package com.pms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "markets")
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Double startingPrice;

    @Column(nullable = false)
    private LocalDateTime startingDate;

    @Column(nullable = false)
    private LocalDateTime endingDate;

    @Column(nullable = false)
    private String status;

    @Column(nullable = true)
    private String result;

    @Column(nullable = false)
    private Double endingPrice;

    @Column(nullable = false)
    private boolean payoutProcessed;

    @ManyToOne(optional = false)
    @JoinColumn(name = "market_type_id", nullable = false)
    private MarketType marketType;

    public Market() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(Double startingPrice) {
        this.startingPrice = startingPrice;
    }

    public LocalDateTime getStartingDate() {
        return startingDate;
    }

    public void setStartingDate(LocalDateTime startingDate) {
        this.startingDate = startingDate;
    }

    public LocalDateTime getEndingDate() {
        return endingDate;
    }

    public void setEndingDate(LocalDateTime endingDate) {
        this.endingDate = endingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public Double getEndingPrice() {
        return endingPrice;
    }

    public void setEndingPrice(Double endingPrice) {
        this.endingPrice = endingPrice;
    }

    public boolean isPayoutProcessed() {
        return payoutProcessed;
    }

    public void setPayoutProcessed(boolean payoutProcessed) {
        this.payoutProcessed = payoutProcessed;
    }

    public MarketType getMarketType() {
        return marketType;
    }

    public void setMarketType(MarketType marketType) {
        this.marketType = marketType;
    }
}