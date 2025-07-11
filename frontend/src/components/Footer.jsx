import React from 'react';

export const Footer = () => (
  <footer className="bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} BudgetLink.</p>
      <p className="mt-2 text-sm">Built with React and Tailwind CSS.</p>
    </div>
  </footer>
);