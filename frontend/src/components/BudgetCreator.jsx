import React, { useState, useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Share2, Copy, PieChart as PieChartIcon, BarChart3, AreaChart as AreaChartIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { CHART_COLORS } from '../constants';

export const BudgetCreator = () => {
    // --- STATE MANAGEMENT ---
    const [expenses, setExpenses] = useState([
        { id: '1', name: 'Monthly Rent', amount: 1200, category: 'Housing', recurring: 'monthly' },
        { id: '2', name: 'Groceries', amount: 450, category: 'Food', recurring: 'monthly' },
        { id: '3', name: 'Internet Bill', amount: 60, category: 'Utilities', recurring: 'monthly' },
        { id: '4', name: 'Gas', amount: 120, category: 'Transport', recurring: 'monthly' },
        { id: '5', name: 'Dinner with Friends', amount: 75, category: 'Social', recurring: 'one-time' },
    ]);
    const [budgetName, setBudgetName] = useState('Your Budget');
    const [newItem, setNewItem] = useState({ name: '', amount: '', category: '', recurring: 'one-time' });
    const [shareableLink, setShareableLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [chartType, setChartType] = useState('pie'); // 'pie', 'bar', or 'area'

    // --- COMPUTED VALUES ---
    const totalBudget = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

    const categoryData = useMemo(() => {
        const categories = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    // --- EVENT HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

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

    const handleDeleteItem = (id) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const generateLink = () => {
        const adjectives = ['sunny', 'happy', 'blue', 'green', 'fast', 'clever'];
        const nouns = ['panda', 'tiger', 'eagle', 'river', 'mountain', 'ocean'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const link = `budgetlink.dev/${randomAdj}-${randomNoun}`;
        setShareableLink(link);
    };
    
    const copyLink = () => {
        const tempInput = document.createElement('input');
        tempInput.value = shareableLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- RENDER LOGIC ---
    const renderChart = () => {
        const tooltipProps = {
            contentStyle: { backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155', borderRadius: '0.5rem' },
            labelStyle: { color: '#cbd5e1' },
            itemStyle: { color: '#cbd5e1' }, // This is the fix!
            formatter: (value) => formatCurrency(value),
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} />
                        <YAxis tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)'}} {...tooltipProps} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );
            case 'area':
                return (
                     <AreaChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} />
                        <YAxis tick={{ fill: 'currentColor' }} tickLine={{ stroke: 'currentColor' }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip {...tooltipProps} />
                        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                );
            case 'pie':
            default:
                return (
                    <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip {...tooltipProps} />
                    </PieChart>
                );
        }
    };

    return (
        <section id="create" className="py-20 sm:py-24 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">Create Your Budget</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Add your expenses below. Everything updates in real-time.</p>
                </div>

                <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-5 lg:gap-12">
                    <div className="lg:col-span-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                             <input
                                type="text"
                                value={budgetName}
                                onChange={(e) => setBudgetName(e.target.value)}
                                placeholder="e.g., Monthly Apartment Budget"
                                className="text-2xl font-bold w-full bg-transparent focus:outline-none border-b-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 pb-2 mb-6 text-slate-900 dark:text-white"
                            />
                            <form onSubmit={handleAddItem} className="grid sm:grid-cols-2 gap-4 mb-8">
                                <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Expense Name (e.g., Rent)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                                <input type="number" name="amount" value={newItem.amount} onChange={handleInputChange} placeholder="Amount ($)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                                <input type="text" name="category" value={newItem.category} onChange={handleInputChange} placeholder="Category (e.g., Housing)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
                                <div className="flex items-center space-x-4">
                                    <select name="recurring" value={newItem.recurring} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        <option value="one-time">One-Time</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                    <button type="submit" className="flex-shrink-0 bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </form>
                            <div className="space-y-3">
                                {expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{expense.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{expense.category} · <span className="capitalize">{expense.recurring}</span></p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(expense.amount)}</p>
                                            <button onClick={() => handleDeleteItem(expense.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {expenses.length === 0 && (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">Add your first expense to get started!</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 mt-12 lg:mt-0">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-slate-800 dark:bg-slate-900/80 text-white p-6 rounded-xl shadow-lg border border-slate-700">
                                <h3 className="text-xl font-semibold mb-4 text-slate-200">Budget Summary</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Total Budget</span>
                                    <span className="text-3xl font-bold text-green-400">{formatCurrency(totalBudget)}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Spending Breakdown</h3>
                                    {/* --- CHART TYPE SELECTOR --- */}
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                        <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md ${chartType === 'pie' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            <PieChartIcon size={18} />
                                        </button>
                                        <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            <BarChart3 size={18} />
                                        </button>
                                        <button onClick={() => setChartType('area')} className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-white dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            <AreaChartIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        {renderChart()}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Share Your Budget</h3>
                                {shareableLink ? (
                                    <div className="flex items-center space-x-2">
                                        <input type="text" readOnly value={shareableLink} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 font-mono text-sm" />
                                        <button onClick={copyLink} className="flex-shrink-0 bg-slate-600 text-white px-3 py-2 rounded-md hover:bg-slate-700 transition-colors relative">
                                            <Copy size={18} />
                                            {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded">Copied!</span>}
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={generateLink} className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-all duration-200">
                                        <Share2 size={20} className="mr-2" />
                                        Generate Shareable Link
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};