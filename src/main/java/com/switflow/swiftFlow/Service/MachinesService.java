package com.switflow.swiftFlow.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.switflow.swiftFlow.Entity.Machines;
import com.switflow.swiftFlow.Repo.MachinesRepo;
import com.switflow.swiftFlow.Request.MachinesRequest;
import com.switflow.swiftFlow.Response.MachinesResponse;

@Service
public class MachinesService {

    @Autowired
    private MachinesRepo machinesRepo;

    public MachinesResponse addMachines(MachinesRequest machinesRequest) {
        Machines machines = new Machines();
        machines.setMachineName(machinesRequest.getMachineName());
        machines.setStatus(machinesRequest.getStatus());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        machines.setDateAdded(LocalDate.now().format(formatter));
        Machines savedMachines = machinesRepo.save(machines);
        return new MachinesResponse(savedMachines.getId(), savedMachines.getMachineName(), savedMachines.getStatus(),
                savedMachines.getDateAdded());
    }

    public MachinesResponse getMachines(int id) {
        Machines machines = machinesRepo.findById(id).orElse(null);
        return new MachinesResponse(machines.getId(), machines.getMachineName(), machines.getStatus(),
                machines.getDateAdded());
    }

    public MachinesResponse updateMachines(int id, MachinesRequest machinesRequest) {
        Machines machines = machinesRepo.findById(id).orElse(null);
        machines.setMachineName(machinesRequest.getMachineName());
        machines.setStatus(machinesRequest.getStatus());
        Machines updatedMachines = machinesRepo.save(machines);
        return new MachinesResponse(updatedMachines.getId(), updatedMachines.getMachineName(),
                updatedMachines.getStatus(),
                updatedMachines.getDateAdded());
    }

    public void deleteMachines(int id) {
        machinesRepo.deleteById(id);
    }

    public List<MachinesResponse> getAllMachines() {
    return machinesRepo.findAll().stream().map(machines -> new MachinesResponse(machines.getId(),
                machines.getMachineName(), machines.getStatus(), machines.getDateAdded())).toList();
    }

}
