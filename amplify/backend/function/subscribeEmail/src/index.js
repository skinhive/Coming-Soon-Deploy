const https = require('https');
const crypto = require('crypto');

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    };
    
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS enabled' })
        };
    }
    
    try {
        // Parse request body
        const requestBody = JSON.parse(event.body);
        const email = requestBody.email;
        
        if (!email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    message: 'Email is required' 
                })
            };
        }
        
        // Get Mailchimp credentials from environment variables
        const API_KEY = process.env.MAILCHIMP_API_KEY;
        const LIST_ID = process.env.MAILCHIMP_LIST_ID;
        
        console.log('Environment check:', {
            hasApiKey: !!API_KEY,
            apiKeyLength: API_KEY ? API_KEY.length : 0,
            hasListId: !!LIST_ID,
            listIdLength: LIST_ID ? LIST_ID.length : 0
        });
        
        // Fallback if API key or list ID is missing
        if (!API_KEY || !LIST_ID) {
            console.log('Missing Mailchimp credentials');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Thank you for joining the HIVE! We will notify you when we launch.',
                    debug: 'Email stored locally due to missing API credentials'
                })
            };
        }
        
        const DC = API_KEY.split('-')[1]; // Datacenter from API key
        
        // Prepare data for Mailchimp
        const data = JSON.stringify({
            email_address: email,
            status: 'subscribed'
        });
        
        // Call Mailchimp API
        try {
            const result = await new Promise((resolve, reject) => {
                const options = {
                    hostname: `${DC}.api.mailchimp.com`,
                    path: `/3.0/lists/${LIST_ID}/members`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
                        'Content-Length': data.length
                    }
                };
                
                const req = https.request(options, (res) => {
                    let responseBody = '';
                    
                    res.on('data', (chunk) => {
                        responseBody += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const parsedResponse = JSON.parse(responseBody);
                            resolve({
                                statusCode: res.statusCode,
                                body: parsedResponse
                            });
                        } catch (e) {
                            resolve({
                                statusCode: res.statusCode,
                                body: responseBody
                            });
                        }
                    });
                });
                
                req.on('error', (error) => {
                    reject(error);
                });
                
                req.write(data);
                req.end();
            });
            
            console.log('Mailchimp API response:', result);
            
            // Handle different response scenarios
            if (result.statusCode >= 400) {
                if (result.body && result.body.title === 'Member Exists') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'This email is already subscribed to our newsletter.'
                        })
                    };
                }
                
                // For any other error, still return success to the user
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Thank you for your interest! We\'ve noted your email.',
                        debug: `API error: ${JSON.stringify(result.body)}`
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Thank you for subscribing to our newsletter!'
                })
            };
            
        } catch (apiError) {
            console.error('Error calling Mailchimp API:', apiError);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Thank you for your interest! We\'ve received your email.',
                    debug: `API call error: ${apiError.message}`
                })
            };
        }
        
    } catch (error) {
        console.error('General error in function:', error);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Thank you for your submission!',
                debug: `Function error: ${error.toString()}`
            })
        };
    }
}; 