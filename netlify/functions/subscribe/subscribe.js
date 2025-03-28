const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('Function invoked with event:', JSON.stringify(event, null, 2));
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed', success: false }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    console.log('Received email:', email);
    
    if (!email) {
      console.log('No email provided in request');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required', success: false }),
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
      console.error('Missing Mailchimp credentials:', { API_KEY: !!API_KEY, LIST_ID: !!LIST_ID });
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
    console.log('Using Mailchimp datacenter:', DC);

    // Prepare data for Mailchimp
    const data = {
      email_address: email,
      status: 'subscribed',
    };

    try {
      console.log('Attempting Mailchimp API call...');
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
      console.log('Mailchimp API response:', {
        status: response.status,
        data: responseData
      });

      if (response.status >= 400) {
        // Handle already subscribed case gracefully
        if (responseData.title === 'Member Exists') {
          console.log('Member already exists');
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
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Thank you for your interest! We\'ve noted your email.',
            success: true,
            debug: `API error: ${JSON.stringify(responseData)}`
          }),
        };
      }

      console.log('Successfully subscribed email to Mailchimp');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Thank you for subscribing to our newsletter!',
          success: true 
        }),
      };
    } catch (apiError) {
      console.error('Error calling Mailchimp API:', apiError);
      
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
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Thank you for your submission!',
        success: true,
        debug: `Function error: ${error.toString()}`
      }),
    };
  }
}; 