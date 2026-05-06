package org.buglaban.travelapi.dto.request.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.buglaban.travelapi.util.PaymentOption;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequestDTO {
    @Valid
    @NotNull(message = "customer must not be null")
    private OrderCustomerRequestDTO customer;

    @Valid
    @NotEmpty(message = "items must not be empty")
    private List<OrderItemRequestDTO> items;

    @NotBlank(message = "paymentMethod must not be blank")
    private String paymentMethod;

    private PaymentOption paymentOption;
}
