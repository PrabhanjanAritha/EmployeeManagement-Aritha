import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { Table, Button } from 'antd';
import { useTheme } from '../theme/useTheme';

const sampleTeams = [
  { id: 'T001', title: 'Platform', client: 'Acme Co', managerName: 'Jane Cooper', managerEmail: 'jane@acme.com', employees: ['EMP001', 'EMP004'] },
  { id: 'T002', title: 'Design', client: 'Beta Ltd', managerName: 'Cody Fisher', managerEmail: 'cody@beta.com', employees: ['EMP002'] },
];

export const Teams: React.FC = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const columns = [
    { title: 'Team', dataIndex: 'title', key: 'title' },
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Manager', key: 'manager', render: (_: any, record: any) => (
      <div style={{ color: palette.textPrimary }}>
        <div>{record.managerName}</div>
        <div style={{ color: palette.textSecondary, fontSize: 12 }}>{record.managerEmail}</div>
      </div>
    )},
    { title: 'Employees', dataIndex: 'employees', key: 'employees', render: (emps: string[]) => emps.join(', ') },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <div>
        <Button type="link" onClick={() => navigate(`/teams/${record.id}`)}>Edit</Button>
      </div>
    )},
  ];

  return (
    <div className="w-full">
        <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 style={{ color: palette.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>All Teams</h2>
                    <p style={{ color: palette.textSecondary, fontSize: 14, fontWeight: 400, margin: '6px 0 0 0' }}>Manage teams and assignments</p>
                </div>
                <button onClick={() => navigate('/teams/add')} style={{ backgroundColor: palette.primary, color: '#fff' }} className="px-5 py-2 rounded-lg whitespace-nowrap">
                + Add Team
                </button>
            </div>
      </div>
      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-lg p-4 border">
        <Table dataSource={sampleTeams} columns={columns} rowKey="id" pagination={false} />
      </div>
    </div>
  );
};

export default Teams;
