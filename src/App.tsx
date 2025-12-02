import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { AddEmployee } from './pages/AddEmployee';
import { EmployeeDetails } from './pages/EmployeeDetails';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/teams" element={<Dashboard />} />
        <Route path="/clients" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}