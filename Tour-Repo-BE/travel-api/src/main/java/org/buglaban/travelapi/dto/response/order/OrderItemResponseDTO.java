package org.buglaban.travelapi.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.buglaban.travelapi.util.CheckInStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDTO {
    private Integer id;
    private Long tourId;
    private Long scheduleId;
    private String tourName;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private Integer adultQuantity;
    private Integer childQuantity;
    private Integer infantQuantity;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private BigDecimal subtotal;
    private CheckInStatus checkInStatus;
    private Integer checkedInAdultQuantity;
    private Integer checkedInChildQuantity;
    private Integer checkedInInfantQuantity;
    private Integer noShowAdultQuantity;
    private Integer noShowChildQuantity;
    private Integer noShowInfantQuantity;
    private LocalDateTime lastCheckInAt;
    private String checkInNote;
}
