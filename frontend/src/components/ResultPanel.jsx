import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Maximize2, 
  Camera, 
  Check, 
  Copy, 
  ExternalLink,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

function ResultImageCard({
  imgUrl,
  index,
  onLightbox,
  onDownload,
  onSendToCameraAngle
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Tự động thử lại tối đa 3 lần sau 3 giây nếu máy chủ AI đang render
  React.useEffect(() => {
    if (hasError && retryKey < 3 && imgUrl.startsWith('http')) {
      const timer = setTimeout(() => {
        setHasError(false);
        setIsLoaded(false);
        setRetryKey(k => k + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError, retryKey, imgUrl]);

  const finalSrc = imgUrl.startsWith('http')
    ? `${imgUrl}${imgUrl.includes('?') ? '&' : '?'}retry=${retryKey}`
    : imgUrl;

  return (
    <div className="result-card" style={{ maxWidth: '660px', width: '100%', margin: '0 auto' }}>
      <div className="result-card-img-wrap" style={{ position: 'relative', minHeight: '200px', maxHeight: '420px', background: '#0b1120' }}>
        {/* Skeleton nạp ảnh */}
        {!isLoaded && !hasError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-dim)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
          }}>
            <div className="spinner-ring" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Đang nạp ảnh phối cảnh...</span>
          </div>
        )}

        {/* Trạng thái lỗi: Hiện nút Thử lại thay vì icon vỡ */}
        {hasError ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '260px',
            gap: '10px',
            background: 'rgba(30, 41, 59, 0.4)',
          }}>
            <AlertCircle size={32} color="#f59e0b" />
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Ảnh đang hoàn thiện trên máy chủ AI
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '320px', lineHeight: 1.5 }}>
              Máy chủ AI FLUX có thể mất vài giây để kết xuất ảnh. Vui lòng bấm thử tải lại bên dưới:
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#f59e0b', color: '#fbbf24' }}
                onClick={() => {
                  setHasError(false);
                  setIsLoaded(false);
                  setRetryKey(k => k + 1);
                }}
              >
                <RefreshCw size={13} />
                <span>Thử tải lại</span>
              </button>
              {imgUrl.startsWith('http') && (
                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                  <span>Mở link gốc</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <img
            src={finalSrc}
            alt={`Kết quả render ${index + 1}`}
            className="result-card-img"
            style={{
              maxHeight: '420px',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
              display: hasError ? 'none' : 'block'
            }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        )}

        {/* Nút hành động nổi trên ảnh khi đã nạp xong */}
        {isLoaded && !hasError && (
          <div className="result-overlay-actions">
            <button
              className="icon-circle-btn"
              title="Phóng to ảnh"
              onClick={() => onLightbox(imgUrl)}
            >
              <Maximize2 size={15} />
            </button>
            <button
              className="icon-circle-btn"
              title="Tải ảnh về máy"
              onClick={() => onDownload(imgUrl, index)}
            >
              <Download size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Chân card với nút ĐẶC BIỆT: Tạo góc camera từ ảnh này */}
      <div className="result-card-footer">
        <button
          className="btn-send-to-camera"
          onClick={() => onSendToCameraAngle(imgUrl)}
          title="Chuyển ảnh này vào tab Góc camera để xoay góc máy khác"
          disabled={hasError}
        >
          <Camera size={15} />
          <span>Tạo góc camera từ ảnh này</span>
        </button>
      </div>
    </div>
  );
}

export default function ResultPanel({
  isRendering,
  renderResult,
  onSendToCameraAngle,
  currentUserRole = 'USER',
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
          {/*<div className="empty-desc">*/}
          {/*  Kết quả phối cảnh kiến trúc sẽ xuất hiện ở đây sau khi bạn nhấn "Tạo Ảnh".*/}
          {/*  Sau khi render xong, bạn có thể dễ dàng chuyển ảnh sang tab <strong>Góc camera</strong> để tạo thêm các góc máy khác nhau!*/}
          {/*</div>*/}
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
          <ResultImageCard
            key={index}
            imgUrl={imgUrl}
            index={index}
            onLightbox={(url) => setLightboxImage(url)}
            onDownload={(url, i) => handleDownload(url, i)}
            onSendToCameraAngle={onSendToCameraAngle}
          />
        ))}
      </div>

      {/* Thông tin Prompt được AI sinh ra (Chỉ hiển thị cho ADMIN, ẩn với USER) */}
      {currentUserRole === 'ADMIN' && renderResult.finalPrompt && (
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
