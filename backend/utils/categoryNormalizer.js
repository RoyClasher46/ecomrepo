/**
 * Normalizes category string to proper format
 * @param {string} category - Category string to normalize
 * @returns {string} - Normalized category
 */
function normalizeCategory(category) {
    if (!category) return "Self";
    const trimmed = String(category).trim();
    if (trimmed.length === 0) return "Self";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

module.exports = { normalizeCategory };

