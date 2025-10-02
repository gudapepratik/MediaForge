import {Server} from 'socket.io'

// rooms = jobId -> [client1, client2, ...]
// user info can be found in io.request.user
const initSocketio = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket client connected ${socket.id}`)

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

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason || "");
    })
  })
}

export default initSocketio;