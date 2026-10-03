package com.renderai.ai.gemini;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String generatePrompt(String userInput) {
        String urlWithKey = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Xây dựng JSON Body an toàn
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        
        // Prompt mẫu dành cho AI Render Kiến Trúc
        String systemPrompt = "Bạn là một chuyên gia kiến trúc và thiết kế nội thất. " +
                "Dựa vào yêu cầu sau, hãy viết một câu lệnh (prompt) bằng tiếng Anh thật chi tiết " +
                "về ánh sáng, vật liệu, phong cách và góc máy để đưa vào AI render ảnh (như Midjourney, Flux).\n" +
                "Yêu cầu của người dùng: " + userInput;

        part.put("text", systemPrompt);
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            return "Không có kết quả trả về từ Gemini.";
        } catch (Exception e) {
            System.err.println("Lỗi gọi Gemini API: " + e.getMessage());
            return "Đã xảy ra lỗi khi kết nối với AI: " + e.getMessage();
        }
    }
    public String analyzeImage(String imageRelativePath) {
        String urlWithKey = apiUrl + "?key=" + apiKey;

        try {
            // Read image file and convert to base64
            // Note: imageRelativePath is expected to be something like "/uploads/filename.jpg"
            String filePath = imageRelativePath;
            if (filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
            Path path = Paths.get(filePath);
            byte[] imageBytes = Files.readAllBytes(path);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Determine mime type
            String mimeType = "image/jpeg";
            if (filePath.toLowerCase().endsWith(".png")) {
                mimeType = "image/png";
            } else if (filePath.toLowerCase().endsWith(".webp")) {
                mimeType = "image/webp";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build multimodal request
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "Bạn là một kiến trúc sư chuyên nghiệp. Hãy phân tích hình ảnh (bản vẽ hoặc sketch) này và viết một đoạn mô tả chi tiết bằng tiếng Anh về kiến trúc, cấu trúc, vật liệu, phong cách, và ánh sáng. Mô tả này sẽ được dùng làm prompt cho AI render ảnh (như Midjourney, Flux). Chỉ trả về câu prompt tiếng Anh.");

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Image);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inlineData", inlineData);

            content.put("parts", List.of(textPart, imagePart));
            requestBody.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            return null; // Trả về null nếu không có kết quả để fallback
        } catch (IOException e) {
            System.err.println("Lỗi đọc file ảnh: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Lỗi gọi Gemini Vision API: " + e.getMessage());
            return null;
        }
    }

    /**
     * Render trực tiếp bằng mô hình "Nano Banana" (gemini-2.5-flash-image)
     * Nhận trực tiếp ảnh SketchUp + Prompt để render Image-to-Image giữ nguyên 100% hình khối kiến trúc
     */
    public String renderImageWithNanoBanana(String imageRelativePath, String prompt) {
        String nanoBananaUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" + apiKey;

        try {
            // 1. Đọc file ảnh gốc
            String filePath = imageRelativePath;
            if (filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
            Path path = Paths.get(filePath);
            byte[] imageBytes = Files.readAllBytes(path);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            String mimeType = "image/jpeg";
            if (filePath.toLowerCase().endsWith(".png")) {
                mimeType = "image/png";
            } else if (filePath.toLowerCase().endsWith(".webp")) {
                mimeType = "image/webp";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. Xây dựng payload Multimodal Image-to-Image cho Nano Banana
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();

            String architecturalDirective = "Act as an elite architectural visualization engine. " +
                    "Transform this 3D architectural model/sketch into a photorealistic architectural photograph. " +
                    "CRITICAL: Strictly maintain the exact building shape, geometry, proportions, balcony positions, window frames, and exterior elements visible in the source image. " +
                    "Apply hyper-realistic materials, realistic architectural lighting, glass reflections, and authentic textures. " +
                    "User requirements: " + prompt;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", architecturalDirective);

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Image);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inlineData", inlineData);

            content.put("parts", List.of(textPart, imagePart));
            requestBody.put("contents", List.of(content));

            // Chỉ định trả về hình ảnh
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("responseModalities", List.of("IMAGE"));
            requestBody.put("generationConfig", genConfig);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(nanoBananaUrl, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");

                    for (Map<String, Object> p : parts) {
                        if (p.containsKey("inlineData")) {
                            Map<String, Object> outData = (Map<String, Object>) p.get("inlineData");
                            String base64Result = (String) outData.get("data");

                            // Lưu ảnh render thành file tĩnh trong /uploads/
                            Path uploadDir = Paths.get("uploads/");
                            if (!Files.exists(uploadDir)) {
                                Files.createDirectories(uploadDir);
                            }
                            String resultFileName = "nano-banana-" + java.util.UUID.randomUUID() + ".png";
                            Path outFilePath = uploadDir.resolve(resultFileName);
                            byte[] decoded = Base64.getDecoder().decode(base64Result);
                            Files.write(outFilePath, decoded);

                            return "/uploads/" + resultFileName;
                        }
                    }
                }
            }
            throw new RuntimeException("Nano Banana không trả về dữ liệu ảnh.");
        } catch (Exception e) {
            System.err.println("Lỗi gọi Nano Banana (Gemini Image): " + e.getMessage());
            throw new RuntimeException("Lỗi Nano Banana: " + e.getMessage(), e);
        }
    }
}

