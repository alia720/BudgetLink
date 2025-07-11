import React from 'react';
import PropTypes from 'prop-types';
import { Share2, Users, Shield, FileDown } from 'lucide-react';

const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center space-x-4 mb-3">
      <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400">{children}</p>
  </div>
);

FeatureCard.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export const Features = () => (
    <section id="docs" className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/70">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">What Makes BudgetLink Different?</h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Built for speed, collaboration, and simplicity. I handle the tech so you can focus on the numbers.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<Share2 size={24} />} title="Shareable by Design">
                    Every budget gets a human-readable URL. Share it in Discord, text it to your roommate, or bookmark it for later.
                </FeatureCard>
                <FeatureCard icon={<Users size={24} />} title="Collaborative Tracking">
                    Anyone with edit access can add expenses. See changes from your collaborators in real-time.
                </FeatureCard>
                <FeatureCard icon={<Shield size={24} />} title="Privacy When You Need It">
                    Add password protection for sensitive budgets, or create view-only tokens for stakeholders. (Coming Soon)
                </FeatureCard>
                 <FeatureCard icon={<FileDown size={24} />} title="Export Everything">
                    Choose your format: PDF reports, CSV data, or Excel spreadsheets. Your budget, your way. (Coming Soon)
                </FeatureCard>
            </div>
        </div>
    </section>
);