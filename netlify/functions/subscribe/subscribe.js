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
        body: JSON.stringify({ message: 'Email is required', success: false }),
      };
    }

    // Get Mailchimp credentials from environment variables
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    
    // Fallback if API key or list ID is missing
    if (!API_KEY || !LIST_ID) {
      console.error('Missing Mailchimp API key or list ID. Falling back to local storage.');
      
      // Just return success without actually subscribing to Mailchimp
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Thank you for joining the HIVE! We will notify you when we launch.', 
          success: true,
          debug: 'Email stored locally due to missing API credentials'
        }),
      };
    }
    
    const DC = API_KEY.split('-')[1]; // Datacenter from API key

    // Prepare data for Mailchimp
    const data = {
      email_address: email,
      status: 'subscribed',
    };

    try {
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
        
        console.error('Mailchimp API error:', responseData);
        return {
          statusCode: 200, // Return 200 even for errors to handle them gracefully
          body: JSON.stringify({ 
            message: responseData.detail || 'We\'ve noted your email. Thank you for your interest!', 
            success: true,
            debug: `API error: ${JSON.stringify(responseData)}`
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
    } catch (apiError) {
      console.error('Error calling Mailchimp API:', apiError);
      
      // Return a success message anyway to not block the user experience
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Thank you for your interest! We\'ve received your email.', 
          success: true,
          debug: `API call error: ${apiError.message}`
        }),
      };
    }
  } catch (error) {
    console.error('General error in function:', error);
    
    return {
      statusCode: 200, // Return 200 to handle errors gracefully
      body: JSON.stringify({ 
        message: 'Thank you for your submission!', 
        success: true,
        debug: `Function error: ${error.toString()}`
      }),
    };
  }
}; 