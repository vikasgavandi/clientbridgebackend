exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Mock company data
    const mockCompanies = [
      { current_comp: 'Microsoft', count: 15 },
      { current_comp: 'Google', count: 12 },
      { current_comp: 'Apple', count: 8 },
      { current_comp: 'Amazon', count: 10 },
      { current_comp: 'Meta', count: 6 },
      { current_comp: 'Netflix', count: 4 }
    ];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCompanies)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};