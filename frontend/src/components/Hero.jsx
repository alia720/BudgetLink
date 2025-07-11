import React from 'react';
import PropTypes from 'prop-types';

export const Hero = ({ handleCreateBudget }) => (
  <section className="py-20 sm:py-24 lg:py-32 text-center">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        The shareable budget builder you'll <span className="text-blue-500">actually</span> use.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400">
        Create → Share → Track → Repeat. No accounts. No friction. Just budgets that work for you and your crew.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button onClick={handleCreateBudget} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          Create a Budget
        </button>
        <a href="#features" className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-lg font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          View Demo
        </a>
      </div>
    </div>
  </section>
);
Hero.propTypes = {
    handleCreateBudget: PropTypes.func.isRequired,
};