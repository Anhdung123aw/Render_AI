package com.renderai.service;

import com.renderai.ai.gemini.GeminiService;
import com.renderai.ai.imagen.ImagenService;
import com.renderai.dto.RenderRequestDto;
import com.renderai.dto.RenderResponseDto;
import com.renderai.entity.*;
import com.renderai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RenderService {

    private final RenderTaskRepository renderTaskRepository;
    private final RenderResultRepository renderResultRepository;
    private final PromptOptionRepository promptOptionRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ImagenService imagenService;

    public RenderService(RenderTaskRepository renderTaskRepository,
                         RenderResultRepository renderResultRepository,
                         PromptOptionRepository promptOptionRepository,
                         UserRepository userRepository,
                         GeminiService geminiService,
                         ImagenService imagenService) {
        this.renderTaskRepository = renderTaskRepository;
        this.renderResultRepository = renderResultRepository;
        this.promptOptionRepository = promptOptionRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.imagenService = imagenService;
    }

    @Transactional
    public RenderResponseDto createRenderTask(RenderRequestDto request) {

        // 1. Lấy thông tin user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        // 2. Nối chuỗi basePrompt + các option đã chọn
        String builtPrompt = buildFinalPrompt(request);

        // 2.5. Nếu có ảnh đầu vào, gọi Gemini Vision để phân tích và thêm vào prompt
        if (request.getOriginalImageUrl() != null && !request.getOriginalImageUrl().isBlank()) {
            String imageDescription = geminiService.analyzeImage(request.getOriginalImageUrl());
            if (imageDescription != null && !imageDescription.isBlank()) {
                builtPrompt = imageDescription + " - " + builtPrompt;
            }
        }

        // 3. Gọi Gemini để làm giàu và chuẩn hóa prompt
        String finalPrompt = builtPrompt; // fallback mặc định
        try {
            String geminiResult = geminiService.generatePrompt(builtPrompt);
            // Chỉ dùng kết quả từ Gemini nếu không phải chuỗi lỗi
            if (geminiResult != null
                    && !geminiResult.startsWith("Đã xảy ra lỗi")
                    && !geminiResult.startsWith("Không có kết quả")
                    && geminiResult.length() > 10) {
                finalPrompt = geminiResult;
            }
        } catch (Exception e) {
            System.err.println("Gemini enhancement failed, using built prompt: " + e.getMessage());
            // finalPrompt giữ nguyên = builtPrompt
        }

        // 4. Lưu RenderTask với status PROCESSING
        RenderTask task = RenderTask.builder()
                .user(user)
                .originalImageUrl(request.getOriginalImageUrl())
                .styleImageUrl(request.getStyleImageUrl())
                .basePrompt(request.getBasePrompt())
                .finalPrompt(finalPrompt)
                .negativePrompt(request.getNegativePrompt())
                .aspectRatio(request.getAspectRatio())
                .numImages(request.getNumImages() != null ? request.getNumImages() : 1)
                .aiProvider("IMAGEN3")
                .status("PROCESSING")
                .build();
        task = renderTaskRepository.save(task);

        // 5. Render ảnh: Nếu có ảnh gốc, ưu tiên dùng model Nano Banana (Image-to-Image) để giữ nguyên hình khối
        List<String> imageUrls = new ArrayList<>();
        boolean renderedByNanoBanana = false;

        boolean isNanoBananaRequested = request.getAiProvider() == null 
                || "NANO_BANANA".equalsIgnoreCase(request.getAiProvider());

        if (isNanoBananaRequested && request.getOriginalImageUrl() != null && !request.getOriginalImageUrl().isBlank()) {
            try {
                System.out.println("Đang kích hoạt mô hình Nano Banana (Image-to-Image) cho ảnh kiến trúc...");
                String nanoBananaResultUrl = geminiService.renderImageWithNanoBanana(request.getOriginalImageUrl(), finalPrompt);
                if (nanoBananaResultUrl != null) {
                    imageUrls.add(nanoBananaResultUrl);
                    renderedByNanoBanana = true;
                    task.setAiProvider("NANO_BANANA");
                }
            } catch (Exception e) {
                System.err.println("Nano Banana gặp lỗi (có thể do Quota API Key Free Tier), chuyển sang phương án dự phòng: " + e.getMessage());
            }
        }

        // Nếu chưa render bằng Nano Banana (hoặc Nano Banana bị giới hạn quota), dùng fallback
        if (!renderedByNanoBanana) {
            try {
                imageUrls = imagenService.generateImages(
                        finalPrompt,
                        task.getNumImages(),
                        request.getAspectRatio(),
                        request.getAiProvider()   // FLUX / OPENAI / GEMINI
                );
            } catch (Exception e) {
                task.setStatus("FAILED");
                renderTaskRepository.save(task);
                return RenderResponseDto.builder()
                        .taskId(task.getId())
                        .status("FAILED")
                        .errorMessage("Image generation error: " + e.getMessage())
                        .build();
            }
        }

        // 6. Lưu URL ảnh vào RENDER_RESULTS
        for (String url : imageUrls) {
            RenderResult result = RenderResult.builder()
                    .renderTask(task)
                    .resultImageUrl(url)
                    .build();
            renderResultRepository.save(result);
        }

        // 7. Cập nhật trạng thái SUCCESS
        task.setStatus("SUCCESS");
        renderTaskRepository.save(task);

        // 8. Trả về kết quả — imageUrls để frontend hiển thị
        return RenderResponseDto.builder()
                .taskId(task.getId())
                .status("SUCCESS")
                .finalPrompt(finalPrompt)
                .imageUrls(imageUrls)
                .aiProvider(request.getAiProvider())
                .createdAt(task.getCreatedAt())
                .build();
    }

    /**
     * Nối chuỗi basePrompt + giá trị tiếng Anh của các option đã chọn
     */
    private String buildFinalPrompt(RenderRequestDto request) {
        StringBuilder prompt = new StringBuilder();

        if (request.getBasePrompt() != null && !request.getBasePrompt().isBlank()) {
            prompt.append(request.getBasePrompt());
        }

        if (request.getStyleOptionId() != null) {
            promptOptionRepository.findById(request.getStyleOptionId())
                    .ifPresent(opt -> prompt.append(", ").append(opt.getPromptValue()));
        }

        if (request.getContextOptionId() != null) {
            promptOptionRepository.findById(request.getContextOptionId())
                    .ifPresent(opt -> prompt.append(", ").append(opt.getPromptValue()));
        }

        if (request.getLightingOptionId() != null) {
            promptOptionRepository.findById(request.getLightingOptionId())
                    .ifPresent(opt -> prompt.append(", ").append(opt.getPromptValue()));
        }

        prompt.append(", architectural visualization, photorealistic, 8K resolution, high quality");

        return prompt.toString();
    }

    /**
     * Lấy lịch sử render của user
     */
    public List<RenderResponseDto> getHistoryByUser(Long userId) {
        return renderTaskRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(task -> {
                    List<String> savedUrls = renderResultRepository.findByRenderTaskId(task.getId())
                            .stream()
                            .map(RenderResult::getResultImageUrl)
                            .collect(Collectors.toList());

                    // Tách base64 và URL thường
                    List<String> base64List = savedUrls.stream()
                            .filter(u -> u.startsWith("base64:"))
                            .map(u -> u.substring(7))
                            .collect(Collectors.toList());

                    List<String> urlList = savedUrls.stream()
                            .filter(u -> !u.startsWith("base64:"))
                            .collect(Collectors.toList());

                    return RenderResponseDto.builder()
                            .taskId(task.getId())
                            .status(task.getStatus())
                            .finalPrompt(task.getFinalPrompt())
                            .aiProvider(task.getAiProvider())
                            .createdAt(task.getCreatedAt())
                            .imageUrls(urlList)
                            .base64Images(base64List)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
