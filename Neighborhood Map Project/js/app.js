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

var googleMap;
var infoWindow;
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
];

function Landmarks(data, position) {
	this.name = data.name;
	this.latlngLoc = data.latlngLoc;
	this.marker = new google.maps.Marker({
		position: data.latlngLoc,
		map: googleMap,
		title: data.name,
		animation: google.maps.Animation.DROP
	});
	this.position = position;
	// this.setVisible = null;

	// Onclick event to bounce markers and populate info window
	this.marker.addListener('click', function(){
		populateInfoWindow(this);
		toggleBounce(this);
		bounceTimer(this);
		// console.log(marker);
	});
}

function populateInfoWindow(marker) {
	console.log('populateInfoWindow');
		infoWindow.marker != marker;
		infoWindow.setContent('<div>' + marker.title + '</div>');
		infoWindow.open(googleMap, marker);
		// Make sure the marker property is cleared if window is closed
		infoWindow.addListener('closeclick', function() {
			infoWindow.marker = null;
		});
		//console.log(markers);
}

function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

function bounceTimer (marker) {
	setTimeout(function() {
		marker.setAnimation(null);
	}, 5000);
}

var ViewModel = function(map, landmarks) {
	var self = this;

	this.googleMap = map;
	this.markers = [];
	this.landmarkList = ko.observableArray([]);

	// Adds Landmark site names to list in DOM
	landmarks.forEach(function(lmarks, position) {
		self.landmarkList.push(new Landmarks(lmarks, position));
	});
	// console.log(landmarks);

	// // Initial attempt at adding markers and click functionality.
	// var bounds = new google.maps.LatLngBounds();

	// for (i = 0; i < landmarks.length; i++) {
	// 	var position = landmarks[i].latlngLoc;
	// 	var title = landmarks[i].name;

	// 	var marker = new google.maps.Marker({
	// 		position: position,
	// 		map: map,
	// 		title: title,
	// 		animation: google.maps.Animation.DROP
	// 	});
	// 	// console.log(position);

	// 	// Onclick event to bounce markers and populate info window
	// 	marker.addListener('click', function(){
	// 		populateInfoWindow(this);
	// 		toggleBounce(this);
	// 		// self.infoWindow.setContent(
	// 		// 	'<div>' + marker.title + '</div>');
	// 		// self.infoWindow.open(map, marker);
	// 		// this.setAnimation(google.maps.Animation.BOUNCE);
	// 		bounceTimer(this);
	// 		// console.log(marker);
	// 	});

	// 	// Push markers to global arrays marker.
	// 	markers.push(marker);

	// 	bounds.extend(markers[i].position);
	// }
	// map.fitBounds(bounds);

	this.listClick = function(clickedLandmark) {
		console.log(clickedLandmark);
		populateInfoWindow(clickedLandmark.marker);
		toggleBounce(clickedLandmark.marker);
		bounceTimer(clickedLandmark.marker);
	};

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
			// console.log('Filtering');
			return ko.utils.arrayFilter(self.landmarkList(), function(filteredMarker) {
				// console.log(filteredMarker);
				var match = filteredMarker.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
				filteredMarker.marker.setVisible(match);
				return match;

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
	this.loadFlickr = function() {
		var $flickrHeader = $('#flickr-header');
		var $flickrElem = $('#flickr-images');

		// Clear out old data before new request
		$flickrElem.text('');

		var key = '88e693240daad97978bc4d93c370fd18';
		var secret = '78ab07255ac49f98';

			var flickrRequestTimeout = setTimeout(function() {
			$flickrElem.text('Failed to load Flickr Images');
		}, 9000);

		var landmark = $('#search-text');
	    var location = landmark.val();

		var flickrURl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + key + '&text=' + location + '&format=json&nojsoncallback=1';

		$.getJSON(flickrURl, function (data) {
			console.log(data);
			var images = data.photos.photo;
			for (var i = 0; i < images.length; i++) {
				var farmID = images[i].farm;
				var serverID = images[i].server;
				var photoID = images[i].id;
				var secretID = images[i].secret;
				var url = 'https://farm' + farmID + '.staticflickr.com/' + serverID + '/' + photoID + '_' + secret + '.jpg';
				$flickrElem.append('<li class=image><img src="'> + url + '""></li>');
				console.log('add Images');
			}
		});
		clearTimeout(flickrRequestTimeout);
	};
};

function initMap() {
	//Constructor creates a new map.
	googleMap = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 13,
		styles: styles
	});

	infoWindow = new google.maps.InfoWindow();

	viewModel = new ViewModel(googleMap, landmarks);
	//Makes it go.
	ko.applyBindings(viewModel);
}

function loadError() {
	alert('An error ocurred during page load. Please try again later');
}
