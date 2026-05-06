package org.buglaban.travelapi.service;

import org.buglaban.travelapi.dto.request.order.CreateOrderRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderCheckInRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderParticipationRequestDTO;
import org.buglaban.travelapi.dto.request.order.OrderPaymentUpdateRequestDTO;
import org.buglaban.travelapi.dto.response.PagedResponse;
import org.buglaban.travelapi.dto.response.order.OrderResponseDTO;
import org.buglaban.travelapi.model.Order;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IOrderService {
    Page<OrderResponseDTO> getAllOrders(int page, int pageSize);
    OrderResponseDTO getOrderById(Long id);
    Long createOrder(CreateOrderRequestDTO requestDTO, Long userId, String email);
    void updateOrder(Long id, Order order);
    void deleteOrder(Long id);
    void changeOrderStatus(Long id, String status);
    void changePaymentStatus(Long id, String status);
    void recordPayment(Long id, OrderPaymentUpdateRequestDTO requestDTO);
    void updateCheckIn(Long orderId, Integer orderDetailId, OrderCheckInRequestDTO requestDTO);
    void confirmParticipation(Long orderId, Long userId, String email, OrderParticipationRequestDTO requestDTO);
    PagedResponse<List<OrderResponseDTO>> getMyOrders(Long userId, String email, int page, int pageSize);
    void cancelOrder(Long orderId, Long userId, String email, String reason);
}
