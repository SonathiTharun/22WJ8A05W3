// Client-side validation utilities for URL shortener

import Logger from './logger';

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Shortcode validation regex (alphanumeric, 3-20 characters)
const SHORTCODE_REGEX = /^[a-zA-Z0-9]{3,20}$/;

/**
 * Validates a URL
 * @param {string} url - The URL to validate
 * @returns {object} - {isValid: boolean, error: string}
 */
export const validateUrl = async (url) => {
    if (!url || typeof url !== 'string') {
        await Logger.logValidationError('url', url, 'URL is required');
        return { isValid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();
    
    if (trimmedUrl.length === 0) {
        await Logger.logValidationError('url', url, 'URL cannot be empty');
        return { isValid: false, error: 'URL cannot be empty' };
    }

    if (trimmedUrl.length > 2048) {
        await Logger.logValidationError('url', url, 'URL is too long (max 2048 characters)');
        return { isValid: false, error: 'URL is too long (max 2048 characters)' };
    }

    // Add protocol if missing
    let urlToTest = trimmedUrl;
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        urlToTest = 'https://' + trimmedUrl;
    }

    // Test with regex first
    if (!URL_REGEX.test(urlToTest)) {
        await Logger.logValidationError('url', url, 'Invalid URL format');
        return { isValid: false, error: 'Please enter a valid URL' };
    }

    // Try to create URL object for additional validation
    try {
        new URL(urlToTest);
        return { isValid: true, normalizedUrl: urlToTest };
    } catch (error) {
        await Logger.logValidationError('url', url, 'Invalid URL format - ' + error.message);
        return { isValid: false, error: 'Please enter a valid URL' };
    }
};

/**
 * Validates a custom shortcode
 * @param {string} shortcode - The shortcode to validate
 * @returns {object} - {isValid: boolean, error: string}
 */
export const validateShortcode = async (shortcode) => {
    if (!shortcode || typeof shortcode !== 'string') {
        return { isValid: true }; // Optional field
    }

    const trimmedCode = shortcode.trim();
    
    if (trimmedCode.length === 0) {
        return { isValid: true }; // Empty is okay, will be auto-generated
    }

    if (trimmedCode.length < 3) {
        await Logger.logValidationError('shortcode', shortcode, 'Shortcode too short (min 3 characters)');
        return { isValid: false, error: 'Shortcode must be at least 3 characters long' };
    }

    if (trimmedCode.length > 20) {
        await Logger.logValidationError('shortcode', shortcode, 'Shortcode too long (max 20 characters)');
        return { isValid: false, error: 'Shortcode must be at most 20 characters long' };
    }

    if (!SHORTCODE_REGEX.test(trimmedCode)) {
        await Logger.logValidationError('shortcode', shortcode, 'Invalid shortcode format');
        return { isValid: false, error: 'Shortcode can only contain letters and numbers' };
    }

    // Check for reserved words
    const reservedWords = ['admin', 'api', 'www', 'app', 'help', 'about', 'contact', 'terms', 'privacy'];
    if (reservedWords.includes(trimmedCode.toLowerCase())) {
        await Logger.logValidationError('shortcode', shortcode, 'Reserved shortcode');
        return { isValid: false, error: 'This shortcode is reserved' };
    }

    return { isValid: true, normalizedShortcode: trimmedCode };
};

/**
 * Validates expiry time
 * @param {number} minutes - Minutes until expiry
 * @returns {object} - {isValid: boolean, error: string, expiryDate: Date}
 */
export const validateExpiry = async (minutes) => {
    if (!minutes) {
        // Default to 30 minutes
        const defaultExpiry = new Date(Date.now() + 30 * 60 * 1000);
        return { isValid: true, expiryDate: defaultExpiry, minutes: 30 };
    }

    const numMinutes = parseInt(minutes, 10);
    
    if (isNaN(numMinutes)) {
        await Logger.logValidationError('expiry', minutes, 'Invalid expiry format');
        return { isValid: false, error: 'Expiry must be a number' };
    }

    if (numMinutes < 1) {
        await Logger.logValidationError('expiry', minutes, 'Expiry too short');
        return { isValid: false, error: 'Expiry must be at least 1 minute' };
    }

    if (numMinutes > 525600) { // 1 year in minutes
        await Logger.logValidationError('expiry', minutes, 'Expiry too long');
        return { isValid: false, error: 'Expiry cannot exceed 1 year' };
    }

    const expiryDate = new Date(Date.now() + numMinutes * 60 * 1000);
    return { isValid: true, expiryDate, minutes: numMinutes };
};

/**
 * Validates multiple URLs at once (max 5)
 * @param {Array} urls - Array of URL objects {url, shortcode, expiry}
 * @returns {object} - {isValid: boolean, errors: Array, validUrls: Array}
 */
export const validateUrlBatch = async (urls) => {
    if (!Array.isArray(urls)) {
        await Logger.logValidationError('batch', urls, 'URLs must be an array');
        return { isValid: false, errors: ['Invalid input format'] };
    }

    if (urls.length === 0) {
        await Logger.logValidationError('batch', urls, 'No URLs provided');
        return { isValid: false, errors: ['At least one URL is required'] };
    }

    if (urls.length > 5) {
        await Logger.logValidationError('batch', urls, 'Too many URLs');
        return { isValid: false, errors: ['Maximum 5 URLs allowed at once'] };
    }

    const validUrls = [];
    const errors = [];
    const usedShortcodes = new Set();

    for (let i = 0; i < urls.length; i++) {
        const urlData = urls[i];
        const urlErrors = [];

        // Validate URL
        const urlValidation = await validateUrl(urlData.url);
        if (!urlValidation.isValid) {
            urlErrors.push(`URL ${i + 1}: ${urlValidation.error}`);
        }

        // Validate shortcode
        const shortcodeValidation = await validateShortcode(urlData.shortcode);
        if (!shortcodeValidation.isValid) {
            urlErrors.push(`URL ${i + 1} shortcode: ${shortcodeValidation.error}`);
        } else if (shortcodeValidation.normalizedShortcode) {
            // Check for duplicate shortcodes in the batch
            if (usedShortcodes.has(shortcodeValidation.normalizedShortcode)) {
                urlErrors.push(`URL ${i + 1}: Duplicate shortcode in batch`);
            } else {
                usedShortcodes.add(shortcodeValidation.normalizedShortcode);
            }
        }

        // Validate expiry
        const expiryValidation = await validateExpiry(urlData.expiry);
        if (!expiryValidation.isValid) {
            urlErrors.push(`URL ${i + 1} expiry: ${expiryValidation.error}`);
        }

        if (urlErrors.length === 0) {
            validUrls.push({
                originalUrl: urlValidation.normalizedUrl,
                shortcode: shortcodeValidation.normalizedShortcode || null,
                expiryDate: expiryValidation.expiryDate,
                expiryMinutes: expiryValidation.minutes
            });
        }

        errors.push(...urlErrors);
    }

    const isValid = errors.length === 0;
    
    if (isValid) {
        await Logger.info('validation', 'Batch validation successful', { count: validUrls.length });
    } else {
        await Logger.warn('validation', 'Batch validation failed', { errorCount: errors.length });
    }

    return { isValid, errors, validUrls };
};

/**
 * Generates a random shortcode
 * @param {number} length - Length of the shortcode (default 6)
 * @returns {string} - Generated shortcode
 */
export const generateShortcode = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const validators = {
    validateUrl,
    validateShortcode,
    validateExpiry,
    validateUrlBatch,
    generateShortcode
};

export default validators;
