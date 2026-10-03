package com.renderai.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PROMPT_OPTIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private PromptOptionType optionType;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "prompt_value", nullable = false)
    private String promptValue;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
