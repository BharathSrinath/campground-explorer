// JUST FOR UNDERSTANDING PURPOSE TO ANSWER THE QUESTION "WHY ARE WE SETTING httpOnly: true?" 

// Function to retrieve a specific cookie by name
function getCookie(cookieName) {
    // Split document.cookie string into individual cookies
    const cookiesArray = document.cookie.split("; ");
    // Iterate through cookies to find the one with the specified name
    for (const cookie of cookiesArray) {
        const [name, value] = cookie.split("=");
        // If the cookie name matches, return its value
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    // Return null if the cookie is not found
    return null;
}

// Example usage: Retrieving a cookie named "sessionToken"
const sessionToken = getCookie("sessionToken");
if (sessionToken) {
    console.log("Session token:", sessionToken);
} else {
    console.log("Session token not found.");
}
