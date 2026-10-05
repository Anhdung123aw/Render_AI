package com.renderai.ai.imagen;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Tích hợp 3 AI Provider thông qua Pollinations.AI (miễn phí):
 *
 *  - FLUX    → model=flux       (FLUX.1-dev — tương đương FLUX.2)
 *  - OPENAI  → model=turbo      (OpenAI compatible, chất lượng cao)
 *  - GEMINI  → model=flux-realism (phong cách photorealistic)
 *
 * Docs: https://image.pollinations.ai/
 */
@Service
public class ImagenService {

    private static final String BASE_URL = "https://image.pollinations.ai/prompt/";
    private final RestTemplate restTemplate;

    public ImagenService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Tạo ảnh với AI provider được chọn.
     *
     * @param prompt      Prompt tiếng Anh đã được tối ưu
     * @param numImages   Số lượng ảnh (1-4)
     * @param aspectRatio Tỷ lệ khung hình ("16:9", "1:1", ...)
     * @param aiProvider  "FLUX", "OPENAI", hoặc "GEMINI"
     * @return Danh sách URL ảnh thật
     */
    public List<String> generateImages(String prompt, int numImages,
                                        String aspectRatio, String aiProvider) {
        int[] size = parseAspectRatio(aspectRatio);
        String pollinationsModel = resolveModel(aiProvider);

        // Chuẩn hóa prompt: loại bỏ dấu phẩy thừa, xuống dòng
        String cleanPrompt = prompt != null ? prompt.trim() : "";
        while (cleanPrompt.startsWith(",")) {
            cleanPrompt = cleanPrompt.substring(1).trim();
        }
        while (cleanPrompt.endsWith(",")) {
            cleanPrompt = cleanPrompt.substring(0, cleanPrompt.length() - 1).trim();
        }
        cleanPrompt = cleanPrompt.replaceAll("[\\r\\n]+", " ").trim();
        if (cleanPrompt.isBlank()) {
            cleanPrompt = "modern luxury architecture villa, photorealistic, 8K resolution, high detail";
        }

        String encodedPrompt = UriUtils.encodePath(cleanPrompt, StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        headers.set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        List<String> imageUrls = new ArrayList<>();
        int count = Math.min(Math.max(numImages, 1), 4);
        for (int i = 0; i < count; i++) {
            boolean savedLocally = false;
            String lastAttemptUrl = null;

            // Thử tải tối đa 3 lần với seed mới nếu server AI trả về 0-byte hoặc bị lỗi
            for (int attempt = 0; attempt < 3; attempt++) {
                long seed = (System.currentTimeMillis() + i * 1337L + attempt * 777L) % Integer.MAX_VALUE;
                String url = BASE_URL + encodedPrompt
                        + "?model="   + pollinationsModel
                        + "&width="   + size[0]
                        + "&height="  + size[1]
                        + "&seed="    + seed
                        + "&nologo=true";
                lastAttemptUrl = url;

                try {
                    System.out.println("Đang kết nối tải ảnh từ AI (" + pollinationsModel + ", attempt " + (attempt + 1) + "): " + url);
                    ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, byte[].class);
                    byte[] imageBytes = response.getBody();

                    if (imageBytes != null && imageBytes.length > 1000) {
                        Path uploadDir = Paths.get("uploads/");
                        if (!Files.exists(uploadDir)) {
                            Files.createDirectories(uploadDir);
                        }
                        String fileName = "flux-" + UUID.randomUUID() + ".jpg";
                        Path outFilePath = uploadDir.resolve(fileName);
                        Files.write(outFilePath, imageBytes);
                        System.out.println("Đã lưu thành công ảnh render cục bộ: /uploads/" + fileName + " (" + imageBytes.length + " bytes)");
                        imageUrls.add("/uploads/" + fileName);
                        savedLocally = true;
                        break;
                    } else {
                        System.err.println("Cảnh báo: Ảnh từ AI trả về rỗng hoặc quá nhỏ (" + (imageBytes != null ? imageBytes.length : 0) + " bytes). Đang thử lại với seed mới...");
                    }
                } catch (Exception e) {
                    System.err.println("Lỗi khi tải ảnh local lần " + (attempt + 1) + ": " + e.getMessage());
                }

                try {
                    Thread.sleep(1500); // Nghỉ 1.5s trước khi thử lại
                } catch (InterruptedException ignored) {}
            }

            // Nếu cả 3 lần tải local đều thất bại, fallback sang direct URL có gắn timestamp để tránh Cloudflare 0-byte cache
            if (!savedLocally && lastAttemptUrl != null) {
                String freshUrl = lastAttemptUrl + "&ts=" + System.currentTimeMillis();
                imageUrls.add(freshUrl);
            }
        }
        return imageUrls;
    }

    /**
     * Map AI provider name → Pollinations model name
     */
    private String resolveModel(String aiProvider) {
        if (aiProvider == null) return "flux";
        return switch (aiProvider.toUpperCase()) {
            case "OPENAI"  -> "turbo";        // OpenAI-compatible, chất lượng cao
            case "GEMINI"  -> "flux-realism"; // Phong cách photorealistic
            case "FLUX"    -> "flux";          // FLUX.1-dev
            default        -> "flux";
        };
    }

    /**
     * Chuyển aspect ratio → width x height
     */
    private int[] parseAspectRatio(String aspectRatio) {
        if (aspectRatio == null) return new int[]{1280, 720};
        return switch (aspectRatio) {
            case "16:9"  -> new int[]{1280, 720};
            case "9:16"  -> new int[]{720, 1280};
            case "4:3"   -> new int[]{1024, 768};
            case "3:4"   -> new int[]{768, 1024};
            case "1:1"   -> new int[]{1024, 1024};
            default      -> new int[]{1280, 720};
        };
    }
}
