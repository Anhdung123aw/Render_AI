package com.renderai.repository;

import com.renderai.entity.RenderTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RenderTaskRepository extends JpaRepository<RenderTask, Long> {
    List<RenderTask> findByUserIdOrderByCreatedAtDesc(Long userId);
}
