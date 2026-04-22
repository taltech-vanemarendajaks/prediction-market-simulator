package com.pms.backend.repository;

import com.pms.backend.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByMarketId(Long marketId);
    List<Position> findByMarketIdAndResult(Long marketId, String result);
    List<Position> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("UPDATE Position p SET p.result = :result WHERE p.market.id = :marketId AND p.positionType = :positionType")
    void batchUpdatePositionResults(@Param("marketId") Long marketId, @Param("positionType") String positionType, @Param("result") String result);
}