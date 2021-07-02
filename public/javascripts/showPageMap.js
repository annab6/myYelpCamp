// <!-- mapbox -->
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/light-v10', // style URL
      center: campground.geometry.coordinates, //starting position [lng, lat]
      zoom: 10 // starting zoom
    });

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Create a marker and add it to the map + add popup
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({offset: 25})
        .setHTML(
          `<h4>${campground.title}</h4><p>${campground.location}</p>`
        )
    )
    .addTo(map); 


// // **** add custom icon marker to map
// campground.geometry.coordinates.forEach(function(marker) {
//   // create a HTML element for each feature
//   const el = document.createElement('div');
//   el.className = 'marker';
//   new mapboxgl.Marker(el)
//     .setLngLat(campground.geometry.coordinates)
//     .setPopup(
//       new mapboxgl.Popup({offset: 25})
//         .setHTML(
//           `<h4>${campground.title}</h4><p>${campground.location}</p>`
//         )
//     )
//     .addTo(map); 
//   });


