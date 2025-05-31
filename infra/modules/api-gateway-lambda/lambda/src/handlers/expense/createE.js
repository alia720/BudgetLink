const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const path = require('path');
const { successResponse, errorResponse, logRequest } = require(path.join(__dirname, '../../lib/utils/response-utils'));

// Add region configuration
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    logRequest(event, 'expense-create');
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Log environment variables
    console.log('Environment variables:', {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      ENVIRONMENT: process.env.ENVIRONMENT
    });
    
    const { slug } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { description, amount, category } = body;

    console.log('Parsed parameters:', { slug, description, amount, category });

    if (!slug) {
      console.log('Missing budget slug');
      return errorResponse(400, 'Budget slug is required');
    }
    if (!description) {
      console.log('Missing description');
      return errorResponse(400, 'Description is required');
    }
    if (!amount) {
      console.log('Missing amount');
      return errorResponse(400, 'Amount is required');
    }

    // Verify that the budget exists
    console.log('Checking if budget exists:', `BUDGET#${slug}`);
    try {
      const budgetResponse = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          PK: `BUDGET#${slug}`,
          SK: 'METADATA'
        }
      }));

      if (!budgetResponse.Item) {
        console.log('Budget not found:', `BUDGET#${slug}`);
        return errorResponse(404, 'Budget not found');
      }

      console.log('Budget found:', JSON.stringify(budgetResponse.Item, null, 2));
    } catch (error) {
      console.error('Error checking budget:', error);
      console.error('Error stack:', error.stack);
      return errorResponse(500, 'Failed to check budget', { error: error.message });
    }

    const expenseItem = {
      PK: `BUDGET#${slug}`,
      SK: `EXPENSE#${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category: category || 'Uncategorized',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Attempting to save expense:', JSON.stringify(expenseItem, null, 2));
    console.log('Using table name:', process.env.DYNAMODB_TABLE);

    try {
      await docClient.send(new PutCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Item: expenseItem
      }));

      console.log('Successfully saved expense');
      return successResponse({ expense: expenseItem });
    } catch (error) {
      console.error('Error saving expense:', error);
      console.error('Error stack:', error.stack);
      return errorResponse(500, 'Failed to save expense', { error: error.message });
    }

  } catch (error) {
    console.error('Error creating expense:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(500, 'Failed to create expense', { error: error.message });
  }
}; 