import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { BudgetCreator } from '../components/BudgetCreator';

export const DashboardPage = () => {
    return (
        <>
            <Hero />
            <Features />
            <BudgetCreator />
        </>
    );
};
