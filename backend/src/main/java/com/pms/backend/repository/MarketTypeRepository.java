package com.pms.backend.repository;

import com.pms.backend.model.MarketType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketTypeRepository extends JpaRepository<MarketType, Long> {
}