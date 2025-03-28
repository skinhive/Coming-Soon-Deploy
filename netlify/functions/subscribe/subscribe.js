const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' }),
      };
    }

    // Get Mailchimp credentials from environment variables
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const DC = API_KEY.split('-')[1]; // Datacenter from API key

    // Prepare data for Mailchimp
    const data = {
      email_address: email,
      status: 'subscribed',
    };

    // Make request to Mailchimp API
    const response = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (response.status >= 400) {
      // Handle already subscribed case gracefully
      if (responseData.title === 'Member Exists') {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'This email is already subscribed to our newsletter.', 
            success: true 
          }),
        };
      }
      
      return {
        statusCode: responseData.status,
        body: JSON.stringify({ 
          message: responseData.detail || 'Error subscribing to the newsletter', 
          success: false 
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Thank you for subscribing to our newsletter!', 
        success: true 
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.toString(), success: false }),
    };
  }
}; 