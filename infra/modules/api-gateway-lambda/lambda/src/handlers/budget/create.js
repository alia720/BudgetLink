// src/handlers/budget/create.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { generateSlug } = require('../../lib/utils/slug-generator');
const { hashPassword } = require('../../lib/auth/password-utils');
const { validateBudgetInput } = require('../../lib/utils/validation');
const { successResponse, errorResponse } = require('../../lib/utils/response-utils');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    
    // Validate input
    const validation = validateBudgetInput(body);
    if (!validation.isValid) {
      return errorResponse(400, 'Invalid input', validation.errors);
    }

    const { name, description, totalBudget, password } = body;
    
    // Generate unique slug
    const slug = generateSlug();
    
    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const timestamp = new Date().toISOString();
    
    const budgetItem = {
      PK: `BUDGET#${slug}`,
      SK: 'METADATA',
      slug,
      name,
      description: description || '',
      totalBudget: parseFloat(totalBudget),
      hasPassword: !!password,
      passwordHash: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      totalExpenses: 0,
      remainingBudget: parseFloat(totalBudget),
      categoryBudgets: {},
      GSI1PK: 'BUDGET',
      GSI1SK: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: budgetItem,
      ConditionExpression: 'attribute_not_exists(PK)' // Ensure no duplicate slugs
    }));

    // Return budget without sensitive data
    const { passwordHash, ...publicBudget } = budgetItem;
    
    return successResponse({
      budget: publicBudget,
      shareUrl: `${process.env.FRONTEND_URL || 'https://budgetlink.com'}/${slug}`
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    
    if (error.name === 'ConditionalCheckFailedException') {
      return errorResponse(409, 'Budget slug already exists. Please try again.');
    }
    
    return errorResponse(500, 'Failed to create budget');
  }
};