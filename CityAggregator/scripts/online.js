//**** Small library to compute distance, bearing and degree <--> radiant conversion 
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

//**** Initializing variables
var j = 0;
var TheCoordinates = {"Longitude" : 7.683933, "Latitude" : 45.069106};
var PrevCoordinates = {"Longitude" : null, "Latitude" : null};
var datahist = null;
var dataglbal = null;
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
var firstLoop=1;
var prevset=0;
var index_speed=0;
var index_bearing=0;
var index_lat=0;
var index_long=0;
var index_soc=0;

//**** Recursive function for the online html
function simulate(marker,tbord) {

     	var infinity = true;
     	var request = new XMLHttpRequest();
     	var historyrqst = new XMLHttpRequest();
	var messagerqst = new XMLHttpRequest();

	//**** Checking the port whether using http ot https
     	if (window.location.protocol=='http:') {
		var port = 6500
     	}
     	else {
		var port = 6400
     	}

	//**** Creating the URL for the data from FCA-AWS
	var rqst = '//serverfull.polito.it:' + port + '/data?imei=';
	//var rqst = '//localhost:' + port + '/data?imei=';

	//**** Checking the IMEI from URL
      	var query = window.location.search.substring(1);
      	var qs = parse_query_string(query);

	//**** If the IMEI is not found, then raise an error
      	//if (!qs.imei)
        //{
        	//window.alert("PLEASE USE THE IMEI");
        //}
	//**** If the IMEI is found
      	//else
	//{
        	var imei = qs.imei; 
      
      		console.log(rqst + imei);

		//**** GET request for data of FCA-AWS
          	request.open('GET', rqst + imei, true);

		//**** As the GET request for data of FCA-AWS gives a response
          	request.onload = function() {
              		//**** Begin accessing JSON data here
          		var data = JSON.parse(this.response)

	  		//console.log(request.status);
      			//console.log(data[1][2].value);
      			//console.log(data);

			//**** If there is a correct response
        		if (request.status >= 200 && request.status < 400 && data[0].value==imei) {

				//**** Store the previous coords
	    			PrevCoordinates.Longitude = TheCoordinates.Longitude;
            			PrevCoordinates.Latitude = TheCoordinates.Latitude;

            			dataglbal = data;

				//**** Store indexes of the fields of response
				for(var s=0; s<dataglbal.length; s++)
				{
					if(dataglbal[s].name=='VehicleSpeedVSO') {
						index_speed=s;
					}

					if(dataglbal[s].name=='Bearing') {
						index_bearing=s;
					}

					if(dataglbal[s].name=='Longitude') {
						index_long=s;
					}

					if(dataglbal[s].name=='Latitude') {
						index_lat=s;
					}

					if(dataglbal[s].name=='SOC') {
						index_soc=s;
					}

					//console.log('Indeces: speed: ' + index_speed + ' , bearing: ' + index_bearing + ' , long: ' + index_long + ' , lat: ' + index_lat + ' , SOC: ' + index_soc);
				}

				//**** Get the new coords
            			TheCoordinates.Longitude = data[index_long].value ;
            			TheCoordinates.Latitude = data[index_lat].value;

				//console.log('Longitude: ' + TheCoordinates.Longitude)
				//console.log('Latitude: ' + TheCoordinates.Latitude)
				
				//**** Get the new bearing
				parsedBearing = data[index_bearing].value;

				//**** If we are not on the first loop and the bearing is more than 100 degrees different from the previous one, than skip the new value
				if(firstLoop==0)
				{
					if(Math.abs(prevBearing-parsedBearing)>100 && prevset==0)
					{
						prevset=1;
						parsedBearing = prevBearing;
					}
					else if(prevset==1)
					{
						prevset=0;
					}
				}
			
				//**** If value of bearing is not skipped, than save the previuos bearing
				if(prevset==0) {
					prevBearing = parsedBearing;
				}
				firstLoop=0;
        		} //**** End of if there is a correct response
        	}; //**** End of request.onload function
		//**** Send the data request
        	request.send();

          	//**** GET request for path history
        	historyrqst.open('GET','//serverfull.polito.it:' + port + '/history?imei='+imei,true);
		//historyrqst.open('GET','//localhost:' + port + '/history?imei='+imei,true);

		//**** As the GET request for path history gives a response
        	historyrqst.onload = function() {
            		if (this.response)
            		{
				//**** Get the path history from response            			
				datahist = JSON.parse(this.response);
            		}
			//**** If there is not a correct responce it means that that IMEI was never seen, so it is wrong
            		else
			{
            		    window.alert("WRONG IMEI");
            		}
        	};
		//**** Send the path history request
        	historyrqst.send();

		//**** If the socket is not opened, then open the socket from server.js to online.js
		if(socketOpened==0)
		{
			socket = io.connect('//serverfull.polito.it:6600');
			console.log('socket opened')
			socketOpened=1;
		}

		//**** If the socket has been opened
		if(socketOpened==1)
		{
			//console.log(socket)

			//**** Upon a received message from socket
			socket.on('message', function(message) {
				//**** If the new message is different from the previous one
				if(prevMsg!=message)
				{
					//**** If is the first loop then set bearing to 0, otherwise set the new bearing					
					if(dataglbal!=null)
					{
						newbearing = parsedBearing;
					}
					else
					{
						newbearing = 0;
					}
					//console.log('----------------------------- Bearing: ' + newbearing)
					//console.log(message);

					//**** Parse the message for message type, message coords and message information
					msgType = message.substring(1,5);
					msgLatitude = message.split('|')[0].split(':')[1].trim();
					msgLongitude = message.split('|')[1].split(':')[1].trim();
					msgInfo = message.split('|')[2].split(':')[1].trim();

					//console.log('Type: ' + msgType + ' Pos: ' + msgLatitude + ';' + msgLongitude + ' Info: ' + msgInfo)

					//**** If new message is a DENM
					if(msgType=='DENM')
					{
						//**** Parse the message for beginning and end of the traces						
						msgEventTraceList = message.split('|')[3].split(':')[1].trim().split('--');
						endLat = msgEventTraceList[msgEventTraceList.length-1].split(';')[0].split('=')[1].toString().trim();
						endLon = msgEventTraceList[msgEventTraceList.length-1].split(';')[1].split('=')[1].toString().trim();
						msgPathTraceList = message.split('|')[4].split(':')[1].trim().split('--');
						startLat = msgPathTraceList[0].split(';')[0].split('=')[1].toString().trim();
						startLon = msgPathTraceList[0].split(';')[1].split('=')[1].toString().trim();

						//console.log('From: ' + startLat + ' ; ' + startLon + ' To: ' + endLat + ' ; ' + endLon)

						//**** Compute the bearing and the distance of the signal
						signalHeading = geo.bearing([startLon,startLat],[msgLongitude,msgLatitude]);
						signalDistance = geo.distance([startLon,startLat],[msgLongitude,msgLatitude])*1609.344;

						console.log('DENM Heading difference: ' + Math.abs(newbearing-signalHeading))

						//**** If we are aligned to the signal
						if(Math.abs(newbearing-signalHeading)<60)
						{
							console.log('DENM Heading OK')
							console.log('DENM Distance to signal: ' + geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344)

							//**** If we are close enough to the signal
							if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<signalDistance+200)
							//if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<10000)
							{
								//**** Set the print flag for DENM
								signalPrint=1;
							}
						}

						//**** If the print flag for DENM is set
						if(signalPrint==1)
						{
							//**** Create a void Geojson for the new work signal
							var feature_works = {};
							feature_works['type'] = 'Feature';
							feature_works['geometry'] = {
											'type': 'Point',
											'coordinates': [msgLongitude,msgLatitude]
									      	    }

							//**** Check if the signal has already been printed
							var found=0;
							for(var h=0;h<works['features'].length;h++)
							{
								if(works['features'][h].geometry.coordinates[0]==msgLongitude && works['features'][h].geometry.coordinates[1]==msgLatitude)
								{
									found=1;
								}
							}

							//**** If the signal has not been printed
							if(found==0)
							{
								console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #0818f6');

								//**** Append the new Geojson feature in the feature collection of the work layer
								works['features'].push(feature_works);

								//**** For each feature in the feature collection, print the signal on the map
								works.features.forEach(function(pippo) {
									var elW = document.createElement('div');
									elW.className = 'works';
									works_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
									works_.addTo(map);
								});
							}

						} //**** End if the print flag for DENM is set
						//**** Else if the signal is not to be printed
						else
						{
							//**** If the signal has been printed before
							if(works_!=null)
							{
								console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #0818f6');

								//**** Remove the signal from the map
								works_.remove();

								//**** Remove the signal from the feature collection
								works['features'].pop();

								//**** Set the signal as not printed
								works_=null;

								//**** Set the print flag for DENM as 0
								signalPrint=0;
							}
						}


					} //**** End if new message is a DENM

					//**** If new message is an IVIM
					if(msgType=='IVIM')
					{
						//**** Parse the message for the traces
						msgZoneType = message.split('|')[3].split(':')[0].trim();
						msgZoneTraceList = message.split('|')[3].split(':')[1].trim().split('--');
						//console.log(msgZoneType)
						//console.log(msgZoneTraceList)

						//**** If the trace is the detection zone, then parse the message for the beginning of the zone
						if(msgZoneType=='Detection zone')
						{
							startLat = msgZoneTraceList[0].split(';')[0].split('=')[1].toString().trim();
							startLon = msgZoneTraceList[0].split(';')[1].split('=')[1].toString().trim();
						}

						//**** If the trace is the relevance zone
						if(msgZoneType=='Relevance zone')
						{
							//**** Parse the message for the end of the zone
							endLat = msgZoneTraceList[msgZoneTraceList.length-1].split(';')[0].split('=')[1].toString().trim();
							endLon = msgZoneTraceList[msgZoneTraceList.length-1].split(';')[1].split('=')[1].toString().trim();

							//console.log('From: ' + startLat + ' ; ' + startLon + ' To: ' + endLat + ' ; ' + endLon)

							//**** Compute the bearing and the distance of the signal
							signalHeading = geo.bearing([startLon,startLat],[msgLongitude,msgLatitude]);
							signalDistance = geo.distance([startLon,startLat],[msgLongitude,msgLatitude])*1609.344;

							console.log('IVIM ' + msgInfo + ' Heading difference: ' + Math.abs(newbearing-signalHeading))

							//**** If we are aligned to the signal
							if(Math.abs(newbearing-signalHeading)<60)
							{
								console.log('IVIM ' + msgInfo + ' Heading OK')
								console.log('IVIM ' + msgInfo + ' Distance to signal: ' + geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344)

								//**** If we are close enough to the signal
								if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<signalDistance+50)
								//if(geo.distance([TheCoordinates.Longitude,TheCoordinates.Latitude], [msgLongitude,msgLatitude])*1609.344<10000)
								{
									//**** If the signal is limit 30, then set the print flag for limit 30
									if(msgInfo=='30 km/h')
									{									
										signalPrint30=1;
									}
									//**** If the signal is limit 50, then set the print flag for limit 50
									if(msgInfo=='50 km/h')
									{									
										signalPrint50=1;
									}
								}
							}
						
							//**** If the signal is limit 30
							if(msgInfo=='30 km/h')
							{

								//**** If the print flag for limit 30 is set
								if(signalPrint30==1)
								{
									//**** Create a void Geojson for the new limit 30 signal
									var feature_sl30 = {};
									feature_sl30['type'] = 'Feature';
									feature_sl30['geometry'] = {
												'type': 'Point',
												'coordinates': [msgLongitude,msgLatitude]
												   }

									//**** Check if the signal has already been printed
									var found=0;
									for(var h=0;h<limit30['features'].length;h++)
									{
										if(limit30['features'][h].geometry.coordinates[0]==msgLongitude && limit30['features'][h].geometry.coordinates[1]==msgLatitude)
										{
											found=1;
										}
									}

									//**** If the signal has not been printed
									if(found==0)
									{
										console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #800080');

										//**** Append the new Geojson feature in the feature collection of the limit 30 layer
										limit30['features'].push(feature_sl30);

										//**** For each feature in the feature collection, print the signal on the map
										limit30.features.forEach(function(pippo) {
											var elW = document.createElement('div');
											elW.className = 'sl30';
											limit30_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
											limit30_.addTo(map);
										});
									}
								} //**** End if the print flag for limit 30 is set
								//**** Else if the signal is not to be printed
								else
								{
									//**** If the signal has been printed before
									if(limit30_!=null)
									{									
										console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #800080');

										//**** Remove the signal from the map
										limit30_.remove();

										//**** Remove the signal from the feature collection
										limit30['features'].pop();

										//**** Set the signal as not printed
										limit30_=null;

										//**** Set the print flag for limit 30 as 0
										signalPrint30=0;
									}
								}
							} //**** End if the signal is limit 30


							//**** If the signal is limit 50
							if(msgInfo=='50 km/h')
							{
								//**** If the print flag for limit 50 is set
								if(signalPrint50==1)
								{
									//**** Create a void Geojson for the new limit 50 signal
									var feature_sl50 = {};
									feature_sl50['type'] = 'Feature';
									feature_sl50['geometry'] = {
													'type': 'Point',
													'coordinates': [msgLongitude,msgLatitude]
												   }

									//**** Check if the signal has already been printed
									var found=0;
									for(var h=0;h<limit50['features'].length;h++)
									{
										if(limit50['features'][h].geometry.coordinates[0]==msgLongitude && limit50['features'][h].geometry.coordinates[1]==msgLatitude)
										{
											found=1;
										}
									}

									//**** If the signal has not been printed
									if(found==0)
									{
										console.log('%c Print Signal ' + msgInfo + ' ','background: #a9dbb1; color: #fe1f11');

										//**** Append the new Geojson feature in the feature collection of the limit 50 layer
										limit50['features'].push(feature_sl50);

										//**** For each feature in the feature collection, print the signal on the map
										limit50.features.forEach(function(pippo) {
											var elW = document.createElement('div');
											elW.className = 'sl50';
											limit50_ = new mapboxgl.Marker(elW).setLngLat(pippo.geometry.coordinates);
											limit50_.addTo(map);
										});
									}
								} //**** End if the print flag for limit 50 is set
								//**** Else if the signal is not to be printed
								else
								{
									//**** If the signal has been printed before
									if(limit50_!=null)
									{
										console.log('%c Removed Signal ' + msgInfo + ' ', 'background: #f7baff; color: #fe1f11');

										//**** Remove the signal from the map
										limit50_.remove();

										//**** Remove the signal from the feature collection
										limit50['features'].pop();

										//**** Set the signal as not printed
										limit50_=null;

										//**** Set the print flag for limit 50 as 0
										signalPrint50=0;
									}
								}
							} //**** End if the signal is limit 50

						} //**** End if the trace is the relevance zone
					} //**** End if new message is an IVIM

					//**** Store the previous message and reset the print flags
					prevMsg=message;
					signalPrint=0;
					signalPrint30=0;
					signalPrint50=0;


				} //**** End if the new message is different from the previous one
			}); //**** End upon a received message from socket
			
		} //**** End if socket has been opened



		/******* FOR CLIENT => SERVER COMMUNICATION
		setInterval(function() {
			console.log('Sending reply to server');
			socket.emit('message', 'Hello! I am a client!');
		}, 1000);
		*********/


		//**** Set the center of the map in the new coords
        	ourcenter.features[0].geometry.coordinates = [parseFloat(TheCoordinates.Longitude), parseFloat(TheCoordinates.Latitude)];

		//**** Print the marker in the center of the map
        	marker.setLngLat([parseFloat(TheCoordinates.Longitude), parseFloat(TheCoordinates.Latitude)]);

		//**** If we are in eagle view mode
        	if (normalview.argument)
        	{
        		//**** Hide the car info
			document.getElementById('car_info').style.visibility = "hidden";

			//**** Remove the marker of street view mode
        	        marker.remove();

			//**** Set the marker of the eagle view mode in the center of the map and print it on the map
        	        map.getSource('point').setData(ourcenter);
        	        map.panTo(ourcenter.features[0].geometry.coordinates);
        	        map.setLayoutProperty('point', 'icon-image','pulsing-dot');
        	        map.setLayoutProperty('point', 'visibility','visible');

			//**** Print on the map the path history
        	        map.getSource('routestory').setData(datahist);
			map.setPaintProperty('routestory','line-dasharray',[0,10]);
			map.setLayoutProperty('routestory','visibility','visible');
		    
		} //**** End if we are in eagle view mode
		//**** If we are in street view mode
        	else
		{
			//**** Show the car info
			document.getElementById('car_info').style.visibility = "visible";

			//**** If data are received
        	        if (dataglbal)
        	        {
				//**** Speed print
				var mySpeedValue = dataglbal[index_speed].value;
				tbord.value = parseFloat(mySpeedValue);		
				var mySpeedName = dataglbal[index_speed].name;
				var SpeedPrint = mySpeedValue + " Km/h";
				document.getElementById(mySpeedName).innerText = SpeedPrint;
				
				/* //**** IMEI and battery charge print --> UNUSED
				var myImeiValue = dataglbal[0].value;
				var myImeiName = dataglbal[0].name;
				var ImeiPrint = "IMEI: " + myImeiValue;
				document.getElementById(myImeiName).innerText = ImeiPrint;

				var myChargeValue = dataglbal[4].value;
				var bat = document.getElementById("battery").ldBar;
				bat.set(parseInt(myChargeValue));
				bat.set(parseInt(78));

				var myChargeName = dataglbal[4].name;
				var ChargePrint = "Battery Level: " + myChargeValue;
				document.getElementById(myChargeName).innerText = ChargePrint;
				*/ //**** End IMEI and battery charge print --> UNUSED


			} //**** End if data are received

                	//**** Print the path history
        	        map.setLayoutProperty('routestory','visibility','none');

			//**** Add to the map the marker of street view mode
        	        marker.addTo(map);

			//**** Set the marker of the street view mode in the center of the map and print it on the map
        	        map.getSource('point').setData(ourcenter);
        	        map.setLayoutProperty('point', 'icon-image','streetimage');
        	        map.setLayoutProperty('point', 'visibility','none');
        	        
			//**** If it is not the first loop
        	        if (j > 1)
        	        {	
					//**** If is the first loop then set bearing to 0, otherwise set the new bearing
					if(dataglbal!=null)
					{
						newbearing = parsedBearing;
					}
					else
					{
						newbearing = 0;
					}        	      		

				//var newbearing = geo.bearing([parseFloat(PrevCoordinates.Longitude),parseFloat(PrevCoordinates.Latitude)],ourcenter.features[0].geometry.coordinates);
				var d = geo.distance([parseFloat(PrevCoordinates.Longitude),parseFloat(PrevCoordinates.Latitude)],ourcenter.features[0].geometry.coordinates);

				//console.log('bearing: ' + newbearing)
				//console.log('distance: ' + d)

				//**** If there are new data
        	          	if (newbearing != 0 && d > 0.001)
        	              	{
        	              		//**** Set the new bearing on the map
					map.setBearing(newbearing);
        	              	}
				//**** Set the new coords as the center of the map
        	          	map.panTo(ourcenter.features[0].geometry.coordinates);
        	        } //**** End if it is not the first loop

		} //**** End if we are in street view mode
	//} //**** End if the IMEI is found

        j++;
	
	//**** Repeat the simulate function every 1s infinitely
        if (infinity) setTimeout(simulate, 1000,marker,tbord);

} //**** End of recursive function for the online html
