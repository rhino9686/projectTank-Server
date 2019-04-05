let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');

var C = xbee_api.constants;

AT_request = function(command_in, serialport_in, xbeeAPI_in ) {

  let frame_obj = { 
    type: C.FRAME_TYPE.AT_COMMAND,
    command: command_in,
    commandParameter: [],
  };

  serialport_in.on("open", function() {
    xbeeAPI_in.builder.write(frame_obj);
  });


  xbeeAPI_in.parser.on("data", function(frame) {
    console.log(">>", frame);
    const return_frame = frame;

    serialport_in.close();
    return return_frame;
  
  });
     
  // All frames parsed by the XBee will be emitted here
  serialport_in.on("close", function(frame) {
    console.log("transaction completed");
  }); 

}

main = function() {

  //initialise our local xbee device
  var xbeeAPI = new xbee_api.XBeeAPI({
    // default options:
    api_mode: 1,              // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
    module: "any",       // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
  });

 // initialize our local serialport
 // make sure serialport is open first
  var serialport;

  try {

    serialport = new SerialPort("/dev/tty.usbserial-AL02BYQV", {
      baudRate: 9600,
      parser: xbeeAPI.rawParser()
      ((err) => {console.log("error!") })
    });

  }
  catch(err) {
    console.log("Error: serialport not found at specified location!");
    return;
  }
 

  //connect the data with pipes
  serialport.pipe(xbeeAPI.parser);
  xbeeAPI.builder.pipe(serialport);

  //first AT_request
  let testBuffer = AT_request( "MY", serialport, xbeeAPI );

  //second AT_request
  testBuffer = AT_request( "DL", serialport, xbeeAPI );

  return;
}

//run main program
main();





