package org.buglaban.travelapi.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.buglaban.travelapi.util.CheckInStatus;
import org.buglaban.travelapi.util.OrderStatus;
import org.buglaban.travelapi.util.PaymentOption;
import org.buglaban.travelapi.util.PaymentStatus;
import org.buglaban.travelapi.util.ParticipationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long id;
    private String orderCode;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String customerNote;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private PaymentOption paymentOption;
    private BigDecimal depositRate;
    private BigDecimal requiredDepositAmount;
    private BigDecimal paidAmount;
    private BigDecimal refundedAmount;
    private BigDecimal outstandingAmount;
    private LocalDate balanceDueDate;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private CheckInStatus checkInStatus;
    private ParticipationStatus participationStatus;
    private BigDecimal refundRate;
    private BigDecimal refundAmount;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime participationConfirmedAt;
    private String participationNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponseDTO> items;
}
