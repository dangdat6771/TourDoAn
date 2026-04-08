package org.buglaban.travelapi.service;

import org.buglaban.travelapi.dto.request.order.CreateOrderRequestDTO;
import org.buglaban.travelapi.dto.response.order.OrderResponseDTO;
import org.buglaban.travelapi.model.Order;
import org.springframework.data.domain.Page;

public interface IOrderService {
    Page<OrderResponseDTO> getAllOrders(int page, int pageSize);
    OrderResponseDTO getOrderById(Long id);
    Long createOrder(CreateOrderRequestDTO requestDTO);
    void updateOrder(Long id, Order order);
    void deleteOrder(Long id);
    void changeOrderStatus(Long id, String status);
    void changePaymentStatus(Long id, String status);
}
