import React, { useState, useMemo } from 'react';
import { ArrowRight, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const SettleUpPage = () => {
    const [participants, setParticipants] = useState(['Alice', 'Bob', 'Charlie']);
    const [newParticipant, setNewParticipant] = useState('');
    
    const [expenses, setExpenses] = useState([
        { id: 1, description: 'Groceries', paidBy: 'Alice', amount: 120.50, splitBetween: 3 },
        { id: 2, description: 'Dinner', paidBy: 'Bob', amount: 85.00, splitBetween: 3 },
        { id: 3, description: 'Gas', paidBy: 'Alice', amount: 55.00, splitBetween: 2 },
    ]);
    const [newExpense, setNewExpense] = useState({ description: '', paidBy: participants[0] || '', amount: '', splitBetween: participants.length });

    const settlement = useMemo(() => {
        if (participants.length === 0) return { totalExpenses: 0, transactions: [] };

        const balances = participants.reduce((acc, person) => ({ ...acc, [person]: 0 }), {});

        expenses.forEach(expense => {
            const share = expense.amount / expense.splitBetween;
            
            // The person who paid gets the full amount credited to their balance
            if (balances[expense.paidBy] !== undefined) {
                balances[expense.paidBy] += expense.amount;
            }
            
            // The share is debited from every participant's balance
            participants.forEach(p => {
                if (balances[p] !== undefined) {
                    balances[p] -= share;
                }
            });
        });

        const debtors = [];
        const creditors = [];

        for (const person in balances) {
            if (balances[person] < 0) debtors.push({ name: person, amount: -balances[person] });
            else if (balances[person] > 0) creditors.push({ name: person, amount: balances[person] });
        }

        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => a.amount - b.amount);

        const transactions = [];
        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];
            const amount = Math.min(debtor.amount, creditor.amount);

            transactions.push({ from: debtor.name, to: creditor.name, amount });
            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 0.01) debtors.shift();
            if (creditor.amount < 0.01) creditors.shift();
        }
        
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        return { totalExpenses, transactions };
    }, [expenses, participants]);

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (newParticipant && !participants.includes(newParticipant)) {
            const newParts = [...participants, newParticipant];
            setParticipants(newParts);
            setNewParticipant('');
            // If this is the first participant, set them as the default payer
            if (participants.length === 0) {
                setNewExpense(p => ({ ...p, paidBy: newParticipant }));
            }
        }
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (newExpense.description && newExpense.amount && newExpense.paidBy && participants.length > 0) {
            setExpenses(prev => [...prev, { ...newExpense, id: crypto.randomUUID(), amount: parseFloat(newExpense.amount), splitBetween: parseInt(newExpense.splitBetween, 10) || participants.length }]);
            setNewExpense({ description: '', paidBy: participants[0], amount: '', splitBetween: participants.length });
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Settle Up</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Add participants and expenses to calculate who owes who.</p>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Inputs */}
                <div className="space-y-8">
                    {/* Participants Input */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Users size={24} /> Participants</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {participants.map(p => (
                                <span key={p} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {p}
                                    <button onClick={() => setParticipants(parts => parts.filter(name => name !== p))} className="text-slate-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <form onSubmit={handleAddParticipant} className="flex gap-2">
                            <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Add new name..." className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                            <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700"><UserPlus size={20} /></button>
                        </form>
                    </div>

                    {/* Expenses Input */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Add Expense</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <input type="text" value={newExpense.description} onChange={(e) => setNewExpense(p => ({...p, description: e.target.value}))} placeholder="Expense description" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense(p => ({...p, amount: e.target.value}))} placeholder="Amount ($)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                                <select value={newExpense.paidBy} onChange={(e) => setNewExpense(p => ({...p, paidBy: e.target.value}))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" disabled={participants.length === 0}>
                                    {participants.map(p => <option key={p} value={p}>{p} paid</option>)}
                                </select>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={newExpense.splitBetween} onChange={(e) => setNewExpense(p => ({...p, splitBetween: e.target.value}))} placeholder={`Split between ${participants.length}`} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                                <button type="submit" className="w-full bg-green-600 text-white p-2.5 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50" disabled={participants.length === 0}><Plus size={20} /> Add</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Results */}
                <div className="space-y-8">
                     {/* Expense List */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Expense Log</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {expenses.map(expense => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">{expense.description}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Paid by {expense.paidBy}, split {expense.splitBetween} ways</p>
                                    </div>
                                    <p className="font-mono text-slate-800 dark:text-slate-300">{formatCurrency(expense.amount)}</p>
                                </div>
                            ))}
                             {expenses.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-8">No expenses added yet.</p>}
                        </div>
                    </div>
                    {/* Settlement Plan */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Settlement Plan</h2>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6 text-center">
                            <p className="text-sm text-blue-800 dark:text-blue-300">Total Spent: <span className="font-bold">{formatCurrency(settlement.totalExpenses)}</span></p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Payments to Settle Up:</h3>
                            {settlement.transactions.length > 0 ? (
                                settlement.transactions.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                        <span className="font-semibold text-green-800 dark:text-green-300">{t.from}</span>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <ArrowRight size={18} />
                                            <span className="font-bold">{formatCurrency(t.amount)}</span>
                                            <ArrowRight size={18} />
                                        </div>
                                        <span className="font-semibold text-green-800 dark:text-green-300">{t.to}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">Everyone is settled up!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
