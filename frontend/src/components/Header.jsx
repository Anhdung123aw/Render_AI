import React from 'react';
import { Sparkles, Camera, Image, Layers, Sliders, History, Globe } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenHistory }) {
  const tabs = [
    { id: 'create', label: 'Tạo Ảnh', icon: Sparkles },
    { id: 'camera', label: 'Góc camera', icon: Camera, badge: 'HOT' },
    { id: 'edit', label: 'Edit Ảnh', icon: Image },
    { id: 'plan3d', label: 'Plan to 3D', icon: Layers },
    { id: 'canva', label: 'Canva Mix', icon: Sliders },
  ];

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="header-brand">
        <div className="brand-icon-box">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-title">AIComplex Studio</div>
          <div className="brand-subtitle">Nền tảng Render Kiến Trúc AI Đỉnh Cao</div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="header-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && <span className="nav-tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="header-actions">
        <button 
          className="btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={onOpenHistory}
        >
          <History size={14} />
          <span>Lịch sử Render</span>
        </button>

        <div className="user-badge">
          <div className="online-dot" title="Hệ thống AI sẵn sàng" />
          <span>AI Engine: FLUX + Gemini</span>
        </div>

        <button 
          className="icon-circle-btn" 
          title="Ngôn ngữ: Tiếng Việt"
          style={{ width: '34px', height: '34px' }}
        >
          <Globe size={15} />
        </button>
      </div>
    </header>
  );
}
