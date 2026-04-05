package com.pms.backend.service;

import com.pms.backend.model.Market;
import com.pms.backend.model.MarketType;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.MarketTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarketService {

    private final MarketRepository marketRepository;
    private final MarketTypeRepository marketTypeRepository;

    public MarketService(MarketRepository marketRepository, MarketTypeRepository marketTypeRepository) {
        this.marketRepository = marketRepository;
        this.marketTypeRepository = marketTypeRepository;
    }

    // --- MarketType Methods ---

    /**
     * Creates a new market type in the database.
     */
    public MarketType createMarketType(MarketType marketType) {
        return marketTypeRepository.save(marketType);
    }

    /**
     * Retrieves an existing market type by ID.
     */
    public Optional<MarketType> getMarketTypeById(Long id) {
        return marketTypeRepository.findById(id);
    }

    /**
     * Retrieves all market types.
     */
    public List<MarketType> getAllMarketTypes() {
        return marketTypeRepository.findAll();
    }

    // --- Market Methods ---

    /**
     * Creates a new market in the database.
     */
    public Market createMarket(Market market) {
        return marketRepository.save(market);
    }

    /**
     * Retrieves an existing market by ID.
     */
    public Optional<Market> getMarketById(Long id) {
        return marketRepository.findById(id);
    }

    /**
     * Retrieves all historical and current markets.
     */
    public List<Market> getAllMarkets() {
        return marketRepository.findAll();
    }

    /**
     * Updates an existing market's state.
     */
    public Market updateMarket(Long id, Market marketDetails) {
        return marketRepository.findById(id).map(market -> {
            if (marketDetails.getTitle() != null) market.setTitle(marketDetails.getTitle());
            if (marketDetails.getCreatedAt() != null) market.setCreatedAt(marketDetails.getCreatedAt());
            if (marketDetails.getStartingPrice() != null) market.setStartingPrice(marketDetails.getStartingPrice());
            if (marketDetails.getStartingDate() != null) market.setStartingDate(marketDetails.getStartingDate());
            if (marketDetails.getEndingDate() != null) market.setEndingDate(marketDetails.getEndingDate());
            if (marketDetails.getStatus() != null) market.setStatus(marketDetails.getStatus());
            if (marketDetails.getResult() != null) market.setResult(marketDetails.getResult());
            if (marketDetails.getMarketType() != null) market.setMarketType(marketDetails.getMarketType());
            return marketRepository.save(market);
        }).orElseThrow(() -> new RuntimeException("Market not found with id " + id));
    }
}
