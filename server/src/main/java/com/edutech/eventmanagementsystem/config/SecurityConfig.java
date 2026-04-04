package com.edutech.eventmanagementsystem.config;

import com.edutech.eventmanagementsystem.jwt.JwtRequestFilter;
import com.edutech.eventmanagementsystem.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserService userDetailsService;
    private final JwtRequestFilter jwtRequestFilter;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(UserService userDetailsService,
            JwtRequestFilter jwtRequestFilter,
            PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeRequests()

                // ── Public ──────────────────────────────────────────
                .antMatchers(HttpMethod.POST, "/api/user/register", "/api/user/login").permitAll()
                .antMatchers("/h2-console/**").permitAll()

                // ── PLANNER ─────────────────────────────────────────
                .antMatchers(HttpMethod.GET,
                        "/api/planner/events",
                        "/api/planner/resources",
                        "/api/planner/staff-users",
                        "/api/planner/available-staff",
                        "/api/planner/event-requests")
                .hasAuthority("PLANNER")
                .antMatchers(HttpMethod.POST,
                        "/api/planner/event",
                        "/api/planner/resource",
                        "/api/planner/allocate-resources")
                .hasAuthority("PLANNER")
                .antMatchers(HttpMethod.PUT,
                        "/api/planner/event-requests/*/review",
                        "/api/planner/event-requests/*/approve",
                        "/api/planner/event-requests/*/reject")
                .hasAuthority("PLANNER")

                // ── STAFF ────────────────────────────────────────────
                .antMatchers(HttpMethod.GET, "/api/staff/my-events").hasAuthority("STAFF")
                .antMatchers(HttpMethod.PUT, "/api/staff/update-status/*").hasAuthority("STAFF")

                // ── CLIENT ───────────────────────────────────────────
                .antMatchers(HttpMethod.GET,
                        "/api/client/events",
                        "/api/client/my-requests",
                        "/api/client/my-bookings")
                .hasAuthority("CLIENT")
                .antMatchers(HttpMethod.POST, "/api/client/event-request").hasAuthority("CLIENT")

                .anyRequest().authenticated()
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.headers().frameOptions().disable();
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
