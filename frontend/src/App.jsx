import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import CreateRenderTab from './components/CreateRenderTab';
import CameraAngleTab from './components/CameraAngleTab';
import ResultPanel from './components/ResultPanel';
import HistoryModal from './components/HistoryModal';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'camera' | 'edit' | 'plan3d'
  const [promptOptions, setPromptOptions] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState(null);
  const [selectedImageForCamera, setSelectedImageForCamera] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load danh mục tùy chọn từ backend khi app khởi chạy
  useEffect(() => {
    async function loadOptions() {
      try {
        const options = await apiService.getPromptOptions();
        setPromptOptions(options);
      } catch (err) {
        console.error('Lỗi tải Prompt Options:', err);
      }
    }
    loadOptions();
  }, []);

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

  // Tính năng quan trọng: Chuyển ảnh render sang Tab Góc Camera
  const handleSendToCameraAngle = (imageUrl) => {
    setSelectedImageForCamera(imageUrl);
    setActiveTab('camera');
  };

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Workspace Layout (Left: Sidebar Controls, Right: Visual Result) */}
      <div className="main-workspace">
        {/* Left Sidebars theo từng Tab */}
        {activeTab === 'create' && (
          <CreateRenderTab
            promptOptions={promptOptions}
            onSubmitRender={handleRenderSubmit}
            isRendering={isRendering}
          />
        )}

        {activeTab === 'camera' && (
          <CameraAngleTab
            selectedImageForCamera={selectedImageForCamera}
            onClearSelectedImage={() => setSelectedImageForCamera(null)}
            onSubmitRender={handleRenderSubmit}
            isRendering={isRendering}
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

        {/* Right Side: Kết quả Render & Thao tác sau khi render */}
        <ResultPanel
          isRendering={isRendering}
          renderResult={renderResult}
          onSendToCameraAngle={handleSendToCameraAngle}
        />
      </div>

      {/* Modal Lịch sử Render */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectImageForCamera={handleSendToCameraAngle}
      />
    </div>
  );
}
