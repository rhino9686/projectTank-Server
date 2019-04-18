let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');

var C = xbee_api.constants;

main = function() {

  //initialise our local xbee device
  var xbeeAPI = new xbee_api.XBeeAPI({
    // default options:
    api_mode: 1,              // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
    module: "any",       // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!

  });
 // initialize our local serialport
  var serialport = new SerialPort("/dev/tty.usbserial-A9QD1BFJ", {
    baudRate: 57600,
    parser: xbeeAPI.rawParser()
  });

  //connect the data with pipes
  serialport.pipe(xbeeAPI.parser);
  xbeeAPI.builder.pipe(serialport);

  AT_request(serialport, xbeeAPI);


}

AT_request = function(serialport_in, xbeeAPI_in ) {


  var frame_obj = { 
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "DL",
    commandParameter: [],
  };


  serialport_in.on("open", function() {
    xbeeAPI_in.builder.write(frame_obj);
  });



  xbeeAPI_in.parser.on("data", function(frame) {
    console.log(">>", frame);
    let raw_frame = frame;
    console.log(raw_frame['commandData'].readInt32BE());

    let frameParsed = raw_frame['commandData'];

  

   serialport_in.close();
  
  });
     
  // All frames parsed by the XBee will be emitted here
  serialport_in.on("close", function(frame) {
    console.log("transaction completed");
  }); 

}



main();





