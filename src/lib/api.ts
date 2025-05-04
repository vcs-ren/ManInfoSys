'use client'; // Mark as client component if used directly in client components or needs browser APIs

// Define the base URL for the PHP API backend.
// IMPORTANT: Replace this with your actual PHP backend URL.
// It's highly recommended to use environment variables for this in a real application.
// Example using environment variable (requires setup):
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Default fallback
const API_BASE_URL = 'http://localhost:8000'; // Placeholder: Use your actual PHP server address

/**
 * Constructs the full API URL.
 * @param path - The relative path of the API endpoint (e.g., /api/login.php).
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
             try { errorData = await response.json(); } catch (e) {}
             console.error(`HTTP error! Status: ${response.status}`, errorData);
             throw new Error(errorData?.message || `HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        throw error; // Re-throw the error after logging
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
        try {
             responseData = await response.json();
        } catch (e) {
             // Handle cases where response is not JSON (e.g., 204 No Content or text error)
             if (!response.ok) {
                 console.error(`HTTP error! Status: ${response.status}. Response not JSON.`);
                 throw new Error(`HTTP error! Status: ${response.status}`);
             }
             // If response is OK but not JSON (e.g., 204), return null or handle as needed
             return null as R; // Adjust based on expected return type for non-JSON success
        }

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`, responseData);
            throw new Error(responseData?.message || `HTTP error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        console.error(`Failed to post to ${url}:`, error);
        throw error; // Re-throw the error after logging
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
         try { responseData = await response.json(); } catch (e) {}

        if (!response.ok) {
             console.error(`HTTP error! Status: ${response.status}`, responseData);
            throw new Error(responseData?.message || `HTTP error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        console.error(`Failed to put to ${url}:`, error);
        throw error; // Re-throw the error after logging
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
             try { errorData = await response.json(); } catch (e) {}
             console.error(`HTTP error! Status: ${response.status}`, errorData);
            throw new Error(errorData?.message || `HTTP error! Status: ${response.status}`);
        }
        // No need to parse response body for successful DELETE (often 204 No Content)
    } catch (error) {
        console.error(`Failed to delete at ${url}:`, error);
        throw error; // Re-throw the error after logging
    }
};
