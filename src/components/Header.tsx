/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
import { getEmployees } from "../api/employees";
import { getTeams } from "../api/teams";
import { getClients } from "../api/clients";

interface HeaderProps {
  onMenuClick: () => void;
  toggleTheme: () => void;
}

interface SearchResult {
  id: string;
  type: "employee" | "team" | "client" | "action";
  title: string;
  subtitle?: string;
  icon: string;
  path: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, toggleTheme }) => {
  const { isDark, palette } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isThemeHover, setIsThemeHover] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard Overview";
    if (path === "/employees" || path.startsWith("/employees")) {
      if (path === "/employees/add") return "Add Employee";
      if (/^\/employees\/[^/]+/.test(path)) return "Employee Details";
      return "Employees";
    }
    if (path === "/teams" || path === "/teams/") return "Teams";
    if (path === "/teams/add") return "Add Team";
    if (/^\/teams\/[^/]+/.test(path)) return "Team Details";
    if (path === "/clients" || path === "/clients/") return "Clients";
    if (path === "/clients/add") return "Add Client";
    if (/^\/clients\/[^/]+/.test(path)) return "Client Details";
    if (path === "/settings") return "Settings";
    return "Dashboard Overview";
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      setIsSearching(true);
      const results: SearchResult[] = [];

      try {
        // Check for action commands first
        if (
          query.includes("add") ||
          query.includes("create") ||
          query.includes("new")
        ) {
          if (query.includes("employee")) {
            results.push({
              id: "action-add-employee",
              type: "action",
              title: "Add New Employee",
              subtitle: "Create a new employee record",
              icon: "person_add",
              path: "/employees/add",
            });
          }
          if (query.includes("team")) {
            results.push({
              id: "action-add-team",
              type: "action",
              title: "Add New Team",
              subtitle: "Create a new team",
              icon: "group_add",
              path: "/teams/add",
            });
          }
          if (query.includes("client")) {
            results.push({
              id: "action-add-client",
              type: "action",
              title: "Add New Client",
              subtitle: "Create a new client record",
              icon: "business",
              path: "/clients/add",
            });
          }
        }

        // Navigation shortcuts
        if (query.includes("dashboard") || query === "home") {
          results.push({
            id: "nav-dashboard",
            type: "action",
            title: "Go to Dashboard",
            subtitle: "View overview and statistics",
            icon: "dashboard",
            path: "/dashboard",
          });
        }
        if (query.includes("employee") && !query.includes("add")) {
          results.push({
            id: "nav-employees",
            type: "action",
            title: "View All Employees",
            subtitle: "Browse employee list",
            icon: "group",
            path: "/employees",
          });
        }
        if (query.includes("team") && !query.includes("add")) {
          results.push({
            id: "nav-teams",
            type: "action",
            title: "View All Teams",
            subtitle: "Browse teams list",
            icon: "groups",
            path: "/teams",
          });
        }
        if (query.includes("client") && !query.includes("add")) {
          results.push({
            id: "nav-clients",
            type: "action",
            title: "View All Clients",
            subtitle: "Browse clients list",
            icon: "business_center",
            path: "/clients",
          });
        }

        // Search employees (with error handling)
        try {
          const employeesData = await getEmployees({
            search: query,
            page: 1,
            pageSize: 5,
          });

          let employees = [];
          if (Array.isArray(employeesData)) {
            employees = employeesData;
          } else if (employeesData && typeof employeesData === "object") {
            employees = (employeesData as any).data || [];
          }

          employees.slice(0, 5).forEach((emp: any) => {
            results.push({
              id: `employee-${emp.id}`,
              type: "employee",
              title: `${emp.firstName} ${emp.lastName}`,
              subtitle: emp.email || emp.title || "Employee",
              icon: "person",
              path: `/employees/${emp.id}`,
            });
          });
        } catch (err) {
          console.log("Employee search failed:", err);
        }

        // Search teams (with error handling)
        try {
          const teamsData = await getTeams({ search: query });

          let teams = [];
          if (Array.isArray(teamsData)) {
            teams = teamsData;
          } else if (teamsData && typeof teamsData === "object") {
            teams = (teamsData as any).data || [];
          }

          teams.slice(0, 5).forEach((team: any) => {
            results.push({
              id: `team-${team.id}`,
              type: "team",
              title: team.name,
              subtitle: team.title || `${team._count?.employees || 0} members`,
              icon: "groups",
              path: `/teams/${team.id}`,
            });
          });
        } catch (err) {
          console.log("Team search failed:", err);
        }

        // Search clients (with error handling)
        try {
          const clientsData = await getClients({ search: query });

          let clients = [];
          if (Array.isArray(clientsData)) {
            clients = clientsData;
          } else if (clientsData && typeof clientsData === "object") {
            clients = (clientsData as any).data || [];
          }

          clients.slice(0, 5).forEach((client: any) => {
            results.push({
              id: `client-${client.id}`,
              type: "client",
              title: client.name,
              subtitle:
                client.address || `${client._count?.employees || 0} employees`,
              icon: "business",
              path: `/clients/${client.id}`,
            });
          });
        } catch (err) {
          console.log("Client search failed:", err);
        }

        console.log("Search results:", results); // Debug log
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const hoverBg = (hover: boolean) =>
    hover ? (isDark ? "rgba(255,255,255,0.06)" : "#f0f2f5") : "transparent";

  const getTypeColor = (type: string) => {
    switch (type) {
      case "employee":
        return palette.primary;
      case "team":
        return "#10B981";
      case "client":
        return "#F59E0B";
      case "action":
        return "#8B5CF6";
      default:
        return palette.textSecondary;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "employee":
        return "Employee";
      case "team":
        return "Team";
      case "client":
        return "Client";
      case "action":
        return "Action";
      default:
        return "";
    }
  };
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "";
  const initials = email ? email.substring(0, 2).toUpperCase() : "NA";
  return (
    <header
      style={{
        backgroundColor: palette.surface,
        color: palette.textPrimary,
        borderBottom: `1px solid ${palette.border}`,
      }}
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-1 md:px-10 transition-colors duration-200"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          style={{ color: palette.textPrimary }}
          className="lg:hidden p-1 rounded"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2
          style={{ color: palette.textPrimary }}
          className="text-lg font-bold leading-tight tracking-[-0.015em]"
        >
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex flex-1 justify-end items-center gap-3 md:gap-4">
        {/* Smart Search */}
        <div
          ref={searchRef}
          className="hidden md:flex relative"
          style={{ minWidth: "240px", maxWidth: "400px", width: "100%" }}
        >
          <label className="flex flex-col !h-10 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div
                style={{
                  color: "#60758a",
                  backgroundColor: isDark ? "#111827" : "#f0f2f5",
                }}
                className="flex items-center justify-center pl-4 rounded-l-lg border-r-0 transition-colors"
              >
                {isSearching ? (
                  <div
                    className="animate-spin"
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid #60758a",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined">search</span>
                )}
              </div>
              <input
                placeholder="Search or type a command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                style={{
                  color: palette.textPrimary,
                  backgroundColor: isDark ? "#111827" : "#f0f2f5",
                  border: "none",
                  outline: "none",
                }}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal transition-colors"
              />
            </div>
          </label>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: 12,
                maxHeight: "400px",
                overflowY: "auto",
                boxShadow: isDark
                  ? "0 8px 24px rgba(0,0,0,0.4)"
                  : "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 1000,
              }}
            >
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop:
                      index > 0 ? `1px solid ${palette.border}` : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#1f2937"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: `${getTypeColor(result.type)}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 20,
                        color: getTypeColor(result.type),
                      }}
                    >
                      {result.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          color: palette.textPrimary,
                          fontWeight: 500,
                          fontSize: 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {result.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: `${getTypeColor(result.type)}20`,
                          color: getTypeColor(result.type),
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {getTypeBadge(result.type)}
                      </span>
                    </div>
                    {result.subtitle && (
                      <div
                        style={{
                          color: palette.textSecondary,
                          fontSize: 12,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: palette.textSecondary,
                      opacity: 0.5,
                    }}
                  >
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSearchResults &&
            searchQuery &&
            searchResults.length === 0 &&
            !isSearching && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                  boxShadow: isDark
                    ? "0 8px 24px rgba(0,0,0,0.4)"
                    : "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 48,
                    color: palette.textSecondary,
                    opacity: 0.5,
                  }}
                >
                  search_off
                </span>
                <p
                  style={{
                    color: palette.textSecondary,
                    marginTop: 8,
                    fontSize: 14,
                  }}
                >
                  No results found for "{searchQuery}"
                </p>
                <p
                  style={{
                    color: palette.textSecondary,
                    marginTop: 4,
                    fontSize: 12,
                  }}
                >
                  Try "add employee" or "view teams"
                </p>
              </div>
            )}
        </div>

        <button
          onClick={toggleTheme}
          onMouseEnter={() => setIsThemeHover(true)}
          onMouseLeave={() => setIsThemeHover(false)}
          style={{
            color: palette.textPrimary,
            backgroundColor: hoverBg(isThemeHover),
            borderRadius: 8,
          }}
          className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-105 font-semibold text-white shadow-md"
            style={{
              width: 35,
              height: 35,
              background: "linear-gradient(135deg, #4f8dfd, #1c62d6)", // cool blue gradient
              border: `1px solid rgba(255,255,255,0.2)`,
            }}
            title="Profile menu"
          >
            {initials}
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: 8,
                marginTop: 8,
                minWidth: 160,
                boxShadow: isDark
                  ? "0 4px 12px rgba(0,0,0,0.3)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 1000,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  color: palette.textPrimary,
                  cursor: "pointer",
                  fontSize: 14,
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#1f2937"
                    : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    marginRight: 8,
                    fontSize: 18,
                    verticalAlign: "middle",
                  }}
                >
                  logout
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
