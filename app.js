var SerialPort = require("serialport").SerialPort;
var request = require('request');

var pandoraUrl = "https://pandora0.herokuapp.com/temperatures";

var serialport = new SerialPort("COM3", {
	baudRate: 9600,
	parser: SerialPort.parsers.readline('\n')
});

serialport.on('open', function(){
  console.log('Serial Port Opend');
  serialport.on('data', function(data){
      console.log(data);
	  if (data != 1) {
			var requestOptions = {
				url: pandoraUrl,
				method: "GET",
				json: true,
				headers: {
					"Content-Type": "application/json"
				}
			};
			request(requestOptions, function (error, response, body) {
				if (error) {
					console.log('Cant get temperatures:', error);
				} else {
					var id = body.results[0].id + 1;
					console.log("Next temp id:"+ id);
					
					  var tempObj = 
					  {
						"temp":data,
						"id": id
					  };
					  var requestOptions = {
							url: pandoraUrl,
							method: "POST",
							json: tempObj,
							headers: {
								"Content-Type": "application/json"
							}
						};
						request(requestOptions, function (error, response, body) {
							if (error) {
								console.log('Failed to send new temp:', error);
							} else {
								console.log("Temp updated successfully");
								var requestOptions = {
									url: pandoraUrl,
									method: "DELETE",
									json: true,
									headers: {
										"Content-Type": "application/json"
									}
								};
								request(requestOptions, function (error, response, body) {
									if (error) {
										console.log('Failed to delete old temp:', error);
									} else {
										console.log("Deleted oldest temp record");
									}
								});
							}
						});
				}
			});
	  }
  });
});
