package com.renderai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "RENDER_TASKS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenderTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "original_image_url")
    private String originalImageUrl;

    @Column(name = "style_image_url")
    private String styleImageUrl;

    @Lob
    @Column(name = "base_prompt")
    private String basePrompt;

    @Lob
    @Column(name = "final_prompt")
    private String finalPrompt;

    @Lob
    @Column(name = "negative_prompt")
    private String negativePrompt;

    @Column(name = "aspect_ratio")
    private String aspectRatio;

    @Column(name = "num_images")
    private Integer numImages;

    @Column(name = "ai_provider")
    private String aiProvider;

    @Column(name = "status")
    private String status;

    @OneToMany(mappedBy = "renderTask", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RenderResult> renderResults;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
