import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Crop, Plus, Minus, Sparkles, UploadCloud, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function CameraAngleTab({
  selectedImageForCamera,
  onClearSelectedImage,
  onSubmitRender,
  isRendering,
}) {
  const [activeImage, setActiveImage] = useState(selectedImageForCamera || null);
  const [selectedCameraAngle, setSelectedCameraAngle] = useState('high-angle');
  const [customDescription, setCustomDescription] = useState('Chụp từ trên cao xuống (high-angle shot)');
  const [isCropActive, setIsCropActive] = useState(false);
  const [numImages, setNumImages] = useState(1);
  const [aiProvider, setAiProvider] = useState('NANO_BANANA'); // 'NANO_BANANA' | 'FLUX'
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Danh mục các góc máy kiến trúc chuẩn studio
  const cameraAnglePresets = [
    {
      id: 'high-angle',
      label: 'Chụp từ trên cao xuống',
      promptDesc: 'Chụp từ trên cao xuống (high-angle shot), bao quát toàn bộ khối công trình và sân vườn phía dưới',
    },
    {
      id: 'drone-aerial',
      label: 'Toàn cảnh trên không (Bird\'s-eye drone)',
      promptDesc: 'Toàn cảnh từ trên không bằng flycam (bird\'s eye drone view), thấy rõ quy hoạch tổng thể khu đất và mái công trình',
    },
    {
      id: 'eye-level',
      label: 'Góc nhìn ngang tầm mắt (Eye-level shot)',
      promptDesc: 'Góc chụp ngang tầm mắt người đứng (human eye-level view), tỉ lệ thực tế chân thực và sống động',
    },
    {
      id: 'low-angle',
      label: 'Góc thấp ngước lên (Low-angle / Worm\'s-eye)',
      promptDesc: 'Góc chụp thấp từ dưới đất ngước nhìn lên (dramatic low-angle worm\'s eye view), tôn lên vẻ bề thế và chiều cao uy nghi của tòa nhà',
    },
    {
      id: 'close-up',
      label: 'Chỉ định góc cận cảnh chi tiết (Close-up detail)',
      promptDesc: 'Chụp cận cảnh chi tiết mặt tiền kiến trúc (architectural close-up shot), nhấn mạnh chất liệu hoàn thiện và đường nét ban công',
    },
    {
      id: 'isometric',
      label: 'Góc phối cảnh nghiêng 45° (Isometric perspective)',
      promptDesc: 'Góc nhìn phối cảnh chéo 45 độ (isometric perspective 3D view), thấy rõ 2 mặt tiền chính và chiều sâu không gian',
    },
    {
      id: 'frontal',
      label: 'Chụp trực diện chính diện (Frontal elevation shot)',
      promptDesc: 'Góc chụp thẳng chính diện 1 điểm tụ (one-point perspective frontal elevation), thể hiện tính cân bằng và hình khối mặt đứng',
    }
  ];

  // Khi selectedImageForCamera từ ngoài truyền vào thay đổi
  useEffect(() => {
    if (selectedImageForCamera) {
      setActiveImage(selectedImageForCamera);
    }
  }, [selectedImageForCamera]);

  // Cập nhật mô tả tùy chỉnh khi đổi dropdown góc camera
  const handleAngleChange = (angleId) => {
    setSelectedCameraAngle(angleId);
    const found = cameraAnglePresets.find(p => p.id === angleId);
    if (found) {
      setCustomDescription(found.promptDesc);
    }
  };

  // Upload ảnh mới trực tiếp tại tab Góc camera
  const handleUploadImage = async (file) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await apiService.uploadImage(file);
      setActiveImage({
        url: res.url,
        preview: URL.createObjectURL(file),
      });
    } catch (err) {
      alert('Tải ảnh lên thất bại: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit tạo ảnh góc camera
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeImage) {
      alert('Vui lòng chọn hoặc tải lên một bức ảnh công trình để tạo góc camera!');
      return;
    }

    const payload = {
      userId: 1,
      originalImageUrl: activeImage.url || activeImage,
      styleImageUrl: null,
      basePrompt: `${customDescription}, architectural rendering, consistent building design, photorealistic, 8k, sharp focus`,
      styleOptionId: null,
      contextOptionId: null,
      lightingOptionId: null,
      negativePrompt: 'distorted geometry, structural changes, blurry, cartoon, low quality, deformed facade',
      aspectRatio: '16:9',
      numImages: numImages,
      aiProvider: aiProvider
    };

    onSubmitRender(payload);
  };

  return (
    <form className="sidebar-panel" onSubmit={handleSubmit}>
      {/* 1. Ảnh tham chiếu / Đầu vào */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">1. Ảnh công trình cần đổi góc máy</span>
          {activeImage && (
            <button
              type="button"
              className="link-btn"
              style={{ color: '#ef4444' }}
              onClick={() => {
                setActiveImage(null);
                if (onClearSelectedImage) onClearSelectedImage();
              }}
            >
              Xóa
            </button>
          )}
        </div>

        {activeImage ? (
          <div className="dropzone-preview-container" style={{ height: '170px' }}>
            <img
              src={activeImage.preview || activeImage.url || activeImage}
              alt="Ảnh gốc cần xoay góc"
              className="dropzone-preview-img"
            />
            {isCropActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: '20px',
                  border: '2px dashed var(--primary)',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  borderRadius: '6px'
                }}
              >
                Vùng tiêu điểm cận cảnh
              </div>
            )}
          </div>
        ) : (
          <div
            className="dropzone-box"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => handleUploadImage(e.target.files[0])}
            />
            <div className="dropzone-content">
              <div className="dropzone-icon">
                <UploadCloud size={20} />
              </div>
              <div className="dropzone-text">
                {isUploading ? 'Đang tải lên...' : 'Chọn ảnh công trình để đổi góc'}
              </div>
              <div className="dropzone-hint">
                Hoặc render xong ở tab "Tạo Ảnh", bấm "Chuyển sang góc camera"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Chỉ định góc cận cảnh (Tùy chọn) */}
      <div className="control-section">
        <span className="section-title">2. Chỉ định góc cận cảnh (Tùy chọn)</span>
        <div className="section-subtext">
          Vẽ một hình chữ nhật trên ảnh để AI tự động render cận cảnh khu vực đó
        </div>
        <button
          type="button"
          className="btn-secondary"
          style={{
            borderColor: isCropActive ? 'var(--primary)' : undefined,
            color: isCropActive ? 'var(--primary)' : undefined,
          }}
          onClick={() => setIsCropActive(!isCropActive)}
          disabled={!activeImage}
        >
          <Crop size={14} />
          <span>{isCropActive ? 'Đã kích hoạt vùng chọn' : '✏️ Chọn vùng'}</span>
        </button>
      </div>

      {/* 3. Chọn góc camera */}
      <div className="control-section">
        <span className="section-title">3. Chọn góc camera</span>
        <select
          className="custom-select"
          value={selectedCameraAngle}
          onChange={(e) => handleAngleChange(e.target.value)}
        >
          {cameraAnglePresets.map((angle) => (
            <option key={angle.id} value={angle.id}>
              {angle.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Mô tả tùy chỉnh */}
      <div className="control-section">
        <span className="section-title">4. Mô tả tùy chỉnh</span>
        <textarea
          className="custom-textarea"
          rows={3}
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="Mô tả chi tiết góc chụp bạn mong muốn..."
        />
      </div>

      {/* 5. Số lượng ảnh */}
      <div className="control-section">
        <span className="section-title">5. Số lượng ảnh</span>
        <div className="stepper-row">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => setNumImages((prev) => Math.max(1, prev - 1))}
          >
            <Minus size={14} />
          </button>
          <span className="stepper-value">{numImages}</span>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => setNumImages((prev) => Math.min(4, prev + 1))}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* 6. Lựa chọn Mô hình AI */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">6. Mô hình AI Render</span>
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
            {aiProvider === 'NANO_BANANA' ? '🍌 Khuyên dùng' : '⚡ Nhanh / Free'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            type="button"
            className={`aspect-btn ${aiProvider === 'NANO_BANANA' ? 'active' : ''}`}
            onClick={() => setAiProvider('NANO_BANANA')}
            title="Google Gemini Nano Banana: Giữ nguyên hình khối công trình gốc"
          >
            🍌 Nano Banana
          </button>
          <button
            type="button"
            className={`aspect-btn ${aiProvider === 'FLUX' ? 'active' : ''}`}
            onClick={() => setAiProvider('FLUX')}
            title="FLUX Engine: Render nhanh góc máy mới"
          >
            ⚡ FLUX.1
          </button>
        </div>
      </div>

      {/* Nút Tạo Ảnh Góc Camera */}
      <button
        type="submit"
        className="btn-submit-render"
        disabled={isRendering || !activeImage}
      >
        <Camera size={18} />
        <span>{isRendering ? 'Đang Tạo Góc Camera...' : 'Tạo Ảnh'}</span>
      </button>
    </form>
  );
}

