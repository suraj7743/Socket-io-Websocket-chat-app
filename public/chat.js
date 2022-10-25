// const name = prompt("Enter your name ");
// const form = document.querySelector(".input-group");
// const messageInput = document.getElementById("sendmessage");
// const messageContainer = document.querySelector(".container");
// const append = (message, position) => {
//   const messageElement = document.createElement("div");
//   messageElement.innerText = message;
//   messageElement.classList.add("message");
//   messageElement.classList.add(position);
//   messageContainer.append(messageElement);
// };
// const socket = io();
// socket.on("userJoined", (message) => {
//   console.log(message);
// });

//for date and time

let today = new Date();
function currentdate() {
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let date = today.getDate();
  let current_date = `${month}/${date}/${year}`;
  return current_date;
}

// output.innerText = current_date;
function currenttime() {
  let today = new Date();
  let hours = addZero(today.getHours());
  let minutes = addZero(today.getMinutes());
  let current_time = `${hours}:${minutes}`;
  return current_time;
}

function addZero(num) {
  return num < 10 ? `0${num}` : num;
}

//selector
const form = document.querySelector(".input-group");
const messageInput = document.getElementById("sendmessage");
const messageContainer = document.querySelector(".container");
const messageLeft = document.querySelector(".message left");
const messageRight = document.querySelector(".message right");
const sendbutton = document.querySelector("#sendform");
const input = document.querySelector("input");

const socket = io();
socket.on("connection");

function userJoined(username) {
  const user = document.createElement("div");
  user.classList.add("center");
  user.textContent = username + "joined";
  messageContainer.appendChild(user);
}
//broadcast event to other user except connect one
let personname;
socket.on("user-joined", (username) => {
  personname = username;
  userJoined(username);
});

const append = (message, position, username) => {
  const messageElement = document.createElement("div");
  const spandate = document.createElement("span");
  const spanleft = document.createElement("span");
  spanleft.innerText = username;
  spandate.innerText = currenttime();
  spandate.classList.add("spanright");
  spanleft.classList.add("spanright");
  const paragraphElement = document.createElement("p");
  paragraphElement.innerText = message;
  messageElement.append(spanleft); //username
  messageElement.append(paragraphElement); //message
  messageElement.append(spandate); //time
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};
let textMessage;
sendbutton.addEventListener("submit", (e) => {
  e.preventDefault();
  textMessage = input.value;
  textMessage = textMessage.trim();
  if (textMessage === "") {
  } else {
    append(textMessage, "right", "you");
    socket.emit("sendMessageToServer", {
      textMessage,
      username: "<%= username %>",
    });
  }
  input.value = "";
});
var audio = new Audio("../public/ting.mp3");
socket.on("takeMessage", ({ textMessage, username }) => {
  append(textMessage, "left", username);
  audio.play();
});
socket.on("join", (data) => {
  console.log(data);
});
