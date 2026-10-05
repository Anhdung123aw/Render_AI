import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import CreateRenderTab from './components/CreateRenderTab';
import CameraAngleTab from './components/CameraAngleTab';
import ResultPanel from './components/ResultPanel';
import HistoryModal from './components/HistoryModal';
import { AdminPromptModal, AdminDashboard, AdminPromptEditor } from './components/admin';
import LoginModal from './components/LoginModal';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'camera' | 'admin-dashboard' | 'admin-prompt-editor' | ...
  const [promptOptions, setPromptOptions] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState(null);
  const [selectedImageForCamera, setSelectedImageForCamera] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Quản lý thông tin đăng nhập người dùng:
  // - Xóa key cũ trong localStorage để khi mở link localhost ở tab mới thì luôn vào trang Đăng ký / Đăng nhập
  // - Dùng sessionStorage để giữ phiên đăng nhập trong tab hiện tại khi người dùng bấm F5 (refresh)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      localStorage.removeItem('render_ai_user');
      const saved = sessionStorage.getItem('render_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const currentUserRole = currentUser?.role || 'USER';
  const [userList, setUserList] = useState([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialPrompt, setAdminInitialPrompt] = useState('');
  const [adminPendingPayload, setAdminPendingPayload] = useState(null);
  const [isPreviewingAdmin, setIsPreviewingAdmin] = useState(false);

  // Khởi tạo tab đúng theo vai trò (ADMIN → admin-prompt-editor; USER → create)
  useEffect(() => {
    if (currentUserRole === 'ADMIN' && (activeTab === 'create' || activeTab === 'admin-dashboard')) {
      setActiveTab('admin-prompt-editor');
    } else if (currentUserRole === 'USER' && (activeTab === 'admin-prompt-editor' || activeTab === 'admin-dashboard')) {
      setActiveTab('create');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserRole]);

  // Load danh mục tùy chọn & người dùng từ backend khi app khởi chạy
  useEffect(() => {
    async function loadData() {
      try {
        const options = await apiService.getPromptOptions();
        setPromptOptions(options);
      } catch (err) {
        console.error('Lỗi tải Prompt Options:', err);
      }

      try {
        const users = await apiService.getUsers();
        if (Array.isArray(users) && users.length > 0) {
          setUserList(users);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách người dùng:', err);
      }
    }
    loadData();
  }, []);

  // Lấy ID người dùng an toàn
  const currentUserId = useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    const matched = userList.find((u) => u.role === currentUserRole);
    if (matched && matched.id) return matched.id;
    return currentUserRole === 'ADMIN' ? 21 : 22;
  }, [currentUser, userList, currentUserRole]);

  // Đăng nhập thành công → chuyển đúng tab theo vai trò
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('render_ai_user', JSON.stringify(user));
      localStorage.removeItem('render_ai_user');
    } catch (e) {
      console.warn('Không thể lưu sessionStorage:', e);
    }
    // Admin → Edit Prompt; User → Tạo Ảnh
    setActiveTab(user.role === 'ADMIN' ? 'admin-prompt-editor' : 'create');
  };

  // Đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('render_ai_user');
      localStorage.removeItem('render_ai_user');
    } catch (e) {}
    setIsLoginModalOpen(false);
  };

  // Xử lý gửi lệnh render tạo ảnh
  const handleRenderSubmit = async (payload) => {
    try {
      setIsRendering(true);
      const res = await apiService.createRender(payload);
      if (res.status === 'FAILED') {
        alert('Tạo ảnh thất bại: ' + (res.errorMessage || 'Lỗi hệ thống'));
      } else {
        setRenderResult(res);
      }
    } catch (err) {
      alert('Lỗi kết nối tới Backend Render: ' + err.message);
    } finally {
      setIsRendering(false);
    }
  };

  // Admin: Xem trước & Tinh chỉnh prompt cuối trước khi render
  const handleRequestAdminPreview = async (payload) => {
    try {
      setIsPreviewingAdmin(true);
      setAdminPendingPayload(payload);
      const res = await apiService.previewPrompt(payload);
      if (res && res.finalPrompt) {
        setAdminInitialPrompt(res.finalPrompt);
        setIsAdminModalOpen(true);
      } else {
        alert('Không nhận được prompt từ hệ thống xem trước!');
      }
    } catch (err) {
      alert('Lỗi tạo bản xem trước Prompt cho Admin: ' + err.message);
    } finally {
      setIsPreviewingAdmin(false);
    }
  };

  // Admin: Xác nhận gửi render với prompt đã được tinh chỉnh
  const handleAdminConfirmRender = async (editedPrompt) => {
    setIsAdminModalOpen(false);
    if (!adminPendingPayload) return;
    const finalPayload = {
      ...adminPendingPayload,
      customFinalPrompt: editedPrompt,
    };
    await handleRenderSubmit(finalPayload);
  };

  // Tính năng quan trọng: Chuyển ảnh render sang Tab Góc Camera
  const handleSendToCameraAngle = (imageUrl) => {
    setSelectedImageForCamera(imageUrl);
    setActiveTab('camera');
  };

  // Bắt buộc đăng nhập mới được vào Studio: Hiển thị LoginModal (Đăng nhập / Đăng ký)
  if (!currentUser) {
    return (
      <div
        className="app-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #1e293b 0%, #090d16 100%)',
          position: 'relative',
        }}
      >
        <LoginModal
          isOpen={true}
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
          currentUser={null}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        currentRole={currentUserRole}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      {activeTab === 'admin-prompt-editor' ? (
        /* Admin: Quản lý xem toàn bộ users, ảnh đã ren và trực tiếp edit prompt */
        <AdminPromptEditor
          onSubmitRender={handleRenderSubmit}
          isRendering={isRendering}
          currentUserId={currentUserId}
          onSendToCameraAngle={handleSendToCameraAngle}
        />
      ) : activeTab === 'admin-dashboard' ? (
        /* Admin: Full-width 3-column layout studio */
        <AdminDashboard
          promptOptions={promptOptions}
          onSubmitRender={handleRenderSubmit}
          isRendering={isRendering}
          currentUserId={currentUserId}
          renderResult={renderResult}
          onSendToCameraAngle={handleSendToCameraAngle}
        />
      ) : (
        /* User: Standard 2-column layout */
        <div className="main-workspace">
          {activeTab === 'create' && (
            <CreateRenderTab
              promptOptions={promptOptions}
              onSubmitRender={handleRenderSubmit}
              isRendering={isRendering || isPreviewingAdmin}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              onRequestAdminPreview={handleRequestAdminPreview}
            />
          )}

          {activeTab === 'camera' && (
            <CameraAngleTab
              selectedImageForCamera={selectedImageForCamera}
              onClearSelectedImage={() => setSelectedImageForCamera(null)}
              onSubmitRender={handleRenderSubmit}
              isRendering={isRendering || isPreviewingAdmin}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              onRequestAdminPreview={handleRequestAdminPreview}
            />
          )}

          {activeTab !== 'create' && activeTab !== 'camera' && (
            <div className="sidebar-panel" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                Tính năng <strong>{activeTab.toUpperCase()}</strong> đang được hoàn thiện. Vui lòng trải nghiệm tính năng <strong>Tạo Ảnh</strong> và <strong>Góc camera</strong>!
              </div>
              <button
                className="btn-secondary"
                style={{ marginTop: '12px' }}
                onClick={() => setActiveTab('create')}
              >
                Về Tạo Ảnh
              </button>
            </div>
          )}

          {/* Right Side: Kết quả Render */}
          <ResultPanel
            isRendering={isRendering}
            renderResult={renderResult}
            onSendToCameraAngle={handleSendToCameraAngle}
            currentUserRole={currentUserRole}
          />
        </div>
      )}


      {/* Modal Lịch sử Render */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectImageForCamera={handleSendToCameraAngle}
        userId={currentUserId}
      />

      {/* Modal Admin Chỉnh Sửa Prompt Cuối Cùng */}
      <AdminPromptModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialPrompt={adminInitialPrompt}
        payload={adminPendingPayload}
        onConfirmRender={handleAdminConfirmRender}
        isRendering={isRendering}
      />

      {/* Modal Đăng nhập / Đăng ký phân quyền */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}


