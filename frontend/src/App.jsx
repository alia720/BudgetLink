import React, { useState } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SettleUpPage } from './pages/SettleUpPage';

const AppLayout = ({ isBudgetActive, theme, toggleTheme, toggleState }) => (
    <div className="min-h-screen font-sans antialiased transition-colors duration-300">
      <Navbar isBudgetActive={isBudgetActive} theme={theme} toggleTheme={toggleTheme} />
      <main className="py-8 sm:py-16">
        <Outlet />
      </main>
      <Footer toggleState={toggleState} />
    </div>
);

export default function App() {
  // --- DEVELOPER TOGGLE ---
  // Set this to `true` to force the app to load in the "BudgetLink" state.
  const FORCE_BUDGET_STATE = false; 
  // -------------------------

  const [theme, toggleTheme] = useDarkMode();
  const [isBudgetActive, setIsBudgetActive] = useState(FORCE_BUDGET_STATE);
  const navigate = useNavigate();

  const handleCreateBudget = () => {
    setIsBudgetActive(true);
    navigate('/budgets');
  };

  const toggleState = () => {
      const newState = !isBudgetActive;
      setIsBudgetActive(newState);
      if (!newState) {
          navigate('/');
      } else {
          navigate('/budgets');
      }
  };

  return (
    <Routes>
      <Route path="/" element={<AppLayout isBudgetActive={isBudgetActive} theme={theme} toggleTheme={toggleTheme} toggleState={toggleState} />}>
        <Route index element={<DashboardPage handleCreateBudget={handleCreateBudget} />} />
        <Route path="settings" element={<SettingsPage />} />
        {isBudgetActive && (
          <>
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="settle-up" element={<SettleUpPage />} />
          </>
        )}
      </Route>
    </Routes>
  );
}
