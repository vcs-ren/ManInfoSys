
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

    let errorMessage = `API Communication Error: Failed to fetch data from the backend.`;
    let detailedLog = `API Request Details:
    - Method: ${method}
    - URL: ${url}
    - Frontend Origin: ${typeof window !== 'undefined' ? window.location.origin : 'N/A (Server-side?)'}
    - Error Type: ${error?.constructor?.name || typeof error}
    - Error Message: ${error?.message || String(error)}
    `;

    // Specific check for network/CORS related errors (often manifest as TypeError 'Failed to fetch')
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
         const requestedPath = url.replace(API_BASE_URL, ''); // Extract the requested path part
        errorMessage = `Network Error: Could not connect to the API backend at ${url}.

        Possible Causes & Checks:
        1. PHP Server Status: Is the PHP server running? Start it using: 'php -S localhost:8000 -t src/api' in your project's root terminal.
        2. Backend URL: Is the API_BASE_URL (${API_BASE_URL}) correct and accessible from your browser?
        3. Endpoint Path: Is the API endpoint path "${requestedPath}" correct relative to the PHP server's document root ('src/api')? (e.g., /login.php, /students/read.php)
        4. CORS Policy: Is the PHP backend configured to allow requests from your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'unknown'})? Check 'Access-Control-Allow-Origin' headers in your PHP files.
        5. Firewall/Network: Could a firewall or network issue be blocking the connection?
        6. Browser Console: Check the browser's Network tab for the failed request details and the Console tab for specific CORS error messages.
        `;
        detailedLog += `
        Troubleshooting Tips:
        - Ensure the PHP server is running and listening on the correct port (8000 in this case).
        - Check the PHP server's console output for any startup errors or errors during the request.
        - Verify the 'Access-Control-Allow-Origin' header in the failing PHP endpoint matches your frontend origin or is '*'.
        - Temporarily simplify the PHP endpoint to just return headers and a basic JSON to isolate the issue.
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
 * @param path - The relative API endpoint path (e.g., /students/read.php).
 * @returns Promise resolving to the fetched data.
 */
export const fetchData = async <T>(path: string): Promise<T> => {
    const url = getApiUrl(path);
    // Append a cache-busting query parameter for GET requests
    const cacheBustingUrl = `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
    console.log(`Fetching data from: ${cacheBustingUrl}`); // Log the URL being fetched
    let response; // Define response outside try block
    try {
        response = await fetch(cacheBustingUrl, { cache: 'no-store' }); // Prevent caching

        if (!response.ok) {
             let errorMessage = `API Error! Status: ${response.status}`;
             let errorBody = '';
             try {
                 const responseCloneForText = response.clone(); // Clone before reading text
                 errorBody = await responseCloneForText.text();
                 try {
                     if (errorBody) { // Try parsing if text exists
                         const errorData = JSON.parse(errorBody);
                         errorMessage = errorData?.message || errorBody || errorMessage;
                     }
                 } catch (jsonError) {
                     // If parsing JSON fails, use the raw text
                     errorMessage = errorBody || errorMessage;
                     console.error("API Error Response Text:", errorBody);
                 }
             } catch (e) {
                 console.error("Failed to read or parse error response body", e);
             }
             console.error(`HTTP error fetching from ${url}! Status: ${response.status}`, `Raw response: ${errorBody || '(empty response)'}`);
             throw new Error(errorMessage);
        }
         // Only attempt to parse JSON if the response is likely to have content
         if (response.status === 204) { // No Content
             return null as T; // Or handle as needed
         }

         // Clone the response to read the body text for logging in case of JSON parse error
         const responseClone = response.clone();
         try {
            return await response.json();
         } catch (jsonError) {
             const responseText = await responseClone.text();
             console.error(`Failed to parse successful response from ${url} as JSON. Status: ${response.status}. Response Text:`, responseText, jsonError);
             throw new Error(`API Error: Received successful response status (${response.status}), but failed to parse body as JSON.`);
         }

    } catch (error) {
        handleFetchError(error, url, 'GET');
    }
};


/**
 * Sends data to the API using POST method.
 * @param path - The relative API endpoint path (e.g., /login.php).
 * @param data - The data to send in the request body.
 * @returns Promise resolving to the API response data.
 */
export const postData = async <T, R>(path: string, data: T): Promise<R> => {
    const url = getApiUrl(path);
     console.log(`Posting data to: ${url}`, data); // Log the URL and data
     let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add other headers like Authorization if needed
            },
            body: JSON.stringify(data),
        });

        let responseData: R | null = null;
        let responseBody = '';
        try {
             // Clone before reading, in case we need to read again on error
             const responseCloneForText = response.clone();
             responseBody = await responseCloneForText.text();

             // Attempt to parse only if there's content and response was OK
             if (responseBody && response.ok) {
                 responseData = JSON.parse(responseBody);
             } else if (response.ok) {
                // Handle cases like 204 No Content or empty successful response
                return null as R; // Or adjust based on expected return for success
             }
        } catch (e) {
             if (!response.ok) {
                 // Error response was not valid JSON
                 const errorMessage = `API Error! Status: ${response.status}. Response not valid JSON: ${responseBody || '(empty response)'}`;
                 console.error(`HTTP error posting to ${url}! Status: ${response.status}. Raw Response: ${responseBody}`);
                 throw new Error(errorMessage);
             }
             // If OK but not JSON, might be unexpected, but treat as success for now
             console.warn(`POST to ${url} successful but response was not JSON.`);
             return null as R;
        }

        if (!response.ok) {
            // Use parsed data if available, otherwise use text or generic message
            let errorMessage = `API Error! Status: ${response.status}. Response: ${responseBody || '(empty response)'}`;
             try {
                const errorJson = JSON.parse(responseBody);
                errorMessage = errorJson?.message || errorMessage;
             } catch (jsonError) {
                // Stick with the text-based error if JSON parsing failed
             }
            console.error(`HTTP error posting to ${url}! Status: ${response.status}`, `Raw Response: ${responseBody}`);
            // Throw the message from the parsed JSON if available, otherwise the constructed message
            throw new Error(errorMessage);
        }
        return responseData as R; // Ensure correct return type
     } catch (error) {
        handleFetchError(error, url, 'POST');
    }
};


/**
 * Sends data to the API using PUT method.
 * @param path - The relative API endpoint path (e.g., /students/update.php/123).
 * @param data - The data to send in the request body.
 * @returns Promise resolving to the API response data.
 */
export const putData = async <T, R>(path: string, data: T): Promise<R> => {
    const url = getApiUrl(path);
     console.log(`Putting data to: ${url}`, data); // Log the URL and data
     let response;
     try {
        response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
         let responseData: R | null = null;
         let responseBody = '';
         try {
             const responseCloneForText = response.clone();
             responseBody = await responseCloneForText.text();
             if (responseBody && response.ok) {
                responseData = JSON.parse(responseBody);
             } else if (response.ok) {
                 return null as R;
             }
         } catch (e) {
              if (!response.ok) {
                 const errorMessage = `API Error! Status: ${response.status}. Response not valid JSON: ${responseBody || '(empty response)'}`;
                 console.error(`HTTP error putting to ${url}! Status: ${response.status}. Raw Response: ${responseBody}`);
                 throw new Error(errorMessage);
             }
              console.warn(`PUT to ${url} successful but response was not JSON.`);
              return null as R;
         }

        if (!response.ok) {
             let errorMessage = `API Error! Status: ${response.status}. Response: ${responseBody || '(empty response)'}`;
             try {
                const errorJson = JSON.parse(responseBody);
                errorMessage = errorJson?.message || errorMessage;
             } catch (jsonError) {
                // Stick with the text-based error
             }
             console.error(`HTTP error putting to ${url}! Status: ${response.status}`, `Raw Response: ${responseBody}`);
            throw new Error(errorMessage);
        }
        return responseData as R;
     } catch (error) {
        handleFetchError(error, url, 'PUT');
    }
};


/**
 * Sends a DELETE request to the API.
 * @param path - The relative API endpoint path (e.g., /students/delete.php/123).
 * @returns Promise resolving when the request is complete.
 */
export const deleteData = async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    console.log(`Deleting data at: ${url}`); // Log the URL
    let response;
    try {
        response = await fetch(url, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { // Allow 204 No Content
            let errorMessage = `API Error! Status: ${response.status}`;
            let errorBody = '';
             try {
                  const responseCloneForText = response.clone(); // Clone before reading text
                  errorBody = await responseCloneForText.text();
                   try {
                       if (errorBody) { // Try parsing if text exists
                            const errorData = JSON.parse(errorBody);
                            errorMessage = errorData?.message || errorBody || errorMessage;
                       }
                   } catch (jsonError) {
                        // If parsing JSON fails, use the raw text
                        errorMessage = errorBody || errorMessage;
                        console.error("API Error Response Text:", errorBody);
                   }
             } catch (e) {
                    console.error("Failed to read or parse error response body", e);
             }
             console.error(`HTTP error deleting at ${url}! Status: ${response.status}`, `Raw response: ${errorBody || '(empty response)'}`);
            throw new Error(errorMessage);
        }
        // No need to parse response body for successful DELETE (often 204 No Content)
    } catch (error) {
        handleFetchError(error, url, 'DELETE');
    }
};
