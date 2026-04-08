package org.buglaban.travelapi.dto.request.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequestDTO {
    @NotNull(message = "tourId must not be null")
    private Long tourId;

    @NotNull(message = "scheduleId must not be null")
    private Long scheduleId;

    @NotNull(message = "adultQuantity must not be null")
    @Min(value = 1, message = "adultQuantity must be at least 1")
    private Integer adultQuantity;

    @NotNull(message = "childQuantity must not be null")
    @Min(value = 0, message = "childQuantity must be at least 0")
    private Integer childQuantity;

    @NotNull(message = "infantQuantity must not be null")
    @Min(value = 0, message = "infantQuantity must be at least 0")
    private Integer infantQuantity;
}
