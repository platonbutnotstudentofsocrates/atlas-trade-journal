
const fetch = require('node-fetch');

async function testApiCall() {
  const apiKey = '807d191245406020fa35644be64e6b6bdfd2b26d78bdfe3df1d1b7187b291cac';

  // Calculate dates: Past 7 days, Today, Next 7 days
  const today = new Date();
  
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 7);
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);

  // Helper to format YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const fromParam = formatDate(pastDate);
  const toParam = formatDate(futureDate);

  const url = `https://financeflowapi.com/world_economic_calendar?from=${fromParam}&to=${toParam}&apikey=${apiKey}`;

  console.log('--- API TEST START ---');
  console.log('Generated URL:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('--- SUCCESS ---');
    console.log('Response Data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('--- ERROR ---');
    console.error('Fetch failed:', error.message);
  }
}

// Execute immediately
testApiCall();
