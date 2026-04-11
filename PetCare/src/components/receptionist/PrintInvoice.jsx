import React from 'react';
import './PrintInvoice.css';

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const PrintInvoice = ({ invoicePreview, paymentSummary, receptionistName, time }) => {
    if (!invoicePreview) return null;

    const chargeItems = Array.isArray(invoicePreview.chargeItems) ? invoicePreview.chargeItems : [];
    const customerName = invoicePreview?.customer?.fullName || invoicePreview?.medicalRecord?.customer?.fullName || '';
    const customerPhone = invoicePreview?.customer?.phoneNumber || invoicePreview?.medicalRecord?.customer?.phoneNumber || '';
    const petName = invoicePreview?.pet?.name || invoicePreview?.medicalRecord?.pet?.name || '';
    const invoiceId = invoicePreview?.id || '---';

    return (
        <div className="invoice-print-container">
            <div className="invoice-header">
                <h2>PHÒNG KHÁM THÚ Y PETCARE</h2>
                <p>123 Đường Đông Cát, Quận Tây Cầu, Hà Nội</p>
                <p>Hotline: 0988 123 456</p>
                <p>Website: petcare-clinic.com</p>
                <div className="invoice-title">
                    <h3>HÓA ĐƠN THANH TOÁN</h3>
                    <p>Số HĐ: #{invoiceId}</p>
                    <p>Ngày: {time || new Date().toLocaleString('vi-VN')}</p>
                </div>
            </div>

            <div className="invoice-customer-info">
                <div className="info-row">
                    <span>Khách hàng:</span>
                    <strong>{toTitleCase(customerName)}</strong>
                </div>
                <div className="info-row">
                    <span>Điện thoại:</span>
                    <strong>{customerPhone}</strong>
                </div>
                <div className="info-row">
                    <span>Thú cưng:</span>
                    <strong>{petName}</strong>
                </div>
                <div className="info-row">
                    <span>Thu ngân:</span>
                    <strong>{toTitleCase(receptionistName)}</strong>
                </div>
            </div>

            <table className="invoice-table">
                <thead>
                    <tr>
                        <th className="col-name">Chi tiết</th>
                        <th className="col-qty">SL</th>
                        <th className="col-price">Đơn giá</th>
                        <th className="col-total">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {chargeItems.map((item, index) => {
                        const qty = Number(item?.qty || item?.quantity || 1);
                        const price = Number(item?.unitPrice || item?.basePrice || item?.price || item?.amount || 0);
                        const total = Number(item?.amount || qty * price);
                        return (
                            <tr key={item.id || index}>
                                <td className="col-name">{item.name}</td>
                                <td className="col-qty">{qty}</td>
                                <td className="col-price">{formatCurrency(price)}</td>
                                <td className="col-total">{formatCurrency(total)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="invoice-summary">
                <div className="summary-row grand-total">
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(paymentSummary?.subtotal)}</strong>
                </div>
                {Number(paymentSummary?.discount) > 0 && (
                    <div className="summary-row">
                        <span>Giảm giá:</span>
                        <strong>-{formatCurrency(paymentSummary.discount)}</strong>
                    </div>
                )}
                {Number(paymentSummary?.insurance) > 0 && (
                    <div className="summary-row">
                        <span>Bảo hiểm chi trả:</span>
                        <strong>-{formatCurrency(paymentSummary.insurance)}</strong>
                    </div>
                )}
            </div>

            <div className="invoice-footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p>Hẹn gặp lại</p>
            </div>
        </div>
    );
};

export default PrintInvoice;
