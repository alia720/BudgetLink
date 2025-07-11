import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettleUpPage } from './pages/SettleUpPage';

// Layout component to share Navbar and Footer across pages
const AppLayout = ({ theme, toggleTheme }) => (
    <div className="min-h-screen font-sans antialiased transition-colors duration-300">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="py-8 sm:py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
);

export default function App() {
  const [theme, toggleTheme] = useDarkMode();

  return (
    <Routes>
      <Route path="/" element={<AppLayout theme={theme} toggleTheme={toggleTheme} />}>
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settle-up" element={<SettleUpPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}