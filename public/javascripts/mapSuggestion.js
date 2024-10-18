const script = document.getElementById('search-js');
script.onload = function () {
  const searchBox = document.querySelector('mapbox-search-box');

  searchBox.options = {
    language: 'en',
  };

  // This is basically to match the styling of the map-box-search element to the bootstrap element.
  searchBox.theme = {
    variables: {
      fontFamily: 'Avenir, sans-serif',   // Optional: align with your desired font
      border: 'none',                     // Match Bootstrap's border style
      borderRadius: '0.375rem',           // Match Bootstrap's rounded input
      boxShadow: 'none',                  // Remove shadow
      padding: '0.375rem 0.75rem',        // Bootstrap's padding for form inputs
      colorText: '#495057',               // Input text color
      colorBackground: '#fff',            // Background color
    },
    cssText: `
      .Input { 
        height: calc(1.5em + 0.75rem + 2px); 
        font-size: 1rem; 
        line-height: 1.5;
      }
    `
  }

  searchBox.addEventListener('retrieve', (e) => {
    const geoData = e.detail.features[0].geometry;
    const location = e.detail.features[0].properties.full_address;
    document.getElementById('destination-location').value = location;
    document.getElementById('destination-geometry').value = JSON.stringify(geoData);
    // We have to stringify the data because form inputs expect strings, not objects
    // So once it is sent as strings, we will parse it before validation. Because our validation expects it to be an object. So right before we call the validate function we will parse it in middleware.js (module.exports.validateDestination).
  });
};

// This file will provide suggestions based on users input in the mapbox-search-box in new/editForm.ejs
  // We have replaced the location input with Mapbox Search, obtained from Mapbox.
  // We copied the CDN into boilerplate.ejs and the mapbox-search-box code into new.ejs and editForm.ejs
// The above code is also from the Mapbox website but slightly tweaked.
// The search results return an object, from which we obtain the geometry (latitude and longitude) and the name of the location entered by the user.
// The obtained data is then attached to hidden form fields (as seen in new.ejs and editForm.ejs).
// When the user clicks on "Create Destination" after entering all details, the form (including the hidden fields) will be sent in the 'req' object.
// Up until now, everything happens on the client side. At the server side, we extract the details from the 'req' object and attach them to the new instance of the destination.


