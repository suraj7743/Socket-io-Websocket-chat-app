const form = document.querySelector("#submitform");
const messageInput = document.getElementById("sendmessage");
const messageContainer = document.querySelector(".container");
const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
};
console.log(messageContainer.scrollHeight);
const socket = io();
document.querySelector("#submitform").addEventListener("submit", (e) => {
  e.preventDefault();
  let textmessage = document.querySelector("input").value;
  textmessage = textmessage.trim();
  if (textmessage === "") {
  } else {
    append(textmessage, "right");
  }
  clearMessage();
});
const clearMessage = () => {
  document.querySelector("input").value = "";
};
