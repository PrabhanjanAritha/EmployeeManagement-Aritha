import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Row, Col,Breadcrumb } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useTheme } from '../theme/useTheme';

const { Option } = Select;

const sampleEmployees = [
  { id: 'EMP001', name: 'Jane Cooper' },
  { id: 'EMP002', name: 'Cody Fisher' },
  { id: 'EMP003', name: 'Esther Howard' },
  { id: 'EMP004', name: 'Jenny Wilson' },
  { id: 'EMP005', name: 'Robert Fox' },
];

export const AddTeam: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('team submit', values);
    navigate('/teams');
  };

  return (
    <div>
    <Breadcrumb
        items={[
          { title: 'Teams', onClick: () => navigate('/teams') },
          { title: 'Add Teams' },
        ]}
        style={{ marginBottom: 24, cursor: 'pointer' }}
      />
      <StyleProvider autoClear>
        <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-xl p-6 border shadow-sm">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="title" label="Team Title" rules={[{ required: true, message: 'Team title required' }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="client" label="Associated Client">
                  <Select placeholder="Select or type client">
                    <Option value="acme">Acme Co</Option>
                    <Option value="beta">Beta Ltd</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name={["manager", "name"]} label="Manager Name">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name={["manager", "email"]} label="Manager Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}> 
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="employees" label="Assign Employees">
                  <Select mode="multiple" placeholder="Select employees to assign">
                    {sampleEmployees.map(e => (
                      <Option key={e.id} value={e.id}>{e.name} ({e.id})</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="default" onClick={() => navigate('/teams')} style={{ border: `1px solid ${palette.border}`, background: 'transparent', color: palette.textPrimary }}>
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

export default AddTeam;
