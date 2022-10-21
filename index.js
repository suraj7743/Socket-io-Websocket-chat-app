const express = require("express");
const app = express();
const http = require("http");
const crypto = require("crypto");
const server = http.createServer(app);
const socketIo = require("socket.io");
const Redis = require("redis");
const io = socketIo(server).listen(server);
app.use("/public", express.static("public"));
app.set("view engine", "ejs");
//connecting to redis with docker image
let redisClient = Redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: "redis",
  },
});
redisClient.connect();
let entryCode;
let code;
app.get("/user", (req, res, next) => {
  entryCode = crypto.randomBytes(3).toString("hex");
  res.render("user", { entryCode });
});

function sendMessage(socket) {
  redisClient.LRANGE(String(code), "0", "-1", (err, data) => {
    // data.map((x) => {
    //   console.log(x.username);
    // });

    data.map((x) => {
      const parseRedis = JSON.parse(x);
      const username = parseRedis.username;
      const textMessage = parseRedis.textMessage;
      const senddate = parseRedis.senddate;
      socket.emit("takeMessage", { textMessage, username, senddate });
    });
  });
}

io.on("connection", (socket) => {
  sendMessage(socket);
  socket.on(
    "sendMessageToServer",
    ({ textMessage, username, senddate, code }) => {
      const sampleobject = {
        username,
        textMessage,
        senddate,
      };
      console.log(code);
      redisClient.rPush(String(code), JSON.stringify(sampleobject));
      io.emit("takeMessage", { textMessage, username, senddate });
    }
  );

  socket.on("disconnect", () => {
    socket.broadcast.emit("userleft");
  });
});

app.get("/chat", (req, res, next) => {
  const username = req.query.name;
  code = req.query.code;
  io.emit("user-joined", username);
  res.render("chat", { username, entryCode, code });
});

server.listen(8000, () => {
  console.log("listening to port 8000");
});
