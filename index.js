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
const redisconfig = {
  host: "localhost",
  port: 6379,
  rejectUnauthorized: false,
};
let redisClient = Redis.createClient({ url: process.env, REDIS_URL });

// {
//   url: process.env.REDIS_URL,
//   legacyMode: true,
//   socket: {
//     port: 6379,
//     host: "redis",
//     rejectUnauthorized: false,
//   },
// }

redisClient
  .connect()
  .then(() => {
    console.log("redis connected");
  })
  .catch((err) => {
    console.log(err);
  });

redisClient.on("error", function (err) {
  console.log("Error Ocucured:", err);
});

let code;
let character;
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
app.get("/", (req, res) => {
  res.send("welcome to my chat app");
});
app.get("/sample", (req, res) => {
  entryCode = crypto.randomBytes(3).toString("hex");
  res.render("sampleuser", {
    entryCode,
    flasherrormessage: req.flash("flasherrormessage"),
  });
});
//get data from body and parse them
app.post("/sample", (req, res) => {
  const { name, code, avatar } = req.body;
  character = avatar;
  return res.redirect(`/chat/?name=${name}&code=${code}&avatar=${character}`);
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
    if (err) {
      console.log(err);
    }
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
  code = req.query.code;
  character = req.query.avatar;
  io.emit("user-joined", { username, character });
  return res.render("chatroom", { username, code, character });
});

//socket connection
function sendMessage(socket) {
  redisClient.LRANGE(String(code), "0", "-1", (err, data) => {
    data.map((x) => {
      const parseRedis = JSON.parse(x);
      const username = parseRedis.username;
      const textMessage = parseRedis.textMessage;
      const senddate = parseRedis.senddate;
      const character = parseRedis.character;
      socket.emit("takeMessage", {
        textMessage,
        username,
        senddate,
        character,
      });
    });
  });
}

io.on("connection", (socket) => {
  sendMessage(socket);
  socket.on(
    "sendMessageToServer",
    ({ textMessage, username, senddate, character }) => {
      const sampleobject = {
        username,
        textMessage,
        senddate,
        character,
      };

      redisClient.rPush(String(code), JSON.stringify(sampleobject));
      io.emit("takeMessage", { textMessage, username, senddate, character });
    }
  );
  socket.on("typing", () => {
    socket.broadcast.emit("showtyping");
  });
  socket.on("stoptyping", () => {
    socket.broadcast.emit("typingfinish");
  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log("listening to port 8000");
});
