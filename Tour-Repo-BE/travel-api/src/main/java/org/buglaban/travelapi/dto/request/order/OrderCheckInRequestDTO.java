package org.buglaban.travelapi.dto.request.order;

import jakarta.validation.constraints.Min;
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
public class OrderCheckInRequestDTO {
    @Min(value = 0, message = "checkedInAdultQuantity must be at least 0")
    private Integer checkedInAdultQuantity;

    @Min(value = 0, message = "checkedInChildQuantity must be at least 0")
    private Integer checkedInChildQuantity;

    @Min(value = 0, message = "checkedInInfantQuantity must be at least 0")
    private Integer checkedInInfantQuantity;

    @Min(value = 0, message = "noShowAdultQuantity must be at least 0")
    private Integer noShowAdultQuantity;

    @Min(value = 0, message = "noShowChildQuantity must be at least 0")
    private Integer noShowChildQuantity;

    @Min(value = 0, message = "noShowInfantQuantity must be at least 0")
    private Integer noShowInfantQuantity;

    private String note;
}
