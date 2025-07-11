import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const CreateBudgetModal = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [total, setTotal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && total) {
            onSave({ name, total: parseFloat(total) });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Budget</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="budgetName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Name</label>
                        <input
                            type="text"
                            id="budgetName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Road Trip"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budgetTotal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Amount</label>
                        <input
                            type="number"
                            id="budgetTotal"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            placeholder="e.g., 1000"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Save Budget
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
CreateBudgetModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};