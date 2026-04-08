package org.buglaban.travelapi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.dto.request.order.CreateOrderRequestDTO;
import org.buglaban.travelapi.dto.response.ResponseData;
import org.buglaban.travelapi.dto.response.ResponseFailure;
import org.buglaban.travelapi.dto.response.order.OrderResponseDTO;
import org.buglaban.travelapi.model.Order;
import org.buglaban.travelapi.service.IOrderService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/order/")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final IOrderService orderService;

    @GetMapping("")
    public ResponseData<?> getAllOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        try {
            Page<OrderResponseDTO> result = orderService.getAllOrders(page, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "Get orders successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get orders fail");
        }
    }

    @GetMapping("{id}")
    public ResponseData<?> getOrderById(@PathVariable Long id) {
        try {
            OrderResponseDTO result = orderService.getOrderById(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Get order successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get order fail");
        }
    }

    @PostMapping("")
    public ResponseData<?> createOrder(@Valid @RequestBody CreateOrderRequestDTO requestDTO) {
        try {
            Long id = orderService.createOrder(requestDTO);
            return new ResponseData<>(HttpStatus.CREATED.value(), "Order created successfully", id);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Create order fail");
        }
    }

    @PutMapping("{id}")
    public ResponseData<?> updateOrder(@PathVariable Long id, @Valid @RequestBody Order order) {
        try {
            orderService.updateOrder(id, order);
            return new ResponseData<>(HttpStatus.OK.value(), "Order updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Update order fail");
        }
    }

    @DeleteMapping("{id}")
    public ResponseData<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Order deleted successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Delete order fail");
        }
    }

    @PatchMapping("{id}/status")
    public ResponseData<?> changeOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            orderService.changeOrderStatus(id, status);
            return new ResponseData<>(HttpStatus.OK.value(), "Status updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Change status fail");
        }
    }

    @PatchMapping("{id}/payment-status")
    public ResponseData<?> changePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            orderService.changePaymentStatus(id, status);
            return new ResponseData<>(HttpStatus.OK.value(), "Payment status updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Change payment status fail");
        }
    }
}
