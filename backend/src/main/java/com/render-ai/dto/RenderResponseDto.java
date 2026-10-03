package com.renderai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenderResponseDto {
    private Long taskId;
    private String status;
    private String finalPrompt;
    private List<String> imageUrls;      // URL ảnh (nếu lưu cloud)
    private List<String> base64Images;   // Base64 PNG từ Imagen 3 (hiển thị trực tiếp)
    private String aiProvider;
    private Date createdAt;
    private String errorMessage;
}
