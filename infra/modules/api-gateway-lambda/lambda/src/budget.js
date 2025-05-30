const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { generateSlug, hashPassword } = require('./utils');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { name, password } = body;

        if (!name) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Name is required' })
            };
        }

        // Generate a unique slug
        const slug = generateSlug();

        // Hash the password if provided
        const hashedPassword = password ? hashPassword(password) : null;

        // Create the budget item
        const budget = {
            PK: `BUDGET#${slug}`,
            SK: 'METADATA',
            name,
            createdAt: new Date().toISOString(),
            isProtected: !!password,
            passwordHash: hashedPassword
        };

        await docClient.send(new PutCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: budget
        }));

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Budget created successfully',
                slug,
                isProtected: !!password
            })
        };
    } catch (error) {
        console.error('Error creating budget:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Error creating budget', details: error.message })
        };
    }
}; 