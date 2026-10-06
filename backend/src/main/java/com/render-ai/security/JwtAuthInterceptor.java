package com.renderai.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Bỏ qua preflight request CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            request.setAttribute("authenticatedUserId", userId);
            request.setAttribute("authenticatedUsername", username);
            request.setAttribute("authenticatedRole", role);
        }

        // Kiểm tra phân quyền bảo vệ các endpoint Admin
        String uri = request.getRequestURI();
        if (uri.startsWith("/api/render/admin") || uri.startsWith("/api/admin")) {
            String role = (String) request.getAttribute("authenticatedRole");
            if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"success\":false,\"message\":\"Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (ADMIN)\"}");
                return false;
            }
        }

        return true;
    }
}
