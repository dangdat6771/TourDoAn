package org.buglaban.travelapi.model;

// ORDER ENTITY - Đơn đặt tour

import jakarta.persistence.*;
import lombok.*;
import org.buglaban.travelapi.util.CheckInStatus;
import org.buglaban.travelapi.util.OrderStatus;
import org.buglaban.travelapi.util.PaymentOption;
import org.buglaban.travelapi.util.PaymentStatus;
import org.buglaban.travelapi.util.ParticipationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends AbstractEntity {

    @Column(name = "order_code", unique = true, nullable = false, length = 50)
    private String orderCode;

    // Quan hệ Many-to-One với User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Thông tin đơn hàng
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_option", length = 20)
    private PaymentOption paymentOption = PaymentOption.FULL;

    @Column(name = "deposit_rate", precision = 5, scale = 2)
    private BigDecimal depositRate = BigDecimal.ZERO;

    @Column(name = "required_deposit_amount", precision = 15, scale = 2)
    private BigDecimal requiredDepositAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "refunded_amount", precision = 15, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Column(name = "outstanding_amount", precision = 15, scale = 2)
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Column(name = "balance_due_date")
    private LocalDate balanceDueDate;

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_status")
    private CheckInStatus checkInStatus = CheckInStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "participation_status")
    private ParticipationStatus participationStatus = ParticipationStatus.PENDING;

    // Thanh toán
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // cash, vnpay

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "refund_rate", precision = 5, scale = 2)
    private BigDecimal refundRate = BigDecimal.ZERO;

    @Column(name = "refund_amount", precision = 15, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "participation_confirmed_at")
    private LocalDateTime participationConfirmedAt;

    @Column(name = "participation_note", columnDefinition = "TEXT")
    private String participationNote;

    // Ghi chú
    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    // Quan hệ One-to-Many với OrderDetail
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<OrderDetail> orderDetails = new HashSet<>();

    // Helper methods
    public void calculateFinalAmount() {
        this.finalAmount = this.totalAmount.subtract(this.discountAmount);
    }

    public void calculateOutstandingAmount() {
        BigDecimal total = finalAmount == null ? BigDecimal.ZERO : finalAmount;
        BigDecimal paid = paidAmount == null ? BigDecimal.ZERO : paidAmount;
        BigDecimal remaining = total.subtract(paid);
        this.outstandingAmount = remaining.compareTo(BigDecimal.ZERO) > 0 ? remaining : BigDecimal.ZERO;
    }
}
