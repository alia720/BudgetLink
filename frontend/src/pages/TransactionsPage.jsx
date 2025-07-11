import React from 'react';

export const TransactionsPage = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">View and manage all your expenses and income.</p>
            </header>
            <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">Transaction list and filtering tools will be displayed here.</p>
            </div>
        </div>
    );
};