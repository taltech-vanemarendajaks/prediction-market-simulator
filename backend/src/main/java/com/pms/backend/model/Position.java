package com.pms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "positions")
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(nullable = false)
    private String positionType;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private String result;

    public Position() {}

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Market getMarket() { return market; }
    public void setMarket(Market market) { this.market = market; }

    public String getPositionType() { return positionType; }
    public void setPositionType(String positionType) { this.positionType = positionType; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}