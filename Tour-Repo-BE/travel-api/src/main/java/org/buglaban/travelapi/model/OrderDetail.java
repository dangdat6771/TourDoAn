package org.buglaban.travelapi.model;
// ORDER DETAIL ENTITY - Chi tiết đơn đặt tour
import jakarta.persistence.*;
import lombok.*;
import org.buglaban.travelapi.util.CheckInStatus;
import org.buglaban.travelapi.util.Gender;
import org.buglaban.travelapi.util.ParticipantType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "order_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Quan hệ Many-to-One với Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Quan hệ Many-to-One với Tour
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    // Quan hệ Many-to-One với TourSchedule
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_schedule_id", nullable = false)
    private TourSchedule tourSchedule;

    @Column(name = "tour_name", nullable = false, length = 500)
    private String tourName;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    // Số lượng người
    @Column(name = "adult_quantity")
    private Integer adultQuantity = 0;

    @Column(name = "child_quantity")
    private Integer childQuantity = 0;

    @Column(name = "infant_quantity")
    private Integer infantQuantity = 0;

    // Giá
    @Column(name = "adult_price", precision = 15, scale = 2)
    private BigDecimal adultPrice = BigDecimal.ZERO;

    @Column(name = "child_price", precision = 15, scale = 2)
    private BigDecimal childPrice = BigDecimal.ZERO;

    @Column(name = "infant_price", precision = 15, scale = 2)
    private BigDecimal infantPrice = BigDecimal.ZERO;

    @Column(name = "subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_status")
    private CheckInStatus checkInStatus = CheckInStatus.NOT_STARTED;

    @Column(name = "checked_in_adult_quantity")
    private Integer checkedInAdultQuantity = 0;

    @Column(name = "checked_in_child_quantity")
    private Integer checkedInChildQuantity = 0;

    @Column(name = "checked_in_infant_quantity")
    private Integer checkedInInfantQuantity = 0;

    @Column(name = "no_show_adult_quantity")
    private Integer noShowAdultQuantity = 0;

    @Column(name = "no_show_child_quantity")
    private Integer noShowChildQuantity = 0;

    @Column(name = "no_show_infant_quantity")
    private Integer noShowInfantQuantity = 0;

    @Column(name = "last_check_in_at")
    private LocalDateTime lastCheckInAt;

    @Column(name = "check_in_note", columnDefinition = "TEXT")
    private String checkInNote;

    // Quan hệ One-to-Many với OrderParticipant
    @OneToMany(mappedBy = "orderDetail", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<OrderParticipant> participants = new HashSet<>();

    // Helper methods
    public void calculateSubtotal() {
        BigDecimal adultTotal = adultPrice.multiply(BigDecimal.valueOf(adultQuantity));
        BigDecimal childTotal = childPrice.multiply(BigDecimal.valueOf(childQuantity));
        BigDecimal infantTotal = infantPrice.multiply(BigDecimal.valueOf(infantQuantity));
        this.subtotal = adultTotal.add(childTotal).add(infantTotal);
    }

    public Integer getTotalParticipants() {
        return adultQuantity + childQuantity + infantQuantity;
    }

    public Integer getOccupiedSeats() {
        return adultQuantity + childQuantity;
    }

    public Integer getTotalCheckedIn() {
        return safeInt(checkedInAdultQuantity) + safeInt(checkedInChildQuantity) + safeInt(checkedInInfantQuantity);
    }

    public Integer getTotalNoShow() {
        return safeInt(noShowAdultQuantity) + safeInt(noShowChildQuantity) + safeInt(noShowInfantQuantity);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}

// ORDER PARTICIPANT ENTITY - Thông tin hành khách

@Entity
@Table(name = "order_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class OrderParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_detail_id", nullable = false)
    private OrderDetail orderDetail;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "passport_number", length = 50)
    private String passportNumber;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Enumerated(EnumType.STRING)
    @Column(name = "participant_type", nullable = false)
    private ParticipantType participantType;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;
}
