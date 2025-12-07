import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { AddEmployee } from "./pages/AddEmployee";
import { EmployeeDetails } from "./pages/EmployeeDetails";
import { Teams } from "./pages/Teams";
import { AddTeam } from "./pages/AddTeam";
import { Clients } from "./pages/Clients";
import { AddClient } from "./pages/AddClient";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import EditTeam from "./pages/TeamDetails";
import EditClient from "./pages/ClientDetails";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/add" element={<AddTeam />} />
        <Route path="/teams/:id" element={<EditTeam />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/add" element={<AddClient />} />
        <Route path="/clients/:id" element={<EditClient />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
