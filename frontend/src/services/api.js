// API service kết nối với Backend Spring Boot
const API_BASE = ''; // Dùng relative path để Vite proxy sang http://localhost:8080
const TOKEN_KEY = 'render_ai_jwt_token';

// Quản lý JWT Token trong SessionStorage / LocalStorage
export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn('Không thể lưu JWT token:', e);
  }
};

export const clearAuthToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Không thể xóa JWT token:', e);
  }
};

// Trợ giúp tự động gắn Authorization Header
const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  getAuthToken,
  setAuthToken,
  clearAuthToken,

  // Lấy thông tin tài khoản hiện tại từ JWT Token
  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        clearAuthToken();
        return null;
      }
      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.warn('Lỗi kiểm tra phiên JWT:', err);
      return null;
    }
  },

  // Lấy các tuỳ chọn Style, Context, Lighting từ Oracle DB
  async getPromptOptions() {
    try {
      const res = await fetch(`${API_BASE}/api/prompt-options`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách tùy chọn');
      const data = await res.json();
      return data.options || {};
    } catch (err) {
      console.warn('Lỗi fetch options, sử dụng fallback mặc định:', err);
      return {
        STYLE: [
          { id: 1, displayName: 'Hiện đại (Modern)', promptValue: 'modern architecture style, clean lines, minimalist elegance' },
          { id: 2, displayName: 'Tân cổ điển (Neoclassical)', promptValue: 'neoclassical architecture style, elegant arches, decorative mouldings' },
          { id: 3, displayName: 'Nhiệt đới (Tropical)', promptValue: 'tropical architecture style, lush greenery, wooden louvers' },
          { id: 4, displayName: 'Công nghiệp (Industrial)', promptValue: 'industrial architecture style, exposed brick and steel frames' },
          { id: 5, displayName: 'Bắc Âu (Scandinavian)', promptValue: 'scandinavian architecture style, bright natural light, warm wood' },
          { id: 6, displayName: 'Tối giản (Minimalist)', promptValue: 'ultra minimalist luxury architecture, pure geometric form' },
          { id: 7, displayName: 'Biệt thự Đẳng cấp (Luxury Villa)', promptValue: 'luxury high-end modern villa, cantilevered balconies, infinity pool' }
        ],
        CONTEXT: [
          { id: 10, displayName: 'Mặt phố sầm uất (City Street)', promptValue: 'located along a clean asphalt city street with modern sidewalks and neat trees' },
          { id: 11, displayName: 'Ven biển bình yên (Coastal Oceanfront)', promptValue: 'situated on a coastal beachfront with serene blue ocean background' },
          { id: 12, displayName: 'Khu đồi thông / Núi (Pine Hill)', promptValue: 'nestled on a pine hill surrounded by misty green nature' },
          { id: 13, displayName: 'Khu đô thị sinh thái (Eco Villa Park)', promptValue: 'in a master-planned green eco-residential park with landscaped lawns' },
          { id: 14, displayName: 'Bên hồ nước phẳng lặng (Lakeside)', promptValue: 'next to a calm reflective lake with soft water ripples' }
        ],
        LIGHTING: [
          { id: 20, displayName: 'Ban ngày nắng tự nhiên (Natural Sunlight)', promptValue: 'crisp bright daytime natural lighting, clear blue sky' },
          { id: 21, displayName: 'Hoàng hôn rực rỡ (Golden Hour)', promptValue: 'warm golden hour sunset lighting, soft long shadows, cinematic glow' },
          { id: 22, displayName: 'Đêm lên đèn ấm áp (Night Architectural Lighting)', promptValue: 'dusk night scene, warm interior architectural spotlights glowing, deep navy sky' },
          { id: 23, displayName: 'Bình minh sương sớm (Misty Dawn)', promptValue: 'early morning misty atmosphere with diffused soft sunlight' },
          { id: 24, displayName: 'Trời u mịt / Mưa nhẹ (Moody Overcast)', promptValue: 'cinematic overcast cloudy sky, soft diffused reflection on wet pavement' }
        ]
      };
    }
  },

  // Tạo mới tùy chọn phong cách / bối cảnh / ánh sáng (Dành cho Admin)
  async createPromptOption(payload) {
    const res = await fetch(`${API_BASE}/api/prompt-options`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Không thể thêm tùy chọn mới');
    return await res.json();
  },

  // Xóa tùy chọn (Dành cho Admin)
  async deletePromptOption(id) {
    const res = await fetch(`${API_BASE}/api/prompt-options/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể xóa tùy chọn');
    return await res.json();
  },

  // Upload file ảnh lên backend Spring Boot
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload ảnh thất bại');
    }
    return await res.json(); // { url: "/uploads/...", fileName: "...", message: "..." }
  },

  // Gọi Gemini AI để tối ưu hóa / sinh Prompt ma thuật
  async generateMagicPrompt(userInput) {
    const res = await fetch(`${API_BASE}/api/ai/generate-prompt`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userInput }),
    });

    if (!res.ok) {
      throw new Error('Không thể tạo prompt AI');
    }
    const data = await res.json();
    return data.prompt;
  },

  // Gọi Render ảnh AI
  async createRender(payload) {
    const res = await fetch(`${API_BASE}/api/render/create`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errorMessage || err.message || 'Lỗi khi yêu cầu tạo ảnh');
    }
    return await res.json(); // RenderResponseDto
  },

  // Lấy lịch sử render
  async getRenderHistory(userId = 1) {
    const res = await fetch(`${API_BASE}/api/render/history/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải lịch sử render');
    return await res.json();
  },

  // Lấy danh sách người dùng và phân quyền
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Lỗi lấy danh sách users:', err);
      return [];
    }
  },

  // Đăng nhập hệ thống (Phân quyền Admin / User & nhận JWT Access Token)
  async login(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Đăng nhập không thành công');
    }

    if (data.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data; // { success: true, accessToken, user: { id, username, email, role } }
  },

  // Đăng ký tài khoản người dùng & nhận JWT Access Token
  async register(username, email, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Đăng ký không thành công');
    }

    if (data.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  // Dành riêng cho ADMIN: Lấy bản xem trước prompt cuối cùng để chỉnh sửa
  async previewPrompt(payload) {
    const res = await fetch(`${API_BASE}/api/render/preview-prompt`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errorMessage || err.error || 'Không thể tạo bản xem trước Prompt');
    }
    const data = await res.json();
    return {
      finalPrompt: typeof data === 'string' ? data : (data.finalPrompt || '')
    };
  },

  // Dành riêng cho ADMIN: Lấy tất cả tác vụ của các user để xem prompt và ảnh đã ren
  async getAllTasksForAdmin() {
    const res = await fetch(`${API_BASE}/api/render/admin/all-tasks`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách tác vụ của users');
    return await res.json();
  },

  // Xóa 1 tác vụ render (card)
  async deleteTask(taskId) {
    const res = await fetch(`${API_BASE}/api/render/task/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Không thể xóa tác vụ #' + taskId);
    }
    return data;
  },

  // Xóa hàng loạt tác vụ render (cards)
  async deleteTasksBatch(taskIds) {
    const res = await fetch(`${API_BASE}/api/render/tasks/delete-batch`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(taskIds),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Không thể xóa danh sách tác vụ');
    }
    return data;
  }
};
