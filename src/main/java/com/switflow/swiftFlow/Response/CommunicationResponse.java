package com.switflow.swiftFlow.Response;

import com.switflow.swiftFlow.utility.Department;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommunicationResponse {
    
    private int id;

    private Department department;

    private String message;

    private String date;

    private String time;
 
    private String priority;

    private String isRead;
}
