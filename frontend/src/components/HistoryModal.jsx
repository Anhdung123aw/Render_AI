import React, { useEffect, useState } from 'react';
import { X, Calendar, Camera, Download, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api';

export default function HistoryModal({ isOpen, onClose, onSelectImageForCamera }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getRenderHistory(1);
      setHistoryList(data || []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="prompt-details-box"
        style={{
          width: '900px',
          maxWidth: '92vw',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Lịch Sử Khởi Tạo Phối Cảnh</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Danh sách các tác phẩm render đã lưu trữ trong cơ sở dữ liệu
            </div>
          </div>
          <button className="icon-circle-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Đang tải lịch sử...
          </div>
        ) : historyList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            Chưa có lịch sử tạo ảnh nào. Hãy bắt đầu tạo tác phẩm đầu tiên!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {historyList.map((item) => (
              <div 
                key={item.taskId} 
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                    Task #{item.taskId} • Trạng thái: {item.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {item.finalPrompt}
                </div>

                {/* Danh sách ảnh của task */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {(item.imageUrls || []).map((imgUrl, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                      <img 
                        src={imgUrl} 
                        alt="Lịch sử" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button
                        className="btn-send-to-camera"
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          right: '6px',
                          padding: '4px 6px',
                          fontSize: '11px',
                          background: 'rgba(15, 21, 35, 0.9)'
                        }}
                        onClick={() => {
                          onSelectImageForCamera(imgUrl);
                          onClose();
                        }}
                      >
                        <Camera size={12} />
                        <span>Tạo góc camera</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
