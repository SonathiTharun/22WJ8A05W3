import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    Visibility as VisibilityIcon,
    Schedule as ScheduleIcon,
    Link as LinkIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import Logger from '../utils/logger';
import { getAllUrls, getStatistics, cleanupExpiredUrls, clearAllData } from '../utils/storage';

const UrlStatisticsPage = () => {
    const [urls, setUrls] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        Logger.info('component', 'URL Statistics page loaded');
    }, []);

    const loadData = async () => {
        try {
            const urlData = getAllUrls();
            const stats = getStatistics();
            setUrls(urlData);
            setStatistics(stats);
            Logger.debug('component', 'Statistics data loaded', { urlCount: urlData.length });
        } catch (error) {
            Logger.error('component', 'Failed to load statistics data', error);
        }
    };

    const handleCleanupExpired = async () => {
        setLoading(true);
        try {
            const deletedCount = await cleanupExpiredUrls();
            await loadData();
            Logger.info('statistics', 'Expired URLs cleaned up', { deletedCount });
        } catch (error) {
            Logger.error('statistics', 'Failed to cleanup expired URLs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAllData = async () => {
        if (window.confirm('Are you sure you want to delete all URL data? This cannot be undone.')) {
            setLoading(true);
            try {
                await clearAllData();
                await loadData();
                Logger.info('statistics', 'All data cleared');
            } catch (error) {
                Logger.error('statistics', 'Failed to clear all data', error);
            } finally {
                setLoading(false);
            }
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

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const isExpired = (expiryDate) => {
        return new Date() > new Date(expiryDate);
    };

    const getStatusChip = (url) => {
        if (isExpired(url.expiryDate)) {
            return <Chip label="Expired" color="error" size="small" />;
        }
        return <Chip label="Active" color="success" size="small" />;
    };

    const handleViewDetails = (url) => {
        setSelectedUrl(url);
        setDialogOpen(true);
        Logger.debug('component', 'Viewing URL details', { shortcode: url.shortcode });
    };

    const StatCard = ({ title, value, icon, color = 'primary' }) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="h6">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" color={color}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ color: `${color}.main` }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    URL Statistics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View analytics and manage your shortened URLs
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total URLs"
                        value={statistics.totalUrls || 0}
                        icon={<LinkIcon sx={{ fontSize: 40 }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active URLs"
                        value={statistics.activeUrls || 0}
                        icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Clicks"
                        value={statistics.totalClicks || 0}
                        icon={<VisibilityIcon sx={{ fontSize: 40 }} />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg Clicks/URL"
                        value={statistics.averageClicksPerUrl || 0}
                        icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={loadData}
                    variant="outlined"
                >
                    Refresh Data
                </Button>
                <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleCleanupExpired}
                    variant="outlined"
                    color="warning"
                    disabled={loading}
                >
                    Cleanup Expired
                </Button>
                <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleClearAllData}
                    variant="outlined"
                    color="error"
                    disabled={loading}
                >
                    Clear All Data
                </Button>
            </Box>

            {/* URLs Table */}
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Short URL</TableCell>
                                <TableCell>Original URL</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Clicks</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {urls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Alert severity="info">
                                            No URLs found. Create some shortened URLs first!
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                urls.map((url) => (
                                    <TableRow key={url.id}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                /{url.shortcode}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    maxWidth: 200, 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={url.originalUrl}
                                            >
                                                {url.originalUrl}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(url)}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6" color="primary">
                                                {url.clickCount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(url.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(url.expiryDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleViewDetails(url)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Copy URL">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => copyToClipboard(url.shortUrl)}
                                                    >
                                                        <CopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* URL Details Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    URL Details: /{selectedUrl?.shortcode}
                </DialogTitle>
                <DialogContent>
                    {selectedUrl && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                                    <Typography><strong>Original URL:</strong> {selectedUrl.originalUrl}</Typography>
                                    <Typography><strong>Short URL:</strong> {selectedUrl.shortUrl}</Typography>
                                    <Typography><strong>Created:</strong> {formatDate(selectedUrl.createdAt)}</Typography>
                                    <Typography><strong>Expires:</strong> {formatDate(selectedUrl.expiryDate)}</Typography>
                                    <Typography><strong>Status:</strong> {getStatusChip(selectedUrl)}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                Click History ({selectedUrl.clickCount} total clicks)
                            </Typography>
                            
                            {selectedUrl.clicks && selectedUrl.clicks.length > 0 ? (
                                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    {selectedUrl.clicks.slice().reverse().map((click, index) => (
                                        <ListItem key={index} divider>
                                            <ListItemText
                                                primary={formatDate(click.timestamp)}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            User Agent: {click.userAgent}
                                                        </Typography>
                                                        {click.referrer && (
                                                            <Typography variant="body2">
                                                                Referrer: {click.referrer}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Alert severity="info">No clicks recorded yet</Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UrlStatisticsPage;
