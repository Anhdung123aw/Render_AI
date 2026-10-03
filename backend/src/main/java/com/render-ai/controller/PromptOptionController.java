package com.renderai.controller;

import com.renderai.dto.PromptOptionGroupDto;
import com.renderai.service.PromptOptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prompt-options")
@CrossOrigin(origins = "*")
public class PromptOptionController {

    private final PromptOptionService promptOptionService;

    public PromptOptionController(PromptOptionService promptOptionService) {
        this.promptOptionService = promptOptionService;
    }

    /**
     * GET /api/prompt-options
     * Trả về tất cả options nhóm theo loại: STYLE, CONTEXT, LIGHTING
     */
    @GetMapping
    public ResponseEntity<PromptOptionGroupDto> getAllOptions() {
        return ResponseEntity.ok(promptOptionService.getAllGrouped());
    }
}
