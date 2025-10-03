import {Server} from 'socket.io'

const x = new Server();

// rooms = jobId -> [client1, client2, ...]
// user info can be found in io.request.user
const initSocketio = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket client connected ${socket.id}`)

    socket.on('joinUserRoom', (callback) => {
      const userId = socket.request?.user?.id;
      if(!userId) {
        callback?.({ok: false, message: "User is Not Authenticated"})
        socket.disconnect();
        return;
      }
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected on socket ${socket.id}`);
      callback?.({ok: true});
    })

    socket.on('leaveUserRoom', async () => {
      const userId = socket.request?.user?.id;
      if(!userId) {
        callback?.({ok: false, message: "User is Not Authenticated"})
        socket.disconnect();
        return;
      }
      await socket.leave(`user:${userId}`);
      console.log(`client ${userId} left user room`)
    })

    socket.on('joinTranscodeRoom', (jobId, callback) => {
      if(callback !== 'function') {
        return socket.disconnect(true);
      }

      if (!jobId) 
        return callback?.({ ok: false, reason: "missing jobId" });

      // add to the room
      socket.join(jobId);

      callback?.({ok: true});
    })

    socket.on('leaveJob', async (jobId) => {
      await socket.leave(jobId);
    })

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason || "");
    })
  })
}

export default initSocketio;