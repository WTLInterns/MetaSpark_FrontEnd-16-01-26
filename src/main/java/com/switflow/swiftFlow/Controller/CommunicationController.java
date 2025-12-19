package com.switflow.swiftFlow.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.switflow.swiftFlow.Request.CommunicationRequest;
import com.switflow.swiftFlow.Response.CommunicationResponse;
import com.switflow.swiftFlow.Service.CommunicationService;

@RestController
@RequestMapping("/communication")
public class CommunicationController {
    
    @Autowired
    private CommunicationService communicationService;


        @PreAuthorize("hasAnyRole('ADMIN','DESIGN','PRODUCTION','INQUIRY','INSPECTION','MACHINING')")
    @GetMapping("/getallcommunication")
    public List<CommunicationResponse> getAllCommunication() {
        return communicationService.getAllCommunication();
    }

    @PreAuthorize("hasAnyRole('ADMIN','DESIGN','PRODUCTION','INQUIRY','INSPECTION','MACHINING')")
    @PostMapping("/add-communication")
    public CommunicationResponse addCommunication(@RequestBody CommunicationRequest communicationRequest) {
        return communicationService.createaCommunication(communicationRequest);
    }

    @PreAuthorize("hasAnyRole('ADMIN','DESIGN','PRODUCTION','INQUIRY','INSPECTION','MACHINING')")
    @PutMapping("/marksAsRead/{id}")
    public CommunicationResponse markAsRead(@PathVariable int id, @RequestBody CommunicationRequest communicationRequest){
return this.communicationService.getMarkAsRead(id, communicationRequest);
    }


    
}
