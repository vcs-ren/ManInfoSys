'use client'; // Mark as client component if used directly in client components or needs browser APIs

// Define the base URL for the PHP API backend.
// IMPORTANT: Replace this with your actual PHP backend URL if it differs.
// It's highly recommended to use environment variables for this in a real application.
// Example using environment variable (requires setup):
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Default fallback
// Make sure your PHP server (e.g., using `php -S localhost:8000 -t src/api`) is running and accessible at this address.
const API_BASE_URL = 'http://localhost:8000';

/**
 * Constructs the full API URL.
 * @param path - The relative path of the API endpoint (e.g., /login.php or /students/read.php).
 * @returns The full URL.
 */
const getApiUrl = (path: string): string => {
    // Ensure the path starts with a slash if needed, or handle joining appropriately
    const cleanedPath = path.startsWith('/') ? path : `/${path}`;
    // Ensure base URL doesn't end with a slash if path starts with one
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanedPath}`;
};


/**
 * Fetches data from the API using GET method.
 * @param path - The relative API endpoint path.
 * @returns Promise resolving to the fetched data.
 */
export const fetchData = async <T>(path: string): Promise<T> => {
    const url = getApiUrl(path);
    // Append a cache-busting query parameter for GET requests
    const cacheBustingUrl = `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
    console.log(`Fetching data from: ${cacheBustingUrl}`); // Log the URL being fetched
    try {
        const response = await fetch(cacheBustingUrl, { cache: 'no-store' }); // Prevent caching
        if (!response.ok) {
             let errorData;
             let errorMessage = `HTTP error! Status: ${response.status}`;
             try {
                  errorData = await response.json();
                  errorMessage = errorData?.message || errorMessage;
             } catch (e) {
                  // If response is not JSON, get text
                  try {
                       const text = await response.text();
                       errorMessage = text || errorMessage;
                  } catch (textError){
                       console.error("Failed to parse response text", textError);
                  }
             }
             console.error(`HTTP error fetching from ${url}! Status: ${response.status}`, errorData);
             throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        console.error(`Network or fetch error when fetching from ${url}:`, error);
        // Re-throw a more specific error message if possible
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error(`Network error: Could not connect to the API at ${API_BASE_URL}. Please ensure the backend server is running, the URL is correct, and check CORS configuration.`);
        }
        throw error;
    }
};


/**
 * Sends data to the API using POST method.
 * @param path - The relative API endpoint path.
 * @param data - The data to send in the request body.
 * @returns Promise resolving to the API response data.
 */
export const postData = async <T, R>(path: string, data: T): Promise<R> => {
    const url = getApiUrl(path);
     console.log(`Posting data to: ${url}`, data); // Log the URL and data
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        // Attempt to parse JSON regardless of status code to get potential error messages
        let responseData;
        let responseText = ''; // Store raw text response for debugging
        try {
             responseText = await response.text();
             responseData = JSON.parse(responseText);
        } catch (e) {
             // Handle cases where response is not JSON (e.g., 204 No Content or text error)
             if (!response.ok) {
                 let errorMessage = `HTTP error! Status: ${response.status}. Response not JSON.`;
                 errorMessage = responseText || errorMessage; // Use raw text if available
                 console.error(`HTTP error posting to ${url}! Status: ${response.status}. Response: ${responseText}`);
                 throw new Error(errorMessage);

             }
             // If response is OK but not JSON (e.g., 204), return null or handle as needed
             return null as R; // Adjust based on expected return type for non-JSON success
        }

        if (!response.ok) {
            console.error(`HTTP error posting to ${url}! Status: ${response.status}`, responseData);
            throw new Error(responseData?.message || `HTTP error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        console.error(`Network or fetch error when posting to ${url}:`, error);
         // Re-throw a more specific error message if possible
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error(`Network error: Could not connect to the API at ${API_BASE_URL}. Please ensure the backend server is running, the URL (${url}) is correct, and check CORS configuration.`);
        }
        throw error;
    }
};


/**
 * Sends data to the API using PUT method.
 * @param path - The relative API endpoint path.
 * @param data - The data to send in the request body.
 * @returns Promise resolving to the API response data.
 */
export const putData = async <T, R>(path: string, data: T): Promise<R> => {
    const url = getApiUrl(path);
     console.log(`Putting data to: ${url}`, data); // Log the URL and data
     try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
         let responseData;
         let responseText = '';
         try {
            responseText = await response.text();
            responseData = JSON.parse(responseText);
         } catch (e) {}

        if (!response.ok) {
             console.error(`HTTP error putting to ${url}! Status: ${response.status}`, responseData || responseText);
            throw new Error(responseData?.message || `HTTP error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        console.error(`Network or fetch error when putting to ${url}:`, error);
         if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error(`Network error: Could not connect to the API at ${API_BASE_URL}. Please ensure the backend server is running, the URL (${url}) is correct, and check CORS configuration.`);
        }
        throw error;
    }
};


/**
 * Sends a DELETE request to the API.
 * @param path - The relative API endpoint path.
 * @returns Promise resolving when the request is complete.
 */
export const deleteData = async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    console.log(`Deleting data at: ${url}`); // Log the URL
    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { // Allow 204 No Content
            let errorData;
             let errorMessage = `HTTP error! Status: ${response.status}`;
             let responseText = '';
             try {
                  responseText = await response.text();
                  errorData = JSON.parse(responseText);
                  errorMessage = errorData?.message || errorMessage;
             } catch (e) {
                  errorMessage = responseText || errorMessage;
             }
             console.error(`HTTP error deleting at ${url}! Status: ${response.status}`, errorData || responseText);
            throw new Error(errorMessage);
        }
        // No need to parse response body for successful DELETE (often 204 No Content)
    } catch (error) {
        console.error(`Network or fetch error when deleting at ${url}:`, error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error(`Network error: Could not connect to the API at ${API_BASE_URL}. Please ensure the backend server is running, the URL (${url}) is correct, and check CORS configuration.`);
        }
        throw error;
    }
};
