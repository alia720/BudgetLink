// src/handlers/budget/get.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
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
        return errorResponse(401, 'Password required', { requiresPassword: true });
      }

      const isValidPassword = await verifyPassword(password, budget.passwordHash);
      if (!isValidPassword) {
        return errorResponse(401, 'Invalid password');
      }
    }

    // Get all expenses for this budget
    const expensesResponse = await docClient.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `BUDGET#${slug}`,
        ':sk': 'EXPENSE#'
      }
    }));

    const expenses = expensesResponse.Items || [];

    // Calculate totals and category breakdowns
    let totalExpenses = 0;
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      totalExpenses += expense.amount;
      if (expense.category) {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      }
    });

    // Update calculated fields
    const budgetWithCalculations = {
      ...budget,
      totalExpenses,
      remainingBudget: budget.totalBudget - totalExpenses,
      categoryTotals,
      expenses: expenses.map(expense => ({
        id: expense.SK.replace('EXPENSE#', ''),
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        isRecurring: expense.isRecurring,
        recurringFrequency: expense.recurringFrequency,
        createdAt: expense.createdAt
      }))
    };

    // Remove sensitive data
    const { passwordHash, ...publicBudget } = budgetWithCalculations;

    return successResponse({ budget: publicBudget });

  } catch (error) {
    console.error('Error getting budget:', error);
    return errorResponse(500, 'Failed to retrieve budget');
  }
};