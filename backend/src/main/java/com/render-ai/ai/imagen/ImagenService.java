package com.renderai.ai.imagen;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

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

    /**
     * Tạo ảnh với AI provider được chọn.
     *
     * @param prompt      Prompt tiếng Anh đã được Gemini tối ưu
     * @param numImages   Số lượng ảnh (1-4)
     * @param aspectRatio Tỷ lệ khung hình ("16:9", "1:1", ...)
     * @param aiProvider  "FLUX", "OPENAI", hoặc "GEMINI"
     * @return Danh sách URL ảnh thật (dùng được trong <img src="...">)
     */
    public List<String> generateImages(String prompt, int numImages,
                                        String aspectRatio, String aiProvider) {
        int[] size = parseAspectRatio(aspectRatio);
        String pollinationsModel = resolveModel(aiProvider);
        String encodedPrompt = UriUtils.encodePath(
                prompt + ", architectural visualization, photorealistic, high detail",
                StandardCharsets.UTF_8
        );

        List<String> imageUrls = new ArrayList<>();
        int count = Math.min(numImages, 4);
        for (int i = 0; i < count; i++) {
            long seed = (System.currentTimeMillis() + i * 1337L) % Integer.MAX_VALUE;
            String url = BASE_URL + encodedPrompt
                    + "?width="   + size[0]
                    + "&height="  + size[1]
                    + "&seed="    + seed
                    + "&nologo=true";

            imageUrls.add(url);
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
