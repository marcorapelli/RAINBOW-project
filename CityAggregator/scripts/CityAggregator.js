//**** Initializing the io library
const socket = io();

//**** Initializing variables
var i = 0;
var j = 0;
var prevMsg = null;
var lastMsgTime = 0;
var prevFlag = 0;
var prevA = 0;
var prevB = 0;
var prevAngle = 0;
var rsu_marker = null;
var dog_marker = null;
var veh_colors = [];
var veh_markers = [];
var polygon_shapes = {
			"type": "geojson",
			"data": {
					"type": "FeatureCollection",
					"features": []
				}
			 };
var empty_coords = displayGeoNetArea([7.683933,45.069106], 0, 0, 0, 3);



//**** Recursive function for the online html
function CityAggregator() {
	
	//**** If it is the first iteration of CityAggregator, verify that the socket has been opened correctly
	if(i==0)
	{
		console.log('Connected on', window.location.origin)
		console.log('Socket opened:', socket.connected);
	}


	//**** If the socket has been opened
	if(socket.connected)
	{
		//**** Function called upon the reception of a message through the socket (main function)
		socket.on('message', function(message) {

			//**** If the new message is different from the previous one
			if(prevMsg!=message)
			{
				//ALL THE APP GOES HERE

				//console.log(message);

				//**** Parse the message
				latency=message.split(';')[0].trim();
				msgType=message.split(';')[1].trim();
				lat=parseFloat(message.split(';')[2].trim());
				long=parseFloat(message.split(';')[3].trim());
				stationID=parseInt(message.split(';')[4].trim());

				//**** If message is a DENM
				if(msgType=='DENM')
				{
					//**** Parse the message
					timestamp=Date.parse(latency);
					areaData=message.split(';')[5].trim();
					stationLat=parseFloat(areaData.split(',')[0].trim());
					stationLong=parseFloat(areaData.split(',')[1].trim());
					areaFlag=parseInt(areaData.split(',')[2].trim());
					areaLat=parseFloat(areaData.split(',')[3].trim());
					areaLong=parseFloat(areaData.split(',')[4].trim());
					areaA=parseInt(areaData.split(',')[5].trim());
					areaB=parseInt(areaData.split(',')[6].trim());
					areaAngle=parseInt(areaData.split(',')[7].trim());
					duration=parseInt(areaData.split(',')[8].trim());

					//console.log('DENM',lat,long,stationLat,stationLong,areaLat,areaLong,duration);



					////// RSU AND DOG MARKERS //////


					//**** Set the center of the map in the RSU coords
					ourcenter.features[0].geometry.coordinates = [stationLong,stationLat];
					map.setZoom(16);
					map.panTo(ourcenter.features[0].geometry.coordinates);

					//**** Create the RSU feature
					var feature_rsu = {};
					feature_rsu['type'] = 'Feature';
					feature_rsu['geometry'] = {
									'type': 'Point',
									'coordinates': [stationLong,stationLat]
								};
					feature_rsu['properties'] = {
									'creationTime': timestamp,
									'duration': duration
								};


					//**** Check if the RSU has already been printed
					var found=-1;
					for(var h=0;h<rsu['features'].length;h++)
					{
						//**** Variables for comparison
						var rsuLong=rsu['features'][h].geometry.coordinates[0];
						var rsuLat=rsu['features'][h].geometry.coordinates[1];

						//**** If I found an RSU feature with the same coords of the new one, then it has already been printed
						if(rsuLong==stationLong && rsuLat==stationLat)
							found=h;
					} //**** End check if the RSU has already been printed


					//**** If the new RSU has not already been printed
					if(found==-1)
					{
						//**** Append the new RSU feature in the FeatureCollection of the RSUs
						rsu['features'].push(feature_rsu);

						

						//**** For each feature in the FeatureCollection of the RSUs
						rsu.features.forEach(function(elem) {
							//**** Create two markers with the RSU image and a dog image and print them on the map
							var el = document.createElement('div');
							el.className = 'rsu_cam';
							rsu_marker = new mapboxgl.Marker(el).setLngLat(elem.geometry.coordinates);
							rsu_marker.addTo(map);

							var el2 = document.createElement('div');
							el2.className = 'dog';
							dog_marker = new mapboxgl.Marker(el2).setLngLat([long,lat]);
							dog_marker.addTo(map);
						});

					} //**** End if the new RSU has not already been printed
					//**** If the new RSU has already been printed
					else
						//**** Update its creation time
						rsu['features'][found].properties.creationTime=timestamp;


					////// END RSU AND DOG MARKERS //////

					////// GEO AREA POLYGONS //////


					//**** Create the coordinates for the polygon area
					var coords_poly = displayGeoNetArea([areaLong,areaLat], areaA, areaB, areaAngle, areaFlag);
					
					//**** Create the polygon feature
					var feature_poly = {};
					feature_poly['type'] = 'Feature';
					feature_poly['geometry'] = {
									'type': 'Polygon',
									'coordinates': coords_poly
								};
					feature_poly['properties'] = {
									'creationTime': timestamp,
									'duration': duration
								 };
					
					//**** Check if the area has already been printed
					var found=-1;
					for(var h=0;h<polygon_shapes.data['features'].length;h++)
					{
						//**** Variables for comparison
						var points=polygon_shapes.data['features'][h].geometry.coordinates[0].length;
						var firstLong=polygon_shapes.data['features'][h].geometry.coordinates[0][0][0];
						var firstLat=polygon_shapes.data['features'][h].geometry.coordinates[0][0][1];
						var lastLong=polygon_shapes.data['features'][h].geometry.coordinates[0][points-1][0];
						var lastLat=polygon_shapes.data['features'][h].geometry.coordinates[0][points-1][1]

						//**** If I found a polygon with the same number of points and same first and last coords of the new one
						//**** Then I can assume that the new polygon has already been printed
						if(points==coords_poly[0].length)
							if(firstLat==coords_poly[0][0][1] && firstLong==coords_poly[0][0][0] && lastLat==coords_poly[0][points-1][1] && lastLong==coords_poly[0][points-1][0])
								found=h;

					} //**** End check if the area has already been printed


					//**** If the new polygon has not already been printed
					if(found==-1)
					{

						//**** Check if there is an empty feature and if all features are empty
						var empty_pos=-1;
						var all_empty=0;
						for(var h=0;h<polygon_shapes.data['features'].length;h++)
							if(polygon_shapes.data['features'][h].geometry.coordinates==empty_coords)
								empty_pos=h;
							else
								all_empty=1;

						//**** If there is no empty feature, then add a new feature
						if(empty_pos==-1)
							polygon_shapes.data['features'].push(feature_poly);
						//**** If there is an empty feature
						else
						{
							//**** If features are not all empty, then update the empty one with the new feature
							if(all_empty==1)
								polygon_shapes.data['features'][empty_pos]=feature_poly;
							//**** If features are all empty, then delete all the features and add the new one
							else
							{
								polygon_shapes.data['features']=[];
								polygon_shapes.data['features'].push(feature_poly);
							}
						} //**** End if there is an empty feature

						//**** Display the polygons on the map
						map.getSource('polygon').setData(polygon_shapes.data);

					} //**** End if the new polygon has not already been printed
					//**** If the new polygon has alredy been printed
					else
						//**** Update its creation time
						polygon_shapes.data['features'][found].properties.creationTime=timestamp;
					
				} //**** End if message is a DENM


				////// END GEO AREA POLYGONS //////

				////// VEHICLE MARKERS //////


				//**** If message is a CAM
				if(msgType=='CAM')
				{
					latency=parseInt(latency);

					//console.log(latency,msgType,stationID,lat,long);

					//**** Create the vehicle feature
					var feature_veh = {};
					feature_veh['type'] = 'Feature';
					feature_veh['id'] = stationID;
					feature_veh['geometry'] = {
									'type': 'Point',
									'coordinates': [long,lat]
								};
					feature_veh['properties'] = {
									'creationTime': Date.now()
								};


					//**** Check if the new vehicle coords have already been printed
					var found = -1;
					for(var h=0;h<vehicle.data['features'].length;h++)
					{
						//**** Variables for comparison
						var vehID=vehicle.data['features'][h].id;
						var vehLat=vehicle.data['features'][h].geometry.coordinates[1];
						var vehLong=vehicle.data['features'][h].geometry.coordinates[0];

						//**** If I found a vehicle with the same ID and coords of the new one, then it has already been printed
						if(vehID==stationID && vehLat==lat && vehLong==long)
							found=h;
					} //**** End check if the new vehicle coords have already been printed


					//**** If the new vehicle coords have not already been printed
					if(found==-1)
					{
						//**** Check if the new vehicle coords belong to a new vehicle
						var found=-1;
						for(var h=0;h<vehicle.data['features'].length;h++)
						{
							var vehID=vehicle.data['features'][h].id;

							if(vehID==stationID)
								found=h;
						}


						//**** If the new vehicle coords belong to a new vehicle
						if(found==-1)
						{
							//**** Choose a random color for the vehicle
							var colors = ['veh1','veh2','veh3','veh4','veh5']
							var index=Math.floor(Math.random() * colors.length);


							//**** Check if there is an empty feature and if all features are empty
							var empty_pos=-1;
							var all_empty=0;
							for(var h=0;h<vehicle.data['features'].length;h++)
								if(vehicle.data['features'][h].geometry.coordinates.length==0)
									empty_pos=h;
								else
									all_empty=1;

							//**** If there is no empty feature, then create a new vehicle feature and vehicle marker
							if(empty_pos==-1)
							{
								vehicle.data['features'].push(feature_veh);
								veh_colors.push(colors[index]);
							}
							//**** If there is an empty feature
							else
							{
								//**** If features are not all empty, then update the empty one with the new feature and marker
								if(all_empty==1)
								{
									vehicle.data['features'][empty_pos]=feature_veh;
									veh_colors[empty_pos]=colors[index];
								}
								//**** If features are all empty, then delete all the features and markers and add the new ones
								else
								{
									vehicle.data['features']=[];
									vehicle.data['features'].push(feature_veh);
									veh_colors=[];
									veh_colors.push(colors[index]);
								}
							} //**** End if there is an empty feature

						}
						//**** If the new vehicle coords belong to a vehicle already existing
						else
						{
							//**** Update its coordinates and its creation time
							vehicle.data['features'][found].geometry.coordinates[0]=long;
							vehicle.data['features'][found].geometry.coordinates[1]=lat;
							vehicle.data['features'][found].properties.creationTime=Date.now();
						}

						//**** Print the vehicle markers
						for(var h=0;h<vehicle.data['features'].length;h++)
						{
							//**** Remove the previous position if any
							if(veh_markers[h]!=undefined)
								veh_markers[h].remove();

							//**** If not an empty feature, then print the new vehicle position on the map
							if(vehicle.data['features'][h].geometry.coordinates.length!=0)
							{
								var el3 = document.createElement('div');
								el3.className = veh_colors[h];
								elem = new mapboxgl.Marker(el3).setLngLat(vehicle.data['features'][h].geometry.coordinates);
								veh_markers[h]=elem;
								elem.addTo(map);
							}
						} //**** End print the vehicle markers

					} //**** End if the new vehicle coords have not already been printed
					//**** If the new vehicle coords have already been printed
					else
						//**** Update its creation time
						vehicle.data['features'][found].properties.creationTime=Date.now();

				} //**** End if message is a CAM


				////// END VEHICLE MARKERS //////
				
				
			} //**** End if the new message is different from the previous one

		}); //**** End socket.on(message)


		////// REFRESH FEATURES //////


		//**** Check for all the RSU features the remaining lifetime
		for(var h=0;h<rsu['features'].length;h++)
		{
			//**** If an RSU feature has expirated lifetime
			if(Date.now()-rsu['features'][h].properties.creationTime>rsu['features'][h].properties.duration*1000)
			{
				//**** Remove the RSU marker and the dog marker from the map
				rsu_marker.remove();
				rsu_marker = null;

				dog_marker.remove();
				dog_marker = null;

				//**** Delete the RSU feature from the FeatureCollection of the RSUs
				rsu['features'].pop();
			}
		} //**** End check for all the RSU features the remaining lifetime

		//**** Check for all the polygons the remaining lifetime
		for(var h=0;h<polygon_shapes.data['features'].length;h++)
		{
			//**** If a polygon has expirated lifetime
			if(Date.now()-polygon_shapes.data['features'][h].properties.creationTime>polygon_shapes.data['features'][h].properties.duration*1000)
			{
				//**** Update it with an empty feature
				polygon_shapes.data['features'][h].geometry.coordinates=empty_coords;
				//**** Display the polygons on the map
				map.getSource('polygon').setData(polygon_shapes.data);
			}
		} //**** End check for all the polygons the remaining lifetime


		//**** Check for all the vehicles the remaining lifetime
		for(var h=0;h<vehicle.data['features'].length;h++)
		{
			//**** If a vehicle has expirated lifetime
			if(Date.now()-vehicle.data['features'][h].properties.creationTime>10000)
			{
				//**** Update it with an empty feature
				vehicle.data['features'][h].geometry.coordinates=[];
				vehicle.data['features'][h].id=-1;

				//**** Remove the vehicle marker
				veh_markers[h].remove();
			}
		} //**** End check for all the vehicles the remaining lifetime


		////// END REFRESH FEATURES //////


	} //**** End if socket has been opened


	i++;


	//**** Repeat the function every second
	setTimeout(CityAggregator, 1000);
} //**** End of recursive function for the online html
