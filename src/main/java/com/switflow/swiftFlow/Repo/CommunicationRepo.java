package com.switflow.swiftFlow.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.switflow.swiftFlow.Entity.Communication;

@Repository
public interface CommunicationRepo extends JpaRepository<Communication, Integer>{

    
} 