package com.skillstorm.project1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> 
                sess.sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/Login", "/LandingPage", "/error",
                    "/LandingPage.html", "/LoginPage.html", "/ErrorPage.html",
                    "/users/login", "/users/register",
                    "/Register.html", "/Register",
                    "/css/**", "/js/**", "/images/**",
                    "/Dashboard/**", 
                    "/inventory/**",
                    "/warehouses/**",
                    "/restocks/**",
                    "/products/**",
                    "/suppliers/**",
                    "/checkouts/**",
                    "/users/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable());

        return http.build();
    }
}
