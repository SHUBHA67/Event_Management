package com.edutech.eventmanagementsystem.config;

import com.edutech.eventmanagementsystem.jwt.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // Authentication is handled via UserService (UserDetailsService)
        // so no in-memory or JDBC auth here
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
            // ✅ CORS CONFIGURATION (inline)
            .cors().configurationSource(request -> {
                CorsConfiguration cors = new CorsConfiguration();
                cors.setAllowedOrigins(
                        List.of("http://localhost:3000", "http://localhost:4200")
                );
                cors.setAllowedMethods(
                        List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
                );
                cors.setAllowedHeaders(List.of("*"));
                cors.setAllowCredentials(true);
                return cors;
            }).and()

            // ✅ CSRF DISABLED (JWT-based auth)
            .csrf().disable()

            // ✅ Stateless session (JWT)
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()

            // ✅ URL authorization
            .authorizeRequests()
            .antMatchers(
                    "/auth/**",
                    "/login",
                    "/register"
            ).permitAll()
            .anyRequest().authenticated();

        // ✅ JWT filter
        http.addFilterBefore(
                jwtRequestFilter,
                UsernamePasswordAuthenticationFilter.class
        );
    }

    // // ✅ Password encoder
    // @Bean
    // public PasswordEncoder passwordEncoder() {
    //     return new BCryptPasswordEncoder();
    // }

    // ✅ Required for authentication process
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}