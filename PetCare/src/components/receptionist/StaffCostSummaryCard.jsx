import React, { useEffect, useMemo, useState } from 'react';
import './StaffCostSummaryCard.css';
import { Mars, Venus, Weight, ChevronDown, ChevronUp } from 'lucide-react';

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0đ';
    return `${Number(value).toLocaleString('vi-VN')}đ`;
};

const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    return Number(value).toLocaleString('vi-VN');
};

const normalizeGender = (rawGender) => String(rawGender || '').trim().toLowerCase();

const StaffCostSummaryCard = ({
    petInfo = {
        name: 'Kuro',
        breed: 'Chó Poodle',
        weight: '4.5kg',
        gender: null,
    },
    costGroups = [],
    paymentSummary = {
        subtotal: 950000,
        discount: 50000,
        insurance: 200000,
        total: 750000,
    },
    paymentHistoryAmount = 0,
    showPaymentHistory = true,
}) => {
    const normalizedGroups = useMemo(
        () => (Array.isArray(costGroups) ? costGroups : []).map((group, index) => ({
            id: group?.id || `group-${index}`,
            title: group?.title || `Dịch vụ #${index + 1}`,
            totalAmount: Number(group?.totalAmount || 0),
            feeRows: Array.isArray(group?.feeRows) ? group.feeRows : [],
        })),
        [costGroups]
    );

    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        const initialExpanded = {};
        normalizedGroups.forEach((group) => {
            initialExpanded[group.id] = true;
        });
        setExpandedGroups(initialExpanded);
    }, [normalizedGroups]);

    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const petGender = normalizeGender(petInfo?.gender);

    return (
        <section className="staff-cost-card">
            <h2 className="cost-card-title">Tổng hợp chi phí</h2>

            <div className="pet-chip">
                <span className="pet-chip-details">
                    <span className="pet-chip-name">{petInfo?.name || 'Thú cưng'}</span>
                    <span className="pet-chip-breed">
                        {petInfo?.breed || '--'}
                        {petGender === 'female' || petGender === 'cái' ? (
                            <Venus size={12} color="#ec4899" style={{ marginLeft: '4px' }} />
                        ) : (
                            <Mars size={12} color="#3b82f6" style={{ marginLeft: '4px' }} />
                        )}
                    </span>
                    <span className="pet-chip-stat">
                        <Weight size={14} color="#888" />
                        {petInfo?.weight || '--'}
                    </span>
                </span>
            </div>

            <div className="cost-header-row">
                <span>SL/DVT</span>
                <span>Đơn giá</span>
                <span>Thành tiền</span>
            </div>

            {normalizedGroups.length > 0 ? normalizedGroups.map((group) => {
                const isExpanded = expandedGroups[group.id] !== false;
                return (
                    <div className="cost-group" key={group.id}>
                        <button
                            type="button"
                            className="cost-group-header-btn"
                            onClick={() => toggleGroup(group.id)}
                            aria-expanded={isExpanded}
                        >
                            <div className="group-meta">
                                <div className="group-title">
                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                    <span>{group.title}</span>
                                </div>
                            </div>
                            <div className="group-amounts">
                                <strong>{formatNumber(group.totalAmount)} đ</strong>
                            </div>
                        </button>

                        {isExpanded ? group.feeRows.map((row, rowIndex) => (
                            <div className="fee-item" key={`${group.id}-${row?.name || rowIndex}`}>
                                <strong className="fee-item-name">{row?.name || '--'}</strong>
                                <div className="fee-row">
                                    <span className="fee-unit">{row?.unit || '--'}</span>
                                    <span>{formatNumber(row?.price)} đ</span>
                                    <span>{formatNumber(row?.amount)} đ</span>
                                </div>
                            </div>
                        )) : null}
                    </div>
                );
            }) : (
                <div className="cost-group cost-group-empty">Chưa có dữ liệu chi tiết dịch vụ.</div>
            )}

            <div className="payment-total-footer" style={{
                display: 'flex', justifyContent: 'space-between', marginTop: '10px',
            }}>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(paymentSummary?.total)}</strong>
            </div>

            {showPaymentHistory && Number(paymentHistoryAmount || 0) > 0 ? (
                <div className="payment-history">
                    <div className="history-head">
                        <span>Lịch sử thanh toán</span>
                        <strong>{formatCurrency(paymentHistoryAmount)}</strong>
                    </div>
                    <div className="history-row">
                        <span>Đã thanh toán</span>
                        <strong>{formatCurrency(paymentHistoryAmount)}</strong>
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default StaffCostSummaryCard;
