package com.renderai.dto.response;

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
    private List<String> imageUrls;
    private List<String> base64Images;
    private String aiProvider;
    private Date createdAt;
    private Long userId;
    private String username;
    private String userEmail;
    private String originalImageUrl;
    private String basePrompt;
    private String errorMessage;
}
