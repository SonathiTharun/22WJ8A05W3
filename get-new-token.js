// get-new-token.js
// Script to help you get a new authentication token

const authConfig = {
    email: "tharun3274@gmail.com",
    name: "sonathi tharun kumar",
    rollNo: "22wj8a05w3",
    accessCode: "PbmVAT",
    clientID: "e6fe2a38-7e9e-46a9-88f4-7876bff65461",
    clientSecret: "BGfYHCMEFAEvfjaV"
};

// Try different possible authentication endpoints
const possibleEndpoints = [
    "http://20.244.56.144/evaluation-service/auth",
    "http://20.244.56.144/evaluation-service/authenticate",
    "http://20.244.56.144/evaluation-service/login",
    "http://20.244.56.144/evaluation-service/token",
    "http://20.244.56.144/auth",
    "http://20.244.56.144/authenticate",
    "http://20.244.56.144/login",
    "http://20.244.56.144/token"
];

async function tryGetToken() {
    console.log("🔍 Trying to get a new authentication token...\n");
    
    const authPayload = {
        email: authConfig.email,
        name: authConfig.name,
        rollNo: authConfig.rollNo,
        accessCode: authConfig.accessCode,
        clientID: authConfig.clientID,
        clientSecret: authConfig.clientSecret
    };
    
    console.log("📋 Using credentials:");
    console.log(`   Email: ${authConfig.email}`);
    console.log(`   Name: ${authConfig.name}`);
    console.log(`   Roll No: ${authConfig.rollNo}`);
    console.log(`   Client ID: ${authConfig.clientID}`);
    console.log(`   Access Code: ${authConfig.accessCode}\n`);
    
    for (const endpoint of possibleEndpoints) {
        console.log(`🌐 Trying endpoint: ${endpoint}`);
        
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(authPayload)
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                console.log(`✅ SUCCESS! Response from ${endpoint}:`);
                console.log(responseText);
                
                try {
                    const data = JSON.parse(responseText);
                    if (data.access_token) {
                        console.log(`\n🎉 NEW TOKEN FOUND: ${data.access_token}`);
                        console.log("\n📝 To use this token, update the authToken variable in logger.js");
                        return data.access_token;
                    } else if (data.token) {
                        console.log(`\n🎉 NEW TOKEN FOUND: ${data.token}`);
                        console.log("\n📝 To use this token, update the authToken variable in logger.js");
                        return data.token;
                    }
                } catch (e) {
                    // Response might not be JSON
                }
                
                console.log("\n");
                return null;
            } else {
                console.log(`❌ Failed: ${response.status} - ${responseText}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log("");
    }
    
    console.log("❌ No working authentication endpoint found.");
    console.log("\n🔍 NEXT STEPS:");
    console.log("1. Check if the service is running at http://20.244.56.144");
    console.log("2. Verify your credentials with the service administrator");
    console.log("3. You may need to re-register your client");
    console.log("4. Try accessing the service documentation or admin panel");
    
    return null;
}

// Run the token retrieval
tryGetToken().then(token => {
    if (token) {
        console.log("\n✅ Token retrieval completed successfully!");
    } else {
        console.log("\n❌ Token retrieval failed. Please check the suggestions above.");
    }
}).catch(error => {
    console.error("❌ Unexpected error:", error);
});
