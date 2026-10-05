import React, { useState, useEffect, useRef } from 'react';
import {
  Crown, Wand2, Send, RefreshCw, Copy, Check, Plus, ShieldCheck,
  UploadCloud, X, Image as ImageIcon, Sparkles, BarChart3, Clock,
  Zap, Settings, ChevronRight, Eye, Sliders
} from 'lucide-react';
import { apiService } from '../../services/api';

// ─── Constant quick-add keywords ────────────────────────────────────────────
const QUICK_KEYWORDS = [
  { emoji: '🌿', label: 'Cây leo ban công',   text: ', lush cascading hanging creepers and blooming bougainvillea on balconies' },
  { emoji: '🏛️', label: 'Bê tông mài cao cấp', text: ', smooth fair-faced architectural concrete finish, refined surface texture' },
  { emoji: '🪟', label: 'Kính Low-E hoàng hôn', text: ', modern Low-E tinted glass panels with soft warm sunset sky reflection' },
  { emoji: '🌇', label: 'Nắng chiều 16h30',   text: ', dramatic 4:30 PM warm golden hour sunlight, long crisp shadows' },
  { emoji: '🔒', label: 'Giữ nguyên hình khối', text: ', strictly preserve exact original building proportions, balconies and facade layout' },
  { emoji: '📷', label: 'Ống kính TS 24mm',   text: ', architectural photography, shot on 24mm tilt-shift lens, perfectly straight vertical lines' },
  { emoji: '✨', label: 'Cực nét 8K Ultra',   text: ', ultra-sharp 8K resolution, hyper-realistic details, award-winning architectural photography' },
  { emoji: '🌊', label: 'Phản chiếu hồ bơi',  text: ', serene pool with crystal-clear water reflecting the blue sky, poolside luxury scene' },
];

export default function AdminDashboard({
  promptOptions,
  onSubmitRender,
  isRendering,
  currentUserId = 21,
  renderResult,
  onSendToCameraAngle,
}) {
  // ── Form state ──────────────────────────────────────────────────────────
  const [originalImage, setOriginalImage] = useState(null);
  const [basePrompt, setBasePrompt]         = useState('Biệt thự hiện đại 3 tầng, mặt tiền kính và đá ốp, bên hồ bơi tràn viền, vườn nhiệt đới, nắng chiều vàng óng');
  const [negativePrompt, setNegativePrompt] = useState('cartoon, 2d illustration, blurry, low quality, watermark, text overlay');
  const [selectedStyle,  setSelectedStyle]  = useState('');
  const [selectedContext,setSelectedContext]= useState('');
  const [selectedLighting,setSelectedLighting]= useState('');
  const [aspectRatio,    setAspectRatio]    = useState('16:9');
  const [numImages,      setNumImages]      = useState(1);
  const [aiProvider,     setAiProvider]     = useState('FLUX');

  // ── Admin exclusive: Final Prompt editor ───────────────────────────────
  const [finalPromptDraft, setFinalPromptDraft] = useState('');
  const [isPreviewing,     setIsPreviewing]     = useState(false);
  const [hasPreview,       setHasPreview]        = useState(false);
  const [copied,           setCopied]            = useState(false);
  const [isUploadingOriginal, setIsUploadingOriginal] = useState(false);

  const fileInputRef = useRef(null);

  // ── Magic Prompt ────────────────────────────────────────────────────────
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const handleMagicPrompt = async () => {
    if (!basePrompt.trim()) { alert('Nhập ý tưởng trước!'); return; }
    try {
      setIsMagicLoading(true);
      const optimized = await apiService.generateMagicPrompt(basePrompt);
      if (optimized) setBasePrompt(optimized);
    } catch (err) { alert('Magic Prompt thất bại: ' + err.message); }
    finally       { setIsMagicLoading(false); }
  };

  // ── Upload ảnh gốc ──────────────────────────────────────────────────────
  const handleOriginalUpload = async (file) => {
    if (!file) return;
    try {
      setIsUploadingOriginal(true);
      const res = await apiService.uploadImage(file);
      setOriginalImage({ url: res.url, preview: URL.createObjectURL(file) });
    } catch (err) { alert('Upload ảnh thất bại: ' + err.message); }
    finally       { setIsUploadingOriginal(false); }
  };

  // ── Build payload ───────────────────────────────────────────────────────
  const buildPayload = () => ({
    userId: currentUserId,
    originalImageUrl: originalImage?.url || null,
    styleImageUrl: null,
    basePrompt: basePrompt.trim(),
    styleOptionId:   selectedStyle   ? Number(selectedStyle)   : null,
    contextOptionId: selectedContext ? Number(selectedContext)  : null,
    lightingOptionId: selectedLighting ? Number(selectedLighting) : null,
    negativePrompt: negativePrompt.trim(),
    aspectRatio,
    numImages,
    aiProvider,
    userRole: 'ADMIN',
  });

  // ── Preview Final Prompt (Admin only) ──────────────────────────────────
  const handlePreviewPrompt = async () => {
    if (!basePrompt.trim()) { alert('Vui lòng nhập Prompt hoặc bối cảnh thiết kế!'); return; }
    try {
      setIsPreviewing(true);
      const res = await apiService.previewPrompt(buildPayload());
      if (res?.finalPrompt) {
        setFinalPromptDraft(res.finalPrompt);
        setHasPreview(true);
      }
    } catch (err) { alert('Lỗi tải Preview Prompt: ' + err.message); }
    finally       { setIsPreviewing(false); }
  };

  // ── Submit Render ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!basePrompt.trim() && !originalImage) {
      alert('Vui lòng nhập Prompt hoặc tải lên bản vẽ công trình!');
      return;
    }
    const payload = {
      ...buildPayload(),
      ...(hasPreview && finalPromptDraft.trim() ? { customFinalPrompt: finalPromptDraft } : {}),
    };
    onSubmitRender(payload);
  };

  // ── Copy prompt ─────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(finalPromptDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Append keyword ──────────────────────────────────────────────────────
  const handleAppend = (text) => setFinalPromptDraft(p => p.trim() + text);

  const styles = promptOptions || {};
  const aspectList = ['1:1','4:3','3:4','16:9','9:16'];

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      minHeight: 0,
      flex: 1,
      overflow: 'hidden',
      background: 'var(--bg-main)',
    }}>

      {/* ═══════════════════════════════════════════════════════════════
          LEFT PANEL – Form nhập liệu (Admin Style)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        width: '300px',
        minWidth: '280px',
        borderRight: '1px solid rgba(245,158,11,0.2)',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #0b0f1a 0%, #0d1120 100%)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>

        {/* Header Admin Panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.1) 100%)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 12px rgba(245,158,11,0.4)',
            flexShrink: 0,
          }}>
            <Crown size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', lineHeight: 1.2 }}>
              Admin Control Panel
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(251,191,36,0.6)' }}>
              Toàn quyền kiểm soát Prompt & Render
            </div>
          </div>
        </div>

        {/* Upload Ảnh (Tùy chọn) */}
        <div className="control-section" style={{ gap: '8px' }}>
          <span className="section-title" style={{ color: '#e2e8f0' }}>📁 Ảnh tham chiếu (Tùy chọn)</span>
          {originalImage ? (
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(245,158,11,0.4)' }}>
              <img src={originalImage.preview} alt="ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setOriginalImage(null)}
                style={{
                  position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.85)',
                  border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              ><X size={12} /></button>
            </div>
          ) : (
            <div
              className="upload-zone"
              style={{ padding: '14px', cursor: 'pointer', minHeight: '70px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={18} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {isUploadingOriginal ? 'Đang tải...' : 'Click tải ảnh bản vẽ / phối cảnh'}
              </span>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handleOriginalUpload(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* Base Prompt */}
        <div className="control-section" style={{ gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title" style={{ color: '#e2e8f0' }}>✏️ Ý tưởng / Mô tả</span>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.3)' }}
              onClick={handleMagicPrompt}
              disabled={isMagicLoading}
            >
              <Wand2 size={12} />
              <span>{isMagicLoading ? '...' : 'Magic AI'}</span>
            </button>
          </div>
          <textarea
            className="custom-textarea"
            rows={3}
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Mô tả công trình, phong cách, bối cảnh..."
            style={{ fontSize: '12px', lineHeight: '1.5' }}
          />
        </div>

        {/* Style / Context / Lighting */}
        {[
          { label: '🎨 Phong cách', key: 'STYLE', val: selectedStyle, set: setSelectedStyle },
          { label: '🌍 Bối cảnh',   key: 'CONTEXT', val: selectedContext, set: setSelectedContext },
          { label: '💡 Ánh sáng',   key: 'LIGHTING', val: selectedLighting, set: setSelectedLighting },
        ].map(({ label, key, val, set }) => (
          <div className="control-section" key={key} style={{ gap: '6px' }}>
            <span className="section-title" style={{ color: '#e2e8f0', fontSize: '12px' }}>{label}</span>
            <select
              className="styled-select"
              value={val}
              onChange={(e) => set(e.target.value)}
            >
              <option value="">-- Mặc định --</option>
              {(styles[key] || []).map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.displayName}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Aspect Ratio */}
        <div className="control-section" style={{ gap: '6px' }}>
          <span className="section-title" style={{ color: '#e2e8f0', fontSize: '12px' }}>📐 Tỷ lệ khung</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {aspectList.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAspectRatio(r)}
                style={{
                  padding: '4px 9px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                  background: aspectRatio === r ? 'rgba(245,158,11,0.25)' : 'var(--bg-input)',
                  border: `1px solid ${aspectRatio === r ? '#f59e0b' : 'var(--border-color)'}`,
                  color: aspectRatio === r ? '#fbbf24' : 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >{r}</button>
            ))}
          </div>
        </div>

        {/* AI Provider */}
        <div className="control-section" style={{ gap: '6px' }}>
          <span className="section-title" style={{ color: '#e2e8f0', fontSize: '12px' }}>🤖 Mô hình AI</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['NANO_BANANA','Nano 🍌'],['FLUX','FLUX ⚡'],['OPENAI','OpenAI']].map(([val,lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setAiProvider(val)}
                style={{
                  flex: 1, padding: '6px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                  background: aiProvider === val ? 'rgba(245,158,11,0.2)' : 'var(--bg-input)',
                  border: `1px solid ${aiProvider === val ? '#f59e0b' : 'var(--border-color)'}`,
                  color: aiProvider === val ? '#fbbf24' : 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >{lbl}</button>
            ))}
          </div>
        </div>

        {/* Số lượng ảnh */}
        <div className="control-section" style={{ gap: '6px' }}>
          <span className="section-title" style={{ color: '#e2e8f0', fontSize: '12px' }}>🖼️ Số lượng ảnh: {numImages}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="icon-circle-btn" style={{ width: '30px', height: '30px' }}
              onClick={() => setNumImages(Math.max(1, numImages - 1))} type="button">−</button>
            <input type="range" min={1} max={4} value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#f59e0b' }} />
            <button className="icon-circle-btn" style={{ width: '30px', height: '30px' }}
              onClick={() => setNumImages(Math.min(4, numImages + 1))} type="button">+</button>
          </div>
        </div>

        {/* Preview Prompt Button */}
        <button
          type="button"
          className="btn-secondary"
          style={{
            width: '100%', padding: '10px', fontSize: '13px', fontWeight: 700,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.1) 100%)',
            borderColor: isPreviewing ? '#f59e0b' : 'rgba(245,158,11,0.4)',
            color: '#fbbf24',
            justifyContent: 'center',
            display: 'flex', gap: '6px', alignItems: 'center',
          }}
          onClick={handlePreviewPrompt}
          disabled={isPreviewing || isRendering}
        >
          <Eye size={16} />
          <span>{isPreviewing ? 'Đang tạo Prompt AI...' : '👁 Xem trước Final Prompt'}</span>
        </button>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CENTER PANEL – Admin Final Prompt Editor (Core feature)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        borderRight: '1px solid rgba(245,158,11,0.15)',
        overflowY: 'auto',
        background: '#080d18',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minWidth: 0,
      }}>

        {/* Title */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 0 18px rgba(249,115,22,0.4)',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Chỉnh Sửa Final Prompt
                <span style={{
                  fontSize: '10px', marginLeft: '8px',
                  background: 'rgba(245,158,11,0.2)', color: '#fbbf24',
                  padding: '2px 8px', borderRadius: '99px',
                  border: '1px solid rgba(245,158,11,0.4)',
                }}>ADMIN EXCLUSIVE</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.6)', margin: '2px 0 0 0' }}>
                Đây là câu prompt tiếng Anh cuối cùng gửi tới AI. Admin có thể can thiệp toàn phần.
              </p>
            </div>
          </div>

          {hasPreview && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copied ? 'Đã copy!' : 'Copy Prompt'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--text-dim)' }}
                onClick={() => { setFinalPromptDraft(''); setHasPreview(false); }}
              >
                <RefreshCw size={14} />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>

        {/* Thông báo nếu chưa preview */}
        {!hasPreview && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            color: 'var(--text-dim)',
            textAlign: 'center',
            minHeight: '200px',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px dashed rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={26} color="rgba(245,158,11,0.5)" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                Chưa có Final Prompt
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '280px', lineHeight: 1.6 }}>
                Nhập mô tả ở cột trái, sau đó bấm <strong style={{ color: '#fbbf24' }}>👁 Xem trước Final Prompt</strong> để Gemini AI tổng hợp và hiển thị câu prompt kỹ thuật ở đây để bạn chỉnh sửa.
              </div>
            </div>
          </div>
        )}

        {/* Textarea chỉnh sửa */}
        {hasPreview && (
          <>
            {/* Config info bar */}
            <div style={{
              background: 'rgba(15,23,42,0.8)', borderRadius: '10px',
              padding: '10px 14px', display: 'flex', gap: '16px', flexWrap: 'wrap',
              fontSize: '12px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div><span style={{ color: 'var(--text-dim)' }}>Mô hình: </span><strong style={{ color: '#f59e0b' }}>{aiProvider}</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Tỷ lệ: </span><strong style={{ color: '#f8fafc' }}>{aspectRatio}</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Số ảnh: </span><strong style={{ color: '#f8fafc' }}>{numImages}</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Ảnh gốc: </span><strong style={{ color: originalImage ? '#4ade80' : '#94a3b8' }}>{originalImage ? '✅ Đính kèm' : 'Text only'}</strong></div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>{finalPromptDraft.length} ký tự</div>
            </div>

            {/* Main textarea */}
            <textarea
              className="custom-textarea"
              rows={10}
              value={finalPromptDraft}
              onChange={(e) => setFinalPromptDraft(e.target.value)}
              style={{
                fontSize: '13px',
                lineHeight: '1.65',
                fontFamily: '"Courier New", Courier, monospace',
                border: '1.5px solid rgba(234,88,12,0.5)',
                backgroundColor: '#060a14',
                borderRadius: '12px',
                color: '#e2e8f0',
                resize: 'vertical',
                flex: 1,
              }}
            />

            {/* Negative prompt */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                🚫 Negative Prompt (Loại bỏ yếu tố không muốn)
              </div>
              <textarea
                className="custom-textarea"
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                style={{ fontSize: '12px', lineHeight: '1.5', resize: 'none' }}
              />
            </div>

            {/* Quick Keywords */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>
                ⚡ Chèn nhanh từ khóa chuyên ngành kiến trúc:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {QUICK_KEYWORDS.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    className="btn-secondary"
                    style={{
                      padding: '5px 10px', fontSize: '11px', borderRadius: '7px',
                      borderColor: 'rgba(245,158,11,0.25)',
                      color: '#fbbf24',
                    }}
                    onClick={() => handleAppend(kw.text)}
                  >
                    <Plus size={11} />
                    <span>{kw.emoji} {kw.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', padding: '14px',
                background: isRendering
                  ? 'rgba(245,158,11,0.4)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontSize: '14px', fontWeight: 800,
                cursor: isRendering ? 'not-allowed' : 'pointer',
                boxShadow: isRendering ? 'none' : '0 6px 24px rgba(245,158,11,0.45)',
                transition: 'all 0.2s',
                letterSpacing: '0.3px',
              }}
              onClick={handleSubmit}
              disabled={isRendering || !finalPromptDraft.trim()}
            >
              <Send size={18} />
              <span>{isRendering ? '⏳ Đang gửi lệnh Render...' : '🚀 Phê Duyệt & Render Ngay Lập Tức'}</span>
            </button>
          </>
        )}

        {/* Nút render nhanh khi chưa preview */}
        {!hasPreview && (
          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', marginTop: 'auto',
              background: 'rgba(245,158,11,0.12)',
              border: '1px dashed rgba(245,158,11,0.3)', borderRadius: '12px',
              color: 'rgba(251,191,36,0.7)', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={handleSubmit}
            disabled={isRendering}
          >
            <Zap size={16} />
            <span>{isRendering ? 'Đang render...' : 'Render nhanh (không chỉnh prompt)'}</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT PANEL – Kết quả Render (Admin View)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        width: '380px', minWidth: '300px',
        overflowY: 'auto',
        background: '#07090f',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 700, color: '#94a3b8',
          display: 'flex', alignItems: 'center', gap: '8px',
          paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <ImageIcon size={16} color="#f59e0b" />
          Kết Quả Render
        </div>

        {isRendering ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', flex: 1, paddingTop: '40px' }}>
            <div className="spinner-ring" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Đang khởi tạo phối cảnh...</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>AI Engine đang xử lý prompt của Admin</div>
            </div>
          </div>
        ) : renderResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Final prompt used */}
            {renderResult.finalPrompt && (
              <div style={{
                background: 'rgba(15,23,42,0.8)', borderRadius: '10px',
                padding: '10px 12px', fontSize: '11px', color: 'var(--text-dim)',
                border: '1px solid rgba(245,158,11,0.15)',
                fontFamily: 'monospace', lineHeight: 1.5,
                maxHeight: '100px', overflowY: 'auto',
              }}>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px', fontFamily: 'sans-serif' }}>
                  ✅ Prompt đã được dùng:
                </div>
                {renderResult.finalPrompt}
              </div>
            )}

            {/* Images */}
            {renderResult.images?.map((imgUrl, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.25)' }}>
                <img
                  src={imgUrl}
                  alt={`render-${i}`}
                  style={{ width: '100%', display: 'block', cursor: 'pointer' }}
                  onClick={() => onSendToCameraAngle && onSendToCameraAngle(imgUrl)}
                />
                <div style={{
                  padding: '8px 12px', background: 'rgba(15,23,42,0.9)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Ảnh #{i + 1}</span>
                  <a
                    href={imgUrl} download={`admin-render-${i + 1}.jpg`} target="_blank" rel="noreferrer"
                    style={{ fontSize: '11px', color: '#fbbf24', textDecoration: 'none', fontWeight: 700 }}
                  >
                    ↓ Tải về
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '12px', color: 'var(--text-dim)',
            textAlign: 'center', paddingTop: '30px',
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.07)',
              border: '1px dashed rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={22} color="rgba(245,158,11,0.4)" />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Kết quả render của Admin sẽ hiển thị tại đây
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
