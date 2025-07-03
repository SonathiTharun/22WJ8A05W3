// server.js
const express = require('express');
const path = require('path');

// Import the logger functions from logger.js
const { sendLog, getTokenInfo, setAuthToken } = require('./logger.js');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'server-interface.html'));
});

// Serve the original test page
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to trigger logging
app.post('/api/log', async (req, res) => {
    const { stack, level, package: pkg, message } = req.body;

    if (!stack || !level || !pkg || !message) {
        return res.status(400).json({
            error: 'Missing required fields: stack, level, package, message'
        });
    }

    try {
        console.log(`📝 Received log request: ${stack}/${level}/${pkg} - ${message}`);

        // Use the actual sendLog function
        await sendLog(stack, level, pkg, message);

        res.json({
            success: true,
            logged: { stack, level, package: pkg, message },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error processing log:', error);
        res.status(500).json({ error: 'Failed to process log', details: error.message });
    }
});

// API endpoint to get token info
app.get('/api/token-info', (req, res) => {
    try {
        const tokenInfo = getTokenInfo();
        res.json({
            success: true,
            tokenInfo: tokenInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting token info:', error);
        res.status(500).json({ error: 'Failed to get token info', details: error.message });
    }
});

// API endpoint to update token
app.post('/api/update-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        setAuthToken(token);
        res.json({
            success: true,
            message: 'Token updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error updating token:', error);
        res.status(500).json({ error: 'Failed to update token', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  / - Main page`);
    console.log(`   POST /api/log - Send log entries`);
    console.log(`   GET  /api/token-info - Get token information`);
});

module.exports = app;
