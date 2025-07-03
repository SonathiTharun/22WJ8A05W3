// logger.js

// Authentication configuration - extracted from the original token
const authConfig = {
    clientID: "e6fe2a38-7e9e-46a9-88f4-7876bff65461",
    clientSecret: "BGfYHCMEFAEvfjaV",
    email: "tharun3274@gmail.com",
    rollNo: "22wj8a05w3",
    accessCode: "PbmVAT",
    authUrl: "http://20.244.56.144/evaluation-service/auth" // Assuming this is the auth endpoint
};

// Current auth token - will be refreshed automatically when expired
let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGFydW4zMjc0QGdtYWlsLmNvbSIsImV4cCI6MTc1MTUyODM2OSwiaWF0IjoxNzUxNTI3NDY5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZGQ5OThhNDUtODFjYi00MjgxLWE1NDEtNzZiN2MwZmI5ODRmIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic29uYXRoaSB0aGFydW4ga3VtYXIiLCJzdWIiOiJlNmZlMmEzOC03ZTllLTQ2YTktODhmNC03ODc2YmZmNjU0NjEifSwiZW1haWwiOiJ0aGFydW4zMjc0QGdtYWlsLmNvbSIsIm5hbWUiOiJzb25hdGhpIHRoYXJ1biBrdW1hciIsInJvbGxObyI6IjIyd2o4YTA1dzMiLCJhY2Nlc3NDb2RlIjoiUGJtVkFUIiwiY2xpZW50SUQiOiJlNmZlMmEzOC03ZTllLTQ2YTktODhmNC03ODc2YmZmNjU0NjEiLCJjbGllbnRTZWNyZXQiOiJCR2ZZSENNRUZBRXZmakFWIn0.K_X2JE_NzoPOQnthBBD-MRup_CFAt_BdRTh7lIXcNtAI";

// Function to check if token is expired or about to expire
function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        // Consider token expired if it expires within the next 60 seconds
        return payload.exp <= (currentTime + 60);
    } catch (e) {
        console.error("Error parsing token:", e);
        return true;
    }
}

// Function to refresh the authentication token
async function refreshAuthToken() {
    console.log("Attempting to refresh authentication token...");

    try {
        const response = await fetch(authConfig.authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientID: authConfig.clientID,
                clientSecret: authConfig.clientSecret,
                email: authConfig.email,
                rollNo: authConfig.rollNo,
                accessCode: authConfig.accessCode
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                authToken = data.access_token;
                console.log("Token refreshed successfully");
                return true;
            } else {
                console.error("No access token in response:", data);
                return false;
            }
        } else {
            const errorText = await response.text();
            console.error(`Token refresh failed: ${response.status} - ${errorText}`);
            return false;
        }
    } catch (e) {
        console.error("Error refreshing token:", e);
        return false;
    }
}

// Function to log stuff to the service
async function sendLog(stackName, severity, pkgName, logMsg) {
    const apiUrl = "http://20.244.56.144/evaluation-service/logs";

    const dataToSend = {
        // Ensure values are lowercase as per API constraint
        stack: stackName.toLowerCase(),
        level: severity.toLowerCase(),
        package: pkgName.toLowerCase(),
        message: logMsg
    };

    // Check if token is expired and refresh if needed
    if (isTokenExpired(authToken)) {
        console.log("Token is expired, attempting to refresh...");
        const refreshSuccess = await refreshAuthToken();
        if (!refreshSuccess) {
            console.error("Failed to refresh token! Can't send log.");
            return;
        }
    }

    if (!authToken) {
        console.error("No token! Can't send log.");
        return;
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
            // Changed message for clarity when successful
            console.log("Log sent successfully:", dataToSend);
        } else {
            const errMsg = await res.text();
            console.error(`Log failed: ${res.status} - ${errMsg}`);
            if (res.status === 401) {
                console.warn("Token expired during request, attempting to refresh and retry...");
                const refreshSuccess = await refreshAuthToken();
                if (refreshSuccess) {
                    // Retry the request with the new token
                    console.log("Retrying log request with refreshed token...");
                    return sendLog(stackName, severity, pkgName, logMsg);
                } else {
                    console.error("Failed to refresh token after 401 error.");
                }
            }
        }
    } catch (e) {
        console.error("Something went wrong sending log:", e);
    }
}

// --- CORRECTED TEST LOGS (USING ALLOWED VALUES FROM YOUR DOCUMENTATION) ---

// This example from the image already works as 'backend' and 'handler' are allowed.
console.log("Attempting to send Backend error log (should succeed):");
sendLog("backend", "error", "handler", "received string, expected bool");

// Frontend log example:
// 'stack' changed to 'web' (based on 'invalid web stack' error and common usage)
// 'package' changed to 'auth' (allowed for both frontend/backend applications)
console.log("Attempting to send Frontend info log:");
sendLog("web", "info", "auth", "User logged in successfully");

// Database log example:
// 'stack' changed to 'backend' (since 'db' package is listed under Backend Application)
// 'package' changed to 'db' (from allowed Backend Application packages)
console.log("Attempting to send DB debug log:");
sendLog("backend", "debug", "db", "Executing complex join query for user data");

// Backend warning log example:
// 'package' changed to 'middleware' (allowed for both, suitable for validation context)
console.log("Attempting to send Backend warning log:");
sendLog("backend", "warn", "middleware", "Invalid email format detected for user ID 456");

// Additional example for Frontend component (using 'web' stack and 'component' package)
console.log("Attempting to send Frontend component debug log:");
sendLog("web", "debug", "component", "User interface element rendered.");

// Additional example for Backend service (using 'backend' stack and 'service' package)
console.log("Attempting to send Backend service info log:");
sendLog("backend", "info", "service", "Data processed by background service.");