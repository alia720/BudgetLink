exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Hello from BudgetLink API!",
            event: event
        })
    };
}; 