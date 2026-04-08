package org.buglaban.travelapi.dto.response;

import lombok.*;
import org.buglaban.travelapi.model.Order;
import org.buglaban.travelapi.model.Review;
import org.buglaban.travelapi.util.Gender;
import org.buglaban.travelapi.util.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailResponseDTO {
    private Long id;

    private String fullName;

    private String email;

    private String passwordHash;

    private String phone;

    private String avatarUrl;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String address;

    private UserStatus status;

    private String role;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
