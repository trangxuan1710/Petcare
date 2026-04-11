import React, { useEffect, useState } from 'react';
import './StaffPaymentInfoCard.css';
import { Headset, Printer } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';

const localAssetImages = import.meta.glob('../../assets/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    import: 'default'
});

const discoveredLocalQrImage = Object.entries(localAssetImages).find(([path]) =>
    /sample[_-]?qr\.(png|jpe?g|webp|svg)$/i.test(path)
)?.[1];

const buildImageCandidates = (qrImageSrc) => {
    const rawCandidates = [
        qrImageSrc,
        '/assets/sample_qr.png',
        '/sample_qr.png',
        discoveredLocalQrImage
    ].filter(Boolean);

    const normalized = rawCandidates.flatMap((candidate) => {
        if (typeof candidate !== 'string') {
            return [];
        }

        // Accept both "assets/foo.png" and "/assets/foo.png" formats.
        if (!candidate.startsWith('http') && !candidate.startsWith('/')) {
            return [candidate, `/${candidate}`];
        }

        return [candidate];
    });

    return Array.from(new Set(normalized));
};

const canLoadImage = (url) =>
    new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
    });

const StaffPaymentInfoCard = ({ 
    // orderId = "#25REC215663", 
    time = "10:03 - 20/03/2026", 
    // status = "Hoàn thành",
    customer = { 
        name: "Nguyễn Anh Đức", 
        phone: "0912345678" 
    },
    cashier = { 
        name: "Nguyễn Thu Hương", 
        phone: "0912345678" 
    },
    showQr = false,
    showPrintButton = false,
    qrImageSrc = '/assets/sample_qr.png',
    onPrintInvoice,
}) => {
    const [resolvedQrImage, setResolvedQrImage] = useState(null);

    useEffect(() => {
        if (!showQr) {
            setResolvedQrImage(null);
            return undefined;
        }

        let active = true;

        const resolveFirstAvailableImage = async () => {
            const candidates = buildImageCandidates(qrImageSrc);

            for (const candidate of candidates) {
                const loaded = await canLoadImage(candidate);
                if (loaded) {
                    if (active) {
                        setResolvedQrImage(candidate);
                    }
                    return;
                }
            }

            if (active) {
                setResolvedQrImage(null);
            }
        };

        resolveFirstAvailableImage();

        return () => {
            active = false;
        };
    }, [qrImageSrc, showQr]);

    const canShowQrImage = showQr && Boolean(resolvedQrImage);

    const handlePrintInvoice = () => {
        if (typeof onPrintInvoice === 'function') {
            onPrintInvoice();
            return;
        }

        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <section className="staff-payment-info-card">
            <div className={`staff-payment-qr-box ${canShowQrImage ? 'has-image' : ''} ${!showQr ? 'is-placeholder' : ''}`}>
                {canShowQrImage ? (
                    <img
                        src={resolvedQrImage}
                        alt="QR thanh toán"
                        className="staff-payment-qr-image"
                    />
                ) : (
                    <>
                        <p className="qr-title">Quét mã để thanh toán</p>
                        <div className="qr-circle">
                            <Headset size={32} strokeWidth={1.5} />
                        </div>
                        <p className="qr-note">
                            {showQr ? (
                                <>
                                    Chưa tạo được mã QR,<br />
                                    vui lòng thử lại sau.
                                </>
                            ) : (
                                <>
                                    Chọn phương thức chuyển khoản<br />
                                    để hiển thị QR động.
                                </>
                            )}
                        </p>
                    </>
                )}

                {showPrintButton && (
                    <button type="button" className="qr-print-btn" onClick={handlePrintInvoice}>
                        <Printer size={14} strokeWidth={2} />
                        <span>In hóa đơn</span>
                    </button>
                )}
            </div>

            <div className="staff-payment-order-info">
                <p className="created-time">{time}</p>
                {/* <span className="status-pill">{status}</span> */}
                {/* <h2 className="order-id-title">{orderId}</h2> */}

                <div className="info-group">
                    <span className="group-label">Khách hàng</span>
                    <strong className="group-value">{toTitleCase(customer.name) || customer.name}</strong>
                    <span className="group-sub">{customer.phone}</span>
                </div>

                <div className="info-group">
                    <span className="group-label">Thu ngân</span>
                    <strong className="group-value">{toTitleCase(cashier.name) || cashier.name}</strong>
                    <span className="group-sub">{cashier.phone}</span>
                </div>
            </div>
        </section>
    );
};

export default StaffPaymentInfoCard;
