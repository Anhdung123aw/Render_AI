package com.renderai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderRequestDto {
    private Long userId;
    private String originalImageUrl;   // URL ảnh gốc đã upload
    private String styleImageUrl;      // URL ảnh tham chiếu style (tuỳ chọn)
    private String basePrompt;         // Chữ người dùng tự gõ
    private Long styleOptionId;        // ID lựa chọn Phong cách
    private Long contextOptionId;      // ID lựa chọn Bối cảnh
    private Long lightingOptionId;     // ID lựa chọn Ánh sáng
    private String negativePrompt;     // Prompt loại trừ
    private String aspectRatio;        // "1:1", "16:9", "4:3"...
    private Integer numImages;         // Số lượng ảnh (1-4)
    private String aiProvider;         // "FLUX" hoặc "OPENAI"
}
