// const name = prompt("Enter your name ");
const form = document.querySelector(".input-group");
const messageInput = document.getElementById("sendmessage");
const messageContainer = document.querySelector(".container");
const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
};
const socket = io();
socket.on("userJoined", (message) => {
  console.log(message);
});
