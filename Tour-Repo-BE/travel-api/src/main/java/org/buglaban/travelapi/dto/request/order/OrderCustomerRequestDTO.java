package org.buglaban.travelapi.dto.request.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class OrderCustomerRequestDTO {
    @NotBlank(message = "fullName must not be blank")
    private String fullName;

    @Email(message = "email invalid format")
    @NotBlank(message = "email must not be blank")
    private String email;

    @NotBlank(message = "phone must not be blank")
    private String phone;

    private String address;

    private String note;
}
