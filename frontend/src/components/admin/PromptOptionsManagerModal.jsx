import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Layers, Check, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

export default function PromptOptionsManagerModal({ isOpen, onClose, onOptionUpdated }) {
  const [options, setOptions] = useState({ STYLE: [], CONTEXT: [], LIGHTING: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('STYLE'); // 'STYLE' | 'CONTEXT' | 'LIGHTING'
  
  // Form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPromptValue, setNewPromptValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load danh sách option
  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getPromptOptions();
      setOptions(res || { STYLE: [], CONTEXT: [], LIGHTING: [] });
    } catch (err) {
      console.error('Lỗi tải danh mục options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Thêm mới option
  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newPromptValue.trim()) {
      alert('Vui lòng nhập đầy đủ tên tiếng Việt và giá trị Prompt tiếng Anh!');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.createPromptOption({
        optionType: activeTab,
        displayName: newDisplayName.trim(),
        promptValue: newPromptValue.trim()
      });
      setNewDisplayName('');
      setNewPromptValue('');
      await loadOptions();
      if (onOptionUpdated) onOptionUpdated();
    } catch (err) {
      alert('Lỗi thêm tùy chọn: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa option
  const handleDeleteOption = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tùy chọn "${name}" không?`)) return;
    try {
      await apiService.deletePromptOption(id);
      await loadOptions();
      if (onOptionUpdated) onOptionUpdated();
    } catch (err) {
      alert('Lỗi xóa tùy chọn: ' + err.message);
    }
  };

  const tabs = [
    { key: 'STYLE', label: '🎨 Phong cách kiến trúc', count: (options.STYLE || []).length },
    { key: 'CONTEXT', label: '🌍 Bối cảnh môi trường', count: (options.CONTEXT || []).length },
    { key: 'LIGHTING', label: '💡 Ánh sáng & Thời tiết', count: (options.LIGHTING || []).length },
  ];

  const currentList = options[activeTab] || [];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 999 }}>
      <div
        className="prompt-details-box"
        style={{
          width: '840px',
          maxWidth: '92vw',
          maxHeight: '88vh',
          backgroundColor: '#0c101a',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              color: '#fff',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.4)'
            }}>
              <Layers size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Quản Lý Thư Viện Prompt (Admin CMS)
                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  QUYỀN ADMIN
                </span>
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Thêm, sửa các tùy chọn trong Dropdown (Phong cách, Bối cảnh, Ánh sáng) mà người dùng nhìn thấy.
              </div>
            </div>
          </div>
          <button className="icon-circle-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeTab === t.key ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                background: activeTab === t.key ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-input)',
                color: activeTab === t.key ? '#fbbf24' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: '10px',
                background: activeTab === t.key ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.08)',
                padding: '1px 6px',
                borderRadius: '99px'
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Form thêm mới */}
        <form onSubmit={handleAddOption} style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px dashed rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Thêm mới vào danh mục: {tabs.find(t => t.key === activeTab)?.label}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr auto', gap: '10px', alignItems: 'flex-start' }}>
            <div>
              <input
                type="text"
                placeholder="Tên tiếng Việt (VD: Indochine Đông Dương)"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Prompt tiếng Anh (VD: indochine style, french colonial, cement tiles...)"
                value={newPromptValue}
                onChange={(e) => setNewPromptValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Đang thêm...' : 'Thêm'}</span>
            </button>
          </div>
        </form>

        {/* Danh sách các tùy chọn hiện tại */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
              Đang tải danh sách...
            </div>
          ) : currentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
              Chưa có tùy chọn nào trong mục này.
            </div>
          ) : (
            currentList.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                    {item.displayName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
                    {item.promptValue}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteOption(item.id, item.displayName)}
                  title="Xóa tùy chọn này"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
