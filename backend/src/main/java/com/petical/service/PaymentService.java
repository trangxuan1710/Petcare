package com.petical.service;

import com.petical.entity.Invoice;
import com.petical.entity.PaymentMethod;
import com.petical.entity.Prepayment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PaymentService {
    Invoice getInvoiceByReceptionSlip(long receptionSlipId);

    List<PaymentMethod> getPaymentMethods();

    Invoice createInvoice(Invoice request);

    Invoice getInvoice(long id);

    Invoice updateInvoice(long id, Invoice request);

    Prepayment createPrepayment(Prepayment request);

    List<Prepayment> listPrepayments(Long receptionSlipId);
}
