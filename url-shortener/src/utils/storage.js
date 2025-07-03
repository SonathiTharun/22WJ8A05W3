// Local storage utilities for URL shortener data
import Logger from './logger';
import { generateShortcode } from './validators';

const STORAGE_KEY = 'url_shortener_data';

/**
 * Get all stored URL data
 * @returns {Array} - Array of URL objects
 */
export const getAllUrls = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        Logger.error('storage', 'Failed to retrieve URLs from storage', error);
        return [];
    }
};

/**
 * Save URL data to storage
 * @param {Array} urls - Array of URL objects to save
 */
export const saveUrls = (urls) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
        Logger.debug('storage', 'URLs saved to storage', { count: urls.length });
    } catch (error) {
        Logger.error('storage', 'Failed to save URLs to storage', error);
    }
};

/**
 * Add a new shortened URL
 * @param {object} urlData - {originalUrl, shortcode, expiryDate, expiryMinutes}
 * @returns {object} - The created URL object with generated shortcode if needed
 */
export const addUrl = async (urlData) => {
    try {
        const urls = getAllUrls();
        
        // Generate shortcode if not provided
        let shortcode = urlData.shortcode;
        if (!shortcode) {
            do {
                shortcode = generateShortcode();
                // eslint-disable-next-line no-loop-func
            } while (urls.some(url => url.shortcode === shortcode));
        } else {
            // Check if shortcode already exists
            if (urls.some(url => url.shortcode === shortcode)) {
                throw new Error('Shortcode already exists');
            }
        }

        const newUrl = {
            id: Date.now().toString(),
            originalUrl: urlData.originalUrl,
            shortcode: shortcode,
            shortUrl: `${window.location.origin}/${shortcode}`,
            expiryDate: urlData.expiryDate,
            expiryMinutes: urlData.expiryMinutes,
            createdAt: new Date(),
            clickCount: 0,
            clicks: []
        };

        urls.push(newUrl);
        saveUrls(urls);
        
        await Logger.logUrlShorten(newUrl.originalUrl, newUrl.shortcode, newUrl.expiryDate);
        
        return newUrl;
    } catch (error) {
        await Logger.error('storage', 'Failed to add URL', error);
        throw error;
    }
};

/**
 * Add multiple URLs
 * @param {Array} urlsData - Array of URL data objects
 * @returns {Array} - Array of created URL objects
 */
export const addUrls = async (urlsData) => {
    const results = [];
    const errors = [];

    for (const urlData of urlsData) {
        try {
            const result = await addUrl(urlData);
            results.push(result);
        } catch (error) {
            errors.push({ urlData, error: error.message });
        }
    }

    if (errors.length > 0) {
        await Logger.warn('storage', 'Some URLs failed to save', { errorCount: errors.length });
    }

    return { results, errors };
};

/**
 * Get URL by shortcode
 * @param {string} shortcode - The shortcode to find
 * @returns {object|null} - The URL object or null if not found
 */
export const getUrlByShortcode = (shortcode) => {
    try {
        const urls = getAllUrls();
        return urls.find(url => url.shortcode === shortcode) || null;
    } catch (error) {
        Logger.error('storage', 'Failed to get URL by shortcode', error);
        return null;
    }
};

/**
 * Record a click on a shortened URL
 * @param {string} shortcode - The shortcode that was clicked
 * @param {object} clickData - Additional click data (userAgent, timestamp, etc.)
 * @returns {object|null} - The updated URL object or null if not found
 */
export const recordClick = async (shortcode, clickData = {}) => {
    try {
        const urls = getAllUrls();
        const urlIndex = urls.findIndex(url => url.shortcode === shortcode);
        
        if (urlIndex === -1) {
            return null;
        }

        const url = urls[urlIndex];
        
        // Check if URL has expired
        if (new Date() > new Date(url.expiryDate)) {
            await Logger.warn('url-redirect', 'Attempted access to expired URL', { shortcode });
            return null;
        }

        // Record the click
        const click = {
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            ...clickData
        };

        url.clickCount += 1;
        url.clicks.push(click);
        
        // Keep only last 100 clicks to prevent storage bloat
        if (url.clicks.length > 100) {
            url.clicks = url.clicks.slice(-100);
        }

        urls[urlIndex] = url;
        saveUrls(urls);
        
        await Logger.logUrlAccess(shortcode, url.originalUrl, click.userAgent, click.timestamp);
        
        return url;
    } catch (error) {
        await Logger.error('storage', 'Failed to record click', error);
        return null;
    }
};

/**
 * Delete expired URLs
 * @returns {number} - Number of URLs deleted
 */
export const cleanupExpiredUrls = async () => {
    try {
        const urls = getAllUrls();
        const now = new Date();
        const validUrls = urls.filter(url => new Date(url.expiryDate) > now);
        const deletedCount = urls.length - validUrls.length;
        
        if (deletedCount > 0) {
            saveUrls(validUrls);
            await Logger.info('storage', 'Cleaned up expired URLs', { deletedCount });
        }
        
        return deletedCount;
    } catch (error) {
        await Logger.error('storage', 'Failed to cleanup expired URLs', error);
        return 0;
    }
};

/**
 * Get statistics for all URLs
 * @returns {object} - Statistics object
 */
export const getStatistics = () => {
    try {
        const urls = getAllUrls();
        const now = new Date();
        
        const stats = {
            totalUrls: urls.length,
            activeUrls: urls.filter(url => new Date(url.expiryDate) > now).length,
            expiredUrls: urls.filter(url => new Date(url.expiryDate) <= now).length,
            totalClicks: urls.reduce((sum, url) => sum + url.clickCount, 0),
            averageClicksPerUrl: 0,
            mostClickedUrl: null,
            recentUrls: urls.slice(-5).reverse()
        };

        if (stats.totalUrls > 0) {
            stats.averageClicksPerUrl = Math.round(stats.totalClicks / stats.totalUrls * 100) / 100;
            stats.mostClickedUrl = urls.reduce((max, url) => 
                url.clickCount > (max?.clickCount || 0) ? url : max, null);
        }

        return stats;
    } catch (error) {
        Logger.error('storage', 'Failed to get statistics', error);
        return {
            totalUrls: 0,
            activeUrls: 0,
            expiredUrls: 0,
            totalClicks: 0,
            averageClicksPerUrl: 0,
            mostClickedUrl: null,
            recentUrls: []
        };
    }
};

/**
 * Clear all stored data
 */
export const clearAllData = async () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        await Logger.info('storage', 'All data cleared');
    } catch (error) {
        await Logger.error('storage', 'Failed to clear data', error);
    }
};

const storageUtils = {
    getAllUrls,
    saveUrls,
    addUrl,
    addUrls,
    getUrlByShortcode,
    recordClick,
    cleanupExpiredUrls,
    getStatistics,
    clearAllData
};

export default storageUtils;
