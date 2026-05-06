package org.buglaban.travelapi.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.dto.request.order.CreateOrderRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderCheckInRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderCustomerRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderItemRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderParticipationRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderPaymentUpdateRequestDTO;
import org.buglaban.travelapi.dto.response.PagedResponse;
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
import org.buglaban.travelapi.util.CheckInStatus;
import org.buglaban.travelapi.util.OrderStatus;
import org.buglaban.travelapi.util.PaymentOption;
import org.buglaban.travelapi.util.PaymentStatus;
import org.buglaban.travelapi.util.ParticipationStatus;
import org.buglaban.travelapi.util.ScheduleStatus;
import org.buglaban.travelapi.util.UserStatus;
import org.buglaban.travelapi.util.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService implements IOrderService {
    private static final BigDecimal DEFAULT_DEPOSIT_RATE = new BigDecimal("0.30");
    private static final long DEPOSIT_ALLOWED_BEFORE_DEPARTURE_DAYS = 7;

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
    public Long createOrder(CreateOrderRequestDTO requestDTO, Long userId, String email) {
        User customer = resolveCustomerForOrder(requestDTO.getCustomer(), userId, email);

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .user(customer)
                .totalAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(BigDecimal.ZERO)
                .paymentOption(requestDTO.getPaymentOption() == null ? PaymentOption.FULL : requestDTO.getPaymentOption())
                .depositRate(BigDecimal.ZERO)
                .requiredDepositAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .refundedAmount(BigDecimal.ZERO)
                .outstandingAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING)
                .checkInStatus(CheckInStatus.NOT_STARTED)
                .participationStatus(ParticipationStatus.PENDING)
                .paymentMethod(requestDTO.getPaymentMethod())
                .customerNote(requestDTO.getCustomer().getNote())
                .orderDetails(new HashSet<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        LocalDate earliestDepartureDate = null;
        Set<OrderDetail> orderDetails = new HashSet<>();

        for (OrderItemRequestDTO item : requestDTO.getItems()) {
            Tour tour = tourRepository.findById(item.getTourId())
                    .orElseThrow(() -> new DataNotFoundException("Tour not found: " + item.getTourId()));

            TourSchedule schedule = scheduleRepository.findById(item.getScheduleId())
                    .orElseThrow(() -> new DataNotFoundException("Schedule not found: " + item.getScheduleId()));

            if (!schedule.getTour().getId().equals(tour.getId())) {
                throw new DataNotFoundException("Selected schedule does not belong to this tour");
            }

            int occupiedSeats = safeInteger(item.getAdultQuantity())
                    + safeInteger(item.getChildQuantity());

            int bookedSeats = safeInteger(schedule.getBookedSeats());
            int availableSlots = Math.max(0, safeInteger(schedule.getAvailableSeats()) - bookedSeats);
            if (availableSlots < occupiedSeats) {
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
                    .checkInStatus(CheckInStatus.NOT_STARTED)
                    .participants(new HashSet<>())
                    .build();
            detail.calculateSubtotal();

            totalAmount = totalAmount.add(defaultAmount(detail.getSubtotal()));
            orderDetails.add(detail);
            earliestDepartureDate = minDate(earliestDepartureDate, schedule.getDepartureDate());

            int updatedBookedSeats = bookedSeats + occupiedSeats;
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
        preparePaymentPlan(order, earliestDepartureDate);
        order.calculateOutstandingAmount();

        return orderRepository.save(order).getId();
    }

    @Override
    public void updateOrder(Long id, Order order) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        hydrateLegacyPaymentFields(existing);

        if (order.getOrderCode() != null) {
            existing.setOrderCode(order.getOrderCode());
        }
        if (order.getFinalAmount() != null) {
            existing.setFinalAmount(order.getFinalAmount());
            existing.calculateOutstandingAmount();
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
        hydrateLegacyPaymentFields(order);

        if (order.getOrderStatus() != OrderStatus.CANCELLED) {
            releaseSeats(order);
        }

        orderRepository.delete(order);
    }

    @Override
    public void changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        hydrateLegacyPaymentFields(order);

        OrderStatus targetStatus = OrderStatus.valueOf(status.toUpperCase(Locale.ROOT));
        if (targetStatus == OrderStatus.CANCELLED) {
            applyCancellation(order, "Cancelled by admin", "admin");
            orderRepository.save(order);
            return;
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new DataNotFoundException("Cancelled orders cannot change status");
        }

        order.setOrderStatus(targetStatus);
        orderRepository.save(order);
    }

    @Override
    public void changePaymentStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        hydrateLegacyPaymentFields(order);

        PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase(Locale.ROOT));
        order.setPaymentStatus(paymentStatus);
        switch (paymentStatus) {
            case PAID -> {
                order.setPaidAmount(defaultAmount(order.getFinalAmount()));
                order.setRefundedAmount(defaultAmount(order.getRefundedAmount()));
                order.setPaymentDate(LocalDateTime.now());
                if (order.getOrderStatus() == OrderStatus.PENDING) {
                    order.setOrderStatus(OrderStatus.CONFIRMED);
                }
            }
            case REFUNDED -> {
                BigDecimal paidAmount = getPaidAmount(order);
                order.setRefundedAmount(paidAmount);
                order.setRefundAmount(paidAmount);
                order.setRefundRate(paidAmount.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.ONE : BigDecimal.ZERO);
                order.setCancelledAt(order.getCancelledAt() == null ? LocalDateTime.now() : order.getCancelledAt());
                order.setOutstandingAmount(BigDecimal.ZERO);
            }
            case CANCELLED -> {
                order.setCancelledAt(order.getCancelledAt() == null ? LocalDateTime.now() : order.getCancelledAt());
                order.setRefundAmount(defaultAmount(order.getRefundAmount()));
                order.setRefundRate(defaultAmount(order.getRefundRate()));
                order.setOutstandingAmount(BigDecimal.ZERO);
            }
            case PENDING -> {
                order.setPaidAmount(BigDecimal.ZERO);
                order.setRefundedAmount(BigDecimal.ZERO);
                order.setRefundAmount(BigDecimal.ZERO);
                order.setRefundRate(BigDecimal.ZERO);
                order.setPaymentDate(null);
            }
        }
        if (paymentStatus == PaymentStatus.PENDING || paymentStatus == PaymentStatus.PAID) {
            order.calculateOutstandingAmount();
        }
        orderRepository.save(order);
    }

    @Override
    public void recordPayment(Long id, OrderPaymentUpdateRequestDTO requestDTO) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + id));
        hydrateLegacyPaymentFields(order);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new DataNotFoundException("Cancelled orders cannot receive payment");
        }

        BigDecimal amount = defaultAmount(requestDTO.getAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DataNotFoundException("Payment amount must be greater than 0");
        }

        BigDecimal newPaidAmount = getPaidAmount(order).add(amount);
        BigDecimal finalAmount = defaultAmount(order.getFinalAmount());
        if (newPaidAmount.compareTo(finalAmount) > 0) {
            throw new DataNotFoundException("Payment exceeds outstanding amount");
        }

        order.setPaidAmount(newPaidAmount);
        order.calculateOutstandingAmount();
        order.setPaymentStatus(order.getOutstandingAmount().compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PAID : PaymentStatus.PENDING);
        order.setPaymentDate(LocalDateTime.now());

        if (requestDTO.getPaymentMethod() != null && !requestDTO.getPaymentMethod().isBlank()) {
            order.setPaymentMethod(requestDTO.getPaymentMethod());
        }
        if (requestDTO.getTransactionId() != null && !requestDTO.getTransactionId().isBlank()) {
            order.setTransactionId(requestDTO.getTransactionId());
        }
        if (requestDTO.getNote() != null && !requestDTO.getNote().isBlank()) {
            order.setAdminNote(appendNote(order.getAdminNote(), requestDTO.getNote().trim()));
        }

        if (hasMetConfirmationPayment(order) && order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }

        orderRepository.save(order);
    }

    @Override
    public void updateCheckIn(Long orderId, Integer orderDetailId, OrderCheckInRequestDTO requestDTO) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + orderId));
        hydrateLegacyPaymentFields(order);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new DataNotFoundException("Cancelled orders cannot be checked in");
        }
        if (!hasMetConfirmationPayment(order)) {
            throw new DataNotFoundException("Order must be at least deposited before check-in");
        }

        OrderDetail detail = order.getOrderDetails().stream()
                .filter(item -> item.getId().equals(orderDetailId))
                .findFirst()
                .orElseThrow(() -> new DataNotFoundException("Order detail not found: " + orderDetailId));

        int checkedInAdults = safeInteger(requestDTO.getCheckedInAdultQuantity());
        int checkedInChildren = safeInteger(requestDTO.getCheckedInChildQuantity());
        int checkedInInfants = safeInteger(requestDTO.getCheckedInInfantQuantity());
        int noShowAdults = safeInteger(requestDTO.getNoShowAdultQuantity());
        int noShowChildren = safeInteger(requestDTO.getNoShowChildQuantity());
        int noShowInfants = safeInteger(requestDTO.getNoShowInfantQuantity());

        validateCheckInCounts(detail.getAdultQuantity(), checkedInAdults, noShowAdults, "adult");
        validateCheckInCounts(detail.getChildQuantity(), checkedInChildren, noShowChildren, "child");
        validateCheckInCounts(detail.getInfantQuantity(), checkedInInfants, noShowInfants, "infant");

        detail.setCheckedInAdultQuantity(checkedInAdults);
        detail.setCheckedInChildQuantity(checkedInChildren);
        detail.setCheckedInInfantQuantity(checkedInInfants);
        detail.setNoShowAdultQuantity(noShowAdults);
        detail.setNoShowChildQuantity(noShowChildren);
        detail.setNoShowInfantQuantity(noShowInfants);
        detail.setCheckInNote(requestDTO.getNote());
        detail.setLastCheckInAt(LocalDateTime.now());
        detail.setCheckInStatus(resolveDetailCheckInStatus(detail));

        order.setCheckInStatus(resolveOrderCheckInStatus(order));
        orderRepository.save(order);
    }

    @Override
    public void confirmParticipation(Long orderId, Long userId, String email, OrderParticipationRequestDTO requestDTO) {
        User user = resolveCurrentUser(userId, email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + orderId));
        hydrateLegacyPaymentFields(order);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new DataNotFoundException("Cancelled orders cannot confirm participation");
        }
        if (!hasMetConfirmationPayment(order)) {
            throw new DataNotFoundException("Please complete the required payment before confirming participation");
        }

        order.setParticipationStatus(ParticipationStatus.CONFIRMED);
        order.setParticipationConfirmedAt(LocalDateTime.now());
        if (requestDTO != null && requestDTO.getNote() != null && !requestDTO.getNote().isBlank()) {
            order.setParticipationNote(requestDTO.getNote().trim());
        }
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<List<OrderResponseDTO>> getMyOrders(Long userId, String email, int page, int pageSize) {
        User user = resolveCurrentUser(userId, email);
        Page<OrderResponseDTO> orders = orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, pageSize))
                .map(this::toOrderResponseDTO);

        return PagedResponse.<List<OrderResponseDTO>>builder()
                .page(orders.getNumber())
                .pageSize(orders.getSize())
                .totalPage(orders.getTotalPages())
                .totalElements(orders.getTotalElements())
                .items(orders.getContent())
                .build();
    }

    @Override
    public void cancelOrder(Long orderId, Long userId, String email, String reason) {
        User user = resolveCurrentUser(userId, email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + orderId));
        hydrateLegacyPaymentFields(order);
        applyCancellation(order, reason, "customer");
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

    private User resolveCustomerForOrder(OrderCustomerRequestDTO customerRequest, Long userId, String email) {
        if (userId == null && (email == null || email.isBlank())) {
            return upsertCustomer(customerRequest);
        }

        User user = resolveCurrentUser(userId, email);
        user.setFullName(customerRequest.getFullName());
        user.setPhone(customerRequest.getPhone());
        user.setAddress(customerRequest.getAddress());
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }
        if (user.getRole() == null) {
            user.setRole(getDefaultUserRole());
        }
        return userRepository.save(user);
    }

    private Role getDefaultUserRole() {
        return roleRepository.findByRoleName(UserType.USER)
                .orElseThrow(() -> new DataNotFoundException("Role USER not found"));
    }

    private User resolveCurrentUser(Long userId, String email) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase(Locale.ROOT);

        if (userId != null && normalizedEmail != null && !normalizedEmail.isBlank()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new DataNotFoundException("User not found: " + userId));

            String userEmail = user.getEmail() == null ? "" : user.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!userEmail.equals(normalizedEmail)) {
                throw new DataNotFoundException("Current user information does not match");
            }
            return user;
        }

        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new DataNotFoundException("User not found: " + userId));
        }

        if (normalizedEmail != null && !normalizedEmail.isBlank()) {
            return userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new DataNotFoundException("User not found with email: " + email));
        }

        throw new DataNotFoundException("Missing current user information");
    }

    private String generateOrderCode() {
        return "OD" + System.currentTimeMillis();
    }

    private void preparePaymentPlan(Order order, LocalDate earliestDepartureDate) {
        PaymentOption paymentOption = order.getPaymentOption() == null ? PaymentOption.FULL : order.getPaymentOption();
        BigDecimal finalAmount = defaultAmount(order.getFinalAmount());

        if (paymentOption == PaymentOption.DEPOSIT && earliestDepartureDate != null) {
            long daysBeforeDeparture = ChronoUnit.DAYS.between(LocalDate.now(), earliestDepartureDate);
            if (daysBeforeDeparture < DEPOSIT_ALLOWED_BEFORE_DEPARTURE_DAYS) {
                throw new DataNotFoundException("Deposit is only allowed when booking at least 7 days before departure");
            }
        }

        BigDecimal requiredAmount = paymentOption == PaymentOption.DEPOSIT
                ? finalAmount.multiply(DEFAULT_DEPOSIT_RATE).setScale(2, RoundingMode.HALF_UP)
                : finalAmount;

        order.setPaymentOption(paymentOption);
        order.setDepositRate(paymentOption == PaymentOption.DEPOSIT ? DEFAULT_DEPOSIT_RATE : BigDecimal.ONE);
        order.setRequiredDepositAmount(requiredAmount);
        order.setPaidAmount(BigDecimal.ZERO);
        order.setRefundedAmount(BigDecimal.ZERO);
        order.setRefundAmount(BigDecimal.ZERO);
        order.setRefundRate(BigDecimal.ZERO);
        order.setBalanceDueDate(resolveBalanceDueDate(paymentOption, earliestDepartureDate));
    }

    private LocalDate resolveBalanceDueDate(PaymentOption paymentOption, LocalDate earliestDepartureDate) {
        if (earliestDepartureDate == null) {
            return null;
        }

        if (paymentOption == PaymentOption.DEPOSIT) {
            LocalDate dueDate = earliestDepartureDate.minusDays(DEPOSIT_ALLOWED_BEFORE_DEPARTURE_DAYS);
            return dueDate.isAfter(LocalDate.now()) ? dueDate : LocalDate.now();
        }

        return earliestDepartureDate;
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int safeInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private LocalDate minDate(LocalDate current, LocalDate candidate) {
        if (current == null) {
            return candidate;
        }
        if (candidate == null) {
            return current;
        }
        return candidate.isBefore(current) ? candidate : current;
    }

    private void releaseSeats(Order order) {
        if (order.getOrderDetails() == null) {
            return;
        }

        for (OrderDetail detail : order.getOrderDetails()) {
            TourSchedule schedule = detail.getTourSchedule();
            if (schedule == null) {
                continue;
            }

            int updatedBookedSeats = Math.max(0, safeInteger(schedule.getBookedSeats()) - detail.getOccupiedSeats());
            schedule.setBookedSeats(updatedBookedSeats);
            if (updatedBookedSeats < safeInteger(schedule.getAvailableSeats()) && schedule.getStatus() == ScheduleStatus.FULL) {
                schedule.setStatus(ScheduleStatus.AVAILABLE);
            }
            scheduleRepository.save(schedule);
        }
    }

    private void applyCancellation(Order order, String reason, String actor) {
        if (order.getOrderStatus() == OrderStatus.COMPLETED) {
            throw new DataNotFoundException("Completed orders cannot be cancelled");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return;
        }
        if (order.getCheckInStatus() != null && order.getCheckInStatus() != CheckInStatus.NOT_STARTED) {
            throw new DataNotFoundException("Orders that have started check-in cannot be cancelled");
        }

        BigDecimal paidAmount = getPaidAmount(order);
        BigDecimal refundRate = determineRefundRate(order);
        BigDecimal refundAmount = paidAmount.multiply(refundRate).setScale(2, RoundingMode.HALF_UP);

        releaseSeats(order);

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(refundAmount.compareTo(BigDecimal.ZERO) > 0 ? PaymentStatus.REFUNDED : PaymentStatus.CANCELLED);
        order.setRefundRate(refundRate);
        order.setRefundAmount(refundAmount);
        order.setRefundedAmount(refundAmount);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason((reason == null || reason.isBlank()) ? "Cancelled by " + actor : reason.trim());
        order.setCheckInStatus(CheckInStatus.CANCELLED);
        order.setParticipationStatus(ParticipationStatus.PENDING);

        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                detail.setCheckInStatus(CheckInStatus.CANCELLED);
                detail.setCheckInNote(appendNote(detail.getCheckInNote(), "Order cancelled"));
            }
        }

        order.setOutstandingAmount(BigDecimal.ZERO);
        order.setAdminNote(appendNote(order.getAdminNote(), "Cancelled by " + actor + ", refund " + refundAmount));
    }

    private BigDecimal determineRefundRate(Order order) {
        LocalDate earliestDepartureDate = order.getOrderDetails() == null
                ? null
                : order.getOrderDetails().stream()
                .map(OrderDetail::getDepartureDate)
                .filter(date -> date != null)
                .min(LocalDate::compareTo)
                .orElse(null);

        if (earliestDepartureDate == null) {
            return BigDecimal.ZERO;
        }

        long daysBeforeDeparture = ChronoUnit.DAYS.between(LocalDate.now(), earliestDepartureDate);
        if (daysBeforeDeparture >= 30) {
            return BigDecimal.ONE;
        }
        if (daysBeforeDeparture >= 14) {
            return new BigDecimal("0.75");
        }
        if (daysBeforeDeparture >= 7) {
            return new BigDecimal("0.50");
        }
        if (daysBeforeDeparture >= 3) {
            return new BigDecimal("0.25");
        }
        return BigDecimal.ZERO;
    }

    private boolean hasMetConfirmationPayment(Order order) {
        return getPaidAmount(order).compareTo(defaultAmount(order.getRequiredDepositAmount())) >= 0;
    }

    private BigDecimal getPaidAmount(Order order) {
        BigDecimal paidAmount = defaultAmount(order.getPaidAmount());
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            return paidAmount;
        }
        return order.getPaymentStatus() == PaymentStatus.PAID ? defaultAmount(order.getFinalAmount()) : paidAmount;
    }

    private void hydrateLegacyPaymentFields(Order order) {
        if (order.getPaymentOption() == null) {
            order.setPaymentOption(PaymentOption.FULL);
        }
        if (order.getDepositRate() == null) {
            order.setDepositRate(order.getPaymentOption() == PaymentOption.DEPOSIT ? DEFAULT_DEPOSIT_RATE : BigDecimal.ONE);
        }
        if (order.getRequiredDepositAmount() == null || order.getRequiredDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
            order.setRequiredDepositAmount(order.getPaymentOption() == PaymentOption.DEPOSIT
                    ? defaultAmount(order.getFinalAmount()).multiply(DEFAULT_DEPOSIT_RATE).setScale(2, RoundingMode.HALF_UP)
                    : defaultAmount(order.getFinalAmount()));
        }
        if (order.getPaidAmount() == null) {
            order.setPaidAmount(order.getPaymentStatus() == PaymentStatus.PAID ? defaultAmount(order.getFinalAmount()) : BigDecimal.ZERO);
        }
        if (order.getRefundedAmount() == null) {
            order.setRefundedAmount(order.getPaymentStatus() == PaymentStatus.REFUNDED ? getPaidAmount(order) : BigDecimal.ZERO);
        }
        if (order.getRefundAmount() == null) {
            order.setRefundAmount(defaultAmount(order.getRefundedAmount()));
        }
        if (order.getRefundRate() == null) {
            order.setRefundRate(BigDecimal.ZERO);
        }
        if (order.getCheckInStatus() == null) {
            order.setCheckInStatus(CheckInStatus.NOT_STARTED);
        }
        if (order.getParticipationStatus() == null) {
            order.setParticipationStatus(ParticipationStatus.PENDING);
        }
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                if (detail.getCheckInStatus() == null) {
                    detail.setCheckInStatus(CheckInStatus.NOT_STARTED);
                }
                if (detail.getCheckedInAdultQuantity() == null) {
                    detail.setCheckedInAdultQuantity(0);
                }
                if (detail.getCheckedInChildQuantity() == null) {
                    detail.setCheckedInChildQuantity(0);
                }
                if (detail.getCheckedInInfantQuantity() == null) {
                    detail.setCheckedInInfantQuantity(0);
                }
                if (detail.getNoShowAdultQuantity() == null) {
                    detail.setNoShowAdultQuantity(0);
                }
                if (detail.getNoShowChildQuantity() == null) {
                    detail.setNoShowChildQuantity(0);
                }
                if (detail.getNoShowInfantQuantity() == null) {
                    detail.setNoShowInfantQuantity(0);
                }
            }
        }
        order.calculateOutstandingAmount();
    }

    private void validateCheckInCounts(Integer bookedQuantity, int checkedInQuantity, int noShowQuantity, String label) {
        int booked = safeInteger(bookedQuantity);
        if (checkedInQuantity + noShowQuantity > booked) {
            throw new DataNotFoundException("Total checked-in and no-show " + label + " quantity exceeds booked quantity");
        }
    }

    private CheckInStatus resolveDetailCheckInStatus(OrderDetail detail) {
        int totalParticipants = detail.getTotalParticipants();
        int totalCheckedIn = detail.getTotalCheckedIn();
        int totalNoShow = detail.getTotalNoShow();

        if (totalCheckedIn == 0 && totalNoShow == 0) {
            return CheckInStatus.NOT_STARTED;
        }
        if (totalNoShow == totalParticipants && totalParticipants > 0) {
            return CheckInStatus.NO_SHOW;
        }
        if (totalCheckedIn == totalParticipants && totalParticipants > 0) {
            return CheckInStatus.CHECKED_IN;
        }
        return CheckInStatus.PARTIAL;
    }

    private CheckInStatus resolveOrderCheckInStatus(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return CheckInStatus.CANCELLED;
        }
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            return CheckInStatus.NOT_STARTED;
        }

        List<CheckInStatus> statuses = order.getOrderDetails().stream()
                .map(detail -> detail.getCheckInStatus() == null ? CheckInStatus.NOT_STARTED : detail.getCheckInStatus())
                .toList();

        if (statuses.stream().allMatch(status -> status == CheckInStatus.NOT_STARTED)) {
            return CheckInStatus.NOT_STARTED;
        }
        if (statuses.stream().allMatch(status -> status == CheckInStatus.CHECKED_IN)) {
            return CheckInStatus.CHECKED_IN;
        }
        if (statuses.stream().allMatch(status -> status == CheckInStatus.NO_SHOW)) {
            return CheckInStatus.NO_SHOW;
        }
        if (statuses.stream().allMatch(status -> status == CheckInStatus.CANCELLED)) {
            return CheckInStatus.CANCELLED;
        }
        return CheckInStatus.PARTIAL;
    }

    private String appendNote(String baseNote, String extraNote) {
        String normalizedBase = baseNote == null ? "" : baseNote.trim();
        String normalizedExtra = extraNote == null ? "" : extraNote.trim();
        if (normalizedExtra.isBlank()) {
            return normalizedBase;
        }
        return normalizedBase.isBlank() ? normalizedExtra : normalizedBase + " | " + normalizedExtra;
    }

    private OrderResponseDTO toOrderResponseDTO(Order order) {
        hydrateLegacyPaymentFields(order);
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
                        .checkInStatus(detail.getCheckInStatus())
                        .checkedInAdultQuantity(safeInteger(detail.getCheckedInAdultQuantity()))
                        .checkedInChildQuantity(safeInteger(detail.getCheckedInChildQuantity()))
                        .checkedInInfantQuantity(safeInteger(detail.getCheckedInInfantQuantity()))
                        .noShowAdultQuantity(safeInteger(detail.getNoShowAdultQuantity()))
                        .noShowChildQuantity(safeInteger(detail.getNoShowChildQuantity()))
                        .noShowInfantQuantity(safeInteger(detail.getNoShowInfantQuantity()))
                        .lastCheckInAt(detail.getLastCheckInAt())
                        .checkInNote(detail.getCheckInNote())
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
                .paymentOption(order.getPaymentOption())
                .depositRate(defaultAmount(order.getDepositRate()))
                .requiredDepositAmount(defaultAmount(order.getRequiredDepositAmount()))
                .paidAmount(getPaidAmount(order))
                .refundedAmount(defaultAmount(order.getRefundedAmount()))
                .outstandingAmount(defaultAmount(order.getOutstandingAmount()))
                .balanceDueDate(order.getBalanceDueDate())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .checkInStatus(order.getCheckInStatus())
                .participationStatus(order.getParticipationStatus())
                .refundRate(defaultAmount(order.getRefundRate()))
                .refundAmount(defaultAmount(order.getRefundAmount()))
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .participationConfirmedAt(order.getParticipationConfirmedAt())
                .participationNote(order.getParticipationNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }
}
