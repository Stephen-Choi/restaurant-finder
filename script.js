var app = angular.module("restaurant", ['ngRoute']); 

app.config(function($routeProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "pages/home.html",
		controller: "MainCtrl",
		controllerAs: "main"
	})

	.when("/search", {
		templateUrl: "pages/search.html",
		controller: "MainCtrl",
		controllerAs: "main"
	})

	.when("/results", {
		templateUrl: "pages/results.html",
		controller: "MainCtrl",
		controllerAs: "main"
	})

	// .when("/saved", {
	// 	templateUrl: "pages/saved.html",
	// 	controller: "MainCtrl",
	// 	controllerAs: "main"
	// })

	// .when("/randomize", {
	// 	templateUrl: "pages/randomize.html",
	// 	controller: "MainCtrl",
	// 	controllerAs: "main"
	// })

	.otherwise({
		redirectTo: "/"
	});

	// $locationProvider.html5Mode(true);
});

app.controller("MainCtrl", ['$scope', '$http', '$location', '$rootScope', function($scope, $http, $location, $rootScope) {
	// handle errors
	$scope.errorMessage = "";
	$scope.working = "working";
	$scope.hasResults = false;
	$rootScope.savedRestaurants = [];
	$scope.activeSaved = 0;
	$scope.random = "";
	$scope.home = true;

	// api urls
	var geoApi = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	var geoKey = "AIzaSyBscxKh4hsgFfdRcUlAcKPBME_kd4ZRV90";

	var placeApi = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
	var placeKey = "AIzaSyBV109RuSA4GKQqnb61GP6xwJGBT1vRkmk";

	// place lib
	var map;
	var service;

	$scope.changeSaved = function() {
		if($scope.activeSaved === 0) {
			$scope.activeSaved = 1;
			console.log($scope.activeSaved);
		} else {
			$scope.activeSaved = 0;
			console.log($scope.activeSaved);
		}
	};

	$scope.saveRestaurant = function(restaurantInfo) {
		var tempObj = restaurantInfo;
		$rootScope.savedRestaurants.push(tempObj);
	};

	$scope.randomFn = function() {
		var num = $rootScope.savedRestaurants.length;
		if(num > 0) {
			var str = ($rootScope.savedRestaurants[getRandomInt(num)].name);
			$scope.random = str.slice(0,27);
		}
	};

	function getRandomInt(num) {
		return Math.floor(Math.random() * Math.floor(num));
	}

	// problems with http, will try to fix in near future
	// $scope.removeRestaurant = function(restaurantIndex) {
	// 	$scope.savedRestaurants.slice(restaurantIndex, 1);
	// };

	// $scope.resetRestaurant = function() {
	// 	$scope.savedRestaurants = [];
	// };

	$scope.getPlaceData = function(zipcode, distance, cuisine) {
		// array to hold place data, resets after each usage
		$rootScope.locationData = [];

		$scope.zipcode = zipcode;
		$scope.distance = distance;
		$scope.cuisine = cuisine;
		$scope.home = false;

		$http({
		  method: "GET",
		  url: geoApi + zipcode + "&key=" + geoKey,
		})
		.then(function (geoResponse) {
		    $scope.geoData = geoResponse.data;

		    if ($scope.geoData.status === "ZERO_RESULTS") {
			    $scope.errorMessage = "Please Enter a Valid Adress";
			} else {
				$scope.place_id = $scope.geoData.results[0].place_id;
			    $scope.geoLocation = $scope.geoData.results[0].geometry.location;
			}
		})

		.then(function() {
			initMap();
		});
	};

	function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: $scope.geoLocation,
          zoom: 15
        });

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: $scope.geoLocation,
          radius: $scope.distance,
          type: ['restaurant'],
          keyword: $scope.cuisine
        }, callback);
      }

      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          $scope.$apply(function() {
          	$scope.errorMessage = "";
          });

          for (var i = 0; i < results.length; i++) {
            let place_ids = results[i].place_id;
            
            let request = {
	          placeId: place_ids 
	        };
	        service.getDetails(request, detailCallBack);
	      }

	      $scope.hasResults = true;

	      $scope.$apply();

		} else {
			$scope.$apply(function() {
          		$scope.errorMessage = "No Results Try Increasing Distance";
          	});
          }
      	}

    function detailCallBack(place, status) {
	  if (status == google.maps.places.PlacesServiceStatus.OK) {
	    $rootScope.locationData.push({
	    	name: place.name,
	    	address: place.formatted_address,
	    	phone_number: place.formatted_phone_number,
	    	rating: place.rating,
	    	website: place.website,
	    	maps: place.url
        });
        console.log(place.name);
        $scope.$apply();
      }
  }
}]);

app.directive("restaurant", function() {
	return {
		templateUrl: 'pages/restaurant-item.html'
	};
});

