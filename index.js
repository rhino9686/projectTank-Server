let xbeeRx = require('xbee-rx');
let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');

var C = xbee_api.constants;

main = function() {
  var xbeeAPI = new xbee_api.XBeeAPI({
    // default options:
    api_mode: 1,              // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
    module: "any",       // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!

  });

  var serialport = new SerialPort("/dev/tty.usbserial-AL02BYQV", {
    baudRate: 9600,
    parser: xbeeAPI.rawParser()
  });

  //connect the data with pipes
  serialport.pipe(xbeeAPI.parser);
  xbeeAPI.builder.pipe(serialport);


  serialport.on("open", function() {
    xbeeAPI.builder.write(frame_obj);
  });


  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "DL",
    commandParameter: [],
  };

    // All frames parsed by the XBee will be emitted here
  xbeeAPI.parser.on("data", function(frame) {
    console.log(">>", frame);
    raw_frame = frame;

    serialport.close();
  
  });

  /* All frames parsed by the XBee will be emitted here
  serialport.on("close", function(frame) {
    console.log("eeeee");
  }); */

}

AT_request = function() {


  
}



main();





