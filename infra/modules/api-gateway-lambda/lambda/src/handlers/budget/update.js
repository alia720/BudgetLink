// src/handlers/budget/update.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { verifyPassword, hashPassword } = require('../../lib/auth/password-utils');
const { validateBudgetUpdateInput } = require('../../lib/utils/validation');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { slug } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    
    if (!slug) {
      return errorResponse(400, 'Budget slug is required');
    }

    // Validate input
    const validation = validateBudgetUpdateInput(body);
    if (!validation.isValid) {
      return errorResponse(400, 'Invalid input', validation.errors);
    }

    const { currentPassword, name, description, totalBudget, newPassword, categoryBudgets } = body;

    // Get current budget
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

    const currentBudget = budgetResponse.Item;

    // Check password if budget is protected
    if (currentBudget.hasPassword) {
      if (!currentPassword) {
        return errorResponse(401, 'Current password required');
      }

      const isValidPassword = await verifyPassword(currentPassword, currentBudget.passwordHash);
      if (!isValidPassword) {
        return errorResponse(401, 'Invalid current password');
      }
    }

    // Prepare update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = name;
    }

    if (description !== undefined) {
      updateExpressions.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }

    if (totalBudget !== undefined) {
      updateExpressions.push('totalBudget = :totalBudget');
      expressionAttributeValues[':totalBudget'] = parseFloat(totalBudget);
      
      // Recalculate remaining budget
      updateExpressions.push('remainingBudget = :remainingBudget');
      expressionAttributeValues[':remainingBudget'] = parseFloat(totalBudget) - (currentBudget.totalExpenses || 0);
    }

    if (categoryBudgets !== undefined) {
      updateExpressions.push('categoryBudgets = :categoryBudgets');
      expressionAttributeValues[':categoryBudgets'] = categoryBudgets;
    }

    // Handle password changes
    if (newPassword !== undefined) {
      if (newPassword === '') {
        // Remove password protection
        updateExpressions.push('hasPassword = :hasPassword');
        updateExpressions.push('passwordHash = :passwordHash');
        expressionAttributeValues[':hasPassword'] = false;
        expressionAttributeValues[':passwordHash'] = null;
      } else {
        // Set/update password
        const hashedPassword = await hashPassword(newPassword);
        updateExpressions.push('hasPassword = :hasPassword');
        updateExpressions.push('passwordHash = :passwordHash');
        expressionAttributeValues[':hasPassword'] = true;
        expressionAttributeValues[':passwordHash'] = hashedPassword;
      }
    }

    // Always update the updatedAt timestamp
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updateExpressions.length === 1) { // Only updatedAt
      return errorResponse(400, 'No valid fields to update');
    }

    // Perform the update
    const updateResponse = await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `BUDGET#${slug}`,
        SK: 'METADATA'
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    // Remove sensitive data
    const { passwordHash, ...publicBudget } = updateResponse.Attributes;

    return successResponse({ budget: publicBudget });

  } catch (error) {
    console.error('Error updating budget:', error);
    return errorResponse(500, 'Failed to update budget');
  }
};