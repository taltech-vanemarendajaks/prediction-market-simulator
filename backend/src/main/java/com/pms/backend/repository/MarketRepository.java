package com.pms.backend.repository;

import com.pms.backend.model.Market;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {
    Optional<Market> findTopByOrderByIdDesc();

    Optional<Market> findByStatus(String status);

    Optional<Market> findTopByStatusOrderByIdDesc(String status);
}