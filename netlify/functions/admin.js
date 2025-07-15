exports.handler = async (event) => {
  const { httpMethod, queryStringParameters, body } = event;
  
  // Check admin role from query params
  if (queryStringParameters?.role !== 'admin') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Access denied. Admins only.' })
    };
  }

  try {
    if (httpMethod === 'GET') {
      // Return mock client data for admin
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        client_name: `Client ${i + 1}`,
        contact: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        current_comp: ['Microsoft', 'Google', 'Apple'][Math.floor(Math.random() * 3)],
        email_id: `client${i + 1}@example.com`,
        brand_name: `Brand ${i + 1}`
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData)
      };
    }

    if (httpMethod === 'POST') {
      const data = JSON.parse(body);
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Data added successfully', id: Math.floor(Math.random() * 1000) })
      };
    }

    if (httpMethod === 'PUT') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Data updated successfully' })
      };
    }

    if (httpMethod === 'DELETE') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Data deleted successfully' })
      };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};