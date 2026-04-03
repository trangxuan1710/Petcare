import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <main className="not-found-page">
            <section className="not-found-card">
                <p className="not-found-code">404</p>
                <h1>Không tìm thấy trang</h1>
                <p>Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.</p>
                <div className="not-found-actions">
                    <Link to="/" className="not-found-btn not-found-btn-primary">Về trang mặc định</Link>
                    <Link to="/login" className="not-found-btn not-found-btn-outline">Đăng nhập</Link>
                </div>
            </section>
        </main>
    );
};

export default NotFound;
