package com.petical.service;

import com.petical.dto.response.InvoicePreviewResponse;
import com.petical.entity.Invoice;
import com.petical.entity.PaymentMethod;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PaymentService {
    InvoicePreviewResponse getInvoiceByReceptionSlip(long receptionSlipId);

    List<PaymentMethod> getPaymentMethods();

    InvoicePreviewResponse createInvoice(Invoice request);

    InvoicePreviewResponse getInvoice(long id);

    InvoicePreviewResponse updateInvoice(long id, Invoice request);
}
