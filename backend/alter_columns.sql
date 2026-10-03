ALTER TABLE render_results MODIFY result_image_url VARCHAR2(2000);
ALTER TABLE render_tasks MODIFY original_image_url VARCHAR2(2000);
ALTER TABLE render_tasks MODIFY style_image_url VARCHAR2(2000);
COMMIT;
EXIT;
