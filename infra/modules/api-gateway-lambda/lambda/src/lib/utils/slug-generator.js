// src/lib/utils/slug-generator.js
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

/**
 * Generates a unique, human-readable slug for budget URLs
 * Format: adjective-color-animal (e.g., "happy-blue-tiger")
 * 
 * @returns {string} A unique slug
 */
function generateSlug() {
  const config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3,
    style: 'lowerCase'
  };

  return uniqueNamesGenerator(config);
}

/**
 * Validates if a slug follows the expected format
 * 
 * @param {string} slug - The slug to validate
 * @returns {boolean} Whether the slug is valid
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Should be lowercase words separated by hyphens
  const slugPattern = /^[a-z]+(-[a-z]+)*$/;
  return slugPattern.test(slug) && slug.length >= 5 && slug.length <= 50;
}

/**
 * Generates multiple unique slugs (useful for avoiding collisions)
 * 
 * @param {number} count - Number of slugs to generate
 * @returns {string[]} Array of unique slugs
 */
function generateMultipleSlugs(count = 5) {
  const slugs = new Set();
  
  while (slugs.size < count) {
    slugs.add(generateSlug());
  }
  
  return Array.from(slugs);
}

module.exports = {
  generateSlug,
  isValidSlug,
  generateMultipleSlugs
};