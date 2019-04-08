let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');

var C = xbee_api.constants;


class xBeeHandler {

  constructor() {
    //initialise local xbee device
    this.xbeeAPI = new xbee_api.XBeeAPI({
      // default options:
      api_mode: 1,         // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
      module: "any",       // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
    });

    this.serialport = null;
  }

  initSerial() {
      // initialize our local serialport
      // make sure serialport is open first
    try {
      //Options for macbook:
      const usb1 =  "/dev/tty.usbserial-1420";
      const usb2 =  "/dev/tty.usbserial-AL02BYQV";
      const usb3 = "/dev/tty.usbserial-A9QD1BFJ";

      this.serialport = new SerialPort(usb3, {
        baudRate: 9600,
        parser: this.xbeeAPI.rawParser()
        ((err) => {console.log("error!") })
      });

    }
    catch(err) {
      console.log("Error: serialport not found at specified location");
      return false;
    }  

      //connect the data with pipes
    this.serialport.pipe(this.xbeeAPI.parser);
    this.xbeeAPI.builder.pipe(this.serialport);

  }
  

  AT_request(command_in) {

    let success = this.initSerial();

    if (!success) {
      return;
    }

    let frame_obj = { 
      type: C.FRAME_TYPE.AT_COMMAND,
      command: command_in,
      commandParameter: [],
    };
  
    this.serialport.on("open", function() {
      this.xbeeAPI.builder.write(frame_obj);
    });
  
  
    this.xbeeAPI.parser.on("data", function(frame) {
      console.log(">>", frame);
      const return_frame = frame;
  
      this.serialport.close();
      return return_frame;
    
    });
       
    // All frames parsed by the XBee will be emitted here
    this.serialport.on("close", function(frame) {
      console.log("AT transaction completed");
    }); 


  }

  API_request() {

    let success = this.initSerial();
    
    if (!success) {
      return;
    }

    let frame_obj = {
      type: 0x01, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_16 
      id: 0x01, // optional, nextFrameId() is called per default
      destination16: "ab00",
      options: 0x00, // optional, 0x00 is default
      data: "TxData0A" // Can either be string or byte array.
    }
  
    this.serialport.on("open", function() {
      this.xbeeAPI.builder.write(frame_obj);
    });
  
  
    this.xbeeAPI.parser.on("data", function(frame) {
      console.log(">>", frame);
      const return_frame = frame;
  
      this.serialport.close();
  
      return return_frame;
    
    });
       
    // All frames parsed by the XBee will be emitted here
    this.serialport.on("close", function(frame) {
      console.log("transaction completed");
    }); 
  
  }

}



main = function() {

  let xBee = new xBeeHandler();

  //first AT_request
  let testBuffer = xBee.AT_request( "MY");

  return;
}

//run main program
main();





