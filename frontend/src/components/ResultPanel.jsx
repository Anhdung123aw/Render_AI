import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Maximize2, 
  Camera, 
  Check, 
  Copy, 
  ExternalLink,
  Layers
} from 'lucide-react';

export default function ResultPanel({
  isRendering,
  renderResult,
  onSendToCameraAngle,
}) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Copy prompt vào clipboard
  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Tải ảnh về máy
  const handleDownload = (imageUrl, index) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `render-ai-${Date.now()}-${index + 1}.jpg`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xử lý khi đang render
  if (isRendering) {
    return (
      <main className="result-panel">
        <div className="loading-render-box">
          <div className="spinner-ring" />
          <div>
            <div className="empty-title">Đang Khởi Tạo Phối Cảnh Kiến Trúc</div>
            <div className="empty-desc" style={{ marginTop: '4px' }}>
              Hệ thống Dual-AI đang tối ưu hóa phối cảnh và ánh sáng thực tế...
            </div>
          </div>

          <div className="loading-steps-list">
            <div className="loading-step-item active">
              <span>●</span>
              <span>1. Phân tích kết cấu kiến trúc bằng Gemini Vision</span>
            </div>
            <div className="loading-step-item active">
              <span>●</span>
              <span>2. Chuẩn hóa & mở rộng Prompt kiến trúc chuyên nghiệp</span>
            </div>
            <div className="loading-step-item active">
              <span>●</span>
              <span>3. Render ảnh chất lượng 8K Photorealistic với FLUX AI</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Khi chưa có kết quả (Empty State)
  if (!renderResult || (!renderResult.imageUrls?.length && !renderResult.base64Images?.length)) {
    return (
      <main className="result-panel">
        <div className="empty-state-box">
          <div className="empty-sparkle-icon">
            <Sparkles size={32} />
          </div>
          <div className="empty-title">Kết Quả Render</div>
          <div className="empty-desc">
            Kết quả phối cảnh kiến trúc sẽ xuất hiện ở đây sau khi bạn nhấn "Tạo Ảnh".
            Sau khi render xong, bạn có thể dễ dàng chuyển ảnh sang tab <strong>Góc camera</strong> để tạo thêm các góc máy khác nhau!
          </div>
        </div>
      </main>
    );
  }

  // Danh sách ảnh kết quả
  const allImages = [
    ...(renderResult.imageUrls || []),
    ...(renderResult.base64Images?.map(b => `data:image/png;base64,${b}`) || [])
  ];

  return (
    <main className="result-panel">
      {/* Header kết quả */}
      <div className="results-header-row">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Tác Phẩm Render Hoàn Thành</h2>
          <div className="results-count-badge">
            {allImages.length} bức ảnh được khởi tạo thành công bởi FLUX Engine
          </div>
        </div>
      </div>

      {/* Lưới ảnh */}
      <div className="results-grid">
        {allImages.map((imgUrl, index) => (
          <div key={index} className="result-card">
            <div className="result-card-img-wrap">
              <img
                src={imgUrl}
                alt={`Kết quả render ${index + 1}`}
                className="result-card-img"
              />

              {/* Nút hành động nổi trên ảnh */}
              <div className="result-overlay-actions">
                <button
                  className="icon-circle-btn"
                  title="Phóng to ảnh"
                  onClick={() => setLightboxImage(imgUrl)}
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  className="icon-circle-btn"
                  title="Tải ảnh về máy"
                  onClick={() => handleDownload(imgUrl, index)}
                >
                  <Download size={15} />
                </button>
              </div>
            </div>

            {/* Chân card với nút ĐẶC BIỆT: Tạo góc camera từ ảnh này */}
            <div className="result-card-footer">
              <button
                className="btn-send-to-camera"
                onClick={() => onSendToCameraAngle(imgUrl)}
                title="Chuyển ảnh này vào tab Góc camera để xoay góc máy khác"
              >
                <Camera size={15} />
                <span>Tạo góc camera từ ảnh này</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Thông tin Prompt được AI sinh ra */}
      {renderResult.finalPrompt && (
        <div className="prompt-details-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="prompt-details-title">Prompt kiến trúc đã được chuẩn hóa bởi Gemini</span>
            <button
              className="link-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
              onClick={() => handleCopyPrompt(renderResult.finalPrompt)}
            >
              {copiedPrompt ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedPrompt ? 'Đã sao chép!' : 'Sao chép Prompt'}</span>
            </button>
          </div>
          <div className="prompt-details-content">
            {renderResult.finalPrompt}
          </div>
        </div>
      )}

      {/* Lightbox Xem ảnh Fullscreen */}
      {lightboxImage && (
        <div className="modal-backdrop" onClick={() => setLightboxImage(null)}>
          <button className="modal-close-btn" onClick={() => setLightboxImage(null)}>
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Phóng to tác phẩm"
            className="modal-content-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
