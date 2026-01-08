package com.switflow.swiftFlow.Controller;

import com.switflow.swiftFlow.Entity.User;
import com.switflow.swiftFlow.Request.AuthRequest;
import com.switflow.swiftFlow.Request.UserRegistrationRequest;
import com.switflow.swiftFlow.Response.AuthResponse;
import com.switflow.swiftFlow.Response.MessageResponse;
import com.switflow.swiftFlow.Service.AuthService;
import com.switflow.swiftFlow.utility.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            AuthResponse response = authService.authenticate(authRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("User not found")) {
                return ResponseEntity.status(401).body("{\"error\": \"User not found\"}");
            } else if (e.getMessage().equals("Invalid credentials")) {
                return ResponseEntity.status(401).body("{\"error\": \"Invalid credentials\"}");
            } else {
                return ResponseEntity.status(401).body("{\"error\": \"" + e.getMessage() + "\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest registrationRequest) {
        try {
            User user = authService.registerUser(registrationRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = authService.getUsernameFromToken(token);
            
            if (username != null && authService.validateToken(token, username)) {
                String newToken = authService.generateNewToken(username);
                User user = authService.getUserByUsername(username);
                Role role = authService.getUserRole(user.getId());
                return ResponseEntity.ok().body(new AuthResponse(newToken, user, role));
            }
        }
        return ResponseEntity.status(401).body(new MessageResponse("Invalid or expired token"));
    }
}