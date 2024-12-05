'use server';

export const createCustomerAccount = async (payload: {
  fullname: string;
  company?: string;
  email: string;
  phone?: string;
  referrerId?: string;
}) => {
  try {
    const { fullname, company, email, phone, referrerId } = payload;
    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts[0] || ''; // First part as first name
    const lastName = nameParts.slice(1).join(' ') || ''; // Remaining parts as last name

    const postData = JSON.stringify({
      email: email,
      first_name: firstName,
      last_name: lastName,
      company: company, // Optional field
      phone: phone, // Optional field
      referrer_id: referrerId, // Optional field
      access_id: process.env.SALES_BUDDY_ACCESS_ID, // Required field
    });

    // Prepare API URL
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const fullApiUrl = `${apiUrl}${apiEnv}${apiPath}create-customer`;

    console.log('Sending API Request:', fullApiUrl, postData);

    // Make the API call
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    // Check for response status and parse response JSON
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create account');
    }

    const data = await response.json();
    console.log('API Response:', data);
    return { status: 200, data };
  } catch (error: any) {
    console.error('Error in createCustomerAccount:', error);
    return { status: 500, error: error.message || 'An unknown error occurred' };
  }
};
