(function(){
      
  		$( document ).ready(function() {
		   getLocation();
		});


		function getLocation() {
		    if (navigator.geolocation) {
		       navigator.geolocation.getCurrentPosition(showPosition, showError);
		        $('erroMsg').text("Geolocation is not supported by this browser.");
		    }
		}

		function showPosition(position) {
    		var lat = position.coords.latitude
    		var lon = position.coords.longitude;
    		localStorage.setItem("lat", lat);
    		localStorage.setItem("lon", lon);
    		initMap(lat, lon);
    		getVenues(lat, lon, 'coffee', 100000);
		}



		function showError(error) {
		    initMap();
		    $('#errorMsg').text("Can't get user location");
		    
		}

      function initMap(lat, lon, locations, icons) {
      	var zoom = 4;
      	if( lat && lon ){
      		var userInput = true;
      		var zoom = 8;
      	}
      	lat = lat ||  52.37
      	lon = lon ||  4.89

        var map = new google.maps.Map(document.getElementById('map'), {
        	center: {lat: lat, lng: lon}, 
        	zoom: zoom
        });

        var infowindow = new google.maps.InfoWindow({
          content: 'contentString'
        });

        if(userInput){
	        	var myLatlng = new google.maps.LatLng(lat, lon);
	        	marker = new google.maps.Marker({
	        	size: new google.maps.Size(100, 100),
		   		map: map,
		   		draggable: true,	
		    	animation: google.maps.Animation.DROP,
		    	position: {lat: lat, lng: lon},
		    	icon: 'src/img/map-pin-marker-circle-64.png'
			});



    		marker.addListener('click', toggleBounce);

    		if(locations) {
    			var markers = locations.forEach(function(item, i) {
    			  var icon = icons[i] ? icons[i].icon[item.type]  :  'src/img/placeholder.png'; 
    			  var address = item.location.address ? item.location.address : item.location.country
    			  var city = item.location.city ? item.location.city : '';
    			  var content = '<div class="info-window">' +
				    			'<h3>' + item.name + '</h3>' +
				    			'<h4>' + address + ', ' + city + '<h4>' +
				    		'</div>';
		          var marker = new google.maps.Marker({
		            position: item.position,
		            icon: icon,
		            map: map,
		          });

		          
	          	google.maps.event.addListener(marker, 'click', function() {
			   		infowindow.setContent(content);
			   		infowindow.open(map, this);
					});
        		});

    		}

			function toggleBounce() {
			  if (marker.getAnimation() !== null) {
			    marker.setAnimation(null);
			  } else {
			    marker.setAnimation(google.maps.Animation.BOUNCE);
			  }
			}

			// To add the marker to the map, call setMap();
			marker.setMap(map)
	    }
  	}


  	function getVenues(lat, lon, query, radius){
  			$('#lat').val(parseFloat(lat), 10);
  			$('#lon').val(parseFloat(lon), 10);
    		var venueSearchUrl 	= 'https://api.foursquare.com/v2/venues/search?v=20161016&ll=' + lat + '%2C%20' + lon + '&query=' + query + '&intent=checkin&radius=' + radius + '&client_id=D0LEACTGUFCGELIPWTOEE2YNT0FUQGXA0ZC3UV5AGBEBNWMX&client_secret=EGYLL1PAUWCOPPZVCNHIRFQ3LBKVF4T1SETDMEP5COMZQZOA';

    		$.ajax({
			   url: venueSearchUrl,
			   data: {
			      format: 'json'
			   },
			   error: function() {
			      $('#info').html('<p>An error has occurred</p>');
			   },
			   dataType: 'jsonp',
			   success: function(data) {
			      var venues = data.response.venues;
			      var locations = [];
			      var icons = [];
			      for(var i = 0; i < venues.length; i++){
			      	var category = venues[i].categories[0] ? venues[i].categories[0].name  :  null;
			      	var name = venues[i].name;
			      	locations.push({
			      		position: new google.maps.LatLng(venues[i].location.lat, venues[i].location.lng), 
			      		type: category,
			      		name: name,
			      		location: venues[i].location
			      	});

			      	if(category){
			      		var thumbKey = venues[i].categories[0].name;
			      		var thumbValue = venues[i].categories[0].icon.prefix + '64' + venues[i].categories[0].icon.suffix
			      		var thumbUrl = thumbValue.replace('ss3.4sqi.net', 'foursquare.com').replace('categories_v2', 'categories');
			      		var obj = {};
			      		obj[thumbKey] = thumbUrl;

				      	icons.push({
				      		icon: obj
				      	})
			      	}

			      }

			      initMap(lat, lon, locations, icons);
			   },
			   type: 'GET'
			});

  	}



		$('#searchBtn').on('click', function(e){
			e.preventDefault();
			var lat = parseFloat(localStorage.getItem('lat'), 16);
			var lon = parseFloat(localStorage.getItem('lon'), 16);
			var query = $('#query').val();
			var radius = $('#radius').val() * 1000;
			if(query == '' && query.length == 0){
				$('#errorMsg').text("Search field can't be empty");
			} else {
				$('#errorMsg').text('');
			}
			if(radius < 1000 || radius > 100000){
				$('#errorMsg').text('Search radius must be between 10m to 100km');
				return false;
			} else {
				$('#errorMsg').text('');
			} 
			if(!lat || !lon) getLocation();
			else getVenues(lat, lon, query, radius)
		})





	}());