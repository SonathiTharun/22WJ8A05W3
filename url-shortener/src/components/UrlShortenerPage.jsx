import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    IconButton,
    Tooltip,
    Grid
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Link as LinkIcon,
    ContentCopy as CopyIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import Logger from '../utils/logger';
import { validateUrlBatch } from '../utils/validators';
import { addUrls } from '../utils/storage';

const UrlShortenerPage = () => {
    const [urls, setUrls] = useState([
        { url: '', shortcode: '', expiry: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        Logger.info('component', 'URL Shortener page loaded');
    }, []);

    const addUrlField = () => {
        if (urls.length < 5) {
            setUrls([...urls, { url: '', shortcode: '', expiry: '' }]);
            Logger.debug('component', 'URL field added', { totalFields: urls.length + 1 });
        }
    };

    const removeUrlField = (index) => {
        if (urls.length > 1) {
            const newUrls = urls.filter((_, i) => i !== index);
            setUrls(newUrls);
            Logger.debug('component', 'URL field removed', { totalFields: newUrls.length });
        }
    };

    const updateUrl = (index, field, value) => {
        const newUrls = [...urls];
        newUrls[index][field] = value;
        setUrls(newUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);
        setResults([]);
        setSuccess(false);

        try {
            Logger.info('url-shortener', 'Starting URL shortening process', { urlCount: urls.length });

            // Filter out empty URLs
            const nonEmptyUrls = urls.filter(url => url.url.trim() !== '');
            
            if (nonEmptyUrls.length === 0) {
                setErrors(['Please enter at least one URL']);
                setLoading(false);
                return;
            }

            // Validate all URLs
            const validation = await validateUrlBatch(nonEmptyUrls);
            
            if (!validation.isValid) {
                setErrors(validation.errors);
                setLoading(false);
                return;
            }

            // Add URLs to storage
            const result = await addUrls(validation.validUrls);
            
            if (result.errors.length > 0) {
                const errorMessages = result.errors.map(err => 
                    `${err.urlData.originalUrl}: ${err.error}`
                );
                setErrors(errorMessages);
            }

            if (result.results.length > 0) {
                setResults(result.results);
                setSuccess(true);
                
                // Reset form for successful URLs
                const successfulIndices = result.results.map((_, i) => i);
                const newUrls = urls.map((url, index) => {
                    if (successfulIndices.includes(index) && nonEmptyUrls[index]) {
                        return { url: '', shortcode: '', expiry: '' };
                    }
                    return url;
                });
                setUrls(newUrls);

                Logger.info('url-shortener', 'URLs shortened successfully', { 
                    count: result.results.length 
                });
            }

        } catch (error) {
            Logger.error('url-shortener', 'Failed to shorten URLs', error);
            setErrors(['An unexpected error occurred. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            Logger.debug('component', 'URL copied to clipboard', { url: text });
        } catch (error) {
            Logger.warn('component', 'Failed to copy to clipboard', { error: error.message });
        }
    };

    const formatExpiryTime = (expiryDate) => {
        return new Date(expiryDate).toLocaleString();
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <LinkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" component="h1" gutterBottom>
                        URL Shortener
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Shorten up to 5 URLs at once with custom shortcodes and expiry times
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    {urls.map((urlData, index) => (
                        <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    URL {index + 1}
                                    {urlData.url && (
                                        <Chip 
                                            label="Filled" 
                                            size="small" 
                                            color="primary" 
                                            sx={{ ml: 2 }} 
                                        />
                                    )}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Long URL"
                                            placeholder="https://example.com/very/long/url"
                                            value={urlData.url}
                                            onChange={(e) => updateUrl(index, 'url', e.target.value)}
                                            required={index === 0}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Custom Shortcode (optional)"
                                            placeholder="mycode123"
                                            value={urlData.shortcode}
                                            onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                                            variant="outlined"
                                            helperText="3-20 characters, letters and numbers only"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Expiry (minutes)"
                                            placeholder="30"
                                            type="number"
                                            value={urlData.expiry}
                                            onChange={(e) => updateUrl(index, 'expiry', e.target.value)}
                                            variant="outlined"
                                            helperText="Default: 30 minutes"
                                            inputProps={{ min: 1, max: 525600 }}
                                        />
                                    </Grid>
                                    {urls.length > 1 && (
                                        <Grid item xs={12}>
                                            <Button
                                                startIcon={<RemoveIcon />}
                                                onClick={() => removeUrlField(index)}
                                                color="error"
                                                variant="outlined"
                                                size="small"
                                            >
                                                Remove URL
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {urls.length < 5 && (
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addUrlField}
                                variant="outlined"
                            >
                                Add Another URL
                            </Button>
                        )}
                        
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                            sx={{ minWidth: 150 }}
                        >
                            {loading ? 'Shortening...' : 'Shorten URLs'}
                        </Button>
                    </Box>
                </form>

                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Errors:</Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {success && results.length > 0 && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Successfully shortened {results.length} URL{results.length > 1 ? 's' : ''}!
                        </Typography>
                        
                        {results.map((result, index) => (
                            <Paper key={index} variant="outlined" sx={{ p: 2, mt: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={8}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Original: {result.originalUrl}
                                        </Typography>
                                        <Typography variant="h6" color="primary" sx={{ wordBreak: 'break-all' }}>
                                            {result.shortUrl}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Expires: {formatExpiryTime(result.expiryDate)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                                        <Tooltip title="Copy to clipboard">
                                            <IconButton 
                                                onClick={() => copyToClipboard(result.shortUrl)}
                                                color="primary"
                                            >
                                                <CopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default UrlShortenerPage;
