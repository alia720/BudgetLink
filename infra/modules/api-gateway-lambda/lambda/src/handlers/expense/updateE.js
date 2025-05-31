const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { slug, expenseId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { description, amount, category } = body;

    if (!slug || !expenseId) {
      return errorResponse(400, 'Budget slug and expense ID are required');
    }

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (description) {
      updateExpression.push('#description = :description');
      expressionAttributeValues[':description'] = description;
      expressionAttributeNames['#description'] = 'description';
    }

    if (amount) {
      updateExpression.push('#amount = :amount');
      expressionAttributeValues[':amount'] = parseFloat(amount);
      expressionAttributeNames['#amount'] = 'amount';
    }

    if (category) {
      updateExpression.push('#category = :category');
      expressionAttributeValues[':category'] = category;
      expressionAttributeNames['#category'] = 'category';
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    const result = await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `BUDGET#${slug}`,
        SK: `EXPENSE#${expenseId}`
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    }));

    return successResponse({ expense: result.Attributes });

  } catch (error) {
    console.error('Error updating expense:', error);
    return errorResponse(500, 'Failed to update expense');
  }
}; 