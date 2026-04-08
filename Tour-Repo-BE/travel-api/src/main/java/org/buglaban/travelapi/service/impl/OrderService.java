package org.buglaban.travelapi.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.dto.request.order.CreateOrderRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderCustomerRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderItemRequestDTO;
import org.buglaban.travelapi.dto.response.order.OrderItemResponseDTO;
import org.buglaban.travelapi.dto.response.order.OrderResponseDTO;
import org.buglaban.travelapi.exception.DataNotFoundException;
import org.buglaban.travelapi.model.Order;
import org.buglaban.travelapi.model.OrderDetail;
import org.buglaban.travelapi.model.Role;
import org.buglaban.travelapi.model.Tour;
import org.buglaban.travelapi.model.TourSchedule;
import org.buglaban.travelapi.model.User;
import org.buglaban.travelapi.repository.IOrderRepository;
import org.buglaban.travelapi.repository.IRoleRepository;
import org.buglaban.travelapi.repository.ITourRepository;
import org.buglaban.travelapi.repository.ITourScheduleRepository;
import org.buglaban.travelapi.repository.IUserRepository;
import org.buglaban.travelapi.service.IOrderService;
import org.buglaban.travelapi.util.OrderStatus;
import org.buglaban.travelapi.util.PaymentStatus;
import org.buglaban.travelapi.util.ScheduleStatus;
import org.buglaban.travelapi.util.UserStatus;
import org.buglaban.travelapi.util.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService implements IOrderService {
    private final IOrderRepository orderRepository;
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final ITourRepository tourRepository;
    private final ITourScheduleRepository scheduleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getAllOrders(int page, int pageSize) {
        return orderRepository.findAll(PageRequest.of(page, pageSize)).map(this::toOrderResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        return toOrderResponseDTO(order);
    }

    @Override
    public Long createOrder(CreateOrderRequestDTO requestDTO) {
        User customer = upsertCustomer(requestDTO.getCustomer());

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .user(customer)
                .totalAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING)
                .paymentMethod(requestDTO.getPaymentMethod())
                .customerNote(requestDTO.getCustomer().getNote())
                .orderDetails(new HashSet<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<OrderDetail> orderDetails = new HashSet<>();

        for (OrderItemRequestDTO item : requestDTO.getItems()) {
            Tour tour = tourRepository.findById(item.getTourId())
                    .orElseThrow(() -> new DataNotFoundException("Tour not found: " + item.getTourId()));

            TourSchedule schedule = scheduleRepository.findById(item.getScheduleId())
                    .orElseThrow(() -> new DataNotFoundException("Schedule not found: " + item.getScheduleId()));

            if (!schedule.getTour().getId().equals(tour.getId())) {
                throw new DataNotFoundException("Selected schedule does not belong to this tour");
            }

            int totalParticipants = safeInteger(item.getAdultQuantity())
                    + safeInteger(item.getChildQuantity())
                    + safeInteger(item.getInfantQuantity());

            int bookedSeats = safeInteger(schedule.getBookedSeats());
            int availableSlots = Math.max(0, safeInteger(schedule.getAvailableSeats()) - bookedSeats);
            if (availableSlots < totalParticipants) {
                throw new DataNotFoundException("Not enough available seats for tour: " + tour.getTourName());
            }

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .tour(tour)
                    .tourSchedule(schedule)
                    .tourName(tour.getTourName())
                    .departureDate(schedule.getDepartureDate())
                    .returnDate(schedule.getReturnDate())
                    .adultQuantity(safeInteger(item.getAdultQuantity()))
                    .childQuantity(safeInteger(item.getChildQuantity()))
                    .infantQuantity(safeInteger(item.getInfantQuantity()))
                    .adultPrice(defaultAmount(tour.getAdultPrice()))
                    .childPrice(defaultAmount(tour.getChildPrice()))
                    .infantPrice(defaultAmount(tour.getInfantPrice()))
                    .participants(new HashSet<>())
                    .build();
            detail.calculateSubtotal();

            totalAmount = totalAmount.add(defaultAmount(detail.getSubtotal()));
            orderDetails.add(detail);

            int updatedBookedSeats = bookedSeats + totalParticipants;
            schedule.setBookedSeats(updatedBookedSeats);
            if (updatedBookedSeats >= safeInteger(schedule.getAvailableSeats())) {
                schedule.setStatus(ScheduleStatus.FULL);
            }
            scheduleRepository.save(schedule);
        }

        order.setOrderDetails(orderDetails);
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.calculateFinalAmount();

        return orderRepository.save(order).getId();
    }

    @Override
    public void updateOrder(Long id, Order order) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));

        if (order.getOrderCode() != null) {
            existing.setOrderCode(order.getOrderCode());
        }
        if (order.getFinalAmount() != null) {
            existing.setFinalAmount(order.getFinalAmount());
        }
        if (order.getPaymentMethod() != null) {
            existing.setPaymentMethod(order.getPaymentMethod());
        }
        if (order.getAdminNote() != null) {
            existing.setAdminNote(order.getAdminNote());
        }

        orderRepository.save(existing);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));

        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                TourSchedule schedule = detail.getTourSchedule();
                if (schedule == null) {
                    continue;
                }

                int updatedBookedSeats = Math.max(0, safeInteger(schedule.getBookedSeats()) - detail.getTotalParticipants());
                schedule.setBookedSeats(updatedBookedSeats);
                if (updatedBookedSeats < safeInteger(schedule.getAvailableSeats()) && schedule.getStatus() == ScheduleStatus.FULL) {
                    schedule.setStatus(ScheduleStatus.AVAILABLE);
                }
                scheduleRepository.save(schedule);
            }
        }

        orderRepository.delete(order);
    }

    @Override
    public void changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        order.setOrderStatus(OrderStatus.valueOf(status.toUpperCase()));
        orderRepository.save(order);
    }

    @Override
    public void changePaymentStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));

        PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
        order.setPaymentStatus(paymentStatus);
        order.setPaymentDate(paymentStatus == PaymentStatus.PAID ? LocalDateTime.now() : null);
        orderRepository.save(order);
    }

    private User upsertCustomer(OrderCustomerRequestDTO customerRequest) {
        User user = userRepository.findByEmail(customerRequest.getEmail())
                .orElseGet(() -> User.builder()
                        .email(customerRequest.getEmail())
                        .passwordHash(UUID.randomUUID().toString())
                        .role(getDefaultUserRole())
                        .status(UserStatus.ACTIVE)
                        .emailVerified(false)
                        .build());

        user.setFullName(customerRequest.getFullName());
        user.setEmail(customerRequest.getEmail());
        user.setPhone(customerRequest.getPhone());
        user.setAddress(customerRequest.getAddress());
        if (user.getRole() == null) {
            user.setRole(getDefaultUserRole());
        }
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(UUID.randomUUID().toString());
        }

        return userRepository.save(user);
    }

    private Role getDefaultUserRole() {
        return roleRepository.findByRoleName(UserType.USER)
                .orElseThrow(() -> new DataNotFoundException("Role USER not found"));
    }

    private String generateOrderCode() {
        return "OD" + System.currentTimeMillis();
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int safeInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private OrderResponseDTO toOrderResponseDTO(Order order) {
        User customer = order.getUser();
        List<OrderItemResponseDTO> items = order.getOrderDetails() == null
                ? List.of()
                : order.getOrderDetails().stream()
                .map(detail -> OrderItemResponseDTO.builder()
                        .id(detail.getId())
                        .tourId(detail.getTour() != null ? detail.getTour().getId() : null)
                        .scheduleId(detail.getTourSchedule() != null ? detail.getTourSchedule().getId() : null)
                        .tourName(detail.getTourName())
                        .departureDate(detail.getDepartureDate())
                        .returnDate(detail.getReturnDate())
                        .adultQuantity(detail.getAdultQuantity())
                        .childQuantity(detail.getChildQuantity())
                        .infantQuantity(detail.getInfantQuantity())
                        .adultPrice(defaultAmount(detail.getAdultPrice()))
                        .childPrice(defaultAmount(detail.getChildPrice()))
                        .infantPrice(defaultAmount(detail.getInfantPrice()))
                        .subtotal(defaultAmount(detail.getSubtotal()))
                        .build())
                .toList();

        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getFullName() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerPhone(customer != null ? customer.getPhone() : null)
                .customerAddress(customer != null ? customer.getAddress() : null)
                .customerNote(order.getCustomerNote())
                .totalAmount(defaultAmount(order.getTotalAmount()))
                .discountAmount(defaultAmount(order.getDiscountAmount()))
                .finalAmount(defaultAmount(order.getFinalAmount()))
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }
}
