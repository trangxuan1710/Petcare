package com.petical.repository;

import com.petical.entity.Invoice;
import com.petical.repository.projection.ClientSpentProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Override
    @EntityGraph(attributePaths = {
            "medicalRecord",
            "medicalRecord.receptionRecord",
            "medicalRecord.receptionRecord.client",
            "medicalRecord.receptionRecord.pet",
            "medicalRecord.receptionRecord.receptionist",
            "medicalRecord.receptionRecord.doctor",
            "medicalRecord.doctor",
            "medicalRecord.status",
            "paymentMethod",
            "receptionist"
    })
    Optional<Invoice> findById(Long id);

    @EntityGraph(attributePaths = {
            "medicalRecord",
            "medicalRecord.receptionRecord",
            "medicalRecord.receptionRecord.client",
            "medicalRecord.receptionRecord.pet",
            "medicalRecord.receptionRecord.receptionist",
            "medicalRecord.receptionRecord.doctor",
            "medicalRecord.doctor",
            "medicalRecord.status",
            "paymentMethod",
            "receptionist"
    })
    Optional<Invoice> findByMedicalRecordId(long medicalRecordId);

                @Query("""
                                                select i.medicalRecord.receptionRecord.client.id as clientId,
                                                                         coalesce(sum(i.totalAmount), 0) as totalSpent
                                                from Invoice i
                                                where i.medicalRecord.receptionRecord.client.id in :clientIds
                                                        and (i.status is null or upper(i.status) = 'PAID')
                                                group by i.medicalRecord.receptionRecord.client.id
                                                """)
                List<ClientSpentProjection> sumTotalSpentByClientIds(@Param("clientIds") Collection<Long> clientIds);
}
