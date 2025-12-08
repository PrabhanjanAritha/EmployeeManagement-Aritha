import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
type QuickLinksProps = {
  isEditable: boolean;
};
export const QuickLinks: React.FC<QuickLinksProps> = ({ isEditable }) => {
  const { palette } = useTheme();
  const navigate = useNavigate();

  return (
    <div>
      <h2
        style={{ color: palette.textPrimary }}
        className="text-xl font-bold leading-tight tracking-[-0.015em] pb-3 pt-2 pl-2"
      >
        Quick Links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/employees/add")}
          style={{ backgroundColor: palette.primary, color: "white" }}
          className="flex items-center justify-center gap-2 rounded-lg p-6 shadow-sm hover:opacity-90 transition-colors"
        >
          <span className="material-symbols-outlined">
            {isEditable ? "person_add" : "visibility"}
          </span>
          <span className="text-base font-semibold">
            {isEditable ? "Add Employee" : "View Employees"}
          </span>
        </button>

        <button
          onClick={() => navigate("/teams")}
          style={{
            backgroundColor: palette.surface,
            color: palette.textPrimary,
            borderColor: palette.border,
          }}
          className="flex items-center justify-center gap-2 rounded-lg p-6 border shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined">groups</span>
          <span className="text-base font-semibold">View All Teams</span>
        </button>

        <button
          onClick={() => navigate("/clients")}
          style={{
            backgroundColor: palette.surface,
            color: palette.textPrimary,
            borderColor: palette.border,
          }}
          className="flex items-center justify-center gap-2 rounded-lg p-6 border shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined">manage_accounts</span>
          <span className="text-base font-semibold">Manage Clients</span>
        </button>
      </div>
    </div>
  );
};
