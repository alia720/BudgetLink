import React from 'react';
import PropTypes from 'prop-types';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';

export const DashboardPage = ({ handleCreateBudget }) => {
    return (
        <>
            <Hero handleCreateBudget={handleCreateBudget} />
            <Features />
        </>
    );
};
DashboardPage.propTypes = {
    handleCreateBudget: PropTypes.func.isRequired,
};