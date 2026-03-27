package com.edutech.eventmanagementsystem.dto;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {

    private String username;
    private String password;


    //new --- check this
    @JsonCreator
    public LoginRequest(@JsonProperty String username,@JsonProperty String password) {
        this.username = username;
        this.password = password;
    }


    public String getUsername() {
        return username;
    }


    public String getPassword() {
        return password;
    }

    

    
}
