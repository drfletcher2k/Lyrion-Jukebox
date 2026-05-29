import { Routes, Route, Navigate } from 'react-router-dom';
import GuestPage from './pages/Guest';
import KioskPage from './pages/Kiosk';

export default function App() {
  return (
    <Routes>
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="*" element={<Navigate to="/kiosk" replace />} />
    </Routes>
  );
}
