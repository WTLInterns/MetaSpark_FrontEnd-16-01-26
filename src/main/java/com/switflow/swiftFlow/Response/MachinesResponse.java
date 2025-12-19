package com.switflow.swiftFlow.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MachinesResponse {
    
    private int id;
    private String machineName;
    private String status;
    private String dateAdded;
}
