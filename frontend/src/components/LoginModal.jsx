import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, LogIn, UserPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, currentUser }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (tab === 'login') {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
        return;
      }
      try {
        setIsLoading(true);
        const res = await apiService.login(username.trim(), password.trim());
        if (res && res.user) {
          setSuccessMsg(`Chào mừng ${res.user.username} (${res.user.role})!`);
          setTimeout(() => {
            onLoginSuccess(res.user);
            onClose();
          }, 500);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Đăng ký tài khoản
      if (!username.trim() || !password.trim()) {
        setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu!');
        return;
      }
      try {
        setIsLoading(true);
        const res = await apiService.register(username.trim(), email.trim(), password.trim());
        if (res && res.user) {
          setSuccessMsg('Đăng ký thành công! Đang tự động đăng nhập...');
          setTimeout(() => {
            onLoginSuccess(res.user);
            onClose();
          }, 600);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Đăng ký không thành công!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={currentUser ? onClose : undefined}>
      <div
        className="prompt-details-box"
        style={{
          width: '460px',
          maxWidth: '92vw',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(249, 115, 22, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 25px rgba(249, 115, 22, 0.15)',
          borderRadius: '16px',
          padding: '28px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng - Chỉ hiển thị khi đã đăng nhập (đổi tài khoản) */}
        {currentUser && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
            }}
            title="Đóng"
          >
            <X size={20} />
          </button>
        )}

        {/* Tiêu đề Modal */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.3) 100%)',
              color: '#f97316',
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Hệ Thống Render AI
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
            {currentUser 
              ? (tab === 'login' ? 'Đổi tài khoản đăng nhập Studio' : 'Đăng ký tài khoản Kiến trúc sư mới')
              : (tab === 'login' ? 'Vui lòng đăng nhập để truy cập nền tảng RenderAI' : 'Đăng ký tài khoản Kiến trúc sư mới')}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: tab === 'login' ? 'var(--accent-orange)' : 'transparent',
              color: tab === 'login' ? '#ffffff' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: tab === 'register' ? 'var(--accent-orange)' : 'transparent',
              color: tab === 'register' ? '#ffffff' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
          >
            Đăng Ký
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="input-prompt"
                style={{ width: '100%', paddingLeft: '38px', height: '40px' }}
                placeholder="Nhập username (vd: admin, user)..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Email (Tùy chọn)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  className="input-prompt"
                  style={{ width: '100%', paddingLeft: '38px', height: '40px' }}
                  placeholder="name@renderai.com..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="input-prompt"
                style={{ width: '100%', paddingLeft: '38px', height: '40px' }}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-render"
            style={{
              marginTop: '8px',
              height: '42px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : tab === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Đăng Nhập Ngay</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Đăng Ký Tài Khoản</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
