package com.skillstorm.project1.conrollers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class PageRedirectController implements ErrorController {

    /**
     * Redirects the root URL and "/LandingPage" to the LandingPage.html file.
     * @return forward path to the landing page HTML file.
     */
    @GetMapping({"/", "/LandingPage"})
    public String landingPage() {
        return "forward:/LandingPage.html";
    }

    /**
     * Serves the login page by forwarding to LoginPage.html.
     * @return forward path to the login page.
     */
    @GetMapping("/Login")
    public String loginPage() {
        return "forward:/LoginPage.html";
    }

    /**
     * Serves the login page by forwarding to LoginPage.html.
     * @return forward path to the login page.
     */
    @GetMapping("/Register")
    public String registerPage() {
        return "forward:/Register.html";
    }

    /**
     * Handles application-level errors and forwards the user to ErrorPage.html.
     * @return forward path to the error page.
     */
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/ErrorPage.html";
    }

    /**
     * Redirects unauthorized users to the login page.
     * Authorized users are forwarded to the dashboard HTML page.
     *
     * @param session the active HTTP session used to check login status.
     * @return forward path to dashboard or redirect to login if unauthorized.
     */
    @GetMapping("/Dashboard")
    public String dashboardPage(HttpSession session) {
        if (session.getAttribute("user") == null) {
            return "redirect:/Login";
        }
        return "forward:/Dashboard/Dashboard.html";
    }
}
