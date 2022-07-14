/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { Express, json, Request, Response } from 'express';
import { Server, OPEN, WebSocket } from 'ws';

const app: Express = express();

app.use(json());

let ws: WebSocket = null;
// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new Server({ noServer: true });
wsServer.on('connection', (socket) => {
  ws = socket;
  socket.on('message', (message) => {
    wsServer.clients.forEach(function each(client) {
      if (client.readyState === OPEN) {
        setTimeout(function () {
          client.send(
            Buffer.from(
              JSON.stringify({
                source: 'server',
                content: 'response from server',
              })
            ),

            { binary: false }
          );
        }, 1000);
      }
    });

    console.log(message.toString());
  });
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});

app.post('/message', (req: Request, res: Response) => {
  console.log('recieved message in post: ', req.body.message);
  ws?.send(
    Buffer.from(
      JSON.stringify({
        source: 'server',
        content: { timestamp: new Date(), message: req.body.message },
      })
    ),

    { binary: false }
  );
  res.sendStatus(200);
});

const port = process.env.port || 5000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
