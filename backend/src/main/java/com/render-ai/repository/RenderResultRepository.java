package com.renderai.repository;

import com.renderai.entity.RenderResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RenderResultRepository extends JpaRepository<RenderResult, Long> {
    List<RenderResult> findByRenderTaskId(Long taskId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RenderResult r WHERE r.renderTask.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RenderResult r WHERE r.renderTask.id IN :taskIds")
    void deleteByTaskIds(@Param("taskIds") List<Long> taskIds);
}
