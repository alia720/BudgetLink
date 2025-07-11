import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = ({ isBudgetActive, theme, toggleTheme }) => {
  const linkStyles = "px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
  const activeLinkStyles = "bg-slate-100 dark:bg-slate-800 font-semibold text-blue-600 dark:text-blue-400";

  const GuestLinks = () => (
    <>
      <a href="#features" className={linkStyles}>Features</a>
      <a href="#demo" className={linkStyles}>Demo</a>
    </>
  );

  const BudgetLinkLinks = () => (
    <>
      <NavLink to="/budgets" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>Budgets</NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>History</NavLink>
      <NavLink to="/settle-up" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>Settle Up</NavLink>
    </>
  );

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="BudgetLink Logo" className="h-10" />
          </NavLink>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <NavLink to="/" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>Dashboard</NavLink>
              {isBudgetActive ? <BudgetLinkLinks /> : <GuestLinks />}
              <NavLink to="/settings" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>Settings</NavLink>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center space-x-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
Navbar.propTypes = {
    isBudgetActive: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    toggleTheme: PropTypes.func.isRequired,
};
