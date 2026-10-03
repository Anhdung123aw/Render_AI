package com.renderai.repository;

import com.renderai.entity.RenderResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RenderResultRepository extends JpaRepository<RenderResult, Long> {
    List<RenderResult> findByRenderTaskId(Long taskId);
}
