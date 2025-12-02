import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Breadcrumb } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useTheme } from '../theme/useTheme';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const AddClient: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('client submit', values);
    navigate('/clients');
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { title: 'Clients', onClick: () => navigate('/clients') },
          { title: 'Add Client' },
        ]}
        style={{ marginBottom: 24, cursor: 'pointer' }}
      />

      <StyleProvider autoClear>
        <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-xl p-6 border shadow-sm">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Client Name" rules={[{ required: true, message: 'Client name required' }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="address" label="Address">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="default" onClick={() => navigate('/clients')} style={{ border: `1px solid ${palette.border}`, background: 'transparent', color: palette.textPrimary }}>
                <span className="material-symbols-outlined">close</span>
                <span style={{ marginLeft: 8 }}>Cancel</span>
              </Button>

              <Button type="default" onClick={() => form.resetFields()} style={{ border: `1px solid ${palette.border}`, background: 'transparent', color: palette.textPrimary }}>
                <span className="material-symbols-outlined">refresh</span>
                <span style={{ marginLeft: 8 }}>Reset</span>
              </Button>

              <Button type="primary" htmlType="submit" style={{ backgroundColor: palette.primary, borderColor: palette.primary }}>
                <span className="material-symbols-outlined">save</span>
                <span style={{ marginLeft: 8 }}>Save</span>
              </Button>
            </div>
          </Form>
        </div>
      </StyleProvider>
    </div>
  );
};

export default AddClient;
