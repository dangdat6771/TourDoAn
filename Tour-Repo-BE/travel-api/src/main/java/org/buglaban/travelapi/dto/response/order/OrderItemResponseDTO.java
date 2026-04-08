package org.buglaban.travelapi.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

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
}
