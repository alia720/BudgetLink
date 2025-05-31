const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { slug, expenseId } = event.pathParameters || {};

    if (!slug || !expenseId) {
      return errorResponse(400, 'Budget slug and expense ID are required');
    }

    await docClient.send(new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `BUDGET#${slug}`,
        SK: `EXPENSE#${expenseId}`
      }
    }));

    return successResponse({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return errorResponse(500, 'Failed to delete expense');
  }
}; 