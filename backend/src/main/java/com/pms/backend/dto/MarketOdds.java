package com.pms.backend.dto;

/**
 * Immutable container for calculated market probabilities.
 * Values are percentages (0–100) that always sum to 100.
 */
public record MarketOdds(double upProbability, double downProbability) {}
