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

function TestDemo(routes,marker,tbord) {
	 // Set the marker to be at the same point as one
	// of the segments or the line.



     	var infinity = true;
     	var request = new XMLHttpRequest();
     	var historyrqst = new XMLHttpRequest();
	var messagerqst = new XMLHttpRequest();


     	if (window.location.protocol=='http:') {
		var port = 6500
     	}
     	else {
		var port = 6400
     	}

	var rqst = '//serverfull.polito.it:' + port + '/data?imei=';
	//var rqst = '//localhost:' + port + '/data?imei=';
	//var rqst = 'http://130.192.30.241:6500/data?imei=';
	//var rqst = 'https://130.192.30.241:6400/data?imei=';

        //var param = "356938035643809";
      	var query = window.location.search.substring(1);
      	var qs = parse_query_string(query);

      	if (!qs.imei)
        {
        	window.alert("PLEASE USE THE IMEI");
        }
      	else
	{
/*        	

		var imei = qs.imei; 
      
      		console.log(rqst + imei);

          	request.open('GET', rqst + imei, true);

          	request.onload = function() {
              		// Begin accessing JSON data here
          		var data = JSON.parse(this.response)

	  		//console.log(request.status);
      			//console.log(data[1][2].value);
      			//console.log(data);

        		if (request.status >= 200 && request.status < 400 && data[0].value==imei) {


	    			PrevCoordinates.Longitude = TheCoordinates.Longitude;
            			PrevCoordinates.Latitude = TheCoordinates.Latitude;

            			TheCoordinates.Longitude = data[2].value ;
            			TheCoordinates.Latitude = data[3].value;
            			dataglbal = data;
        		}
        	};

        	request.send();

          
        	historyrqst.open('GET','//serverfull.polito.it:' + port + '/history?imei='+imei,true);
		//historyrqst.open('GET','//localhost:' + port + '/history?imei='+imei,true);
        	historyrqst.onload = function() {
            		if (this.response)
            		{
            			datahist = JSON.parse(this.response);
            		}
            		else{
            		    window.alert("WRONG IMEI");
            		}
        	};
        	historyrqst.send();

		*/

		if(socketOpened==0)
		{
			//socket = io.connect('//serverfull.polito.it:6600');
			console.log('socket opened')
			socketOpened=1;
		}

		if(socketOpened==1)
		{
			//console.log(socket)
			/*socket.on('message', function(message) {
				if(prevMsg!=message && j < routes.source.data.geometry.coordinates.length)
				{
					
					if(j>1 && j < routes.source.data.geometry.coordinates.length)
					{
						var newbearing = geo.bearing(routes.source.data.geometry.coordinates[j-1],routes.source.data.geometry.coordinates[j]);
             	 				//var d = geo.distance(routes.source.data.geometry.coordinates[j-1],ourcenter.features[0].geometry.coordinates);

						//console.log('bearing: ' + newbearing)
						//console.log('distance: ' + d)
						if(newbearing!=0)
						{
							prevBearing=newbearing;
						}
					}
				
					//console.log(message);
					//signalPrint=1 //FOR TESTS ONLY
	
					msgType = message.substring(1,5);
					msgLatitude = message.split('|')[0].split(':')[1].trim();
					msgLongitude = message.split('|')[1].split(':')[1].trim();
					msgInfo = message.split('|')[2].split(':')[1].trim();

					//console.log('Type: ' + msgType + ' Pos: ' + msgLatitude + ';' + msgLongitude + ' Info: ' + msgInfo)

					if(msgType=='DENM')
					{
						msgEventTraceList = message.split('|')[3].split(':')[1].trim().split('--');
						endLat = msgEventTraceList[msgEventTraceList.length-1].split(';')[0].split('=')[1].toString().trim();
						endLon = msgEventTraceList[msgEventTraceList.length-1].split(';')[1].split('=')[1].toString().trim();
						msgPathTraceList = message.split('|')[4].split(':')[1].trim().split('--');
						startLat = msgPathTraceList[0].split(';')[0].split('=')[1].toString().trim();
						startLon = msgPathTraceList[0].split(';')[1].split('=')[1].toString().trim();

						//console.log('From: ' + startLat + ' ; ' + startLon + ' To: ' + endLat + ' ; ' + endLon)

						signalHeading = geo.bearing([startLon,startLat],[msgLongitude,msgLatitude]);
						signalDistance = geo.distance([startLon,startLat],[msgLongitude,msgLatitude])*1609.344;

						console.log('DENM Heading difference: ' + Math.abs(prevBearing-signalHeading))
						if(Math.abs(prevBearing-signalHeading)<60)
						{
							console.log('DENM Heading OK')
							console.log('DENM Distance to signal: ' + geo.distance(routes.source.data.geometry.coordinates[j], [msgLongitude,msgLatitude])*1609.344)
							if(geo.distance(routes.source.data.geometry.coordinates[j], [msgLongitude,msgLatitude])*1609.344<signalDistance+200)
							//if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<10000)
							{
								signalPrint=1;
							}
						}

						if(signalPrint==1)
						{
							var feature_works = {};
							feature_works['type'] = 'Feature';
							feature_works['geometry'] = {
											'type': 'Point',
											'coordinates': [msgLongitude,msgLatitude]
									      	    }
							
							var found=0;
							for(var h=0;h<works['features'].length;h++)
							{
								if(works['features'][h].geometry.coordinates[0]==msgLongitude && works['features'][h].geometry.coordinates[1]==msgLatitude)
								{
									found=1;
								}
							}
		
							if(found==0)
							{
								console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #0818f6')
								works['features'].push(feature_works);

								works.features.forEach(function(pippo) {
									var elW = document.createElement('div');
									elW.className = 'works';
									works_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
									works_.addTo(map);
								});
							}
						}
						else
						{
							if(works_!=null)
							{
								console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #0818f6')
								works_.remove();
								works['features'].pop();
								works_=null;
								signalPrint=0;
							}
						}
					}
					if(msgType=='IVIM')
					{
						
						msgZoneType = message.split('|')[3].split(':')[0].trim();
						msgZoneTraceList = message.split('|')[3].split(':')[1].trim().split('--');
						//console.log(msgZoneType)
						//console.log(msgZoneTraceList)

						if(msgZoneType=='Detection zone')
						{
							startLat = msgZoneTraceList[0].split(';')[0].split('=')[1].toString().trim();
							startLon = msgZoneTraceList[0].split(';')[1].split('=')[1].toString().trim();
						}
						if(msgZoneType=='Relevance zone')
						{
							endLat = msgZoneTraceList[msgZoneTraceList.length-1].split(';')[0].split('=')[1].toString().trim();
							endLon = msgZoneTraceList[msgZoneTraceList.length-1].split(';')[1].split('=')[1].toString().trim();

							//console.log('From: ' + startLat + ' ; ' + startLon + ' To: ' + endLat + ' ; ' + endLon)
							signalHeading = geo.bearing([startLon,startLat],[msgLongitude,msgLatitude]);
							signalDistance = geo.distance([startLon,startLat],[msgLongitude,msgLatitude])*1609.344;

							console.log('IVIM ' + msgInfo + ' Heading difference: ' + Math.abs(prevBearing-signalHeading))
							if(Math.abs(prevBearing-signalHeading)<60)
							{
								console.log('IVIM ' + msgInfo + ' Heading OK')
								console.log('IVIM ' + msgInfo + ' Distance to signal: ' + geo.distance(routes.source.data.geometry.coordinates[j], [msgLongitude,msgLatitude])*1609.344)
								if(geo.distance(routes.source.data.geometry.coordinates[j], [msgLongitude,msgLatitude])*1609.344<signalDistance+50)
								//if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<10000)
								{
									if(msgInfo=='30 km/h')
									{									
										signalPrint30=1;
									}
									if(msgInfo=='50 km/h')
									{									
										signalPrint50=1;
									}
								}
							}
						
						
							if(msgInfo=='30 km/h')
							{
								if(signalPrint30==1)
								{
									var feature_sl30 = {};
									feature_sl30['type'] = 'Feature';
									feature_sl30['geometry'] = {
												'type': 'Point',
												'coordinates': [msgLongitude,msgLatitude]
												   }

									var found=0;
									for(var h=0;h<limit30['features'].length;h++)
									{
										if(limit30['features'][h].geometry.coordinates[0]==msgLongitude && limit30['features'][h].geometry.coordinates[1]==msgLatitude)
										{
											found=1;
										}
									}
									if(found==0)
									{
										console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #800080')
										limit30['features'].push(feature_sl30);

										limit30.features.forEach(function(pippo) {
											var elW = document.createElement('div');
											elW.className = 'sl30';
											limit30_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
											limit30_.addTo(map);
										});
									}
								}
								else
								{
									if(limit30_!=null)
									{									
										console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #800080')
										limit30_.remove();
										limit30['features'].pop();
										limit30_=null;
										signalPrint30=0;
									}
								}
							}
							if(msgInfo=='50 km/h')
							{
								if(signalPrint50==1)
								{
									var feature_sl50 = {};
									feature_sl50['type'] = 'Feature';
									feature_sl50['geometry'] = {
													'type': 'Point',
													'coordinates': [msgLongitude,msgLatitude]
												   }

									var found=0;
									for(var h=0;h<limit50['features'].length;h++)
									{
										if(limit50['features'][h].geometry.coordinates[0]==msgLongitude && limit50['features'][h].geometry.coordinates[1]==msgLatitude)
										{
											found=1;
										}
									}

									if(found==0)
									{
										console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #fe1f11')
										limit50['features'].push(feature_sl50);
									
										limit50.features.forEach(function(pippo) {
											var elW = document.createElement('div');
											elW.className = 'sl50';
											limit50_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
											limit50_.addTo(map);
										});
									}
								}
								else
								{
									if(limit50_!=null)
									{
										console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #fe1f11')
										limit50_.remove();
										limit50['features'].pop();
										limit50_=null;
										signalPrint50=0;
									}
								}
							}
						}
					}

					/******* FOR CLIENT => SERVER COMMUNICATION
					setInterval(function() {
						console.log('Sending reply to server');
						socket.emit('message', 'Hello! I am a client!');
					}, 1000);
					*********/
			/*		prevMsg=message;
					signalPrint=0;
					signalPrint30=0;
					signalPrint50=0;
				}
			}); */
			/********* SOCKETS *********/
		}

        	ourcenter.features[0].geometry.coordinates = routes.source.data.geometry.coordinates[j];

        	marker.setLngLat(routes.source.data.geometry.coordinates[j]);

        	if (normalview.argument)
        	{
        		document.getElementById('car_info').style.visibility = "hidden";
        	        marker.remove();
        	        map.getSource('point').setData(ourcenter);
        	        map.panTo(ourcenter.features[0].geometry.coordinates);
        	        map.setLayoutProperty('point', 'icon-image','pulsing-dot');
        	        map.setLayoutProperty('point', 'visibility','visible');
        	        map.getSource('routestory').setData(datahist);
			map.setPaintProperty('routestory','line-dasharray',[0,10]);
			map.setLayoutProperty('routestory','visibility','visible');
		    
		}
        	else {
        	/* show the car infor */
        	        document.getElementById('car_info').style.visibility = "visible";
        	        if (dataglbal)
        	        {
				//var myImeiValue = dataglbal[0].value;
				//var myImeiName = dataglbal[0].name;
				//var ImeiPrint = "IMEI: " + myImeiValue;
				//document.getElementById(myImeiName).innerText = ImeiPrint;
				var mySpeedValue = dataglbal[1].value;
				tbord.value = parseFloat(mySpeedValue);
				//tbord.value = parseFloat(135);

				
				var mySpeedName = dataglbal[1].name;
				var SpeedPrint = mySpeedValue + " Km/h";
				document.getElementById(mySpeedName).innerText = SpeedPrint;
				

				//var myChargeValue = dataglbal[4].value;
				//var bat = document.getElementById("battery").ldBar;
				//bat.set(parseInt(myChargeValue));
				//bat.set(parseInt(78));

				/*
				var myChargeName = dataglbal[4].name;
				var ChargePrint = "Battery Level: " + myChargeValue;
				document.getElementById(myChargeName).innerText = ChargePrint;
				*/
			}

                
        	        map.setLayoutProperty('routestory','visibility','none');
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

				//console.log('bearing: ' + newbearing)
				//console.log('distance: ' + d)
        	          	if (newbearing != 0 && d > 0.001)
        	              	{
        	              		map.setBearing(newbearing);
        	              	}
        	          	map.panTo(ourcenter.features[0].geometry.coordinates);
        	        }
		}
	}

        
        if (++j < routes.source.data.geometry.coordinates.length) setTimeout(TestDemo, 1000,routes,marker,tbord);

}
