import React from 'react';
import DoctorLayout from '../../layouts/DoctorLayout';
import TicketCard from '../../components/doctor/TicketCard';
import TabStatus from '../../components/doctor/TabStatus';

const Dashboard = () => {
    const dummyTickets = [
        {
            id: 1,
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'male',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: true // Thể hiện trạng thái có màu cảnh báo đỏ
            },
            services: [
                { name: 'Điều trị ngoại trú', status: 'pending' },
                { name: 'Điều trị nội trú', status: 'completed' },
                { name: 'Khám lâm sàng', status: 'completed' }
            ]
        },
        {
            id: 2,
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'male',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: false // Thể hiện trạng thái thường
            },
            services: [
                { name: 'Khám lâm sàng', status: 'pending' }
            ]
        },
        {
            id: 3,
            customerName: 'Nguyễn Anh Đức',
            dateTime: '10:03 - 20/03/2026',
            paidAmount: '0đ',
            totalAmount: '/1.000.000đ',
            pet: {
                name: 'Kuro',
                breed: 'Chó Poodle',
                gender: 'female',
                age: '3 Tuổi',
                weight: '4.5kg',
                hasAlert: false // Thể hiện trạng thái thường
            },
            services: [
                { name: 'Khám lâm sàng', status: 'completed' },
                { name: 'Gửi thú cưng (spa)', status: 'failed' }
            ]
        }
    ];

    return (
        <DoctorLayout>
            <div style={{ padding: '24px 16px', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                <TabStatus />

                {dummyTickets.map((ticket) => (
                    <TicketCard key={ticket.id} {...ticket} />
                ))}

            </div>
        </DoctorLayout>
    );
};

export default Dashboard;
