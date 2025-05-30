const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

/**
 * Generates a unique, readable slug for a budget
 * Format: adjective-color-animal (e.g., "happy-blue-tiger")
 * This creates 26,000+ unique combinations
 */
function generateSlug() {
    const customConfig = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase'
    };

    return uniqueNamesGenerator(customConfig);
}

/**
 * Hashes a password using bcrypt
 */
function hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

/**
 * Verifies a password against a hash
 */
function verifyPassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compareSync(password, hash);
}

module.exports = {
    generateSlug,
    hashPassword,
    verifyPassword
}; 