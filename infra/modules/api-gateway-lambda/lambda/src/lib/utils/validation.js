// src/lib/utils/validation.js
const { validatePasswordStrength } = require('../auth/password-utils');

/**
 * Validate budget creation input
 * 
 * @param {object} input - Budget creation data
 * @returns {object} Validation result
 */
function validateBudgetInput(input) {
  const errors = [];

  // Required fields
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Budget name is required');
  } else if (input.name.length > 100) {
    errors.push('Budget name must be less than 100 characters');
  }

  if (!input.totalBudget || isNaN(parseFloat(input.totalBudget))) {
    errors.push('Total budget must be a valid number');
  } else if (parseFloat(input.totalBudget) <= 0) {
    errors.push('Total budget must be greater than 0');
  } else if (parseFloat(input.totalBudget) > 999999999) {
    errors.push('Total budget is too large');
  }

  // Optional fields
  if (input.description && input.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // Password validation if provided
  if (input.password) {
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate budget update input
 * 
 * @param {object} input - Budget update data
 * @returns {object} Validation result
 */
function validateBudgetUpdateInput(input) {
  const errors = [];

  // At least one field should be provided for update
  const updateFields = ['name', 'description', 'totalBudget', 'newPassword', 'categoryBudgets'];
  const hasUpdateField = updateFields.some(field => input[field] !== undefined);

  if (!hasUpdateField) {
    errors.push('At least one field must be provided for update');
  }

  // Validate individual fields if provided
  if (input.name !== undefined) {
    if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
      errors.push('Budget name cannot be empty');
    } else if (input.name.length > 100) {
      errors.push('Budget name must be less than 100 characters');
    }
  }

  if (input.description !== undefined && input.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (input.totalBudget !== undefined) {
    if (isNaN(parseFloat(input.totalBudget))) {
      errors.push('Total budget must be a valid number');
    } else if (parseFloat(input.totalBudget) <= 0) {
      errors.push('Total budget must be greater than 0');
    } else if (parseFloat(input.totalBudget) > 999999999) {
      errors.push('Total budget is too large');
    }
  }

  if (input.newPassword !== undefined && input.newPassword !== '') {
    const passwordValidation = validatePasswordStrength(input.newPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (input.categoryBudgets !== undefined) {
    if (typeof input.categoryBudgets !== 'object' || Array.isArray(input.categoryBudgets)) {
      errors.push('Category budgets must be an object');
    } else {
      for (const [category, budget] of Object.entries(input.categoryBudgets)) {
        if (typeof category !== 'string' || category.length === 0) {
          errors.push('Category names must be non-empty strings');
          break;
        }
        if (isNaN(parseFloat(budget)) || parseFloat(budget) < 0) {
          errors.push(`Category budget for "${category}" must be a non-negative number`);
          break;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate expense input
 * 
 * @param {object} input - Expense data
 * @returns {object} Validation result
 */
function validateExpenseInput(input) {
  const errors = [];

  // Required fields
  if (!input.description || typeof input.description !== 'string' || input.description.trim().length === 0) {
    errors.push('Expense description is required');
  } else if (input.description.length > 200) {
    errors.push('Expense description must be less than 200 characters');
  }

  if (!input.amount || isNaN(parseFloat(input.amount))) {
    errors.push('Expense amount must be a valid number');
  } else if (parseFloat(input.amount) <= 0) {
    errors.push('Expense amount must be greater than 0');
  } else if (parseFloat(input.amount) > 999999999) {
    errors.push('Expense amount is too large');
  }

  // Optional fields
  if (input.category && (typeof input.category !== 'string' || input.category.length > 50)) {
    errors.push('Category must be a string less than 50 characters');
  }

  if (input.date) {
    const date = new Date(input.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  if (input.isRecurring !== undefined && typeof input.isRecurring !== 'boolean') {
    errors.push('isRecurring must be a boolean');
  }

  if (input.recurringFrequency && !['daily', 'weekly', 'monthly', 'yearly'].includes(input.recurringFrequency)) {
    errors.push('Invalid recurring frequency. Must be: daily, weekly, monthly, or yearly');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input to prevent XSS
 * 
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .substring(0, 1000); // Limit length
}

module.exports = {
  validateBudgetInput,
  validateBudgetUpdateInput,
  validateExpenseInput,
  sanitizeString
};