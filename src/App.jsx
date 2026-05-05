import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './features/dashboard/components/Dashboard';
import PlanningLayout from './features/planning/components/PlanningLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan/:id" element={<PlanningLayout />} />
      </Routes>
    </BrowserRouter>
  );
}