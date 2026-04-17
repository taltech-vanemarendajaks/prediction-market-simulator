package com.pms.backend.service;

import com.pms.backend.dto.MarketOdds;
import com.pms.backend.model.Position;
import com.pms.backend.repository.PositionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Calculates live UP/DOWN probability for a market based on
 * the ratio of placed positions (weighted by amount).
 *
 * Pure read-only service — no side effects, no persistence.
 */
@Service
public class OddsService {

    private final PositionRepository positionRepository;

    public OddsService(PositionRepository positionRepository) {
        this.positionRepository = positionRepository;
    }

    /**
     * Computes the UP/DOWN probability split for the given market.
     *
     * @param marketId the market to calculate odds for
     * @return MarketOdds with upProbability and downProbability (0–100),
     *         defaults to 50/50 when no positions exist
     */
    public MarketOdds calculateOdds(Long marketId) {
        List<Position> positions = positionRepository.findByMarketId(marketId);

        double totalUp = 0.0;
        double totalDown = 0.0;

        for (Position p : positions) {
            if ("UP".equals(p.getPositionType())) {
                totalUp += p.getAmount();
            } else {
                totalDown += p.getAmount();
            }
        }

        double total = totalUp + totalDown;

        if (total == 0) {
            return new MarketOdds(50.0, 50.0);
        }

        return new MarketOdds(
                (totalUp / total) * 100.0,
                (totalDown / total) * 100.0);
    }
}
