package com.switflow.swiftFlow.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.switflow.swiftFlow.Entity.Communication;
import com.switflow.swiftFlow.Repo.CommunicationRepo;
import com.switflow.swiftFlow.Request.CommunicationRequest;
import com.switflow.swiftFlow.Response.CommunicationResponse;

@Service
public class CommunicationService {

    @Autowired
    private CommunicationRepo communicationRepository;

    public CommunicationResponse createaCommunication(CommunicationRequest communicationRequest) {

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String currentDate = LocalDate.now().format(dateFormatter);
        String currentTime = LocalTime.now().format(timeFormatter);
        Communication communication = new Communication();
        communication.setDepartment(communicationRequest.getDepartment());
        communication.setMessage(communicationRequest.getMessage());
        communication.setDate(currentDate);
        communication.setTime(currentTime);
        communication.setPriority(communicationRequest.getPriority());
        communication.setIsRead("0");
        communicationRepository.save(communication);
        return new CommunicationResponse(communication.getId(), communication.getDepartment(),
                communication.getMessage(), communication.getDate(), communication.getTime(),
                communication.getPriority(), communication.getIsRead());
    }

    public CommunicationResponse updateCommunication(CommunicationRequest communicationRequest) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String currentDate = LocalDate.now().format(dateFormatter);
        String currentTime = LocalTime.now().format(timeFormatter);
        Communication communication = new Communication();
        communication.setDepartment(communicationRequest.getDepartment());
        communication.setMessage(communicationRequest.getMessage());
        communication.setDate(currentDate);
        communication.setTime(currentTime);
        communication.setPriority(communicationRequest.getPriority());
        communication.setIsRead(communicationRequest.getIsRead());
        return new CommunicationResponse(communication.getId(), communication.getDepartment(),
                communication.getMessage(), communication.getDate(), communication.getTime(),
                communication.getPriority(), communication.getIsRead());
    }

    public List<CommunicationResponse> getAllCommunication() {
        return this.communicationRepository.findAll().stream()
                .map(communication -> new CommunicationResponse(
                    communication.getId(), 
                    communication.getDepartment(),
                    communication.getMessage(), 
                    communication.getDate(), 
                    communication.getTime(),
                    communication.getPriority(), 
                    communication.getIsRead())
                    )
                .toList();

    }

    public CommunicationResponse getMarkAsRead(int id, CommunicationRequest communicationRequest){
        Communication communication = communicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Communication not found"));
        communication.setIsRead("1");
        communicationRepository.save(communication);
        return new CommunicationResponse(communication.getId(), communication.getDepartment(),
                communication.getMessage(), communication.getDate(), communication.getTime(),
                communication.getPriority(), communication.getIsRead());
    }
}
