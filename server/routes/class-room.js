const querystring = require('querystring')
const fs = require('fs')
const path = require('path')

const dataFolder = path.join(__dirname, 'data')
const dataFile = path.join(__dirname, './data/class-room.json')
const isExistDataFile = fs.existsSync(dataFile)
let rooms = []
try {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder)
  }
  if (isExistDataFile) {
    rooms = require(dataFile)
  } else {
    writeFile()
  }
} catch (error) {}

function writeFile() {
  // fs.writeFile(dataFile, JSON.stringify(rooms, null, 2), { encoding: "utf8" }, () => {})
}

const room = {
  roomId: String,
  roomName: String,
  whiteScreen: {
    uuid: String,
    roomToken: String
  }
}

function getRoutes(app, cors) {
  app.options('/class-room', cors())
  app.options('/class-room/rooms', cors())
  app.post('/class-room/rooms', cors(), (req, res) => {
    const { query, body } = req
    console.log(query, body)
    try {
      if (body.roomId && !rooms.map(t => t.roomId).includes(body.roomId)) {
        rooms.push(body)
      }
    } catch (error) {}
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(body))

    writeFile()
  })

  app.put('/class-room/rooms', cors(), (req, res) => {
    const { query, body } = req
    console.log(query, body)
    try {
      if (body.roomId) {
        const index = rooms.map(t => t.roomId).indexOf(body.roomId)
        if (index > -1) {
          rooms[index] = Object.assign(rooms[index], body)
        }
      }
    } catch (error) {}
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
    res.setHeader('Content-Type', 'application/json')
    res.send(rooms)
    
    writeFile()
  })

  app.get('/class-room/rooms', cors(), (req, res) => {
    const { query, body } = req
    console.log(query, body)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
    res.setHeader('Content-Type', 'application/json')
    
    if (body.roomId) {
      const index = rooms.map(t => t.roomId).indexOf(body.roomId)
      if (index > -1) {
        res.send(JSON.stringify(rooms[index]))
      }
    } else {
      res.send(JSON.stringify(rooms))
    }
    
    writeFile()
  })

  app.delete('/class-room/rooms', cors(), (req, res) => {
    const { query, body } = req
    console.log(query, body)
    try {
      if (body.roomId) {
        const index = rooms.map(t => t.roomId).indexOf(body.roomId)
        if (index > -1) {
          rooms.splice(index, 1)
        }
      }
    } catch (error) {}

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(body))
    
    writeFile()
  })
}

module.exports = getRoutes
