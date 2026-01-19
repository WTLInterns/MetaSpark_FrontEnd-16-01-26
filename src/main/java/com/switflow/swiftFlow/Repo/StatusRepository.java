package com.switflow.swiftFlow.Repo;

import com.switflow.swiftFlow.Entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusRepository extends JpaRepository<Status, Integer> {
    List<Status> findByOrdersOrderId(long orderId);

    void deleteByOrdersOrderId(long orderId);
}