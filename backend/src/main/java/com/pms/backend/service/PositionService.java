package com.pms.backend.service;

import com.pms.backend.model.Market;
import com.pms.backend.model.Position;
import com.pms.backend.model.User;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.PositionRepository;
import com.pms.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PositionService {

    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    public PositionService(
            PositionRepository positionRepository,
            UserRepository userRepository,
            MarketRepository marketRepository
    ) {
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.marketRepository = marketRepository;        
    }

    /**
     * Creates a new position for a given market.
     * Takes the market to link to, and the position details (amount, userId,
     * positionType).
     */
    public Position createPosition(Market market, Position positionDetails) {
        positionDetails.setMarket(market);

        // Ensure creation date is set if not provided by the payload
        if (positionDetails.getCreatedAt() == null) {
            positionDetails.setCreatedAt(LocalDateTime.now());
        }

        return positionRepository.save(positionDetails);
    }

    @Transactional
    public Position createPositionForUser(Long userId, Long marketId, String positionType, Double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new NoSuchElementException("Market not found"));

        if (!"OPEN".equals(market.getStatus())) {
            throw new IllegalStateException("Market is not open");
        }

        if (user.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        user.setBalance(user.getBalance() - amount);

        Position position = new Position();
        position.setUserId(userId);
        position.setMarket(market);
        position.setPositionType(positionType);
        position.setAmount(amount);
        position.setCreatedAt(LocalDateTime.now());

        return positionRepository.save(position);
    }

    /**
     * Retrieves an existing position by its ID.
     */
    public Optional<Position> getPositionById(Long id) {
        return positionRepository.findById(id);
    }

    /**
     * Retrieves all positions across all markets.
     */
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }

    /**
     * Retrieves all positions for a specific market.
     */
    public List<Position> getPositionsByMarketId(Long marketId) {
        return positionRepository.findByMarketId(marketId);
    }

    /**
     * Resolves all positions instantly at the database level using 2 queries
     * without looping in Java.
     */
    @Transactional
    public void resolveAllPositionsForMarket(Long marketId, String winningPositionType) {
        String losingPositionType = winningPositionType.equals("UP") ? "DOWN" : "UP";

        // Query 1: Set all correct positions to WIN
        positionRepository.batchUpdatePositionResults(marketId, winningPositionType, "WIN");

        // Query 2: Set all incorrect positions to LOSS
        positionRepository.batchUpdatePositionResults(marketId, losingPositionType, "LOSS");
    }
}
