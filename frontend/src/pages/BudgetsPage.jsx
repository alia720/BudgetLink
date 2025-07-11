import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { BudgetDetail } from '../components/BudgetDetail';
import { CreateBudgetModal } from '../components/CreateBudgetModal';

const initialBudgets = [
    { 
        id: 1, 
        name: 'Monthly Household', 
        total: 2500, 
        expenses: [
            { id: 'e1', name: 'Rent', amount: 1500, category: 'Housing' },
            { id: 'e2', name: 'Internet', amount: 60, category: 'Utilities' },
            { id: 'e3', name: 'Groceries', amount: 290, category: 'Food' },
        ]
    },
    { 
        id: 2, 
        name: 'Summer Vacation', 
        total: 1200,
        expenses: [
            { id: 'e4', name: 'Flights', amount: 800, category: 'Travel' },
            { id: 'e5', name: 'Hotel', amount: 400, category: 'Travel' },
        ]
    },
];

export const BudgetsPage = () => {
    const [budgets, setBudgets] = useState(initialBudgets);
    const [selectedBudgetId, setSelectedBudgetId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const selectedBudget = useMemo(() => budgets.find(b => b.id === selectedBudgetId), [budgets, selectedBudgetId]);

    const handleCreateBudget = (newBudget) => {
        setBudgets(prev => [...prev, { ...newBudget, id: crypto.randomUUID(), expenses: [] }]);
        setIsCreating(false);
    };

    if (selectedBudgetId && selectedBudget) {
        return <BudgetDetail budget={selectedBudget} onBack={() => setSelectedBudgetId(null)} />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isCreating && <CreateBudgetModal onClose={() => setIsCreating(false)} onSave={handleCreateBudget} />}
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Your Budgets</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Manage all your financial plans from one place.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {budgets.map(budget => {
                    const spent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
                    const progress = (spent / budget.total) * 100;
                    return (
                        <div key={budget.id} onClick={() => setSelectedBudgetId(budget.id)} className="cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{budget.name}</h2>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${progress > 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                    {Math.round(progress)}% Spent
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm font-mono text-slate-600 dark:text-slate-400">
                                    <span>{formatCurrency(spent)}</span>
                                    <span>{formatCurrency(budget.total)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <button onClick={() => setIsCreating(true)} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-solid hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300">
                    <PlusCircle size={32} className="mb-2" />
                    <span className="font-semibold">Create New Budget</span>
                </button>
            </div>
        </div>
    );
};