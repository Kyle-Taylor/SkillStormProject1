package com.skillstorm.project1.conrollers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class PageRedirectController implements ErrorController {

    @GetMapping({"/", "/LandingPage"})
    public String landingPage() {
        return "forward:/LandingPage.html";
    }

    @GetMapping("/Login")
    public String loginPage() {
        return "forward:/LoginPage.html";
    }

    @RequestMapping("/Error")
    public String handleError() {
        return "forward:/ErrorPage.html";
    }

    @GetMapping("/Dashboard")
    public String dashboardPage(HttpSession session) {
        if (session.getAttribute("user") == null) {
            return "redirect:/Login";
        }
        return "forward:/Dashboard/Dashboard.html";
    }
}
