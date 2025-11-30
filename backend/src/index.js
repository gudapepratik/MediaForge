import {app, sessionMiddleware} from './app.js'
import { connectDB } from './config/db.js'
import {createServer} from 'node:http'
import { Server } from 'socket.io';
import passport from 'passport';
import initSocketio from './socketio/socket.js';
import {createAdapter} from '@socket.io/redis-adapter'
import IORedis from 'ioredis';

const server = createServer(app);

// redis adapter setup
// const pubClient = new IORedis({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD
// })

const pubClient = new IORedis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

// socket.io server
// const io = new Server(server, {cors: {origin: ['*'], credentials: true, methods: ['GET', 'POST']}});

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  },
  adapter: createAdapter(pubClient, subClient)
})

// authenticates the socket client
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
})

io.use((socket, next) => {
  passport.initialize()(socket.request, {}, next);
})

// adds user as socket.request.user
io.use((socket, next) => {
  passport.session()(socket.request, {}, next);
})

connectDB()
.then(() => {
    const port = process.env.PORT || 3000;
    // app.listen(port, () => {
    //     console.log(`Server running on port ${port || 3000}`)
    // })
    server.listen(port, () => {
        console.log(`Server running on port ${port || 3000}`)
    })

    initSocketio(io);
})    
.catch((error) => {
    console.log("Error occurred while connecting to Postgres")
})  

export {io};