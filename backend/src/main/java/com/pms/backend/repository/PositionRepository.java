package com.pms.backend.repository;

import com.pms.backend.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByMarketId(Long marketId);
}