mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [79.0882, 21.1458],
    zoom: 4
});

// This will provide on-screen controls to zoom-in/zoom-out 
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('destinations', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
            // Look at the above file to know the format of the data to be sent
            // There is a property called features under which the geojson data exists.
        data: destinations,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'destinations',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'destinations',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'destinations',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('destinations').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        const popUpText = e.features[0].properties.popUpMarkup;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpText)
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});

// https://docs.mapbox.com/help/getting-started/creating-data/
// Changes Made to the Mapbox Code

// Above is an example code from Mapbox that provides clustering for earthquakes (It even had a tsunami property to correlate data). We replaced 'earthquakes' with 'destinations'.
// Objective:
    // When a user clicks on a destination in the map, we want to take them to that specific destination. 
    // Although we can include an anchor tag inside the popup’s setHTML, there are some challenges.
// Challenge: Passing Data in the Required Format
    // We have to send data in the way that the libraries expect. 
    // The question is: how does Mapbox expect this data to be formatted?
    // Handling Individual Points:
        // Clicking on an individual point is handled by the 'unclustered-point' function. 
        // When you console.log(features[0]), you will see the details are listed under the 'properties' key.
        // However, our schema doesn’t store the destination details this way.
    // Current Data Structure:
        // We have passed 'destinations' to this file under the 'features' property. 
        // If you inspect the console output of 'features[0]' or 'destinations', all properties are listed under 'features'.
        // However, Mapbox’s sample data places relevant information under the 'properties' field, which is where the destination-related details should be directly available, along with the 'geometry'.
// Solution: Using Mongoose Virtuals
    // To solve this, we use Mongoose virtuals to create a virtual property called 'properties' and place the required data under it.
// Virtuals and JSON Conversion:
    // One complication is that Mongoose doesn’t include virtuals when converting a document to JSON. 
    // Since we are using JSON.stringify, virtuals won't be included in the parsed version.
    // Solution:
        // We must explicitly enable virtuals in the schema using { toJSON: { virtuals: true } }.
            // const opts = { toJSON: { virtuals: true } };
