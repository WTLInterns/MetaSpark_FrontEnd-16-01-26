package com.switflow.swiftFlow.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MachinesRequest {
    
    private String machineName;
    private String status;
    private String dateAdded;
}
