import React, { useRef, useState } from 'react';
import { UploadCloud, X, Wand2, Sparkles, Image as ImageIcon, Plus, Minus, Crown } from 'lucide-react';
import { apiService } from '../services/api';

export default function CreateRenderTab({
  promptOptions,
  onSubmitRender,
  isRendering,
  currentUserRole = 'USER',
  currentUserId,
  onRequestAdminPreview,
}) {
  // States
  const [originalImage, setOriginalImage] = useState(null); // File hoặc { url, preview }
  const [styleImage, setStyleImage] = useState(null);
  const [basePrompt, setBasePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedLighting, setSelectedLighting] = useState('');

  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [numImages, setNumImages] = useState(1);
  const [aiProvider, setAiProvider] = useState('NANO_BANANA'); // 'NANO_BANANA' | 'FLUX' | 'OPENAI'
  const [isGeneratingMagic, setIsGeneratingMagic] = useState(false);
  const [isUploadingOriginal, setIsUploadingOriginal] = useState(false);

  const fileInputRef = useRef(null);
  const styleInputRef = useRef(null);

  // Xử lý upload ảnh gốc
  const handleOriginalUpload = async (file) => {
    if (!file) return;
    try {
      setIsUploadingOriginal(true);
      const res = await apiService.uploadImage(file);
      setOriginalImage({
        url: res.url,
        preview: URL.createObjectURL(file),
      });
    } catch (err) {
      alert('Upload ảnh gốc thất bại: ' + err.message);
    } finally {
      setIsUploadingOriginal(false);
    }
  };

  // Xử lý upload ảnh style
  const handleStyleUpload = async (file) => {
    if (!file) return;
    try {
      const res = await apiService.uploadImage(file);
      setStyleImage({
        url: res.url,
        preview: URL.createObjectURL(file),
      });
    } catch (err) {
      alert('Upload ảnh style thất bại: ' + err.message);
    }
  };

  // Nút AI Magic Prompt
  const handleMagicPrompt = async () => {
    if (!basePrompt.trim()) {
      alert('Vui lòng nhập ý tưởng trước để AI hỗ trợ phát triển Prompt!');
      return;
    }
    try {
      setIsGeneratingMagic(true);
      const optimized = await apiService.generateMagicPrompt(basePrompt);
      if (optimized) {
        setBasePrompt(optimized);
      }
    } catch (err) {
      alert('Không thể tạo Magic Prompt: ' + err.message);
    } finally {
      setIsGeneratingMagic(false);
    }
  };

  // Gửi tạo ảnh
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!basePrompt.trim() && !originalImage) {
      alert('Vui lòng nhập Prompt hoặc tải lên ảnh công trình!');
      return;
    }

    const payload = {
      userId: currentUserId || (currentUserRole === 'ADMIN' ? 21 : 22),
      originalImageUrl: originalImage?.url || null,
      styleImageUrl: styleImage?.url || null,
      basePrompt: basePrompt.trim(),
      styleOptionId: selectedStyle ? Number(selectedStyle) : null,
      contextOptionId: selectedContext ? Number(selectedContext) : null,
      lightingOptionId: selectedLighting ? Number(selectedLighting) : null,
      negativePrompt: negativePrompt.trim(),
      aspectRatio: aspectRatio,
      numImages: numImages,
      aiProvider: aiProvider,
      userRole: currentUserRole
    };

    // Nếu là ADMIN: Kích hoạt modal xem trước & tinh chỉnh prompt cuối cùng trước khi render
    if (currentUserRole === 'ADMIN' && onRequestAdminPreview) {
      onRequestAdminPreview(payload);
    } else {
      // User thường: Gửi trực tiếp
      onSubmitRender(payload);
    }
  };

  const aspectList = [
    { id: '1:1', label: 'Vuông (1:1)' },
    { id: '4:3', label: 'Ngang (4:3)' },
    { id: '3:4', label: 'Dọc (3:4)' },
    { id: '16:9', label: 'Rộng (16:9)' },
    { id: '9:16', label: 'Story (9:16)' },
    { id: 'auto', label: 'Tự động' },
  ];

  return (
    <form className="sidebar-panel" onSubmit={handleFormSubmit}>
      {/* 1. Tải ảnh lên */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">1. Tải ảnh lên (Tùy chọn)</span>
        </div>
        <div className="section-subtext">
          Ưu tiên ảnh vẽ tay, ảnh SketchUp/Revit không bóng đổ và bao cảnh
        </div>

        {originalImage ? (
          <div className="dropzone-preview-container">
            <img src={originalImage.preview} alt="Ảnh gốc" className="dropzone-preview-img" />
            <button
              type="button"
              className="remove-img-btn"
              onClick={() => setOriginalImage(null)}
              title="Xóa ảnh"
            >
              <X size={16} />
            </button>
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
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => handleOriginalUpload(e.target.files[0])}
            />
            <div className="dropzone-content">
              <div className="dropzone-icon">
                <UploadCloud size={20} />
              </div>
              <div className="dropzone-text">
                {isUploadingOriginal ? 'Đang tải lên...' : 'Kéo thả, dán, hoặc click'}
              </div>
              <div className="dropzone-hint">PNG, JPG, WEBP tối đa 50MB</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Ảnh tham chiếu (Style) */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">2. Ảnh tham chiếu (Style)</span>
          <button
            type="button"
            className="link-btn"
            onClick={() => styleInputRef.current?.click()}
          >
            Chọn ảnh có sẵn
          </button>
        </div>
        <div className="section-subtext">
          AI sẽ lấy cảm hứng về phong cách, ánh sáng, số cam và vật liệu
        </div>

        {styleImage ? (
          <div className="dropzone-preview-container" style={{ height: '100px' }}>
            <img src={styleImage.preview} alt="Style" className="dropzone-preview-img" />
            <button
              type="button"
              className="remove-img-btn"
              onClick={() => setStyleImage(null)}
              title="Xóa style"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="dropzone-box"
            style={{ padding: '14px' }}
            onClick={() => styleInputRef.current?.click()}
          >
            <input
              type="file"
              ref={styleInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => handleStyleUpload(e.target.files[0])}
            />
            <div className="dropzone-content">
              <span className="dropzone-text" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Kéo thả, dán, hoặc click
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Prompt */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">3. Prompt kiến trúc</span>
          <button
            type="button"
            className="btn-secondary btn-magic-ai"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={handleMagicPrompt}
            disabled={isGeneratingMagic}
          >
            <Wand2 size={12} />
            <span>{isGeneratingMagic ? 'Đang viết...' : 'Magic Prompt'}</span>
          </button>
        </div>

        <textarea
          className="custom-textarea"
          rows={3}
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          placeholder="Mô tả công trình (ví dụ: Biệt thự nghỉ dưỡng 3 tầng hiện đại, ban công tràn ngập cây xanh...)"
        />

        {/* Dropdowns gợi ý có sẵn */}
        <div className="options-stack">
          {/* Phong cách */}
          <div className="select-group-item">
            <label className="select-group-label">Phong cách kiến trúc</label>
            <select
              className="custom-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              <option value="">-- Mặc định theo Prompt --</option>
              {promptOptions?.STYLE?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Bối cảnh */}
          <div className="select-group-item">
            <label className="select-group-label">Bối cảnh môi trường</label>
            <select
              className="custom-select"
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
            >
              <option value="">-- Mặc định theo Prompt --</option>
              {promptOptions?.CONTEXT?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Ánh sáng */}
          <div className="select-group-item">
            <label className="select-group-label">Ánh sáng & Thời tiết</label>
            <select
              className="custom-select"
              value={selectedLighting}
              onChange={(e) => setSelectedLighting(e.target.value)}
            >
              <option value="">-- Mặc định theo Prompt --</option>
              {promptOptions?.LIGHTING?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nút phụ chuyển đổi nhanh */}
        <div className="prompt-actions-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setBasePrompt('Biệt thự hiện đại 2 tầng, vật liệu kính và bê tông mài, sân vườn hồ bơi sang trọng, ánh sáng nắng ban mai')}
          >
            <ImageIcon size={13} />
            <span>Tạo từ ảnh mẫu</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleMagicPrompt}
          >
            <Sparkles size={13} />
            <span>Tối ưu Prompt AI</span>
          </button>
        </div>
      </div>

      {/* 4. Prompt loại trừ */}
      <div className="control-section">
        <span className="section-title">4. Prompt loại trừ (Negative Prompt)</span>
        <div className="section-subtext">
          Liệt kê những thứ bạn không muốn xuất hiện trong ảnh: mờ, chữ ký, biến dạng...
        </div>
        <textarea
          className="custom-textarea"
          rows={2}
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Nhập yếu tố loại trừ: cartoon, mờ, biến dạng, chất lượng thấp..."
        />
      </div>

      {/* 5. Tỷ lệ khung hình */}
      <div className="control-section">
        <span className="section-title">5. Tỷ lệ khung hình</span>
        <div className="aspect-grid">
          {aspectList.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`aspect-btn ${aspectRatio === item.id ? 'active' : ''}`}
              onClick={() => setAspectRatio(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Số lượng ảnh */}
      <div className="control-section">
        <span className="section-title">6. Số lượng ảnh</span>
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

      {/* 7. Lựa chọn Mô hình AI */}
      <div className="control-section">
        <div className="section-label-row">
          <span className="section-title">7. Mô hình AI Render</span>
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
            {aiProvider === 'NANO_BANANA' ? '🍌 Khuyên dùng (Giữ khối)' : '⚡ Nhanh / Miễn phí'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <button
            type="button"
            className={`aspect-btn ${aiProvider === 'NANO_BANANA' ? 'active' : ''}`}
            onClick={() => setAiProvider('NANO_BANANA')}
            title="Google Gemini Nano Banana: Giữ nguyên 100% hình khối SketchUp & Revit"
          >
            🍌 Nano Banana
          </button>
          <button
            type="button"
            className={`aspect-btn ${aiProvider === 'FLUX' ? 'active' : ''}`}
            onClick={() => setAiProvider('FLUX')}
            title="FLUX.1 Engine: Render nhanh, phong cách nghệ thuật, Miễn phí"
          >
            ⚡ FLUX.1
          </button>
          <button
            type="button"
            className={`aspect-btn ${aiProvider === 'OPENAI' ? 'active' : ''}`}
            onClick={() => setAiProvider('OPENAI')}
            title="OpenAI Turbo: Phối cảnh concept tự do"
          >
            🧠 OpenAI
          </button>
        </div>
        <div className="section-subtext" style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
          {aiProvider === 'NANO_BANANA' && '✨ Cơ chế Image-to-Image: Đắp vật liệu thực tế đè lên đúng hình khối bản vẽ 3D.'}
          {aiProvider === 'FLUX' && '✨ Cơ chế Text-to-Image: Render phối cảnh từ mô tả văn bản (Miễn phí 100%).'}
          {aiProvider === 'OPENAI' && '✨ Ý tưởng concept sơ khai nhanh chóng.'}
        </div>
      </div>

      {/* Nút Tạo Ảnh Chính */}
      <button
        type="submit"
        className="btn-submit-render"
        style={currentUserRole === 'ADMIN' ? {
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
        } : undefined}
        disabled={isRendering}
      >
        {currentUserRole === 'ADMIN' ? (
          <>
            <Crown size={18} />
            <span>{isRendering ? 'Đang Phân Tích Prompt...' : '👑 Xem & Tinh Chỉnh Prompt Cuối Cùng (Admin)'}</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>{isRendering ? 'Đang Khởi Tạo Render...' : 'Tạo Ảnh'}</span>
          </>
        )}
      </button>
    </form>
  );
}


