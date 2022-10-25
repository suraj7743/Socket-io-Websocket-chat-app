const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const crypto = require("crypto");
const server = http.createServer(app);
const socketIo = require("socket.io");
const Redis = require("redis");
const moment = require("moment");
const session = require("express-session");
const flash = require("connect-flash");
const io = socketIo(server).listen(server);
app.use("/public", express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//connecting to redis with docker image
console.log(moment().calendar());
let redisClient = Redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: "redis",
  },
});

redisClient.connect();
redisClient.set("somevalue", "./public/chat-box.png");

let code;
app.use(
  session({
    secret: "somesecretkeyidontwannareveal",
    cookie: {
      maxAge: 60000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
//render homepage
app.get("/sample", (req, res) => {
  entryCode = crypto.randomBytes(3).toString("hex");
  res.render("sampleuser", {
    entryCode,
    flasherrormessage: req.flash("flasherrormessage"),
  });
});
//get data from body and parse them
app.post("/sample", (req, res) => {
  const { name, code } = req.body;
  return res.redirect(`/chat/?name=${name}&code=${code}`);
});

//middleware for chat route to control only person with valid id can enter

const chatControlMiddleware = (req, res, next) => {
  let check = 1;
  code = req.query.code;
  if (!(req.query && req.query.code && req.query.name)) {
    req.flash("flasherrormessage", "Login First!");
    return res.redirect("/sample");
  }
  redisClient.sMembers("codekeys", (err, data) => {
    data.forEach((x) => {
      if (x === code.toString()) {
        check = 2;
      }
    });
    if (check === 2) {
      next();
    } else {
      req.flash("flasherrormessage", "Enter Valid Id");
      res.redirect("/sample");
    }
  });
};

//socket connection starts from here
let personname;

app.get("/chat", chatControlMiddleware, (req, res, next) => {
  const username = req.query.name;
  personname = req.query.name;
  code = req.query.code;
  io.emit("user-joined", username);
  return res.render("chatroom", { username, code });
});

//socket connection
function sendMessage(socket) {
  redisClient.LRANGE(String(code), "0", "-1", (err, data) => {
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

      redisClient.rPush(String(code), JSON.stringify(sampleobject));
      io.emit("takeMessage", { textMessage, username, senddate });
    }
  );
  socket.on("typing", () => {
    socket.broadcast.emit("showtyping");
  });
  socket.on("stoptyping", () => {
    socket.broadcast.emit("typingfinish");
  });
});

server.listen(8000, () => {
  console.log("listening to port 8000");
});
