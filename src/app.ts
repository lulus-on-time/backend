import express, {Express, Request, Response} from "express"
import {  WebSocketServer  } from "ws"
import connectionEventListener from './positioning/wss-listener/connection'

const app: Express = express()
const port = 3000
const wsPort = 8080

app.get('/', async (req: Request, res: Response) => {
    res.status(404).send({
        'code': 404,
        'errors': {
            'reason': 'This server only accepts websocket connections at port 8080'
        },
        'data': null
    })
})

app.listen(port, () => {
    console.log(`Find Myself server listening on port: ${port}`)
})

const wss = new WebSocketServer({
    port: wsPort
})

wss.on('connection', connectionEventListener)