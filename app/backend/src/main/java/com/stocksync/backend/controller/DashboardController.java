package com.stocksync.backend.controller;

import com.stocksync.backend.dto.DashboardDTO;
import com.stocksync.backend.infra.security.SecurityConfig;
import com.stocksync.backend.model.User;
import com.stocksync.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Controlador de dashboard")
@SecurityRequirement(name = SecurityConfig.SECURITY)
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal User user){
        DashboardDTO dashboardData = dashboardService.getDashboardData(user);
        return ResponseEntity.ok(dashboardData);
    }
}
