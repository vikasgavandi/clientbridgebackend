exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Mock client data
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      marketing_name: `Marketing ${i + 1}`,
      client_name: `Client ${i + 1}`,
      contact: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      current_comp: ['Microsoft', 'Google', 'Apple', 'Amazon', 'Meta'][Math.floor(Math.random() * 5)],
      earlier_comp: ['IBM', 'Oracle', 'SAP', 'Adobe'][Math.floor(Math.random() * 4)],
      brand_name: `Brand ${i + 1}`,
      email_id: `client${i + 1}@example.com`,
      therapy_area: ['Oncology', 'Cardiology', 'Neurology'][Math.floor(Math.random() * 3)],
      division: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
      date: new Date().toLocaleDateString(),
      comment: `Remark for client ${i + 1}`,
      last_call: new Date().toLocaleDateString()
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};