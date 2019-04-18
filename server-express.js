const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

var myHealth = 300;


var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200       // some legacy browsers (IE11, various SmartTVs) choke on 204 
  }


app.use(bodyParser.json());
app.use(cors(corsOptions));

app.listen(8000, () => {
    console.log('Server started!')
  })



  app.route('/api/cats/:name').get((req, res) => {
    const requestedCatName = req.params['name']
    res.send({ name: requestedCatName })
  })

  app.route('/api/cats/:name').put((req, res) => {
    res.send(200, req.body)
  })



  app.route('/api/cats/:name').delete((req, res) => {
    res.sendStatus(204)
  })

  app.route('/api/tankOne/').get((req, res) => {
    res.send({ health: myHealth });
    myHealth--;
  })

  app.route('/api/tankTwo/').get((req, res) => {
    res.send({ health: myHealth });
    myHealth --;
  })

