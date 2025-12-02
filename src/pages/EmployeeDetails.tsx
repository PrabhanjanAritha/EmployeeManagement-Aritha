import React from 'react';
import { useTheme } from '../theme/useTheme';

export const EmployeeDetails: React.FC = () => {
  const { palette } = useTheme();

  return (
    <div>
      <nav style={{ color: palette.textSecondary }} className="text-sm mb-3">Home / Employees / <strong style={{ color: palette.textPrimary }}>Annette Black</strong></nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: palette.textPrimary }} className="text-2xl font-bold">Annette Black</h1>
          <p style={{ color: palette.textSecondary }}>Details for employee EMP001</p>
        </div>
        <div>
          <button style={{ backgroundColor: palette.primary, color: '#fff' }} className="px-4 py-2 rounded">Edit Employee</button>
        </div>
      </div>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-xl p-6 border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div style={{ color: palette.textSecondary }} className="mb-1">Employee ID</div>
            <div style={{ color: palette.textPrimary }}>EMP001</div>

            <div style={{ color: palette.textSecondary }} className="mt-4 mb-1">Full Name</div>
            <div style={{ color: palette.textPrimary }}>Annette Black</div>

            <div style={{ color: palette.textSecondary }} className="mt-4 mb-1">Team</div>
            <div style={{ color: palette.textPrimary }}>Frontend Development</div>
          </div>

          <div>
            <div style={{ color: palette.textSecondary }} className="mb-1">Date of Joining</div>
            <div style={{ color: palette.textPrimary }}>2021-08-15</div>

            <div style={{ color: palette.textSecondary }} className="mt-4 mb-1">Date of Birth</div>
            <div style={{ color: palette.textPrimary }}>1995-03-20</div>

            <div style={{ color: palette.textSecondary }} className="mt-4 mb-1">Experience at Joining</div>
            <div style={{ color: palette.textPrimary }}>2 Years</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-xl p-6 border shadow-sm">
        <h3 style={{ color: palette.textPrimary }} className="text-lg font-semibold mb-3">Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input placeholder="mm/dd/yyyy" style={{ padding: 10, borderRadius: 8, border: `1px solid ${palette.border}` }} />
          <textarea placeholder="Add a new note..." style={{ padding: 10, borderRadius: 8, border: `1px solid ${palette.border}` }} />
        </div>
        <div className="flex justify-end">
          <button style={{ backgroundColor: palette.primary, color: '#fff' }} className="px-4 py-2 rounded">Add Note</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
