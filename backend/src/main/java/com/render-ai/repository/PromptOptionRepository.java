package com.renderai.repository;

import com.renderai.entity.PromptOption;
import com.renderai.entity.PromptOptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromptOptionRepository extends JpaRepository<PromptOption, Long> {
    List<PromptOption> findByOptionTypeAndIsActiveTrue(PromptOptionType optionType);
}
