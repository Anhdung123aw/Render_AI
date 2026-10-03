package com.renderai.controller;

import com.renderai.ai.gemini.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Mở CORS để ReactJS có thể gọi được API
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate-prompt")
    public ResponseEntity<?> generatePrompt(@RequestBody Map<String, String> request) {
        String userInput = request.get("userInput");
        if (userInput == null || userInput.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng cung cấp nội dung yêu cầu (userInput)."));
        }

        String result = geminiService.generatePrompt(userInput);
        return ResponseEntity.ok(Map.of("prompt", result));
    }
}
