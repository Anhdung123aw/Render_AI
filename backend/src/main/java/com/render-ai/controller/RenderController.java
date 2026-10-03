package com.renderai.controller;

import com.renderai.dto.RenderRequestDto;
import com.renderai.dto.RenderResponseDto;
import com.renderai.service.RenderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/render")
@CrossOrigin(origins = "*")
public class RenderController {

    private final RenderService renderService;

    public RenderController(RenderService renderService) {
        this.renderService = renderService;
    }

    /**
     * POST /api/render/create
     * Luồng chính: nhận options → build prompt → gọi AI → lưu DB → trả ảnh
     */
    @PostMapping("/create")
    public ResponseEntity<RenderResponseDto> createRender(@RequestBody RenderRequestDto request) {
        try {
            RenderResponseDto response = renderService.createRenderTask(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(RenderResponseDto.builder()
                            .status("FAILED")
                            .errorMessage(e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/render/history/{userId}
     * Lấy lịch sử tạo ảnh của một user
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<RenderResponseDto>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(renderService.getHistoryByUser(userId));
    }
}
