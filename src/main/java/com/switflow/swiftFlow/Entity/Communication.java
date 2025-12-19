package com.switflow.swiftFlow.Entity;

import com.switflow.swiftFlow.utility.Department;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Communication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private Department department;

    private String message;

    private String date;

    private String time;
 
    private String priority;

    private String isRead;

    
}
