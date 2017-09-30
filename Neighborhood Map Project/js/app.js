// Using MVVM Framework, Google Maps API, Knockout JS
// and third-party API.
// The View is the HTML file.

var styles = [
	{ featureType: 'water',
		stylers: [{ color: '#19a0d8' }]},
   	{ featureType: 'administrative', elementType: 'labels.text.stroke',
        stylers: [{ color: '#ffffff' }, { weight: 6 }]},
    {featureType: 'administrative', elementType: 'labels.text.fill',
        stylers: [{ color: '#e85113' }]},
    {featureType: 'road.highway', elementType: 'geometry.stroke',
        stylers: [{ color: '#efe9e4' }, { lightness: -40 }]},
    {featureType: 'transit.station',
        stylers: [{ weight: 9 }, { hue: '#e85113' }]},
    {featureType: 'road.highway',elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]},
    {featureType: 'water', elementType: 'labels.text.stroke',
        stylers: [{ lightness: 100 }]},
    {featureType: 'water', elementType: 'labels.text.fill',
        stylers: [{ lightness: -100 }]},
    {featureType: 'poi', elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { color: '#f0e4d3' }]},
    {featureType: 'road.highway', elementType: 'geometry.fill',
        stylers: [ { color: '#efe9e4' }, { lightness: -25 }]}
];

var map;
var markers = [];
var landmarks = [
	{
		name: 'Texas State Capitol',
		latlngLoc: {lat: 30.2741853, lng: -97.7405401},
	},
	{
		name: 'University of Texas Tower',
		latlngLoc: {lat: 30.2861062, lng: -97.7393634},
	},
	{
		name: 'Mount Bonnell',
		latlngLoc: {lat: 30.3207616, lng: -97.77334019999999},
	},
	{
		name: 'Congress Avenue Bridge',
		latlngLoc: {lat: 30.2617381, lng: -97.74516319999999},
	},
	{
		name: 'Barton Springs',
		latlngLoc: {lat: 30.2660703, lng: -97.76913479999999},
	},
	{
		name: '360 Bridge / Pennybacker Bridge',
		latlngLoc: {lat: 30.3516437, lng: -97.79701449999999},
	},
	{
		name: 'Auditorium Shores',
		latlngLoc: {lat: 30.2627167, lng: -97.7515303},
	},
	{
		name: 'Zilker Park',
		latlngLoc: {lat: 30.2669624, lng: -97.77285930000001},	
	}
]

var ViewModel = function(map, landmarks) {
	var self = this;

	this.googleMap = map;
	this.marker = [];
	this.landmarkList = ko.observableArray([]);
	this.infoWindow = new google.maps.InfoWindow();

	function Landmarks(data, position) {
		this.name = data.name;
		this.latlngLoc = data.latlngLoc;
		this.marker = null;
		this.position = position;
		// this.setVisible = null;
	}

	// Adds Landmark site names to list in DOM
	landmarks.forEach(function(lmarks, position) {
		self.landmarkList.push(new Landmarks(lmarks, position));
	});
	// console.log(landmarks);

	// // Adds Makers to the DOM
	var bounds = new google.maps.LatLngBounds();

	for (i = 0; i < landmarks.length; i++) {
		var position = landmarks[i].latlngLoc;
		var title = landmarks[i].name;

		var marker = new google.maps.Marker({
			position: position,
			map: map,
			title: title, 
			animation: google.maps.Animation.DROP
		});
		//console.log(position);
		// Push markers to global arrays marker.
		markers.push(marker);


		// Onclick event to bounce markers and populate info window
		marker.addListener('click', function(){
			populateInfoWindow(this);
			toggleBounce(this);
			// self.infoWindow.setContent(
			// 	'<div>' + marker.title + '</div>');
			// self.infoWindow.open(map, marker);
			// this.setAnimation(google.maps.Animation.BOUNCE);
			bounceTimer(this);
			console.log(marker);
		});

		// // Onclick event to open Info Window
		// marker.addListener('click', function(){
		// 	populateInfoWindow(this, infoWindow);
		// });

		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);

	function populateInfoWindow(markers, infoWindow) {
		//console.log('populateInfoWindow');
		if (self.infoWindow.markers != markers) {
			self.infoWindow.setContent('<div>' + markers.title + '</div>');
			self.infoWindow.open(map, markers);
			// Make sure the marker property is cleared if window is closed
			self.infoWindow.addListener('closeclick', function() {
				self.infoWindow.marker = null;
			})
			//console.log(markers);
		}
	}

	function toggleBounce(markers) {
		if (markers.getAnimation() !== null) {
			markers.setAnimation(null);
		} else {
			markers.setAnimation(google.maps.Animation.BOUNCE);
		}
	}

	function bounceTimer (markers) {
		setTimeout(function() {
			markers.setAnimation(null);
		}, 5000);
	}

	this.listClick = function(clickedLandmark) {
		console.log(clickedLandmark);
		// self.infoWindow.setContent('<div>' + self.landmarkList.title + '</div>');
		populateInfoWindow(markers[clickedLandmark.position]);
		toggleBounce(markers[clickedLandmark.position]);
		bounceTimer(markers[clickedLandmark.position]);
	}

	// Knockout Observable for Filtering
	this.filteredText = ko.observable('');

	// Adds Filtering Functionality
	this.filteredLandmark = ko.computed(function() {
		var filter = self.filteredText().toLowerCase();
		if(!filter) {
			// If there is not a filter, then return the whole list and markers.
			return self.landmarkList();
			// Add default to show all markers.
		} else {
			console.log('Filtering');
			return ko.utils.arrayFilter(self.landmarkList(), function(filteredMarker) {
				console.log(filteredMarker);
				var match = filteredMarker.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
				markers[filteredMarker.position].setVisible(match);
				return match;
				return populateInfoWindow(filteredMarker.position);

				// // Initial attempt at filtering. Trouble with the stringStartsWith.
				// var stringStartsWith = function(string, startsWith) {
				// 	string = string || '';
				// 	if(startsWith.length > string.length)
				// 		return false;
				// 	return string.substring(0, startsWith.length) === startsWith;
				// };	
				// return stringStartsWith(lmarks.name.toLowerCase().filter);
			});
		}
		
	});

	// Add Flickr API to List View
}


function initMap() {
	//Constructor creates a new map.
	var googleMap = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 13,
		styles: styles
	});

	viewModel = new ViewModel(googleMap, landmarks);
	//Makes it go.
	ko.applyBindings(viewModel);
};

function loadError() {
	alert('An error ocurred during page load. Please try again later');
};
