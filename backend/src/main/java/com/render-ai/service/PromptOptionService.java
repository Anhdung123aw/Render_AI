package com.renderai.service;

import com.renderai.dto.PromptOptionDto;
import com.renderai.dto.PromptOptionGroupDto;
import com.renderai.entity.PromptOption;
import com.renderai.entity.PromptOptionType;
import com.renderai.repository.PromptOptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PromptOptionService {

    private final PromptOptionRepository promptOptionRepository;

    public PromptOptionService(PromptOptionRepository promptOptionRepository) {
        this.promptOptionRepository = promptOptionRepository;
    }

    /**
     * Lấy tất cả option đang active, nhóm theo loại (STYLE/CONTEXT/LIGHTING)
     */
    public PromptOptionGroupDto getAllGrouped() {
        List<PromptOption> all = promptOptionRepository.findAll()
                .stream()
                .filter(PromptOption::getIsActive)
                .collect(Collectors.toList());

        Map<String, List<PromptOptionDto>> grouped = all.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOptionType().name(),
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));

        return PromptOptionGroupDto.builder().options(grouped).build();
    }

    private PromptOptionDto toDto(PromptOption option) {
        return PromptOptionDto.builder()
                .id(option.getId())
                .optionType(option.getOptionType().name())
                .displayName(option.getDisplayName())
                .promptValue(option.getPromptValue())
                .build();
    }
}
