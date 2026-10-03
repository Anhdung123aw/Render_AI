-- ============================================================
-- Schema khởi tạo cho hệ thống Render AI
-- Oracle 12c+  (dùng IDENTITY cho auto-increment)
-- ============================================================

-- Xóa bảng cũ nếu tồn tại (đảo ngược thứ tự FK)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE render_results CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE render_tasks CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE prompt_options CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE app_users CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ============================================================
-- 1. Bảng APP_USERS
-- ============================================================
CREATE TABLE app_users (
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username   VARCHAR2(100) NOT NULL UNIQUE,
    password   VARCHAR2(255) NOT NULL,
    email      VARCHAR2(150) NOT NULL UNIQUE,
    user_role  VARCHAR2(20)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
/

-- ============================================================
-- 2. Bảng PROMPT_OPTIONS
-- ============================================================
CREATE TABLE prompt_options (
    id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    option_type  VARCHAR2(50)  NOT NULL,
    display_name VARCHAR2(100) NOT NULL,
    prompt_value VARCHAR2(255) NOT NULL,
    is_active    NUMBER(1)     DEFAULT 1
)
/

-- ============================================================
-- 3. Bảng RENDER_TASKS
-- ============================================================
CREATE TABLE render_tasks (
    id                 NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id            NUMBER        NOT NULL,
    original_image_url VARCHAR2(500),
    style_image_url    VARCHAR2(500),
    base_prompt        CLOB,
    final_prompt       CLOB,
    negative_prompt    CLOB,
    aspect_ratio       VARCHAR2(20),
    num_images         NUMBER(3),
    ai_provider        VARCHAR2(50),
    status             VARCHAR2(30),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES app_users(id)
)
/

-- ============================================================
-- 4. Bảng RENDER_RESULTS
-- ============================================================
CREATE TABLE render_results (
    id               NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id          NUMBER       NOT NULL,
    result_image_url VARCHAR2(500) NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_task FOREIGN KEY (task_id) REFERENCES render_tasks(id)
)
/

-- Dữ liệu mẫu cho bảng PROMPT_OPTIONS
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('STYLE', 'Nhiệt đới', 'tropical architecture style')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('STYLE', 'Hiện đại', 'modern minimalist architecture style')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('STYLE', 'Đông Dương', 'Indochine colonial architecture style')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('CONTEXT', 'Bãi biển', 'beachfront ocean view setting')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('CONTEXT', 'Đô thị', 'urban city environment setting')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('CONTEXT', 'Vườn cây', 'lush tropical garden surrounding')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('LIGHTING', 'Ban ngày', 'bright natural daylight')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('LIGHTING', 'Hoàng hôn', 'golden hour sunset lighting')
/
INSERT INTO prompt_options (option_type, display_name, prompt_value) VALUES ('LIGHTING', 'Ban đêm', 'dramatic night lighting with artificial lights')
/
COMMIT
/
