const fetch = require('node-fetch');
const crypto = require('crypto');

// Mailchimp API configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_DC = MAILCHIMP_API_KEY ? MAILCHIMP_API_KEY.split('-')[1] : '';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { email } = JSON.parse(event.body);

        // Validate email
        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Valid email is required' })
            };
        }

        // Generate MD5 hash of lowercase email for Mailchimp
        const subscriberHash = crypto
            .createHash('md5')
            .update(email.toLowerCase())
            .digest('hex');

        // Prepare data for Mailchimp
        const data = {
            email_address: email,
            status: 'pending', // Double opt-in
            merge_fields: {
                SIGNUP_SRC: 'Coming Soon Page'
            }
        };

        // Make API request to Mailchimp
        const response = await fetch(
            `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
            {
                method: 'PUT', // PUT will insert or update
                headers: {
                    'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        const result = await response.json();

        if (response.ok) {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({
                    message: 'Thank you for subscribing! Please check your email to confirm.'
                })
            };
        } else {
            // Handle Mailchimp specific errors
            let errorMessage = 'Failed to subscribe. Please try again.';
            
            if (result.title === 'Member Exists') {
                errorMessage = 'You are already subscribed to our mailing list.';
            } else if (result.title === 'Invalid Resource') {
                errorMessage = 'Please provide a valid email address.';
            }

            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: errorMessage })
            };
        }
    } catch (error) {
        console.error('Subscription error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 