import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Box,
    CircularProgress,
    Button,
    Card,
    CardContent
} from '@mui/material';
import {
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    Link as LinkIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import Logger from '../utils/logger';
import { getUrlByShortcode, recordClick } from '../utils/storage';

const RedirectHandler = () => {
    const { shortcode } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [urlData, setUrlData] = useState(null);
    const [redirecting, setRedirecting] = useState(false);

    const handleRedirect = useCallback(async () => {
        try {
            Logger.info('redirect', 'Processing redirect request', { shortcode });

            // Get URL data
            const url = getUrlByShortcode(shortcode);
            
            if (!url) {
                setError('URL not found');
                Logger.warn('redirect', 'URL not found', { shortcode });
                setLoading(false);
                return;
            }

            setUrlData(url);

            // Check if URL has expired
            if (new Date() > new Date(url.expiryDate)) {
                setError('URL has expired');
                Logger.warn('redirect', 'URL expired', { shortcode, expiryDate: url.expiryDate });
                setLoading(false);
                return;
            }

            // Record the click
            await recordClick(shortcode, {
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            });

            setLoading(false);
            setRedirecting(true);

            // Redirect after a short delay to show the redirect page
            setTimeout(() => {
                window.location.href = url.originalUrl;
            }, 2000);

        } catch (error) {
            Logger.error('redirect', 'Redirect failed', error, { shortcode });
            setError('An error occurred while processing the redirect');
            setLoading(false);
        }
    }, [shortcode]);

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    const formatTimeRemaining = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expired';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h5" gutterBottom>
                        Processing redirect...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Looking up /{shortcode}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
                    <Typography variant="h4" gutterBottom color="error">
                        {error === 'URL not found' ? '404 - Not Found' : 'Error'}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        {error}
                    </Typography>
                    
                    {error === 'URL not found' ? (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            The short URL /{shortcode} does not exist or may have been removed.
                        </Typography>
                    ) : error === 'URL has expired' ? (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                This short URL has expired and is no longer valid.
                            </Typography>
                            {urlData && (
                                <Card variant="outlined" sx={{ mt: 2, textAlign: 'left' }}>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Original URL:
                                        </Typography>
                                        <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 1 }}>
                                            {urlData.originalUrl}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Expired: {new Date(urlData.expiryDate).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Something went wrong while processing your request.
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        href="/"
                        sx={{ mr: 2 }}
                    >
                        Go Home
                    </Button>
                    
                    {error === 'URL has expired' && urlData && (
                        <Button
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            href={urlData.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit Original URL
                        </Button>
                    )}
                </Paper>
            </Container>
        );
    }

    if (redirecting && urlData) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <LinkIcon sx={{ fontSize: 60, color: 'success.main', mb: 3 }} />
                    <Typography variant="h4" gutterBottom color="success.main">
                        Redirecting...
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Taking you to your destination
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Destination:
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 2 }}>
                                {urlData.originalUrl}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {formatTimeRemaining(urlData.expiryDate)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        If you're not redirected automatically, 
                        <Button 
                            component="a" 
                            href={urlData.originalUrl}
                            sx={{ ml: 1 }}
                        >
                            click here
                        </Button>
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return null;
};

export default RedirectHandler;
