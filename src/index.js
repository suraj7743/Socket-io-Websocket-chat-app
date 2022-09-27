const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
app.use(express.static("./public"));
const socketIo = require("socket.io");

const io = socketIo(server);
io.on("connection", (socket) => {
  socket.on("inputMessage", (text) => {
    socket.broadcast.emit("takeMessage", text);
  });
});

server.listen(8000, () => {
  console.log("listening to port 8000");
});
