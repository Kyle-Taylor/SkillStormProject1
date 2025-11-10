package com.skillstorm.project1.conrollers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class PageRedirectController implements ErrorController{

    @GetMapping({"/", "/LandingPage"})
    public String landingPage() {
        return "redirect:/LandingPage.html";
    }

    @GetMapping("/Login")
    public String loginPage() {
        return "redirect:/LoginPage.html";
    }
       @RequestMapping("/error")
    public String handleError() {
        return "redirect:/ErrorPage.html";
    }
}
