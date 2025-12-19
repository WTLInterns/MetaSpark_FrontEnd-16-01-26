const API_BASE_URL = 'http://localhost:8080/product';

// Helper function to get auth token (if needed)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('swiftflow-user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.token; // Adjust based on how token is stored
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Get the response body as text first
    const responseBody = await response.text();
    
    // Try to parse as JSON
    try {
      const errorData = JSON.parse(responseBody);
      throw new Error(errorData.message || 'An error occurred');
    } catch (jsonError) {
      // If JSON parsing fails, use the raw text response or default message
      throw new Error(responseBody || 'An error occurred');
    }
  }
  return response.json();
};

// Create headers with optional auth
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get all products
export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/getAll`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Get product by ID
export const getProductById = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/getById/${productId}`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};