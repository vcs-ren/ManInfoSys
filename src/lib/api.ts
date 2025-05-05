'use client'; // Mark as client component if used directly in client components or needs browser APIs

// Define the base URL for the PHP API backend.
// IMPORTANT: Replace this with your actual PHP backend URL if it differs.
// It's highly recommended to use environment variables for this in a real application.
// Example using environment variable (requires setup):
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Default fallback
// Make sure your PHP server (e.g., using `php -S localhost:8000 -t src/api`) is running and accessible at this address.
const API_BASE_URL = 'http://localhost:8000'; // Assuming PHP dev server is running here

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

// Generic error handler for fetch requests
const handleFetchError = (error: any, url: string, method: string): never => {
    console.error(`Fetch error during ${method} request to ${url}:`, error);

    let errorMessage = `API Error: Failed to fetch data.`;
    let detailedLog = `API Request Details:
    - Method: ${method}
    - URL: ${url}
    - Frontend Origin: ${typeof window !== 'undefined' ? window.location.origin : 'N/A (Server-side?)'}
    - Error Type: ${error?.constructor?.name || typeof error}
    - Error Message: ${error?.message || String(error)}
    `;

    // Specific check for network/CORS related errors
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        errorMessage = `Network Error: Could not connect to the API backend at ${url}. Please ensure the PHP server is running and accessible. Check for CORS issues in the browser console.`;
        detailedLog += `
        Possible Causes:
        1. Backend Server Not Running: The PHP development server might not be started at ${API_BASE_URL}. Run 'php -S localhost:8000 -t src/api' in your terminal.
        2. Incorrect URL/Path: Verify the API path "${url.replace(API_BASE_URL, '')}" is correct.
        3. CORS Policy: The PHP backend isn't sending the correct 'Access-Control-Allow-Origin' header for your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'unknown'}). Check PHP headers.
        4. Firewall/Network Issue: Network configuration might be blocking the request.
        5. Mixed Content: Requesting HTTP from an HTTPS page (less likely in local dev).
        `;
         console.error("Detailed Network/CORS Check: Is the PHP server running at the correct address? Is the endpoint path correct? Check the browser's Network tab for the failed request and look for CORS errors in the Console tab.");
    } else if (error instanceof Error) {
        // Use the message from standard Error objects if available
        errorMessage = `API Error: ${error.message}`;
    } else {
         errorMessage = `API Error: An unknown error occurred during the fetch request.`;
    }


    console.error("Detailed Fetch Error Log:", detailedLog);
    // Re-throw a new error with the processed, more user-friendly message
    throw new Error(errorMessage);
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
             let errorMessage = `API Error! Status: ${response.status}`;
             let responseText = ''; // Initialize responseText
             try {
                  responseText = await response.text(); // Try reading text first
                   try {
                        errorData = JSON.parse(responseText);
                        errorMessage = errorData?.message || errorMessage;
                   } catch (jsonError) {
                        // If parsing JSON fails, use the raw text (if not empty)
                        errorMessage = responseText || errorMessage;
                   }
             } catch (e) {
                   console.error("Failed to parse error response", e);
             }
             console.error(`HTTP error fetching from ${url}! Status: ${response.status}`, errorData || `Raw response: ${responseText}`);
             throw new Error(errorMessage);
        }
         // Only attempt to parse JSON if the response is likely to have content
         if (response.status === 204) { // No Content
             return null as T; // Or handle as needed
         }
        return response.json();
    } catch (error) {
        handleFetchError(error, url, 'GET');
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
            headers: {
                'Content-Type': 'application/json',
                // Add other headers like Authorization if needed
            },
            body: JSON.stringify(data),
        });

        let responseData;
        let responseText = '';
        try {
             responseText = await response.text();
             // Attempt to parse only if there's content and response was OK
             if (responseText && response.ok) {
                 responseData = JSON.parse(responseText);
             } else if (response.ok) {
                // Handle cases like 204 No Content or empty successful response
                return null as R; // Or adjust based on expected return for success
             }
        } catch (e) {
             if (!response.ok) {
                 const errorMessage = `API Error! Status: ${response.status}. Response not valid JSON: ${responseText || '(empty response)'}`;
                 console.error(`HTTP error posting to ${url}! Status: ${response.status}. Raw Response: ${responseText}`);
                 throw new Error(errorMessage);
             }
             // If OK but not JSON, might be unexpected, but treat as success for now
             console.warn(`POST to ${url} successful but response was not JSON.`);
             return null as R;
        }

        if (!response.ok) {
            const errorPayload = responseData || { message: `API Error: Status ${response.status}. Response: ${responseText || '(empty response)'}` };
            console.error(`HTTP error posting to ${url}! Status: ${response.status}`, errorPayload);
            throw new Error(errorPayload?.message || `API error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        handleFetchError(error, url, 'POST');
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
             if (responseText && response.ok) {
                responseData = JSON.parse(responseText);
             } else if (response.ok) {
                 return null as R;
             }
         } catch (e) {
              if (!response.ok) {
                 const errorMessage = `API Error! Status: ${response.status}. Response not valid JSON: ${responseText || '(empty response)'}`;
                 console.error(`HTTP error putting to ${url}! Status: ${response.status}. Raw Response: ${responseText}`);
                 throw new Error(errorMessage);
             }
              console.warn(`PUT to ${url} successful but response was not JSON.`);
              return null as R;
         }

        if (!response.ok) {
             const errorPayload = responseData || { message: `API Error: Status ${response.status}. Response: ${responseText || '(empty response)'}` };
             console.error(`HTTP error putting to ${url}! Status: ${response.status}`, errorPayload);
            throw new Error(errorPayload?.message || `API error! Status: ${response.status}`);
        }
        return responseData;
     } catch (error) {
        handleFetchError(error, url, 'PUT');
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
             let errorMessage = `API Error! Status: ${response.status}`;
             let responseText = '';
             try {
                  responseText = await response.text();
                   try {
                        if (responseText) errorData = JSON.parse(responseText);
                        errorMessage = errorData?.message || errorMessage;
                   } catch (jsonError) {
                        errorMessage = responseText || errorMessage;
                   }
             } catch (e) {
                    console.error("Failed to parse error response", e);
             }
             console.error(`HTTP error deleting at ${url}! Status: ${response.status}`, errorData || `Raw response: ${responseText}`);
            throw new Error(errorMessage);
        }
        // No need to parse response body for successful DELETE (often 204 No Content)
    } catch (error) {
        handleFetchError(error, url, 'DELETE');
    }
};
