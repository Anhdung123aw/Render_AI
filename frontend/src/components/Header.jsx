import React from 'react';
import { Sparkles, Camera, Image, Layers, Sliders, History, Globe, Crown, User, LogOut } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenHistory,
  currentRole,
  currentUser,
  onOpenLogin,
  onLogout,
}) {

  const isAdmin = currentRole === 'ADMIN';

  const userTabs = [
    { id: 'create', label: 'Tạo Ảnh', icon: Sparkles },
    { id: 'camera', label: 'Góc camera', icon: Camera, badge: 'HOT' },
    { id: 'edit',   label: 'Edit Ảnh', icon: Image },
    { id: 'plan3d', label: 'Plan to 3D', icon: Layers },
    { id: 'canva',  label: 'Canva Mix', icon: Sliders },
  ];

  const adminTabs = [
    { id: 'admin-prompt-editor', label: 'EditPrompt' },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;


  return (
    <header className="app-header">
      {/* Cụm bên trái: Brand Logo + Toàn bộ Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="header-brand">
          <div className="brand-icon-box">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="brand-title">AIRender</div>
            <div className="brand-subtitle">Nền tảng Render Kiến Trúc AI Đỉnh Cao</div>
          </div>
        </div>

        {/* Tabs nằm ngay cạnh Brand ở cột ngoài cùng bên trái */}
        <nav className="header-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin-dashboard' || tab.id === 'admin-prompt-editor';
            return (
              <button
                key={tab.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                style={isAdminTab ? {
                  background: isActive
                    ? 'var(--primary-gradient)'
                    : 'rgba(234, 88, 12, 0.08)',
                  borderColor: isActive ? 'var(--primary)' : 'rgba(234, 88, 12, 0.25)',
                  color: isActive ? '#ffffff' : '#ea580c',
                  fontWeight: 800,
                  boxShadow: isActive ? '0 2px 10px var(--primary-glow)' : 'none'
                } : undefined}
                onClick={() => setActiveTab(tab.id)}
              >
                {Icon && <Icon size={15} color={isAdminTab ? (isActive ? '#ffffff' : '#ea580c') : undefined} />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="nav-tab-badge" style={isAdminTab ? {
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                  } : undefined}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        {/* Nút Lịch sử */}
        <button 
          className="btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={onOpenHistory}
        >
          <History size={14} />
          <span>Lịch sử</span>
        </button>

        {/* Profile Người dùng & Nút Đăng xuất */}
        {currentUser ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {isAdmin ? <Crown size={14} /> : <User size={14} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentUser.username}
              </span>
              <span style={{ fontSize: '10px', color: isAdmin ? '#ea580c' : 'var(--text-dim)', fontWeight: 600 }}>
                {isAdmin ? 'Quản trị viên' : 'Kiến trúc sư'}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: '4px',
              }}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={12} />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              background: 'var(--accent-orange)',
              borderColor: 'transparent',
              color: '#fff',
              fontWeight: 700,
            }}
            onClick={onOpenLogin}
          >
            <User size={14} />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}

