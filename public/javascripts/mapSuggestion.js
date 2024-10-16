const script = document.getElementById('search-js');
script.onload = function () {
  const searchBox = document.querySelector('mapbox-search-box');

  searchBox.options = {
    language: 'en',
  };

  searchBox.addEventListener('retrieve', (e) => {
    const geoData = e.detail.features[0].geometry;
    const location = e.detail.features[0].properties.name;
    document.getElementById('campground-location').value = location;
    document.getElementById('campground-geometry').value = JSON.stringify(geoData);
    // We have to stringify the data because form inputs expect strings, not objects
    // So once it is sent as strings, we will parse it before validation. Because our validation expects it to be an object. So right before we call the validate function we will parse it in middleware.js (module.exports.validateCampground).
  });
};

// This file will provide suggestions based on users input in the mapbox-search-box in new/edit.ejs
  // We have replaced the location input with Mapbox Search, obtained from Mapbox.
  // We copied the CDN into boilerplate.ejs and the mapbox-search-box code into new.ejs and edit.ejs
// The above code is also from the Mapbox website but slightly tweaked.
// The search results return an object, from which we obtain the geometry (latitude and longitude) and the name of the location entered by the user.
// The obtained data is then attached to hidden form fields (as seen in new.ejs and edit.ejs).
// When the user clicks on "Create Campground" after entering all details, the form (including the hidden fields) will be sent in the 'req' object.
// Up until now, everything happens on the client side. At the server side, we extract the details from the 'req' object and attach them to the new instance of the campground.


