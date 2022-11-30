//**** Function to create the polygon of the high priority area defined in the GeoNet header
//**** Inputs: coords of a center point, two distances in meters (with A>B, otherwise it swap them), an offset angle (in degrees from the North, clockwise direction) and a flag
//**** If flag==0 it displays a circle with radius and center defined (B and angle are ignored)
//**** If flag==1 it displays a rectangle with center, distance from short/from long sides and a rotation angle defined
//**** If flag==2 it displays an ellipse with center, major/minor semiaxis and a rotation angle defined (TO DO!!)
//**** Else it delete the previous displayed figure
var displayGeoNetArea = function(center, semiAxis_A, semiAxis_B, angle, flag) {
	// Semiaxis A has to be the greater
	if(semiAxis_A<semiAxis_B)
	{
		var swap=semiAxis_A
		semiAxis_A=semiAxis_B
		semiAxis_B=swap
	}

	// Read the coordinates points
	var coords = {
		latitude: center[1],
		longitude: center[0]
	};

	// Convert semiaxis from meters to Km
	semiAxis_A = semiAxis_A/1000;
	semiAxis_B = semiAxis_B/1000;

	// Convert offset angle from ETSI standard to goniometric standard
	// ETSI standard: North=0deg, East=90deg, etc.
	// Goniometric standard: East=0rad, North=pi/2rad, etc.
	angle_rad=angle*(Math.PI/180);
	angle_offset=(Math.PI/2)-angle_rad


	var ret = [];
	var theta, x, y;

	// If flag==0 --> Circular Area
	if(flag==0)
	{
		// Polygon with 64 points or more is a circle
		points = 64;

		// Define distances in Lat Long format from the center with respect to radius
		var distanceX = semiAxis_A/(111.320*Math.cos(coords.latitude*Math.PI/180));
		var distanceY = semiAxis_A/110.574;

		// For every point
		for(var i=0; i<points; i++)
		{
			// Set the angle rotation and compute points to display
			theta = (i/points)*(2*Math.PI);
			x = distanceX*Math.cos(theta);
			y = distanceY*Math.sin(theta);

			// Add the point to the polygon
			ret.push([coords.longitude+x, coords.latitude+y]);
		}
		// Last point of the polygon has to be the same as the first one
		ret.push(ret[0]);
	} // End if flag==0 --> Circular Area

	// If flag==1 --> Rectangular Area
	else if(flag==1)
	{
		// Number of points of a rectangle
		points = 4;

		// From the distances from the short and long edge compute the semidiagonal
		semiDiag=Math.sqrt(semiAxis_A*semiAxis_A+semiAxis_B*semiAxis_B);

		// Define distances in Lat Long format from the center with respect to the semidiagonal
		var distanceX = semiDiag/(111.320*Math.cos(coords.latitude*Math.PI/180));
		var distanceY = semiDiag/110.574;

		// Compute the angles between the East (East=0deg, North=90deg, etc.) and the first semidiagonal
		theta_offset1=Math.asin(semiAxis_A/semiDiag);
		theta_offset2=Math.PI/2-theta_offset1;	

		// For every point
		for(var i=0; i<points; i++)
		{
			// Set the angles for every point considering the additional angle offset
			theta = (i/points)*(2*Math.PI)+angle_offset;

			// Set the angle rotation and compute points to display
			if(i==0 || i==2)
			{
				theta_off = theta+theta_offset2;

				x = distanceX*Math.cos(theta_off);
				y = distanceY*Math.sin(theta_off);
			}
			else
			{
				theta_off = theta+theta_offset1;

				x = distanceX*Math.cos(theta_off);
				y = distanceY*Math.sin(theta_off);
			}

			// Add the point to the polygon
			ret.push([coords.longitude+x, coords.latitude+y]);
		}
		// Last point of the polygon has to be the same as the first one
		ret.push(ret[0]);
	} // End if flag==1 --> Rectangular Area

	// If flag==2 --> Ellipsoidal Area
	else if(flag==2)
	{	
		var radius_earth = 6378;
		// One step per angle
		steps = 360;
		for (var i = 0; i < steps; i++) {
			// Rotations of -theta_offset to respect ETSI convention (North-to-West)
   			delta_x = semiAxis_A*Math.sin(i*Math.PI/180);
   			delta_y = semiAxis_B*Math.cos(i*Math.PI/180);
   			delta_x_rot = delta_x*Math.cos(angle_offset) - delta_y*Math.sin(angle_offset);
   			delta_y_rot = delta_x*Math.sin(angle_offset) + delta_y*Math.cos(angle_offset);
   			// Transformations of coordinates from meters to latitude/longitude following this formula:
   			
   			//new_latitude  = latitude  + (dy / r_earth) * (180 / pi);
			//new_longitude = longitude + (dx / r_earth) * (180 / pi) / cos(latitude * pi/180);
			
   			delta_long = (delta_x_rot/radius_earth)*(180/Math.PI)/Math.cos(coords.latitude*Math.PI/180);
   			delta_lat = (delta_y_rot/radius_earth)*(180/Math.PI);
   			
			ret.push([coords.longitude+delta_long, coords.latitude+delta_lat]);	
		}	

		ret.push(ret[0]);
	} // End if flag==2 --> Ellipsoidal Area

	// Else --> Remove the area (display a 2 points polygon)
	else
	{
		// A 2 points polygon is not displayed
		points = 2;

		// Define distances in Lat Long format from the center with respect to the semidiagonal
		var distanceX = semiAxis_A/(111.320*Math.cos(coords.latitude*Math.PI/180));
		var distanceY = semiAxis_A/110.574;
		
		
		// For every point
		for(var i=0; i<points; i++)
		{
			// Set the angle rotation and compute points to display
			theta = (i/points)*(2*Math.PI)+angle_offset;
			x = distanceX*Math.cos(theta);
			y = distanceY*Math.sin(theta);

			// Add the point to the polygon
			ret.push([coords.longitude+x, coords.latitude+y]);
		}
		// Last point of the polygon has to be the same as the first one
		ret.push(ret[0]);
	} // End else --> Remove the area (display a 2 points polygon)

	// Return the coordinates to create the polygon
	return [ret];

} // End displayGeoNetArea function
