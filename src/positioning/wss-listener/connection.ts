import WebSocket from "ws"

const listener = (
    ws: WebSocket,
    request: Request
) => {
    console.log("New WebSocket Connection Started")


    ws.on('message', (data, isBinary) => {
        if (isBinary) {
            ws.send(JSON.stringify({
                'errors': {
                    'reason': 'Not accepting binary data.'
                },
                'data': null,
            })) 
            return
        }

        ws.send(JSON.stringify({
            'errors' : null,
            'data': {
                'location': `Message received: ${data.toString()}`
            }
        }
        ))
        console.log(`Message received: ${data.toString()}`)
    })

    ws.on('close', (code, reason) => {
        console.log({
            'code' : `${code}`,
            'reason': `${reason}`
        })
    })

    ws.on('error', (err) => {
        console.error({
            err
        })
    })
}

export default listener