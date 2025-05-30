const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { verifyPassword } = require('./utils');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Helper function to verify budget access
async function verifyBudgetAccess(slug, password) {
    const result = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            PK: `BUDGET#${slug}`,
            SK: 'METADATA'
        }
    }));

    if (!result.Item) {
        return { error: 'Budget not found', statusCode: 404 };
    }

    if (result.Item.isProtected) {
        if (!password) {
            return { error: 'This budget is password protected', statusCode: 401 };
        }

        const isValid = verifyPassword(password, result.Item.passwordHash);
        if (!isValid) {
            return { error: 'Invalid password', statusCode: 401 };
        }
    }

    return { budget: result.Item };
}

exports.handler = async (event) => {
    try {
        const slug = event.pathParameters.slug;
        const { password } = JSON.parse(event.body || '{}');
        const method = event.requestContext.http.method;

        // Verify budget access first
        const accessCheck = await verifyBudgetAccess(slug, password);
        if (accessCheck.error) {
            return {
                statusCode: accessCheck.statusCode,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: accessCheck.error, isProtected: true })
            };
        }

        // Handle different HTTP methods
        switch (method) {
            case 'POST':
                // Add new expense
                const { amount, description, category, date, isRecurring, recurringDetails } = JSON.parse(event.body);
                
                if (!amount || !description) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: JSON.stringify({ error: 'Amount and description are required' })
                    };
                }

                const expense = {
                    PK: `BUDGET#${slug}`,
                    SK: `EXPENSE#${Date.now()}`,
                    amount,
                    description,
                    category: category || 'Uncategorized',
                    date: date || new Date().toISOString(),
                    isRecurring: isRecurring || false,
                    ...(isRecurring && { recurringDetails })
                };

                await docClient.send(new PutCommand({
                    TableName: process.env.DYNAMODB_TABLE,
                    Item: expense
                }));

                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        message: 'Expense added successfully',
                        expense
                    })
                };

            case 'GET':
                // List all expenses for the budget
                const expenses = await docClient.send(new QueryCommand({
                    TableName: process.env.DYNAMODB_TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                    ExpressionAttributeValues: {
                        ':pk': `BUDGET#${slug}`,
                        ':sk': 'EXPENSE#'
                    }
                }));

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify(expenses.Items)
                };

            case 'DELETE':
                // Delete an expense
                const expenseId = event.pathParameters.expenseId;
                if (!expenseId) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: JSON.stringify({ error: 'Expense ID is required' })
                    };
                }

                await docClient.send(new DeleteCommand({
                    TableName: process.env.DYNAMODB_TABLE,
                    Key: {
                        PK: `BUDGET#${slug}`,
                        SK: `EXPENSE#${expenseId}`
                    }
                }));

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ message: 'Expense deleted successfully' })
                };

            case 'PUT':
                // Update an expense
                const { expenseId: updateExpenseId, ...updateData } = JSON.parse(event.body);
                if (!updateExpenseId) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: JSON.stringify({ error: 'Expense ID is required' })
                    };
                }

                const updateExpressions = [];
                const expressionAttributeNames = {};
                const expressionAttributeValues = {};

                Object.entries(updateData).forEach(([key, value]) => {
                    updateExpressions.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = value;
                });

                await docClient.send(new UpdateCommand({
                    TableName: process.env.DYNAMODB_TABLE,
                    Key: {
                        PK: `BUDGET#${slug}`,
                        SK: `EXPENSE#${updateExpenseId}`
                    },
                    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
                    ExpressionAttributeNames: expressionAttributeNames,
                    ExpressionAttributeValues: expressionAttributeValues
                }));

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ message: 'Expense updated successfully' })
                };

            default:
                return {
                    statusCode: 405,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Error handling expense:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Error handling expense', details: error.message })
        };
    }
}; 