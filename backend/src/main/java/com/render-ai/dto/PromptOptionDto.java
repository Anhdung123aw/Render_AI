package com.renderai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptOptionDto {
    private Long id;
    private String optionType;
    private String displayName;
    private String promptValue;
}
