import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button } from 'antd';
import { useTheme } from '../theme/useTheme';

/* eslint-disable @typescript-eslint/no-explicit-any */

const sampleClients = [
  { id: 'C001', name: 'Acme Corporation', address: '123 Business St, New York, NY 10001' },
  { id: 'C002', name: 'Beta Solutions', address: '456 Tech Ave, San Francisco, CA 94105' },
  { id: 'C003', name: 'Gamma Industries', address: '789 Innovation Blvd, Austin, TX 78701' },
];

export const Clients: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const columns = [
    { title: 'Client Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <div>
        <Button type="link" onClick={() => navigate(`/clients/${record.id}`)}>Edit</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 style={{ color: palette.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>All Clients</h2>
            <p style={{ color: palette.textSecondary, fontSize: 14, fontWeight: 400, margin: '6px 0 0 0' }}>Manage your client list</p>
          </div>
          <Button type="primary" onClick={() => navigate('/clients/add')}>+ Add Client</Button>
        </div>
      </div>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-lg p-4 border">
        <Table dataSource={sampleClients} columns={columns} rowKey="id" pagination={false} />
      </div>
    </div>
  );
};

export default Clients;
