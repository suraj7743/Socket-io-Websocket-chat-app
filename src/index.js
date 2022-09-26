const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
app.use(express.static("./public"));

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  socket.on("username", (name) => {
    socket.emit("takeUsername", () => {
      return name;
    });
  });
});

server.listen(8000, () => {
  console.log("listening to port 8000");
});
