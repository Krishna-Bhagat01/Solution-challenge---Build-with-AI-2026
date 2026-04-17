import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { IncidentProvider } from './contexts/IncidentContext';
import { Toaster } from './components/ui/sonner';

// Pages
import LandingPage from './pages/LandingPage';
import GuestPanicPage from './pages/GuestPanicPage';
import GuestConfirmationPage from './pages/GuestConfirmationPage';
import StaffDashboard from './pages/StaffDashboard';
import CommandCenter from './pages/CommandCenter';

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <IncidentProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/guest" element={<GuestPanicPage />} />
              <Route path="/guest/confirmation/:id" element={<GuestConfirmationPage />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/command" element={<CommandCenter />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster position="bottom-right" theme="dark" closeButton />
        </IncidentProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}
