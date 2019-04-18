let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');


//Server Stuff
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(cors(corsOptions));

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200       // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

var C = xbee_api.constants;


class xBeeHandler {

  constructor() {
    //initialise local xbee device
    this.xbeeAPI = new xbee_api.XBeeAPI({
      // default options:
      api_mode: 1,         // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
      module: "any",       // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
    });
    this.C = xbee_api.constants;
  }

  AT_request(command_in, callback) {

      // make sure serialport is open first
      let serialport;
      try {
        //Options for macbook:
        const usb2 =  "/dev/tty.usbserial-AL02BYQV";
        const usb3 = "/dev/tty.usbserial-A9QD1BFJ";
  
        serialport = new SerialPort("/dev/tty.usbserial-AL02BYQV", {
          baudRate: 57600,
          parser: this.xbeeAPI.rawParser()
        });
        
  
      }
      catch(err) {
        console.log("Error: unable to connect to serialport");
        console.log(err)
        return false;
      }  
  
        //connect the data with pipes
      serialport.pipe(this.xbeeAPI.parser);
      this.xbeeAPI.builder.pipe(serialport); 


    let bee = this.xbeeAPI;
    let sport = serialport;

    let frame_obj = { 
      type: C.FRAME_TYPE.AT_COMMAND,
      command: command_in,
      commandParameter: [],
    };
  
    serialport.on("open", function() {
       bee.builder.write(frame_obj);
    });

  
    this.xbeeAPI.parser.on("data", function(frame) {
      console.log(">>", frame);
      serialport.close();
      callback(frame);
    
    });
       
  }

  async API_request(command, callback) {

     // make sure serialport is open first
    let serialport;
     try {
      //Options for macbook:
      const usb2 =  "/dev/tty.usbserial-AL02BYQV";
      const usb3 = "/dev/tty.usbserial-A9QD1BFJ";

      serialport = new SerialPort("/dev/tty.usbserial-AL02BYQV", {
        baudRate: 57600,
        parser: this.xbeeAPI.rawParser()
      });
      
    }
    catch(err) {
      console.log("Error: unable to connect to serialport");
      console.log(err)
      return false;
    }  

      //connect the data with pipes
    serialport.pipe(this.xbeeAPI.parser);
    this.xbeeAPI.builder.pipe(serialport); 


    let bee = this.xbeeAPI;
    let sport = serialport;

    let frame_obj = {
      type: 0x01, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_16 
      id: 0x01, // optional, nextFrameId() is called per default
      destination16: "ffff",
      options: 0x00, // optional, 0x00 is default
      data: "Hello from Server!\0" // Can either be string or byte array.
    }
  
    serialport.on("open", function() {
      bee.builder.write(frame_obj);
    });
  
  
    this.xbeeAPI.parser.on("data", function(frame) {
      console.log(">>", frame);
      serialport.close();
      return frame;
    
    });
       
  
  }//API_Request

  receive_data(callback) {
     // make sure serialport is open first
     let serialport;
     try {
      //Options for macbook:
      const usb2 =  "/dev/tty.usbserial-AL02BYQV";
      const usb3 = "/dev/tty.usbserial-A9QD1BFJ";

      serialport = new SerialPort("/dev/tty.usbserial-AL02BYQV", {
        baudRate: 57600,
        parser: this.xbeeAPI.rawParser()
      });
      
    }
    catch(err) {
      console.log("Error: unable to connect to serialport");
      console.log(err)
      return false;
    }  

      //connect the data with pipes
    serialport.pipe(this.xbeeAPI.parser);
    this.xbeeAPI.builder.pipe(serialport); 

    this.xbeeAPI.parser.on("data", function(frame) {
      console.log(">>", frame);
      serialport.close();
      return frame;
    
    });

  }//receive_data
}



runXBees = function() {

  //first AT_request
  
{
  let xBee = new xBeeHandler();
  let testBuffer = xBee.AT_request( "MY", (res) => { 
    console.log("yeet"); 

  } );
}

setTimeout(() => {
  let xBee2 = new xBeeHandler();
  let testBuffer2 = xBee2.API_request("F", (res) => console.log("yeet2"));

}, 90);


setTimeout(() => {
  let xBee3 = new xBeeHandler();
  let testBuffer3 = xBee3.receive_data( (res) => console.log("yeet3"));

}, 90 );



  return;
}

//run main program
runXBees();





