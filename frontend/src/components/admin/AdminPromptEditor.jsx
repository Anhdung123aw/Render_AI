import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, Send, Copy, Check,
  Edit3, Image as ImageIcon, Sparkles, AlertCircle,
  Download, Camera, Layers, ExternalLink, ArrowRight, X,
  ChevronRight, ChevronLeft, Trash2, CheckSquare, Square
} from 'lucide-react';
import { apiService } from '../../services/api';
import PromptOptionsManagerModal from './PromptOptionsManagerModal';

function AdminRenderImageCard({
  imgUrl,
  idx,
  isSingle,
  taskId,
  onPreview,
  onSendToCameraAngle
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (hasError && retryKey < 3 && imgUrl?.startsWith('http')) {
      const timer = setTimeout(() => {
        setHasError(false);
        setIsLoaded(false);
        setRetryKey(k => k + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError, retryKey, imgUrl]);

  const finalSrc = imgUrl?.startsWith('http')
    ? `${imgUrl}${imgUrl.includes('?') ? '&' : '?'}retry=${retryKey}`
    : imgUrl;

  return (
    <div
      style={{
        flex: isSingle ? '0 1 420px' : '1 0 240px',
        maxWidth: isSingle ? '440px' : '360px',
        width: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto'
      }}
    >
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: '200px',
        maxHeight: '320px',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {!isLoaded && !hasError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.88)'
          }}>
            <div className="spinner-ring" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Đang nạp ảnh...</span>
          </div>
        )}

        {hasError ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '180px'
          }}>
            <AlertCircle size={24} color="#ea580c" />
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              Ảnh đang hoàn thiện trên máy chủ AI
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '240px', lineHeight: 1.4 }}>
              Máy chủ AI có thể mất vài giây. Nhấn thử lại nếu ảnh chưa hiện.
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px', color: '#ea580c', borderColor: '#ea580c' }}
                onClick={() => {
                  setHasError(false);
                  setIsLoaded(false);
                  setRetryKey(k => k + 1);
                }}
              >
                <RefreshCw size={11} />
                <span>Thử tải lại</span>
              </button>
              {imgUrl?.startsWith('http') && (
                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <ExternalLink size={11} />
                  <span>Mở link</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <img
            src={finalSrc}
            alt={`Render result ${idx + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              display: isLoaded ? 'block' : 'none',
              margin: 'auto',
              cursor: 'pointer'
            }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={() => onPreview(imgUrl)}
          />
        )}

        <div style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          background: 'rgba(15, 23, 42, 0.75)',
          color: '#fff',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)',
          fontWeight: 600
        }}>
          Ảnh #{idx + 1}
        </div>
      </div>

      <div style={{
        padding: '8px 10px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '4px 8px', fontSize: '11px', color: '#ea580c' }}
          onClick={() => onSendToCameraAngle && onSendToCameraAngle(imgUrl)}
          disabled={hasError}
        >
          <Camera size={12} />
          <span>Đổi góc cam</span>
        </button>

        <a
          href={imgUrl}
          download={`render-${taskId}-${idx + 1}.jpg`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '11px',
            color: 'var(--text-main)',
            textDecoration: 'none',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            pointerEvents: hasError ? 'none' : 'auto',
            opacity: hasError ? 0.5 : 1
          }}
        >
          <Download size={11} style={{ display: 'inline', marginRight: '3px' }} />
          Tải về
        </a>
      </div>
    </div>
  );
}

export default function AdminPromptEditor({
  onSubmitRender,
  isRendering,
  currentUserId = 21,
  onSendToCameraAngle
}) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState(null);
  const [isOptionsManagerOpen, setIsOptionsManagerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const PAGE_SIZE = 10;

  // Load danh sách toàn bộ tác vụ render của tất cả user
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllTasksForAdmin();
      const taskList = Array.isArray(data) ? data : [];
      setTasks(taskList);
      if (selectedTask) {
        const found = taskList.find(t => t.taskId === selectedTask.taskId);
        if (found) {
          setSelectedTask(found);
          setEditedPrompt(found.finalPrompt || found.basePrompt || '');
        } else {
          setSelectedTask(null);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tác vụ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeImagePreview) {
          setActiveImagePreview(null);
        } else if (selectedTask) {
          setSelectedTask(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImagePreview, selectedTask]);

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setEditedPrompt(task.finalPrompt || task.basePrompt || '');
    setActiveImagePreview(null);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId, e, username) => {
    if (e) e.stopPropagation();
    const ok = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tác vụ #${taskId} của @${username || 'user'}? Thao tác này không thể hoàn tác.`);
    if (!ok) return;

    try {
      setIsDeleting(true);
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      setSelectedCardIds(prev => prev.filter(id => id !== taskId));
      if (selectedTask?.taskId === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      alert('Lỗi khi xóa tác vụ: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCardIds.length === 0) return;
    const ok = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCardIds.length} tác vụ đã chọn? Thao tác này không thể hoàn tác.`);
    if (!ok) return;

    try {
      setIsDeleting(true);
      await apiService.deleteTasksBatch(selectedCardIds);
      setTasks(prev => prev.filter(t => !selectedCardIds.includes(t.taskId)));
      if (selectedTask && selectedCardIds.includes(selectedTask.taskId)) {
        setSelectedTask(null);
      }
      setSelectedCardIds([]);
    } catch (err) {
      alert('Lỗi khi xóa danh sách tác vụ: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const userList = Array.from(new Set(tasks.map(t => t.username || 'Unknown')));

  const filteredTasks = tasks.filter(task => {
    const matchUser = selectedUserFilter === 'ALL' || task.username === selectedUserFilter;
    const matchSearch = !searchTerm.trim() ||
      (task.username && task.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.finalPrompt && task.finalPrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.basePrompt && task.basePrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (String(task.taskId).includes(searchTerm));
    return matchUser && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const pagedTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isAllCurrentPageSelected = pagedTasks.length > 0 && pagedTasks.every(t => selectedCardIds.includes(t.taskId));
  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const currentPageIds = pagedTasks.map(t => t.taskId);
      setSelectedCardIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      const currentPageIds = pagedTasks.map(t => t.taskId);
      setSelectedCardIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const toggleSelectCard = (taskId, e) => {
    if (e) e.stopPropagation();
    setSelectedCardIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  useEffect(() => { setCurrentPage(1); }, [selectedUserFilter, searchTerm]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(editedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReRender = () => {
    if (!editedPrompt.trim()) {
      alert('Prompt không được để trống!');
      return;
    }

    const payload = {
      userId: currentUserId,
      originalImageUrl: selectedTask?.originalImageUrl || null,
      styleImageUrl: null,
      basePrompt: selectedTask?.basePrompt || editedPrompt,
      customFinalPrompt: editedPrompt.trim(),
      aspectRatio: '16:9',
      numImages: 1,
      aiProvider: selectedTask?.aiProvider || 'NANO_BANANA',
      userRole: 'ADMIN'
    };

    onSubmitRender(payload);
  };

  const getTaskImages = (task) => {
    if (!task) return [];
    const imgs = [];
    if (task.imageUrls && Array.isArray(task.imageUrls)) {
      imgs.push(...task.imageUrls);
    }
    if (task.base64Images && Array.isArray(task.base64Images)) {
      task.base64Images.forEach(b64 => imgs.push(`data:image/png;base64,${b64}`));
    }
    return imgs;
  };

  const currentTaskImages = getTaskImages(selectedTask);

  return (
    <div style={{
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "100%",
      height: "100%",
      minHeight: 0,
      overflow: "hidden",
      background: "var(--bg-main)"
    }}>

      {/* TOOLBAR - SÁNG SỦA, TINH TẾ */}
      <div style={{
        width: "100%",
        borderBottom: "1px solid var(--border-color)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        flexShrink: 0
      }}>
        <div style={{
          maxWidth: "1020px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "var(--primary-gradient)",
              color: "#fff", padding: "7px", borderRadius: "9px", display: "flex",
              boxShadow: "0 2px 8px var(--primary-glow)"
            }}>
              <Users size={17} />
            </div>
            <div>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-main)" }}>Lịch Sử Render Users</span>
              <span style={{
                fontSize: "11px", marginLeft: "8px",
                background: "rgba(234, 88, 12, 0.1)", color: "var(--primary)",
                padding: "2px 8px", borderRadius: "99px", fontWeight: 700
              }}>
                {filteredTasks.length} tác vụ
              </span>
            </div>
          </div>

          <select
            className="styled-select"
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            style={{ fontSize: "12px", padding: "6px 10px", height: "36px", minWidth: "180px" }}
          >
            <option value="ALL">Tất cả người dùng ({tasks.length})</option>
            {userList.map(u => (
              <option key={u} value={u}>{u} ({tasks.filter(t => t.username === u).length})</option>
            ))}
          </select>

          <div style={{ position: "relative", flex: 1, maxWidth: "320px", minWidth: "160px" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "var(--text-dim)" }} />
            <input
              type="text"
              placeholder="Tìm theo user, ID, prompt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "7px 10px 7px 32px", fontSize: "12px",
                borderRadius: "8px", border: "1px solid var(--border-color)",
                background: "#ffffff", color: "var(--text-main)", outline: "none",
                height: "36px"
              }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            {selectedCardIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: isDeleting ? "default" : "pointer",
                  transition: "all 0.15s ease"
                }}
                title="Xóa vĩnh viễn các tác vụ đã chọn"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? "Đang xóa..." : `Xóa (${selectedCardIds.length}) card`}</span>
              </button>
            )}

            <button type="button" className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px", borderColor: "rgba(234, 88, 12, 0.3)", color: "var(--primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => setIsOptionsManagerOpen(true)}
            >
              <Layers size={13} /><span>+ Thêm Prompt</span>
            </button>
            <button className="icon-circle-btn" onClick={loadTasks} title="Tải lại danh sách" style={{ width: "34px", height: "34px" }}>
              <RefreshCw size={14} className={isLoading ? "spin-anim" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* DANH SÁCH 10 CARD THEO HÀNG DỌC - NỀN SÁNG SCANDINAVIAN */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 24px 32px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1020px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {filteredTasks.length > 0 && !isLoading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px",
              fontSize: "11.5px",
              color: "var(--text-dim)"
            }}>
              <div
                onClick={toggleSelectAllCurrentPage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                {isAllCurrentPageSelected ? (
                  <CheckSquare size={14} color="var(--primary)" />
                ) : (
                  <Square size={14} color="var(--text-dim)" />
                )}
                <span style={{ color: isAllCurrentPageSelected ? "var(--primary)" : "var(--text-muted)", fontWeight: 600 }}>
                  {isAllCurrentPageSelected ? "Bỏ chọn tất cả trang này" : "Chọn tất cả 10 card trang này"}
                </span>
              </div>
              <div>
                Đang hiển thị {pagedTasks.length} / {filteredTasks.length} tác vụ
              </div>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: "13px" }}>
              <div className="spinner-ring" style={{ width: "32px", height: "32px", margin: "0 auto 12px" }} />
              Đang tải danh sách tác vụ...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-dim)", fontSize: "13px", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
              Chưa có tác vụ nào phù hợp.
            </div>
          ) : (
            <>
              {pagedTasks.map((task) => {
                const imgs = getTaskImages(task);
                const hasOriginal = Boolean(task.originalImageUrl);
                const hasRendered = imgs.length > 0;
                const previewImg = imgs[0] || task.originalImageUrl;
                const isCardSelected = selectedCardIds.includes(task.taskId);

                return (
                  <div
                    key={task.taskId}
                    onClick={() => handleSelectTask(task)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: isCardSelected ? "rgba(234, 88, 12, 0.05)" : "#ffffff",
                      border: isCardSelected ? "1.5px solid var(--primary)" : "1px solid var(--border-color)",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                      position: "relative"
                    }}
                    onMouseEnter={e => {
                      if (!isCardSelected) {
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.background = "rgba(234, 88, 12, 0.03)";
                      }
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      if (!isCardSelected) {
                        e.currentTarget.style.borderColor = "var(--border-color)";
                        e.currentTarget.style.background = "#ffffff";
                      }
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* CHECKBOX CHỌN CARD */}
                    <div
                      onClick={(e) => toggleSelectCard(task.taskId, e)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px"
                      }}
                      title={isCardSelected ? "Bỏ chọn" : "Chọn card này"}
                    >
                      {isCardSelected ? (
                        <CheckSquare size={16} color="var(--primary)" />
                      ) : (
                        <Square size={16} color="var(--text-dim)" />
                      )}
                    </div>

                    {/* KHỐI ẢNH: HIỂN THỊ CẢ ẢNH 1 VÀ ẢNH 2 */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {hasOriginal && hasRendered ? (
                        <>
                          <div
                            style={{
                              position: "relative",
                              width: "66px",
                              height: "54px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              border: "1px solid #bfdbfe",
                              overflow: "hidden"
                            }}
                            title="Ảnh 1: Ảnh gốc đầu vào"
                          >
                            <img
                              src={task.originalImageUrl}
                              alt="Ảnh 1 gốc"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <span style={{
                              position: "absolute", bottom: "2px", left: "2px",
                              fontSize: "8.5px", background: "rgba(37, 99, 235, 0.9)", color: "#ffffff",
                              padding: "1px 4px", borderRadius: "3px", fontWeight: 700
                            }}>
                              Ảnh 1
                            </span>
                          </div>

                          <ArrowRight size={13} color="var(--primary)" style={{ flexShrink: 0 }} />

                          <div
                            style={{
                              position: "relative",
                              width: "66px",
                              height: "54px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              border: "1px solid #fed7aa",
                              overflow: "hidden"
                            }}
                            title="Ảnh 2: Kết quả render"
                          >
                            <img
                              src={imgs[0]}
                              alt="Ảnh 2 render"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <span style={{
                              position: "absolute", bottom: "2px", left: "2px",
                              fontSize: "8.5px", background: "rgba(234, 88, 12, 0.9)", color: "#fff",
                              padding: "1px 4px", borderRadius: "3px", fontWeight: 700
                            }}>
                              Ảnh 2
                            </span>
                          </div>
                        </>
                      ) : (
                        <div style={{
                          position: "relative",
                          width: "72px",
                          height: "54px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          border: "1px solid var(--border-color)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {previewImg ? (
                            <>
                              <img src={previewImg} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <span style={{
                                position: "absolute", bottom: "2px", left: "2px",
                                fontSize: "8.5px", background: hasRendered ? "rgba(234, 88, 12, 0.9)" : "rgba(37, 99, 235, 0.9)",
                                color: "#fff", padding: "1px 4px", borderRadius: "3px", fontWeight: 700
                              }}>
                                {hasRendered ? 'Ảnh 2' : 'Ảnh 1'}
                              </span>
                            </>
                          ) : (
                            <ImageIcon size={22} color="var(--text-dim)" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* THÔNG TIN TÁC VỤ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            fontSize: "13px", fontWeight: 800,
                            color: task.username === "admin" ? "#ea580c" : "#2563eb"
                          }}>
                            @{task.username || "user"}
                          </span>
                          <span style={{
                            fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                            background: "var(--bg-input)", color: "var(--text-muted)", fontWeight: 600
                          }}>
                            {task.aiProvider || "NANO_BANANA"}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)" }}>
                          #{task.taskId}
                        </span>
                      </div>

                      <div style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "6px"
                      }}>
                        {task.basePrompt || task.finalPrompt || "Không có mô tả prompt"}
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        {hasOriginal ? (
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>
                            Có ảnh gốc
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "#f1f5f9", color: "var(--text-dim)" }}>
                            Text Prompt
                          </span>
                        )}

                        {imgs.length > 0 ? (
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "#f0fdf4", color: "#16a34a", fontWeight: 700 }}>
                            {imgs.length} ảnh render
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "#fef2f2", color: "#ef4444" }}>
                            Chưa render ảnh
                          </span>
                        )}

                        {task.createdAt && (
                          <span style={{ fontSize: "10.5px", color: "var(--text-dim)", marginLeft: "auto" }}>
                            {new Date(task.createdAt).toLocaleString("vi-VN", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CỤM HÀNH ĐỘNG BÊN PHẢI */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTask(task.taskId, e, task.username)}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "1px solid #fee2e2",
                          background: "#fef2f2",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        title={`Xóa card #${task.taskId}`}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#fee2e2";
                          e.currentTarget.style.borderColor = "#fca5a5";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#fef2f2";
                          e.currentTarget.style.borderColor = "#fee2e2";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--primary)",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "rgba(234, 88, 12, 0.08)"
                      }}>
                        <span>Chi tiết</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "16px 0 4px",
                  marginTop: "6px"
                }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: currentPage === 1 ? "#f8fafc" : "#ffffff",
                      color: currentPage === 1 ? "var(--text-dim)" : "var(--primary)",
                      cursor: currentPage === 1 ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
                    }}
                  >
                    <ChevronLeft size={13} />
                    <span>Trước</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} style={{ color: "var(--text-dim)", fontSize: "12px", padding: "0 4px" }}>...</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "8px",
                            border: item === currentPage ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                            background: item === currentPage ? "var(--primary)" : "#ffffff",
                            color: item === currentPage ? "#ffffff" : "var(--text-main)",
                            fontWeight: item === currentPage ? 800 : 500,
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: item === currentPage ? "0 2px 6px var(--primary-glow)" : "none"
                          }}
                        >
                          {item}
                        </button>
                      )
                    )
                  }

                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: currentPage === totalPages ? "#f8fafc" : "#ffffff",
                      color: currentPage === totalPages ? "var(--text-dim)" : "var(--primary)",
                      cursor: currentPage === totalPages ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
                    }}
                  >
                    <span>Sau</span>
                    <ChevronRight size={13} />
                  </button>

                  <span style={{ fontSize: "11px", color: "var(--text-dim)", marginLeft: "8px" }}>
                    Trang {currentPage}/{totalPages} ({filteredTasks.length} tác vụ)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CHI TIẾT NGHIỆP VỤ - POPUP SÁNG ĐÈ LÊN GIAO DIỆN */}
      {selectedTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={handleCloseDetail}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              maxHeight: "92vh",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "fadeInUp 0.22s ease"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  background: "var(--primary-gradient)",
                  padding: "8px", borderRadius: "10px", color: "#fff",
                  boxShadow: "0 2px 10px var(--primary-glow)"
                }}>
                  <Edit3 size={17} />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-main)" }}>
                    Chi Tiết Nghiệp Vụ — @{selectedTask.username || "user"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "2px", fontWeight: 600 }}>
                    Tác vụ #{selectedTask.taskId} • {selectedTask.aiProvider || "NANO_BANANA"} • {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString("vi-VN") : "Mới tạo"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.taskId, null, selectedTask.username)}
                  disabled={isDeleting}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "1px solid #fee2e2",
                    background: "#fef2f2",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer"
                  }}
                  title="Xóa tác vụ này"
                >
                  <Trash2 size={13} />
                  <span>Xóa</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopyPrompt}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copied ? "Đã copy!" : "Copy Prompt"}</span>
                </button>

                <button
                  type="button"
                  className="btn-submit-render"
                  style={{
                    margin: 0, padding: "7px 16px",
                    fontSize: "12.5px", fontWeight: 800,
                    display: "flex", alignItems: "center", gap: "7px"
                  }}
                  onClick={handleReRender}
                  disabled={isRendering}
                >
                  <Send size={13} />
                  <span>{isRendering ? "Đang Render..." : "Phê Duyệt & Render Lại"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseDetail}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: "#f1f5f9",
                    color: "var(--text-muted)",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Đóng (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                {/* CỘT 1: ẢNH 1 */}
                <div style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #bfdbfe",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ImageIcon size={14} color="#2563eb" />
                      Ảnh 1: Ảnh Gốc (Bản vẽ đầu vào)
                    </span>
                    <span style={{ fontSize: "10px", color: selectedTask.originalImageUrl ? "#16a34a" : "var(--text-dim)", fontWeight: 600 }}>
                      {selectedTask.originalImageUrl ? "Có bản vẽ" : "Chỉ dùng Text"}
                    </span>
                  </div>

                  <div style={{
                    minHeight: "180px",
                    maxHeight: "270px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px dashed #cbd5e1",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {selectedTask.originalImageUrl ? (
                      <img
                        src={selectedTask.originalImageUrl}
                        alt="Ảnh 1 gốc"
                        style={{ maxWidth: "100%", maxHeight: "260px", objectFit: "contain", cursor: "pointer" }}
                        onClick={() => setActiveImagePreview(selectedTask.originalImageUrl)}
                        title="Click để phóng to ảnh gốc"
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "20px" }}>
                        <ImageIcon size={28} style={{ margin: "0 auto 6px", opacity: 0.35 }} />
                        <div style={{ fontSize: "11px" }}>Không có ảnh gốc (Chỉ dùng Text Prompt)</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CỘT 2: ẢNH 2 */}
                <div style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #fed7aa",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sparkles size={14} color="var(--primary)" />
                      Ảnh 2: Ảnh Đầu Ra ({currentTaskImages.length})
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                      Task #{selectedTask.taskId}
                    </span>
                  </div>

                  <div style={{
                    minHeight: "180px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    overflowX: "auto",
                    padding: "4px"
                  }}>
                    {currentTaskImages.length > 0 ? (
                      currentTaskImages.map((imgUrl, idx) => (
                        <AdminRenderImageCard
                          key={idx}
                          imgUrl={imgUrl}
                          idx={idx}
                          isSingle={currentTaskImages.length === 1}
                          taskId={selectedTask.taskId}
                          onPreview={setActiveImagePreview}
                          onSendToCameraAngle={onSendToCameraAngle}
                        />
                      ))
                    ) : (
                      <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-dim)",
                        borderRadius: "8px",
                        background: "#ffffff",
                        border: "1px dashed #cbd5e1",
                        minHeight: "160px"
                      }}>
                        <ImageIcon size={28} style={{ margin: "0 auto 6px", opacity: 0.3 }} />
                        <div style={{ fontSize: "11px" }}>Chưa có ảnh render.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KHỐI PROMPT & TINH CHỈNH */}
              <div style={{
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                {selectedTask.basePrompt && (
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-dim)", marginBottom: "3px" }}>
                      Ý tưởng gốc người dùng nhập:
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-main)", lineHeight: "1.5" }}>
                      {selectedTask.basePrompt}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={13} color="var(--primary)" />
                    Final Prompt (Chỉnh sửa trước khi Render):
                  </label>
                  <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                    {editedPrompt.length} ký tự
                  </span>
                </div>

                <textarea
                  className="custom-textarea"
                  rows={4}
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  placeholder="Nhập hoặc tinh chỉnh prompt trước khi render lại..."
                  style={{
                    fontSize: "12.5px",
                    lineHeight: "1.65",
                    fontFamily: '"Courier New", Courier, monospace',
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    borderRadius: "9px",
                    color: "var(--text-main)",
                    resize: "vertical"
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)" }}>Thêm nhanh:</span>
                  {[
                    { lbl: "Cây leo", text: ", lush cascading hanging creepers and blooming bougainvillea on balconies" },
                    { lbl: "Bê tông mịn", text: ", smooth fair-faced architectural concrete finish" },
                    { lbl: "Nắng 16h30", text: ", dramatic 4:30 PM warm golden hour sunlight" },
                    { lbl: "TS 24mm", text: ", shot on 24mm tilt-shift lens" },
                    { lbl: "8K siêu nét", text: ", photorealistic, 8K resolution, award-winning" },
                  ].map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "3px 7px", fontSize: "10px", borderRadius: "5px" }}
                      onClick={() => setEditedPrompt(prev => prev.trim() + kw.text)}
                    >
                      + {kw.lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW CHO ẢNH */}
      {activeImagePreview && (
        <div className="modal-backdrop" onClick={() => setActiveImagePreview(null)} style={{ zIndex: 300 }}>
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={activeImagePreview}
              alt="Preview phóng to"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ TÙY CHỌN PROMPT */}
      <PromptOptionsManagerModal
        isOpen={isOptionsManagerOpen}
        onClose={() => setIsOptionsManagerOpen(false)}
      />
    </div>
  );
}
