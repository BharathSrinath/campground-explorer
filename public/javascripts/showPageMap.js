mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // Same as the ID that we have given it to the above div
    style: "mapbox://styles/mapbox/streets-v12",
    center: destination.features.geometry.coordinates,
    zoom: 12,
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

//   This adds marker to the location (long and lat). set-popup will give us information that we specify within setHTML function when we click the marker.
new mapboxgl.Marker()
    .setLngLat(destination.features.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
                `<h5 style="color: black;">${destination.features.title}</h5><p style="color: black;">${destination.features.location}</p>`
            )
    )
    .addTo(map)

