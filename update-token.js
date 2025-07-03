// update-token.js
// Quick script to update the token in logger.js

const fs = require('fs');

// Replace this with your new token
const NEW_TOKEN = "YOUR_NEW_TOKEN_HERE";

function updateToken(newToken) {
    if (!newToken || newToken === "YOUR_NEW_TOKEN_HERE") {
        console.log("❌ Please provide a valid token by editing the NEW_TOKEN variable in this file");
        return;
    }
    
    try {
        // Read the current logger.js file
        let loggerContent = fs.readFileSync('logger.js', 'utf8');
        
        // Find the current token line and replace it
        const tokenRegex = /let authToken = "[^"]*";/;
        const newTokenLine = `let authToken = "${newToken}";`;
        
        if (tokenRegex.test(loggerContent)) {
            loggerContent = loggerContent.replace(tokenRegex, newTokenLine);
            
            // Write the updated content back
            fs.writeFileSync('logger.js', loggerContent);
            
            console.log("✅ Token updated successfully in logger.js!");
            console.log("🧪 You can now run 'node logger.js' to test the new token");
        } else {
            console.log("❌ Could not find the token line in logger.js");
        }
    } catch (error) {
        console.error("❌ Error updating token:", error.message);
    }
}

// Update the token
updateToken(NEW_TOKEN);
