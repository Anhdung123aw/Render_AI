package com.renderai.service;

import com.renderai.ai.gemini.GeminiService;
import com.renderai.ai.imagen.ImagenService;
import com.renderai.dto.request.RenderRequestDto;
import com.renderai.dto.response.RenderResponseDto;
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

        // 1. Lấy thông tin user an toàn (ưu tiên ID, sau đó tới username theo Role, hoặc user đầu tiên có sẵn)
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null && request.getUserRole() != null) {
            String targetUsername = "ADMIN".equalsIgnoreCase(request.getUserRole()) ? "admin" : "user";
            user = userRepository.findByUsername(targetUsername).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hợp lệ trong hệ thống"));
        }

        // 2. Xác định finalPrompt:
        // NẾU ADMIN đã trực tiếp duyệt và chỉnh sửa prompt (customFinalPrompt) -> Sử dụng trực tiếp
        String finalPrompt;
        if (request.getCustomFinalPrompt() != null && !request.getCustomFinalPrompt().isBlank()) {
            finalPrompt = request.getCustomFinalPrompt();
            System.out.println("Áp dụng Prompt cuối cùng do ADMIN trực tiếp phê duyệt và chỉnh sửa: " + finalPrompt);
        } else {
            // Luồng thông thường cho User: Gemini tự động phân tích và tối ưu
            String builtPrompt = buildFinalPrompt(request);
            if (request.getOriginalImageUrl() != null && !request.getOriginalImageUrl().isBlank()) {
                String imageDescription = geminiService.analyzeImage(request.getOriginalImageUrl());
                if (imageDescription != null && !imageDescription.isBlank()) {
                    builtPrompt = imageDescription + " - " + builtPrompt;
                }
            }

            finalPrompt = builtPrompt;
            try {
                String geminiResult = geminiService.generatePrompt(builtPrompt);
                if (geminiResult != null
                        && !geminiResult.startsWith("Đã xảy ra lỗi")
                        && !geminiResult.startsWith("Không có kết quả")
                        && geminiResult.length() > 10) {
                    finalPrompt = geminiResult;
                }
            } catch (Exception e) {
                System.err.println("Gemini enhancement failed, using built prompt: " + e.getMessage());
            }
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

        boolean isNanoBananaRequested = "NANO_BANANA".equalsIgnoreCase(request.getAiProvider());

        if (isNanoBananaRequested) {
            // Người dùng chủ động chọn Nano Banana: Bắt buộc phải có ảnh
            if (request.getOriginalImageUrl() == null || request.getOriginalImageUrl().isBlank()) {
                task.setStatus("FAILED");
                renderTaskRepository.save(task);
                return RenderResponseDto.builder()
                        .taskId(task.getId())
                        .status("FAILED")
                        .errorMessage("Mô hình Nano Banana yêu cầu phải tải lên ảnh bản vẽ 3D / SketchUp để thực hiện Image-to-Image!")
                        .build();
            }

            try {
                System.out.println("Đang thực hiện render Image-to-Image với Google Gemini Nano Banana...");
                String nanoBananaResultUrl = geminiService.renderImageWithNanoBanana(request.getOriginalImageUrl(), finalPrompt);
                imageUrls.add(nanoBananaResultUrl);
                renderedByNanoBanana = true;
                task.setAiProvider("NANO_BANANA");
            } catch (Exception e) {
                task.setStatus("FAILED");
                renderTaskRepository.save(task);
                String errDetail = e.getMessage();
                if (errDetail != null && errDetail.contains("429")) {
                    errDetail = "Khóa API Google hiện tại đang ở gói 'Free Tier' (chưa bật Billing, hạn ngạch tạo ảnh limit: 0). " +
                            "Vui lòng vào Google AI Studio bấm 'Set up billing' để kích hoạt, hoặc chọn mô hình 'FLUX.1' để render miễn phí!";
                }
                return RenderResponseDto.builder()
                        .taskId(task.getId())
                        .status("FAILED")
                        .errorMessage("Lỗi Nano Banana: " + errDetail)
                        .build();
            }
        } else {
            // Người dùng chọn FLUX hoặc mô hình khác: Chạy qua Pollinations
            try {
                imageUrls = imagenService.generateImages(
                        finalPrompt,
                        task.getNumImages(),
                        request.getAspectRatio(),
                        request.getAiProvider() != null ? request.getAiProvider() : "FLUX"
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
        List<String> parts = new ArrayList<>();

        if (request.getBasePrompt() != null && !request.getBasePrompt().isBlank()) {
            parts.add(request.getBasePrompt().trim());
        }

        if (request.getStyleOptionId() != null) {
            promptOptionRepository.findById(request.getStyleOptionId())
                    .ifPresent(opt -> parts.add(opt.getPromptValue().trim()));
        }

        if (request.getContextOptionId() != null) {
            promptOptionRepository.findById(request.getContextOptionId())
                    .ifPresent(opt -> parts.add(opt.getPromptValue().trim()));
        }

        if (request.getLightingOptionId() != null) {
            promptOptionRepository.findById(request.getLightingOptionId())
                    .ifPresent(opt -> parts.add(opt.getPromptValue().trim()));
        }

        parts.add("architectural visualization, photorealistic, 8K resolution, high quality");

        return String.join(", ", parts);
    }

    private RenderResponseDto mapTaskToDto(RenderTask task) {
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

        String username = task.getUser() != null ? task.getUser().getUsername() : "Unknown";
        String email = task.getUser() != null ? task.getUser().getEmail() : "";
        Long uId = task.getUser() != null ? task.getUser().getId() : null;

        return RenderResponseDto.builder()
                .taskId(task.getId())
                .status(task.getStatus())
                .finalPrompt(task.getFinalPrompt())
                .basePrompt(task.getBasePrompt())
                .originalImageUrl(task.getOriginalImageUrl())
                .aiProvider(task.getAiProvider())
                .createdAt(task.getCreatedAt())
                .imageUrls(urlList)
                .base64Images(base64List)
                .userId(uId)
                .username(username)
                .userEmail(email)
                .build();
    }

    /**
     * Lấy lịch sử render của user
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RenderResponseDto> getHistoryByUser(Long userId) {
        return renderTaskRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());
    }

    /**
     * Dành cho Admin: Lấy danh sách tất cả các tác vụ render của tất cả user
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RenderResponseDto> getAllRenderTasks() {
        return renderTaskRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());
    }

    /**
     * Dành riêng cho ADMIN: Tạo bản xem trước Final Prompt từ Gemini
     * Để Admin đọc, chỉnh sửa từ khóa kỹ thuật kiến trúc trước khi gửi render thật
     */
    public String previewFinalPrompt(RenderRequestDto request) {
        String builtPrompt = buildFinalPrompt(request);
        if (request.getOriginalImageUrl() != null && !request.getOriginalImageUrl().isBlank()) {
            String imageDescription = geminiService.analyzeImage(request.getOriginalImageUrl());
            if (imageDescription != null && !imageDescription.isBlank()) {
                builtPrompt = imageDescription + " - " + builtPrompt;
            }
        }

        try {
            String geminiResult = geminiService.generatePrompt(builtPrompt);
            if (geminiResult != null
                    && !geminiResult.startsWith("Đã xảy ra lỗi")
                    && !geminiResult.startsWith("Không có kết quả")
                    && geminiResult.length() > 10) {
                return geminiResult;
            }
        } catch (Exception e) {
            System.err.println("Gemini preview enhancement failed: " + e.getMessage());
        }
        return builtPrompt;
    }

    /**
     * Xóa 1 tác vụ render theo taskId
     */
    @org.springframework.transaction.annotation.Transactional
    public boolean deleteTask(Long taskId) {
        if (!renderTaskRepository.existsById(taskId)) {
            return false;
        }
        // Xóa các ảnh kết quả con trong bảng RENDER_RESULTS trước để tránh lỗi ràng buộc khóa ngoại Oracle
        renderResultRepository.deleteByTaskId(taskId);
        renderTaskRepository.deleteById(taskId);
        return true;
    }

    /**
     * Xóa nhiều tác vụ render theo danh sách taskIds
     */
    @org.springframework.transaction.annotation.Transactional
    public int deleteTasksBatch(List<Long> taskIds) {
        if (taskIds == null || taskIds.isEmpty()) {
            return 0;
        }
        renderResultRepository.deleteByTaskIds(taskIds);
        renderTaskRepository.deleteAllById(taskIds);
        return taskIds.size();
    }
}

