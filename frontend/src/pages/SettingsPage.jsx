import React from 'react';

export const SettingsPage = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Manage your application preferences.</p>
            </header>
            <div className="mt-12 max-w-2xl mx-auto p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                 <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">Preferences</h2>
                 <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400">Theme toggle, category management, and data export options will be available here.</p>
                 </div>
            </div>
        </div>
    );
};
