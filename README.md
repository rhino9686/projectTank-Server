## Project Tank: Messenger Component

To be able to utilize Javascript libraries for communication with XBee modules, we used the Express library to make a HTTP server. The Server uses the Serialport and Xbee-api libraries to communicate with the xbees, and communicates with an Angular application through HTTP by creating a server on 'localhost:4200'.


### Installing
Just download the files or clone the repo, and go to the root directory and type 'npm install' to download dependencies.


### Running
Use 'node xbeehandler.js' to start the server and use the Angular application to talk to it.

