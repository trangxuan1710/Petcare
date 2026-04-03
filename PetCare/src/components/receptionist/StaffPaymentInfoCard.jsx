import React, { useEffect, useState } from 'react';
import './StaffPaymentInfoCard.css';
import { Headset, Printer } from 'lucide-react';

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
    qrImageSrc = '/assets/sample_qr.png'
}) => {
    const [resolvedQrImage, setResolvedQrImage] = useState(null);

    useEffect(() => {
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
    }, [qrImageSrc]);

    const canShowQrImage = Boolean(resolvedQrImage);

    return (
        <section className="staff-payment-info-card">
            <div className={`staff-payment-qr-box ${canShowQrImage ? 'has-image' : ''}`}>
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
                            Chưa hỗ trợ tạo mã,<br /> 
                            vui lòng chọn hình thức<br /> 
                            thanh toán QR
                        </p>
                        <button type="button" className="print-btn">
                            <span>In đơn</span>
                            <Printer size={24} strokeWidth={2} />
                        </button>
                    </>
                )}
            </div>

            <div className="staff-payment-order-info">
                <p className="created-time">{time}</p>
                {/* <span className="status-pill">{status}</span> */}
                {/* <h2 className="order-id-title">{orderId}</h2> */}

                <div className="info-group">
                    <span className="group-label">Khách hàng</span>
                    <strong className="group-value">{customer.name}</strong>
                    <span className="group-sub">{customer.phone}</span>
                </div>

                <div className="info-group">
                    <span className="group-label">Thu ngân</span>
                    <strong className="group-value">{cashier.name}</strong>
                    <span className="group-sub">{cashier.phone}</span>
                </div>
            </div>
        </section>
    );
};

export default StaffPaymentInfoCard;
