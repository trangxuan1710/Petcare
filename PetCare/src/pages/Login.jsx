import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input, Flag } from 'semantic-ui-react';
import './Login.css';
import bgImage from '../assets/LoginBG.png';
import logoImage from '../assets/petical_logo.png';
import authService from '../api/authService';
import { RECEPTIONIST_PATHS } from '../routes/receptionistPaths';
import { TECH_PATHS } from '../routes/techPaths';

import { Eye, EyeOff } from 'lucide-react';

const EyeClosedIcon = () => <EyeOff size={24} color="#209D80" />;
const EyeOpenIcon = () => <Eye size={24} color="#209D80" />;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [rememberAccount, setRememberAccount] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const sanitizePhone = (value) => value.replace(/\D/g, '');

    const getRoleHomePath = (role) => {
        if (role === 'DOCTOR') return '/doctors/home';
        if (role === 'RECEPTIONIST' || role === 'STAFF') return RECEPTIONIST_PATHS.TODAY_ORDERS;
        if (role === 'TECHNICIAN') return TECH_PATHS.HOME;
        return '/';
    };

    const handleLogin = async () => {
        if (isSubmitting) return;

        const normalizedPhone = sanitizePhone(phoneNumber);
        if (!normalizedPhone || !password) {
            setErrorMessage('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const response = await authService.login({ phoneNumber: normalizedPhone, password });
            const role = response?.data?.data?.user?.role;
            const fromPath = location.state?.from?.pathname;

            navigate(fromPath || getRoleHomePath(role), { replace: true });
        } catch (error) {
            const apiMessage = error?.response?.data?.message;
            setErrorMessage(apiMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-header" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <div className="login-form-container">
                <div className="login-logo-wrap">
                    <img src={logoImage} alt="Petical logo" className="login-logo" />
                </div>
                <h1 className="login-title">Xin chào!</h1>
                <p className="login-subtitle">Vui lòng đăng nhập để sử dụng dịch vụ!</p>

                <Input
                    fluid
                    type="tel"
                    className="custom-semantic-input"
                    placeholder="(000) 000 00 00"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    label={
                        <div className="semantic-label-content">
                            <Flag name='vn' />
                            <div className="semantic-divider"></div>
                            <span className="semantic-country-code">+84</span>
                        </div>
                    }
                    labelPosition='left'
                />

                <div className="input-group">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field password-field"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleLogin();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                </div>

                <div className="login-actions">
                    <label className="checkbox-container">
                        <input type="checkbox" checked={rememberAccount} onChange={(event) => setRememberAccount(event.target.checked)} />
                        <span className="checkmark"></span>
                        Lưu tài khoản
                    </label>
                    {/* <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</a> */}
                </div>

                {errorMessage && (
                    <div style={{ color: '#d92d20', fontSize: '13px', marginBottom: '12px' }}>{errorMessage}</div>
                )}

                <button className="login-button" onClick={handleLogin} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <div className="login-footer">
                    <p>Bạn chưa có tài khoản?</p>
                    <p>Vui lòng liên hệ hotline 10204848 để được hỗ trợ</p>
                    <div className="home-indicator"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
