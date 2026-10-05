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

    /**
     * POST /api/prompt-options
     * Thêm mới option (STYLE, CONTEXT, LIGHTING)
     */
    @PostMapping
    public ResponseEntity<com.renderai.dto.PromptOptionDto> createOption(@RequestBody com.renderai.dto.PromptOptionDto dto) {
        return ResponseEntity.ok(promptOptionService.createOption(dto));
    }

    /**
     * DELETE /api/prompt-options/{id}
     * Xóa option
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, String>> deleteOption(@PathVariable Long id) {
        promptOptionService.deleteOption(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Deleted option " + id));
    }
}

