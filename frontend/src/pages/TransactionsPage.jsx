import React from 'react';
import { PlusCircle, Trash2, UserPlus, Handshake, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

// Mock data representing a history of all actions
const eventLog = [
    { id: 1, type: 'PARTICIPANT_ADD', user: 'Alice', description: "created the budget and added Bob and Charlie.", timestamp: '2025-07-10 09:00 AM' },
    { id: 2, type: 'EXPENSE_ADD', user: 'Alice', description: "added 'Groceries'", amount: 120.50, timestamp: '2025-07-10 10:30 AM' },
    { id: 3, type: 'EXPENSE_ADD', user: 'Bob', description: "added 'Dinner'", amount: 85.00, timestamp: '2025-07-10 07:15 PM' },
    { id: 4, type: 'EXPENSE_ADD', user: 'Alice', description: "added 'Gas'", amount: 55.00, timestamp: '2025-07-11 08:00 AM' },
    { id: 5, type: 'EXPENSE_DELETE', user: 'Charlie', description: "deleted 'Movie Tickets'", amount: 45.00, timestamp: '2025-07-11 11:45 AM' },
    { id: 6, type: 'SETTLEMENT', user: 'Bob', description: "paid Alice", amount: 17.50, timestamp: '2025-07-12 01:20 PM' },
];

const EventIcon = ({ type }) => {
    switch(type) {
        case 'EXPENSE_ADD': return <PlusCircle className="text-green-500" />;
        case 'EXPENSE_DELETE': return <Trash2 className="text-red-500" />;
        case 'PARTICIPANT_ADD': return <UserPlus className="text-blue-500" />;
        case 'SETTLEMENT': return <Handshake className="text-purple-500" />;
        default: return <ArrowRight className="text-slate-400" />;
    }
};

export const TransactionsPage = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Budget History</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">A complete and unchangeable log of all activity.</p>
            </header>

            <div className="max-w-3xl mx-auto">
                <div className="space-y-8 relative border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                    {eventLog.map(event => (
                        <div key={event.id} className="relative">
                            <div className="absolute -left-5 bg-white dark:bg-slate-800 p-1 rounded-full">
                                <EventIcon type={event.type} />
                            </div>
                            <div className="ml-10 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                                            <span className="font-bold">{event.user}</span> {event.description}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.timestamp}</p>
                                    </div>
                                    {event.amount && (
                                        <p className={`font-mono text-lg ${
                                            event.type === 'EXPENSE_ADD' ? 'text-red-500' : 
                                            event.type === 'SETTLEMENT' ? 'text-green-500' : 'text-slate-500'
                                        }`}>
                                            {event.type === 'EXPENSE_DELETE' ? `(${formatCurrency(event.amount)})` : formatCurrency(event.amount)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};