import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/useTheme';

const sampleEmployees = [
  { id: 'EMP001', name: 'Jane Cooper', team: 'Engineering', doj: '03/15/2021', exp: '5 years' },
  { id: 'EMP002', name: 'Cody Fisher', team: 'Design', doj: '08/21/2022', exp: '2 years' },
  { id: 'EMP003', name: 'Esther Howard', team: 'Marketing', doj: '11/05/2019', exp: '8 years' },
  { id: 'EMP004', name: 'Jenny Wilson', team: 'Engineering', doj: '01/30/2023', exp: '1 year' },
  { id: 'EMP005', name: 'Robert Fox', team: 'Design', doj: '07/12/2018', exp: '10 years' },
];

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ color: palette.textPrimary }} className="text-2xl font-bold">Employee List</h1>
          <p style={{ color: palette.textSecondary }} className="mt-1">A quick view of all employees</p>
        </div>

        <div>
          <button onClick={() => navigate('/employees/add')} style={{ backgroundColor: palette.primary, color: '#fff' }} className="px-4 py-2 rounded-lg">
            + Add Employee
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-lg p-4 border mb-6">
        <div className="flex gap-4 items-center">
          <input placeholder="Search by EmployeeID or Name" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="flex-1 p-3 rounded-md" />
          <select style={{ backgroundColor: palette.surface, borderColor: palette.border, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-3 rounded-md">
            <option>All Teams</option>
          </select>
          <input placeholder="Min Exp" style={{ width: 110, backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-3 rounded-md" />
          <input placeholder="Max Exp" style={{ width: 110, backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-3 rounded-md" />
        </div>
      </div>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-lg border overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Employee ID</th>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Name</th>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Team</th>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Date of Joining</th>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Total Experience</th>
              <th style={{ textAlign: 'left', padding: 16, color: palette.textSecondary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleEmployees.map((e) => (
              <tr key={e.id} style={{ borderTop: `1px solid ${palette.border}` }}>
                <td style={{ padding: 16, color: palette.textPrimary }}>{e.id}</td>
                <td style={{ padding: 16, color: palette.textPrimary }}>{e.name}</td>
                <td style={{ padding: 16, color: palette.textPrimary }}>{e.team}</td>
                <td style={{ padding: 16, color: palette.textPrimary }}>{e.doj}</td>
                <td style={{ padding: 16, color: palette.textPrimary }}>{e.exp}</td>
                <td style={{ padding: 16 }}>
                  <button
                    onClick={() => navigate(`/employees/${e.id}`)}
                    style={{ color: palette.textSecondary }}
                    className="mr-3"
                    title={`Edit ${e.name}`}
                  >
                    ✏️
                  </button>
                  <button style={{ color: palette.textSecondary }} title={`Delete ${e.name}`}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm" style={{ color: palette.textSecondary }}>
        Showing 1-5 of 100
      </div>
    </div>
  );
};

export default Employees;
