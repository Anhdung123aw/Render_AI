package com.renderai.controller;

import com.renderai.dto.request.RenderRequestDto;
import com.renderai.dto.response.RenderResponseDto;
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
     * POST /api/render/preview-prompt
     * Dành riêng cho ADMIN: xem trước và chuẩn bị tinh chỉnh prompt cuối cùng trước khi render
     */
    @PostMapping("/preview-prompt")
    public ResponseEntity<java.util.Map<String, String>> previewPrompt(@RequestBody RenderRequestDto request) {
        String finalPrompt = renderService.previewFinalPrompt(request);
        return ResponseEntity.ok(java.util.Map.of("finalPrompt", finalPrompt));
    }

    /**
     * GET /api/render/history/{userId}
     * Lấy lịch sử tạo ảnh của một user
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<RenderResponseDto>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(renderService.getHistoryByUser(userId));
    }

    /**
     * GET /api/render/admin/all-tasks
     * Dành riêng cho Admin: Lấy danh sách toàn bộ render của các users để quản lý và chỉnh sửa prompt
     */
    @GetMapping("/admin/all-tasks")
    public ResponseEntity<List<RenderResponseDto>> getAllTasksForAdmin() {
        return ResponseEntity.ok(renderService.getAllRenderTasks());
    }

    /**
     * DELETE /api/render/task/{taskId}
     * Xóa 1 tác vụ render theo taskId
     */
    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteTask(@PathVariable Long taskId) {
        boolean deleted = renderService.deleteTask(taskId);
        if (deleted) {
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Đã xóa tác vụ #" + taskId));
        } else {
            return ResponseEntity.status(404).body(java.util.Map.of("success", false, "message", "Không tìm thấy tác vụ #" + taskId));
        }
    }

    /**
     * POST /api/render/tasks/delete-batch
     * Xóa danh sách nhiều tác vụ render
     */
    @PostMapping("/tasks/delete-batch")
    public ResponseEntity<java.util.Map<String, Object>> deleteTasksBatch(@RequestBody List<Long> taskIds) {
        int count = renderService.deleteTasksBatch(taskIds);
        return ResponseEntity.ok(java.util.Map.of("success", true, "deletedCount", count, "message", "Đã xóa " + count + " tác vụ"));
    }
}


