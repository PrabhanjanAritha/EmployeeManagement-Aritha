import React from 'react';
import { useTheme } from '../theme/useTheme';

export const AddEmployee: React.FC = () => {
  const { palette } = useTheme();

  return (
    <div>
      <h1 style={{ color: palette.textPrimary }} className="text-2xl font-bold mb-2">Add New Employee</h1>
      <p style={{ color: palette.textSecondary }} className="mb-6">Fill in the details below to add a new employee to the system.</p>

      <div style={{ backgroundColor: palette.surface, borderColor: palette.border }} className="rounded-xl p-6 border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">Employee ID</div>
            <input placeholder="e.g., EMP001" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }} />
          </label>

          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">Team</div>
            <select style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }}>
              <option>Select a team</option>
            </select>
          </label>

          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">First Name</div>
            <input placeholder="Enter first name" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }} />
          </label>

          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">Last Name</div>
            <input placeholder="Enter last name" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }} />
          </label>

          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">Date of Birth</div>
            <input placeholder="mm/dd/yyyy" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }} />
          </label>

          <label>
            <div style={{ color: palette.textSecondary }} className="mb-1">Date of Joining</div>
            <input placeholder="mm/dd/yyyy" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%' }} />
          </label>

          <label className="md:col-span-2">
            <div style={{ color: palette.textSecondary }} className="mb-1">Total Experience (Years)</div>
            <input placeholder="e.g., 5" style={{ padding: 12, borderRadius: 8, border: `1px solid ${palette.border}`, width: '200px' }} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button style={{ border: `1px solid ${palette.border}`, background: 'transparent', color: palette.textPrimary }} className="px-4 py-2 rounded">Cancel</button>
          <button style={{ backgroundColor: palette.primary, color: '#fff' }} className="px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
