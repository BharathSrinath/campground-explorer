mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // Same as the ID that we have given it to the above div
    style: "mapbox://styles/mapbox/streets-v12",
    center: campground.geometry.coordinates,
    zoom: 9,
});

//   This adds marker to the location
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .addTo(map)

