CONNECT RENDER_AI/RenderAi_2026@localhost:1521/XEPDB1

CREATE TABLE app_users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(100) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    user_role VARCHAR2(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prompt_options (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    option_type VARCHAR2(50) NOT NULL,
    display_name VARCHAR2(100) NOT NULL,
    prompt_value VARCHAR2(255) NOT NULL,
    is_active NUMBER(1) DEFAULT 1
);

CREATE TABLE render_tasks (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    original_image_url VARCHAR2(500),
    style_image_url VARCHAR2(500),
    base_prompt CLOB,
    final_prompt CLOB,
    negative_prompt CLOB,
    aspect_ratio VARCHAR2(20),
    num_images NUMBER(3),
    ai_provider VARCHAR2(50),
    status VARCHAR2(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES app_users(id)
);

CREATE TABLE render_results (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id NUMBER NOT NULL,
    result_image_url VARCHAR2(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_task FOREIGN KEY (task_id) REFERENCES render_tasks(id)
);

COMMIT;
EXIT;
