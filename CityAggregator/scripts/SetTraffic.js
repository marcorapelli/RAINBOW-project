function SetTraffic(hour) {

	var date = new Date();
	var newHour= date.getHours();
	//var newHour=hour+1
	var nextHour=newHour+1;

	if (hour != newHour) {


		if (hour != 25) {

			var hour2 = hour+1;
			
			var idRed = 'Red' + hour + '_' + hour2;
			var idOrange = 'Orange' + hour + '_' + hour2;
			var idYellow = 'Yellow' + hour + '_' + hour2;

			map.removeLayer(idRed);
			map.removeLayer(idOrange);
			map.removeLayer(idYellow);
		}
		var TrafficRed = 'TrafficRed' + newHour + '_' + nextHour;
		var TrafficOrange = 'TrafficOrange' + newHour + '_' + nextHour;
		var TrafficYellow = 'TrafficYellow' + newHour + '_' + nextHour;

		map.addLayer(eval(TrafficRed));
		map.addLayer(eval(TrafficOrange));
		map.addLayer(eval(TrafficYellow));
	}

	setTimeout(SetTraffic, 3000, newHour);
}
