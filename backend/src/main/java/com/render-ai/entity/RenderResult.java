package com.renderai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "RENDER_RESULTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenderResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private RenderTask renderTask;

    @Column(name = "result_image_url", nullable = false)
    private String resultImageUrl;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
