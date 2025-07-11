import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, PieChart as PieChartIcon, BarChart3, AreaChart as AreaChartIcon, ArrowLeft } from 'lucide-react';
import { CHART_COLORS } from '../constants';
import { formatCurrency } from '../utils/formatCurrency';

export const BudgetDetail = ({ budget, onBack }) => {
    const [expenses, setExpenses] = useState(budget.expenses || []);
    const [newItem, setNewItem] = useState({ name: '', amount: '', category: '', recurring: 'one-time' });
    const [chartType, setChartType] = useState('pie');

    const totalSpent = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
    const categoryData = useMemo(() => {
        const categories = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.name && newItem.amount && newItem.category) {
            const newExpense = {
                id: crypto.randomUUID(),
                name: newItem.name,
                amount: parseFloat(newItem.amount),
                category: newItem.category,
                recurring: newItem.recurring,
            };
            setExpenses(prev => [...prev, newExpense]);
            setNewItem({ name: '', amount: '', category: '', recurring: 'one-time' });
        }
    };

    const renderChart = () => {
        const tooltipProps = {
            contentStyle: { backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155', borderRadius: '0.5rem' },
            labelStyle: { color: '#cbd5e1' },
            itemStyle: { color: '#cbd5e1' },
            formatter: (value) => formatCurrency(value),
        };
        switch (chartType) {
            case 'bar':
                return <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} /><YAxis tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} tickFormatter={(value) => `$${value}`} /><Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)'}} {...tooltipProps} /><Bar dataKey="value" radius={[4, 4, 0, 0]}>{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}</Bar></BarChart>;
            case 'area':
                return <AreaChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} /><YAxis tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} tickFormatter={(value) => `$${value}`} /><Tooltip {...tooltipProps} /><Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" /></AreaChart>;
            case 'pie':
            default:
                return <PieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}</Pie><Tooltip {...tooltipProps} /></PieChart>;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="mb-12">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to all budgets
                </button>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{budget.name}</h1>
            </header>
            <div className="max-w-6xl mx-auto grid lg:grid-cols-5 lg:gap-12">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Add New Expense</h3>
                        <form onSubmit={handleAddItem} className="grid sm:grid-cols-2 gap-4">
                            <input type="text" name="name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Expense Name" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                            <input type="number" name="amount" value={newItem.amount} onChange={(e) => setNewItem({...newItem, amount: e.target.value})} placeholder="Amount ($)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                            <input type="text" name="category" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} placeholder="Category" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                            <div className="flex items-center space-x-4">
                                <select name="recurring" value={newItem.recurring} onChange={(e) => setNewItem({...newItem, recurring: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                    <option value="one-time">One-Time</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <button type="submit" className="flex-shrink-0 bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700"><Plus size={20} /></button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Expense List</h3>
                        <div className="space-y-3">
                            {expenses.map(expense => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">{expense.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{expense.category}</p>
                                    </div>
                                    <p className="font-mono text-slate-800 dark:text-slate-300">{formatCurrency(expense.amount)}</p>
                                </div>
                            ))}
                            {expenses.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-8">No expenses added to this budget yet.</p>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 mt-12 lg:mt-0">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Spending Breakdown</h3>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                    <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md ${chartType === 'pie' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}><PieChartIcon size={18} /></button>
                                    <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}><BarChart3 size={18} /></button>
                                    <button onClick={() => setChartType('area')} className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}><AreaChartIcon size={18} /></button>
                                </div>
                            </div>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
BudgetDetail.propTypes = {
    budget: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};
