package com.switflow.swiftFlow.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.switflow.swiftFlow.Entity.Machines;

@Repository
public interface MachinesRepo extends JpaRepository<Machines, Integer> {
    
}
