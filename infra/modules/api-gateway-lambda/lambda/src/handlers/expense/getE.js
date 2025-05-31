const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { slug, expenseId } = event.pathParameters || {};

    if (!slug || !expenseId) {
      return errorResponse(400, 'Budget slug and expense ID are required');
    }

    const result = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `BUDGET#${slug}`,
        SK: `EXPENSE#${expenseId}`
      }
    }));

    if (!result.Item) {
      return errorResponse(404, 'Expense not found');
    }

    return successResponse({ expense: result.Item });

  } catch (error) {
    console.error('Error retrieving expense:', error);
    return errorResponse(500, 'Failed to retrieve expense');
  }
}; 