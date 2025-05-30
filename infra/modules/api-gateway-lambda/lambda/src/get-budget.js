const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { verifyPassword } = require('./utils');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        const slug = event.pathParameters.slug;
        const body = event.body ? JSON.parse(event.body) : {};
        console.log('Request body:', body);
        const { password } = body;

        // Get the budget
        const result = await docClient.send(new GetCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                PK: `BUDGET#${slug}`,
                SK: 'METADATA'
            }
        }));

        if (!result.Item) {
            console.log('Budget not found');
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Budget not found' })
            };
        }

        const budget = result.Item;
        console.log('Budget found:', { ...budget, passwordHash: '[REDACTED]' });

        // Check if budget is protected
        if (budget.isProtected) {
            if (!password) {
                console.log('No password provided');
                return {
                    statusCode: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ 
                        error: 'This budget is password protected',
                        isProtected: true
                    })
                };
            }

            // Verify password
            console.log('Verifying password...');
            const isValid = verifyPassword(password, budget.passwordHash);
            console.log('Password verification result:', isValid);
            
            if (!isValid) {
                return {
                    statusCode: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ 
                        error: 'Invalid password',
                        isProtected: true
                    })
                };
            }
        }

        // Return budget data (excluding sensitive information)
        const { passwordHash, ...budgetData } = budget;
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(budgetData)
        };
    } catch (error) {
        console.error('Error accessing budget:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Error accessing budget', details: error.message })
        };
    }
}; 