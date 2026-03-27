import React, { useState } from 'react';
import { Input, Flag } from 'semantic-ui-react';
import './Login.css';
import bgImage from '../assets/LoginBG.png';
import logoImage from '../assets/petical_logo.png';

import { Eye, EyeOff } from 'lucide-react';

const EyeClosedIcon = () => <EyeOff size={24} color="#209D80" />;
const EyeOpenIcon = () => <Eye size={24} color="#209D80" />;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

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
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        Lưu tài khoản
                    </label>
                    {/* <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</a> */}
                </div>

                <button className="login-button">Đăng nhập</button>

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
