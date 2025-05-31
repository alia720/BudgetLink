// src/handlers/budget/delete.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { verifyPassword } = require('../../lib/auth/password-utils');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { slug } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!slug) {
      return errorResponse(400, 'Budget slug is required');
    }

    // Get budget metadata
    const budgetResponse = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `BUDGET#${slug}`,
        SK: 'METADATA'
      }
    }));

    if (!budgetResponse.Item) {
      return errorResponse(404, 'Budget not found');
    }

    const budget = budgetResponse.Item;

    // Check password if budget is protected
    if (budget.hasPassword) {
      if (!password) {
        return errorResponse(401, 'Password required');
      }

      const isValidPassword = await verifyPassword(password, budget.passwordHash);
      if (!isValidPassword) {
        return errorResponse(401, 'Invalid password');
      }
    }

    // Get all items related to this budget (expenses, etc.)
    const allItemsResponse = await docClient.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `BUDGET#${slug}`
      }
    }));

    const itemsToDelete = allItemsResponse.Items || [];

    if (itemsToDelete.length === 0) {
      return errorResponse(404, 'Budget not found');
    }

    // Batch delete all items (budget + expenses)
    // DynamoDB BatchWrite can handle up to 25 items at a time
    const deleteRequests = itemsToDelete.map(item => ({
      DeleteRequest: {
        Key: {
          PK: item.PK,
          SK: item.SK
        }
      }
    }));

    // Process in batches of 25
    const batchSize = 25;
    for (let i = 0; i < deleteRequests.length; i += batchSize) {
      const batch = deleteRequests.slice(i, i + batchSize);
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [process.env.DYNAMODB_TABLE]: batch
        }
      }));
    }

    return successResponse({ 
      message: 'Budget and all associated data deleted successfully',
      deletedItems: itemsToDelete.length
    });

  } catch (error) {
    console.error('Error deleting budget:', error);
    return errorResponse(500, 'Failed to delete budget');
  }
};