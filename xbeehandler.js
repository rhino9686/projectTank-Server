//Xbee/Serialport imports
let xbee_api = require('xbee-api');
var SerialPort = require('serialport');
var util = require('util');
var C = xbee_api.constants;

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

app.listen(8000, () => {
  console.log('Server started!')
})


//local Tank Data
var tankOneHealth = 100;
var tankTwoHealth = 100;


//My Class for xBeeHandler
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
    this.serport = serialport;
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
      this.serport = serialport;
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
     // console.log(">>", frame);
      callback(frame);
      
    
    });

  }//receive_data

  send_message(typeNum, colorNum, tankStr, callback) {

    let frame_obj = {
      type: 0x01, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_16 
      id: 0x01, // optional, nextFrameId() is called per default
      destination16: "ffff",
      options: 0x00, // optional, 0x00 is default
      data: "Setup Command!\0" // Can either be string or byte array.
    }

    if (tankStr === "One") {
      frame_obj['destination16'] = 'ffff';
    } 
    else if (tankStr === "Two") {
      frame_obj['destination16'] = 'aaad';
    }
    console.log("attempting send");

    let myData = new Array(16);
    myData[4] = typeNum;

    myData[6] = colorNum;

    frame_obj['data'] = myData;
    //console.log(this.xbeeAPI.builder);
    this.xbeeAPI.builder.write(frame_obj);
    callback("Setup sent to Tank!");

  }


}

var GlobalXbeePtr;

poll = () => {
  setTimeout(() => {
    let xBee = new xBeeHandler();
    GlobalXbeePtr = xBee;
    xBee.receive_data( (res) => 
    {
     // console.log(res); //For Debugging
      let frame = res;
      if ( !('data' in frame)) {
        return;
      }
      let buff = frame['data'];
      let addr = frame['remote64'];
      console.log(addr);
      let health = buff[4];
      
      if (addr === '0013a200416a1dfa') {
        console.log('Tank One health updated');
        tankOneHealth = health;
      }
      else {
        console.log('Tank Two health updated');
        tankTwoHealth = health;
      }
      console.log("health: "+ health);
    });
    
  
  }, 90 );
}

runXBees = function() {

  
setTimeout(() => {
  let xBee2 = new xBeeHandler();
  let testBuffer2 = xBee2.API_request("F", (res) => console.log("API sent"));

}, 90);


setTimeout(() => {
  let xBee3 = new xBeeHandler();
  let testBuffer3 = xBee3.receive_data( (res) => console.log("Packet Received"));

}, 1000 );

}


app.route('/api/tankOne/').get((req, res) => {
  res.send({ health: tankOneHealth });
})

app.route('/api/tankTwo/').get((req, res) => {
  res.send({ health: tankTwoHealth });
})

app.route('/api/tankOne/setup/').post((req, res) => {
  console.log("Setting up Tank One!");
  
  let typeNum = req.body['type'];
  let colorNum = req.body['color'];
  console.log("Type: ", typeNum);
  console.log( "Color: ", colorNum);

  GlobalXbeePtr.send_message(typeNum, colorNum, "One", (res) => {
      console.log(res);
  } );

  res.status(200).send(req.body);
})

app.route('/api/tankTwo/setup/').put((req, res) => {
  console.log("Setting up Tank Two!")

  let typeNum = req.body['type'];
  let colorNum = req.body['color'];
  console.log("Type: ", typeNum);
  console.log( "Color: ", colorNum);

  GlobalXbeePtr.send_message(typeNum, colorNum, "Two", (res) => {
    console.log(res);
  } );
  res.status(200).send(req.body);
})

poll();
