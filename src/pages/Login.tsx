import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useTheme } from '../theme/useTheme';
import { StyleProvider } from '@ant-design/cssinjs';
import { login } from '../store/authSlice';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Login: React.FC = () => {
  const { palette, isDark } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (
        values.email === 'admin@arithaconsulting.com' &&
        values.password === 'Aritha@010'
      ) {
        dispatch(login({ email: values.email }));
        message.success('Login successful!');
        navigate('/');
      } else {
        message.error('Invalid email or password');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <StyleProvider autoClear>
      <div
        className="ae-root"
        style={{
          backgroundColor: isDark ? '#020617' : '#f3f4f6',
          color: palette.textPrimary,
        }}
      >
        <style>{`
          .ae-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", Segoe UI, sans-serif;
          }

          /* Unified frame which contains both left and right sections */
          .ae-frame {
            position: relative;
            width: 100%;
            max-width: 1120px;
            border-radius: 26px;
            padding: 24px 24px;
            box-shadow:
              0 20px 55px rgba(15,23,42,0.28),
              0 0 0 1px rgba(148,163,184,0.38);
            overflow: hidden;
          }

          .ae-frame-inner {
            position: relative;
            z-index: 1;
          }

          /* subtle gradient wash over the whole frame */
          .ae-frame::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 55%),
              radial-gradient(circle at bottom right, rgba(234,88,12,0.18), transparent 55%);
            opacity: 0.8;
            pointer-events: none;
          }

          .fade-up {
            animation: fadeUp .6s ease both;
          }
          @keyframes fadeUp {
            from { opacity:0; transform: translateY(10px);}
            to { opacity:1; transform: translateY(0);}
          }

          /* LEFT SECTION INSIDE THE FRAME */
          .ae-left-wrap {
            padding: 18px 12px 18px 4px;
          }

          .ae-left-inner {
            padding: 24px 24px;
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            color: white;
          }

          .ae-left-gradient {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #2563eb, #0ea5e9, #f97316);
            background-size: 220% 220%;
            animation: gradientShift 12s ease-in-out infinite;
            opacity: 0.96;
          }

          @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .ae-left-blur {
            position: absolute;
            inset: -40px;
            background: radial-gradient(circle at top right, rgba(255,255,255,0.25), transparent 60%);
            opacity: 0.6;
          }

          .ae-left-content {
            position: relative;
            z-index: 1;
          }

          .ae-logo {
            width: 72px;
            height: 72px;
            border-radius: 18px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:30px;
            font-weight:700;
            color: white;
            background: rgba(15,23,42,0.25);
            box-shadow: 0 12px 40px rgba(15,23,42,0.4);
          }

          .ae-title {
            font-size: 26px;
            font-weight: 800;
            margin: 16px 0 8px;
            letter-spacing: 0.01em;
          }

          .ae-sub {
            font-size: 14px;
            color: rgba(241,245,249,0.95);
            margin-bottom: 12px;
          }

          .ae-desc {
            font-size: 13px;
            color: rgba(226,232,240,0.92);
            line-height: 1.7;
            max-width: 360px;
          }

          .ae-cta {
            margin-top: 18px;
            display:inline-flex;
            align-items:center;
            gap: 8px;
            background: rgba(15,23,42,0.28);
            color: #f9fafb;
            padding: 7px 14px;
            border-radius: 999px;
            font-weight:600;
            font-size: 13px;
            backdrop-filter: blur(8px);
            transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
            border: 1px solid rgba(15,23,42,0.35);
          }
          .ae-cta::after {
            content: '→';
            font-size: 13px;
          }
          .ae-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 34px rgba(15,23,42,0.45);
            background: rgba(15,23,42,0.38);
          }

          /* RIGHT SECTION INSIDE THE SAME FRAME */
          .ae-right-wrap {
            padding: 18px 4px 18px 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ae-right-inner {
            width: 100%;
            max-width: 400px;
          }

          .ae-card-header {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 18px;
          }

          .ae-pill {
            display:inline-flex;
            align-items:center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 600;
            background: rgba(148,163,184,0.11);
            border: 1px solid rgba(148,163,184,0.45);
            color: rgba(15,23,42,0.85);
          }

          .ae-pill-dot {
            width: 7px;
            height: 7px;
            border-radius:999px;
          }

          .ae-card-title {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.02em;
          }

          .ae-card-subtitle {
            font-size: 13px;
          }

          .ae-form {
            margin-top: 12px;
          }

          .ae-form-label {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.02em;
          }

          /* Inputs */
          .ae-input .ant-input,
          .ae-input .ant-input-password {
            border-radius: 10px;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, transform 0.12s ease;
            font-size: 14px;
          }

          .ae-input .ant-input-affix-wrapper {
            border-radius: 10px !important;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, transform 0.12s ease;
          }

          .ae-input .ant-input:hover,
          .ae-input .ant-input-password:hover,
          .ae-input .ant-input-affix-wrapper:hover {
            transform: translateY(-1px);
          }

          .ae-input .ant-input:focus,
          .ae-input .ant-input-focused,
          .ae-input .ant-input-affix-wrapper-focused {
            box-shadow: 0 0 0 1px rgba(59,130,246,0.65);
          }

          /* Button */
          .ae-btn-primary {
            border-radius: 999px !important;
            font-weight: 600;
            letter-spacing: 0.02em;
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.18s ease, border-color 0.18s ease;
          }

          .ae-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 40px rgba(37,99,235,0.55);
          }

          .ae-btn-primary:active {
            transform: translateY(0px) scale(0.99);
            box-shadow: 0 8px 24px rgba(15,23,42,0.45);
          }

          /* Demo block */
          .ae-demo-block {
            margin-top: 16px;
            padding: 10px 12px;
            border-radius: 12px;
            font-size: 12px;
            border: 1px dashed rgba(148,163,184,0.8);
          }

          .ae-demo-label {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.08em;
            opacity: 0.95;
          }

          .ae-demo-cred {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
          }

          .ae-footer-hint {
            font-size: 11px;
            opacity: 0.8;
            margin-top: 10px;
          }

          @media (max-width: 991px) {
            .ae-root {
              padding: 16px;
            }
            .ae-frame {
              padding: 18px 18px;
            }
            .ae-left-wrap {
              display: none;
            }
            .ae-right-wrap {
              padding: 4px;
            }
          }
        `}</style>

        <div
          className="ae-frame fade-up"
          style={{
            background: isDark
              ? 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))'
              : 'linear-gradient(145deg, #ffffff, #f9fafb)',
            border: `1px solid ${palette.border}`,
          }}
        >
          <div className="ae-frame-inner">
            <Row gutter={24} align="middle">
              {/* LEFT SIDE - Branding (inside same frame) */}
              <Col 
  xs={0} 
  md={12}
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>

                <div className="ae-left-wrap">
                  <div className="ae-left-inner">
                    <div className="ae-left-gradient" />
                    <div className="ae-left-blur" />
                    <div className="ae-left-content">
                      <div className="ae-logo">
                        <span style={{ fontSize: 24 }}>AE</span>
                      </div>
                      <h1 className="ae-title">Aritha Employee Portal</h1>
                      <div className="ae-sub">
                        Modern HR dashboard for people ops and teams.
                      </div>
                      <p className="ae-desc">
                        Welcome to Aritha — manage employees, teams and clients with a single,
                        fast interface. Sign in to continue to your dashboard and keep
                        everything in one place.
                      </p>
                      <button type="button" className="ae-cta">
                        Get started
                      </button>
                    </div>
                  </div>
                </div>
              </Col>

              {/* RIGHT SIDE - Login (same frame, no separate card feel) */}
              <Col xs={24} md={12}>
                <div className="ae-right-wrap">
                  <div className="ae-right-inner">
                    <div className="ae-card-header">
                     
                        
                      <h2
                        className="ae-card-title"
                        style={{ color: palette.textPrimary }}
                      >
                        Login
                      </h2>
                      <p
                        className="ae-card-subtitle"
                        style={{ color: palette.textSecondary }}
                      >
                        Enter your credentials to access the system.
                      </p>
                    </div>

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                      autoComplete="off"
                      className="ae-form"
                    >
                      <Form.Item
                        name="email"
                        label={
                          <span
                            className="ae-form-label"
                            style={{ color: palette.textPrimary }}
                          >
                            Email
                          </span>
                        }
                        rules={[
                          { required: true, message: 'Email is required' },
                          { type: 'email', message: 'Enter a valid email' },
                        ]}
                        className="ae-input"
                      >
                        <Input
                          type="email"
                          placeholder="admin@arithaconsulting.com"
                          style={{
                            backgroundColor: isDark ? '#020617' : '#f9fafb',
                            borderColor: palette.border,
                            color: palette.textPrimary,
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label={
                          <span
                            className="ae-form-label"
                            style={{ color: palette.textPrimary }}
                          >
                            Password
                          </span>
                        }
                        rules={[{ required: true, message: 'Password is required' }]}
                        className="ae-input"
                      >
                        <Input.Password
                          placeholder="Enter your password"
                          style={{
                            backgroundColor: isDark ? '#020617' : '#f9fafb',
                            borderColor: palette.border,
                            color: palette.textPrimary,
                          }}
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 6 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="ae-btn-primary"
                          style={{
                            backgroundColor: palette.primary,
                            borderColor: palette.primary,
                            width: '100%',
                            height: 44,
                            fontSize: 15,
                          }}
                          loading={loading}
                        >
                          Sign In
                        </Button>
                      </Form.Item>
                    </Form>

                    <div
                      className="ae-demo-block"
                      style={{
                        backgroundColor: isDark ? '#020617' : '#f9fafb',
                        color: palette.textSecondary,
                      }}
                    >
                      <div className="ae-demo-label">Demo Credentials</div>
                      <div style={{ marginTop: 4 }}>
                        <div className="ae-demo-cred">
                          Email:&nbsp;admin@arithaconsulting.com
                        </div>
                        <div className="ae-demo-cred">
                          Password:&nbsp;Aritha@010
                        </div>
                      </div>
                    </div>

                    <div
                      className="ae-footer-hint"
                      style={{ color: palette.textSecondary }}
                    >
                      Use the above demo login to explore the Aritha Employee Portal.
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </StyleProvider>
  );
};

export default Login;
