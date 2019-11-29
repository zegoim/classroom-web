const http = require('http')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const setClassRoomRoutes = require('./routes/class-room')
setClassRoomRoutes(app, cors)

const hostName = '0.0.0.0'
const port = 8092
http.createServer(app)
  .listen(port, hostName, (err) => {
    err ? console.error('error is ', err) : console.log(`Server run on http://${hostName}:${port}`)
  })
