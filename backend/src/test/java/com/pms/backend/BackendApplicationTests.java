package com.pms.backend;

import com.pms.backend.model.Market;
import com.pms.backend.model.MarketType;
import com.pms.backend.model.User;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.MarketTypeRepository;
import com.pms.backend.repository.PositionRepository;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.PositionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private MarketTypeRepository marketTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PositionService positionService;

    private Long openMarketId;

    @BeforeEach
    void setUp() {
        positionRepository.deleteAll();
        marketRepository.deleteAll();
        marketTypeRepository.deleteAll();
        userRepository.deleteAll();

        MarketType marketType = new MarketType();
        marketType.setTicker("BTCUSDT");
        marketType.setApi("BYBIT");
        marketType.setEnabled(true);
        marketType.setCreateDate(LocalDateTime.now());
        marketType = marketTypeRepository.save(marketType);

        Market market = new Market();
        market.setTitle("BTC 5 Minute UP or DOWN");
        market.setCreatedAt(LocalDateTime.now());
        market.setStartingPrice(50000.0);
        market.setStartingDate(LocalDateTime.now());
        market.setEndingDate(LocalDateTime.now().plusMinutes(5));
        market.setStatus("OPEN");
        market.setEndingPrice(50000.0);
		market.setPayoutProcessed(false);
        market.setMarketType(marketType);
        market = marketRepository.save(market);

        openMarketId = market.getId();
    }

    @Test
    void authenticatedUserCannotSpoofPositionOwnershipAndCanReadOwnPositions() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "user1",
                                  "email": "user1@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "user2",
                                  "email": "user2@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "user2@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/wallet/claim")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.balance").value(500.0))
                .andExpect(jsonPath("$.starterClaimed").value(true));

        mockMvc.perform(post("/api/position")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "marketId": %d,
                                  "userId": 1,
                                  "positionType": "UP",
                                  "amount": 10
                                }
                                """.formatted(openMarketId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.marketId").value(openMarketId))
                .andExpect(jsonPath("$.positionType").value("UP"))
                .andExpect(jsonPath("$.amount").value(10.0))
                .andExpect(jsonPath("$.balance").value(490.0));

        mockMvc.perform(get("/api/positions/me")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(2))
                .andExpect(jsonPath("$[0].marketId").value(openMarketId))
                .andExpect(jsonPath("$[0].positionType").value("UP"))
                .andExpect(jsonPath("$[0].amount").value(10.0));
    }

    @Test
    void unauthenticatedUserCannotReadOwnPositions() throws Exception {
        mockMvc.perform(get("/api/positions/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticatedUserCannotCreatePosition() throws Exception {
        mockMvc.perform(post("/api/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "marketId": %d,
                                  "positionType": "UP",
                                  "amount": 10
                                }
                                """.formatted(openMarketId)))
                .andExpect(status().isForbidden());
    }

    @Test
    void winningPositionGetsPaidOutOnlyOnce() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "winner",
                                  "email": "winner@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "winner@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/wallet/claim")
                        .session(session))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/position")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "marketId": %d,
                                  "positionType": "UP",
                                  "amount": 100
                                }
                                """.formatted(openMarketId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(400.0));

        positionService.resolveMarketAndProcessPayouts(openMarketId, "UP");

        User userAfterFirstPayout = userRepository.findByEmail("winner@test.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(600.0, userAfterFirstPayout.getBalance());

        positionService.resolveMarketAndProcessPayouts(openMarketId, "UP");

        User userAfterSecondPayoutAttempt = userRepository.findByEmail("winner@test.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(600.0, userAfterSecondPayoutAttempt.getBalance());
    }
}
