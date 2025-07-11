import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

const initialEventLog = [
    { id: 1, type: 'PARTICIPANT_ADD', user: 'Alice', description: "created the budget and added Bob and Charlie.", timestamp: '2025-07-10 09:00 AM' },
    { id: 2, type: 'EXPENSE_ADD', user: 'Alice', description: "added 'Groceries'", amount: 120.50, timestamp: '2025-07-10 10:30 AM' },
];

export const AppProvider = ({ children }) => {
    const [eventLog, setEventLog] = useState(initialEventLog);

    const addEvent = (event) => {
        const newEvent = {
            ...event,
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleString(),
        };
        setEventLog(prevLog => [newEvent, ...prevLog]);
    };

    const value = {
        eventLog,
        addEvent,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};