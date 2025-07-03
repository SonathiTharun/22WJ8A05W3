// Custom logging middleware for React app
// Based on the logger.js from parent directory but adapted for client-side use

// Authentication configuration - extracted from the original token
const authConfig = {
    clientID: "e6fe2a38-7e9e-46a9-88f4-7876bff65461",
    clientSecret: "BGfYHCMEFAEvfjaV",
    email: "tharun3274@gmail.com",
    name: "sonathi tharun kumar",
    rollNo: "22wj8a05w3",
    accessCode: "PbmVAT",
    authUrl: "http://20.244.56.144/evaluation-service/auth"
};

// Current auth token - will be refreshed automatically when expired
let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGFydW4zMjc0QGdtYWlsLmNvbSIsImV4cCI6MTc1MTUyOTIyOSwiaWF0IjoxNzUxNTI4MzI5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiY2M5NzI4Y2YtZGFlNi00MDM5LWFmNDgtZjVkMmU4ZWVlOWEyIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic29uYXRoaSB0aGFydW4ga3VtYXIiLCJzdWIiOiJlNmZlMmEzOC03ZTllLTQ2YTktODhmNC03ODc2YmZmNjU0NjEifSwiZW1haWwiOiJ0aGFydW4zMjc0QGdtYWlsLmNvbSIsIm5hbWUiOiJzb25hdGhpIHRoYXJ1biBrdW1hciIsInJvbGxObyI6IjIyd2o4YTA1dzMiLCJhY2Nlc3NDb2RlIjoiUGJtVkFUIiwiY2xpZW50SUQiOiJlNmZlMmEzOC03ZTllLTQ2YTktODhmNC03ODc2YmZmNjU0NjEiLCJjbGllbnRTZWNyZXQiOiJCR2ZZSENNRUZBRXZmakFWIn0.saY_tY9jPkW2kW0nVQso7ZbfX8NIyNNFAMbDypV9ls0";

// Function to check if token is expired or about to expire
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const expTime = payload.exp || payload.MapClaims?.exp;
        // Consider token expired if it expires within the next 60 seconds
        return expTime <= (currentTime + 60);
    } catch (e) {
        console.error("Error parsing token:", e);
        return true;
    }
}

// Function to refresh the authentication token
async function refreshAuthToken() {
    const authPayload = {
        email: authConfig.email,
        name: authConfig.name,
        rollNo: authConfig.rollNo,
        accessCode: authConfig.accessCode,
        clientID: authConfig.clientID,
        clientSecret: authConfig.clientSecret
    };
    
    try {
        const response = await fetch(authConfig.authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(authPayload)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                authToken = data.access_token;
                return true;
            } else if (data.token) {
                authToken = data.token;
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

// Function to log stuff to the service
async function sendLog(stackName, severity, pkgName, logMsg) {
    const apiUrl = "http://20.244.56.144/evaluation-service/logs";

    const dataToSend = {
        stack: stackName.toLowerCase(),
        level: severity.toLowerCase(),
        package: pkgName.toLowerCase(),
        message: logMsg
    };

    // Check if token is expired and refresh if needed
    if (isTokenExpired(authToken)) {
        const refreshSuccess = await refreshAuthToken();
        if (!refreshSuccess) {
            console.error("Failed to refresh token! Can't send log.");
            return false;
        }
    }

    if (!authToken) {
        console.error("No token! Can't send log.");
        return false;
    }

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(dataToSend)
        });

        if (res.ok) {
            return true;
        } else {
            if (res.status === 401) {
                const refreshSuccess = await refreshAuthToken();
                if (refreshSuccess) {
                    // Retry the request with the new token
                    return sendLog(stackName, severity, pkgName, logMsg);
                }
            }
            return false;
        }
    } catch (e) {
        console.error("Error sending log:", e);
        return false;
    }
}

// Custom logger class for React app
class Logger {
    static async info(package_name, message, context = {}) {
        await sendLog("frontend", "info", package_name, `${message} ${JSON.stringify(context)}`);
    }

    static async error(package_name, message, error = null, context = {}) {
        const errorMsg = error ? `${message} - Error: ${error.message || error}` : message;
        await sendLog("frontend", "error", package_name, `${errorMsg} ${JSON.stringify(context)}`);
    }

    static async warn(package_name, message, context = {}) {
        await sendLog("frontend", "warn", package_name, `${message} ${JSON.stringify(context)}`);
    }

    static async debug(package_name, message, context = {}) {
        await sendLog("frontend", "debug", package_name, `${message} ${JSON.stringify(context)}`);
    }

    // Specific logging methods for URL shortener app
    static async logUrlShorten(originalUrl, shortCode, expiryTime) {
        await this.info("url-shortener", "URL shortened", {
            originalUrl,
            shortCode,
            expiryTime: expiryTime?.toISOString()
        });
    }

    static async logUrlAccess(shortCode, originalUrl, userAgent, timestamp) {
        await this.info("url-redirect", "Short URL accessed", {
            shortCode,
            originalUrl,
            userAgent,
            timestamp: timestamp?.toISOString()
        });
    }

    static async logValidationError(field, value, error) {
        await this.warn("validation", "Validation failed", {
            field,
            value,
            error
        });
    }

    static async logApiError(endpoint, error, context = {}) {
        await this.error("api", `API call failed: ${endpoint}`, error, context);
    }
}

export default Logger;
