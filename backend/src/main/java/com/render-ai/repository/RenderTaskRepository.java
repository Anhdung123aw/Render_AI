package com.renderai.repository;

import com.renderai.entity.RenderTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RenderTaskRepository extends JpaRepository<RenderTask, Long> {
    List<RenderTask> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT r FROM RenderTask r LEFT JOIN FETCH r.user ORDER BY r.createdAt DESC")
    List<RenderTask> findAllByOrderByCreatedAtDesc();
}
