package com.edutech.eventmanagementsystem.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.eventmanagementsystem.dto.LoginRequest;
import com.edutech.eventmanagementsystem.dto.LoginResponse;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.jwt.JwtUtil;
import com.edutech.eventmanagementsystem.service.UserService;


@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    UserService userService;

    //In built method -- of spring security;
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user){

        User saved=userService.registerUser(user);
        return new ResponseEntity<User>(saved,HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse>login(@RequestBody LoginRequest loginRequest){
        // Login request and login request are dto files;

        try {
            

            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

        } catch (AuthenticationException e) {
            // TODO: handle exception

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid credentials");
        
        }
        UserDetails userDetails=userService.loadUserByUsername(loginRequest.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
