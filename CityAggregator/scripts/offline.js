var geo = {/*
            * assume corrd = {lng, lat}
            */
	bearing : function (coordinates1,coordinates2) {
		var dLon = this._toRad(coordinates2[0]-coordinates1[0]);
		var y = Math.sin(dLon) * Math.cos(this._toRad(coordinates2[1]));
            	var x = Math.cos(this._toRad(coordinates1[1]))*Math.sin(this._toRad(coordinates2[1])) -
                Math.sin(this._toRad(coordinates1[1]))*Math.cos(this._toRad(coordinates2[1]))*Math.cos(dLon);
            	var brng = this._toDeg(Math.atan2(y, x));
            	return ((brng + 360) % 360);
        },
        _toRad : function(deg) {
             return deg * Math.PI / 180;
        },
        _toDeg : function(rad) {
            return rad * 180 / Math.PI;
        },

        distance : function (coordinates1,coordinates2){
            var p1 = turf.point(coordinates1);
            var p2 = turf.point(coordinates2);
            var param = { units: 'miles'};
            return turf.distance(p1,p2,param);
        },
};


var j = 0;
var TheCoordinates = {"Longitude" : 7.683933, "Latitude" : 45.069106};
var PrevCoordinates = {"Longitude" : null, "Latitude" : null};
var listCoordinates = [];
var datahist = null;
var dataglbal = null;
var datamsg = null;
var socketOpened = 0;
var socket = null;
var prevMsg = null;
var endLat = null;
var endLon = null;
var signalPrint = 0;
var signalPrint30 = 0;
var signalPrint50 = 0;
var prevBearing = 0;
var works_ = null;
var limit30_ = null;
var limit50_ = null;

function TestSimulationOffline(routes,marker) {

          ourcenter.features[0].geometry.coordinates = routes.source.data.geometry.coordinates[j];
         // console.log(ourcenter);
	
	marker.setLngLat(routes.source.data.geometry.coordinates[j]);


        if (normalview.argument)
            {
                marker.remove();
		map.getSource('point').setData(ourcenter);
                map.panTo(ourcenter.features[0].geometry.coordinates);
		map.setLayoutProperty('point', 'icon-image','pulsing-dot');
		map.setLayoutProperty('point', 'visibility','visible');
            }
        else {
	    marker.addTo(map);
            map.getSource('point').setData(ourcenter);
	    map.setLayoutProperty('point', 'icon-image','streetimage');
	    map.setLayoutProperty('point', 'visibility','none');
	    

            if (j > 1)
              {
              var newbearing = geo.bearing(routes.source.data.geometry.coordinates[j-1],
                  routes.source.data.geometry.coordinates[j]);
              var d = geo.distance(routes.source.data.geometry.coordinates[j-1],
                  ourcenter.features[0].geometry.coordinates);

                  //console.log("bearing : ", newbearing);
                  //console.log("distance : ", d);

              map.setBearing(newbearing,{duration : 1.0, animate : true});
              map.panTo(ourcenter.features[0].geometry.coordinates);
             }

        }

          if (++j < routes.source.data.geometry.coordinates.length) setTimeout(TestSimulationOffline, 3000,routes,marker);

     }
