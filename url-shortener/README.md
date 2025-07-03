# URL Shortener React App

A comprehensive URL shortening application built with React and Material-UI that allows users to shorten URLs, track statistics, and manage their links with custom shortcodes and expiry times.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Navigate to the project directory:**

   ```bash
   cd url-shortener
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## 📖 How to Use

### 🔗 Shortening URLs

1. **Access the URL Shortener Page**

   - Open `http://localhost:3000` in your browser
   - You'll see the main "URL Shortener" tab

2. **Enter Your URLs**

   - **Long URL**: Enter the URL you want to shorten (e.g., `https://example.com/very/long/url`)
   - **Custom Shortcode** (Optional): Enter a custom shortcode (3-20 characters, letters and numbers only)
   - **Expiry Time** (Optional): Set expiry in minutes (default: 30 minutes)

3. **Add Multiple URLs** (Up to 5)

   - Click "Add Another URL" to add more URLs
   - Each URL can have its own custom shortcode and expiry time
   - Click "Remove URL" to delete unwanted fields

4. **Shorten Your URLs**

   - Click the "Shorten URLs" button
   - Wait for processing (validation and creation)
   - View your results with generated short URLs

5. **Copy and Share**
   - Click the copy icon next to any short URL
   - Share the short URL with others
   - The short URL will redirect to your original URL

### 📊 Viewing Statistics

1. **Navigate to Statistics**

   - Click the "Statistics" tab in the navigation
   - View the analytics dashboard

2. **Overview Cards**

   - **Total URLs**: Number of URLs you've shortened
   - **Active URLs**: URLs that haven't expired yet
   - **Total Clicks**: Total number of times your URLs were accessed
   - **Avg Clicks/URL**: Average clicks per URL

3. **URLs Table**

   - View all your shortened URLs in a table format
   - See status (Active/Expired), click counts, creation and expiry dates
   - Click the eye icon to view detailed click history
   - Click the copy icon to copy the short URL

4. **Detailed Click History**
   - Click the eye icon next to any URL
   - View timestamp of each click
   - See user agent (browser/device information)
   - Check referrer information (where the click came from)

### 🔄 Using Short URLs

1. **Access Short URLs**

   - Use any generated short URL (e.g., `http://localhost:3000/abc123`)
   - The app will automatically redirect you to the original URL
   - A brief redirect page will show before forwarding

2. **Redirect Process**
   - Short URL is validated
   - Expiry is checked
   - Click is recorded for statistics
   - User is redirected to original URL

## ✨ Features

### Core Features

- **Batch URL Shortening**: Process up to 5 URLs at once
- **Custom Shortcodes**: Create memorable short URLs
- **Expiry Management**: Set custom expiry times (1 minute to 1 year)
- **Real-time Analytics**: Track clicks and view statistics
- **Responsive Design**: Works on desktop and mobile devices

### Advanced Features

- **Input Validation**: Comprehensive client-side validation
- **Error Handling**: Clear error messages and recovery options
- **Data Persistence**: URLs saved locally in your browser
- **Automatic Cleanup**: Expired URLs are automatically removed
- **Copy to Clipboard**: Easy sharing of short URLs

## 🛠 Management Features

### Data Management

- **Refresh Data**: Update statistics in real-time
- **Cleanup Expired**: Remove all expired URLs manually
- **Clear All Data**: Reset the application (with confirmation)

### URL Status

- **Active**: URL is valid and can be accessed
- **Expired**: URL has passed its expiry time and won't redirect

## 📝 Input Guidelines

### URL Format

- Must be a valid URL format
- Protocol (http/https) is optional - will be added automatically
- Maximum length: 2048 characters
- Examples:
  - ✅ `https://example.com`
  - ✅ `example.com/page`
  - ✅ `www.example.com/path?param=value`

### Custom Shortcode Rules

- 3-20 characters long
- Letters and numbers only (a-z, A-Z, 0-9)
- Cannot use reserved words (admin, api, www, etc.)
- Must be unique across all your URLs
- Examples:
  - ✅ `mylink123`
  - ✅ `project2024`
  - ❌ `ab` (too short)
  - ❌ `my-link` (contains hyphen)
  - ❌ `admin` (reserved word)

### Expiry Time

- Minimum: 1 minute
- Maximum: 525,600 minutes (1 year)
- Default: 30 minutes if not specified
- Examples:
  - `30` = 30 minutes
  - `1440` = 24 hours (1 day)
  - `10080` = 1 week

## 🔧 Troubleshooting

### Common Issues

**URLs not shortening:**

- Check that URLs are in valid format
- Ensure custom shortcodes follow the rules
- Verify expiry time is within allowed range

**Short URLs not working:**

- Check if the URL has expired
- Ensure you're using the correct short URL
- Verify the original URL is still accessible

**Statistics not updating:**

- Click "Refresh Data" button
- Check browser's localStorage is enabled
- Clear browser cache if needed

**App not loading:**

- Ensure Node.js is installed
- Run `npm install` to install dependencies
- Check that port 3000 is available

### Browser Requirements

- Modern browser with JavaScript enabled
- localStorage support required for data persistence
- Clipboard API support for copy functionality

## 🔒 Privacy & Data

- **Local Storage**: All data is stored locally in your browser
- **No Server**: URLs are not stored on external servers
- **Privacy**: Your URLs and statistics remain private
- **Cleanup**: Data can be cleared at any time

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Ensure all prerequisites are met
3. Try refreshing the page
4. Clear browser data and restart the app

## 🎯 Tips for Best Results

1. **Use descriptive shortcodes** for easy remembering
2. **Set appropriate expiry times** based on your needs
3. **Monitor statistics regularly** to track URL performance
4. **Clean up expired URLs** to keep your list organized
5. **Test short URLs** before sharing them

## 🏗️ Technical Details

### Built With

- **React 18** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Custom Logging** - Integrated logging middleware
- **localStorage** - Data persistence

### Project Structure

```
src/
├── components/
│   ├── UrlShortenerPage.jsx    # Main shortening interface
│   ├── UrlStatisticsPage.jsx   # Analytics dashboard
│   └── RedirectHandler.jsx     # URL redirection logic
├── utils/
│   ├── logger.js               # Custom logging middleware
│   ├── validators.js           # Client-side validation
│   └── storage.js              # Data persistence
├── App.js                      # Main app with routing
└── index.js                    # App entry point
```

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

---

**Enjoy using the URL Shortener! 🚀**

_Built with React, Material-UI, and custom logging middleware_
