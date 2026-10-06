import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Sparkles, Send, Plus, Check } from 'lucide-react';

export default function AdminPromptModal({
  isOpen,
  onClose,
  initialPrompt,
  payload,
  onConfirmRender,
  isRendering,
}) {
  const [editedPrompt, setEditedPrompt] = useState(initialPrompt || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedPrompt(initialPrompt || '');
  }, [initialPrompt]);

  if (!isOpen) return null;

  // Các từ khóa đắt giá của kiến trúc sư để thêm nhanh
  const quickKeywords = [
    { label: '🌿 Tăng cây leo & hoa ban công', text: ', lush cascading hanging creepers and blooming bougainvillea on balconies' },
    { label: '🏛️ Bê tông mài mịn cao cấp', text: ', smooth fair-faced architectural concrete finish, refined surface texture' },
    { label: '🪟 Kính Low-E phản xạ hoàng hôn', text: ', modern Low-E tinted glass panels with soft warm sunset sky reflection' },
    { label: '🌇 Nắng chiều 16h30 ấm áp', text: ', dramatic 4:30 PM warm golden hour sunlight, long crisp shadows' },
    { label: '🔒 Khóa 100% hình khối kiến trúc', text: ', strictly preserve exact original building proportions, balconies and facade layout' },
    { label: '📷 Ống kính kiến trúc 24mm TS', text: ', architectural photography, shot on 24mm tilt-shift lens, perfectly straight vertical lines' },
  ];

  const handleAppendKeyword = (text) => {
    setEditedPrompt((prev) => prev.trim() + text);
  };

  const handleConfirm = () => {
    onConfirmRender(editedPrompt);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="prompt-details-box"
        style={{
          width: '780px',
          maxWidth: '92vw',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Phê Duyệt & Tinh Chỉnh Prompt Cuối Cùng
                <span style={{ fontSize: '11px', background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(234, 88, 12, 0.25)', fontWeight: 700 }}>
                  QUYỀN ADMIN
                </span>
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Admin có quyền can thiệp, bổ sung từ khóa kỹ thuật trước khi lệnh render được gửi tới AI Engine.
              </div>
            </div>
          </div>
          <button className="icon-circle-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Thông tin cấu hình hiện tại */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
          <div><strong style={{ color: 'var(--text-dim)' }}>Mô hình AI:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{payload?.aiProvider || 'NANO_BANANA'}</span></div>
          <div><strong style={{ color: 'var(--text-dim)' }}>Tỷ lệ:</strong> <span style={{ color: 'var(--text-main)' }}>{payload?.aspectRatio || '16:9'}</span></div>
          <div><strong style={{ color: 'var(--text-dim)' }}>Ảnh gốc:</strong> <span style={{ color: 'var(--text-main)' }}>{payload?.originalImageUrl ? '✅ Đã đính kèm bản vẽ 3D' : 'Chỉ dùng Text'}</span></div>
        </div>

        {/* Textarea chỉnh sửa Prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Final Prompt tiếng Anh (Đã qua xử lý bởi Gemini Vision & LLM):
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {editedPrompt.length} ký tự
            </span>
          </div>
          <textarea
            className="custom-textarea"
            rows={6}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            style={{ 
              fontSize: '13px', 
              lineHeight: '1.6', 
              fontFamily: 'monospace',
              border: '1.5px solid var(--primary)',
              backgroundColor: '#ffffff',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Gợi ý thêm nhanh từ khóa chuyên ngành */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            ⚡ Thêm nhanh thuật ngữ chuyên ngành kiến trúc (Click để chèn vào cuối Prompt):
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {quickKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px' }}
                onClick={() => handleAppendKeyword(kw.text)}
              >
                <Plus size={11} />
                <span>{kw.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '6px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isRendering}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn-submit-render"
            style={{ 
              margin: 0, 
              padding: '10px 20px', 
              fontSize: '13.5px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
            }}
            onClick={handleConfirm}
            disabled={isRendering || !editedPrompt.trim()}
          >
            <Send size={15} />
            <span>{isRendering ? 'Đang gửi AI Render...' : '🚀 Phê Duyệt & Gửi Render Lên AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
