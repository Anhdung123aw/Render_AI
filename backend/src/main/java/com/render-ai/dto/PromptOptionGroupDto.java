package com.renderai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptOptionGroupDto {
    // Key = "STYLE" / "CONTEXT" / "LIGHTING"
    // Value = danh sách các lựa chọn tương ứng
    private Map<String, List<PromptOptionDto>> options;
}
