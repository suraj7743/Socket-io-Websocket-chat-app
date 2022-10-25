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
const messageContainer = document.querySelector(".card-body"); //change
const messageLeft = document.querySelector(".left"); //change
const messageRight = document.querySelector(".right"); //change
const sendbutton = document.querySelector("#sendform");
const input = document.querySelector("input");
const card = document.querySelector(".card");

const socket = io();

function userJoined(username, text) {
  const user = document.createElement("div");
  user.classList.add("divider", "align-items-center", "mb-4");
  const userjoinedPtag = document.createElement("p");
  userjoinedPtag.classList.add("text-center", "mx-3", "mb-0");
  userjoinedPtag.style.color = "#a2aab7";
  userjoinedPtag.textContent = username + text;
  user.appendChild(userjoinedPtag);
  messageContainer.appendChild(user);
}
//broadcast event to other user except connect one
let username;
socket.on("user-joined", (username) => {
  username = username;
  userJoined(username, "-Joined");
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
let personname;
let senddate;

const appendleft = (message, sendtime, username) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("d-flex", "flex-row", "justify-content-start");
  // const image = document.createElement("img");
  // image.style.width = "45px";
  // image.style.height = "100%";
  // image.src =
  //   "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp";
  const divForTimeAndP = document.createElement("div");
  const pUsername = document.createElement("p");
  pUsername.classList.add("small", "ms-3", "mb-0", "rounded-3", "text-muted");
  pUsername.textContent = username;
  const pMessage = document.createElement("p");
  pMessage.classList.add("small", "p-2", "ms-3", "mb-1", "rounded-3", "left");
  pMessage.style.backgroundColor = "#f5f6f7";
  pMessage.textContent = message;
  const pTime = document.createElement("p");
  pTime.classList.add("small", "ms-3", "mb-3", "rounded-3", "text-muted");
  pTime.textContent = sendtime;
  divForTimeAndP.append(pUsername);
  divForTimeAndP.append(pMessage);
  divForTimeAndP.append(pTime);
  // messageElement.append(image);
  messageElement.append(divForTimeAndP);
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
  audio.play();
};

//for appending item to right
const appendRight = (message, sendtime, username) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "d-flex",
    "flex-row",
    "justify-content-end",
    "mb-4",
    "pt-1"
  );
  // const image = document.createElement("img");
  // image.style.width = "45px";
  // image.style.height = "100%";
  // image.src = "cool-background.png";

  const divForTimeAndP = document.createElement("div");
  const pUsername = document.createElement("p");
  pUsername.classList.add(
    "small",
    "me-3",
    "mb-0",
    "rounded-3",
    "text-muted",
    "d-flex",
    "justify-content-end"
  );
  pUsername.textContent = username;
  const pMessage = document.createElement("p");
  pMessage.classList.add(
    "small",
    "p-2",
    "me-3",
    "mb-1",
    "text-white",
    "rounded-3",
    "bg-primary",
    "right"
  );
  pMessage.textContent = message;
  const pTime = document.createElement("p");
  pTime.classList.add(
    "small",
    "me-3",
    "mb-3",
    "rounded-3",
    "text-muted",
    "d-flex",
    "justify-content-end"
  );
  pTime.textContent = sendtime;
  divForTimeAndP.append(pUsername);
  divForTimeAndP.append(pMessage);
  divForTimeAndP.append(pTime);
  messageElement.append(divForTimeAndP);
  // messageElement.append(image);
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

let textMessage;

form.addEventListener("submit", function(e) {
  socket.emit("stoptyping");
  e.preventDefault();
  textMessage = input.value;
  textMessage = textMessage.trim();
  if (textMessage === "") {
  } else {
    textMessage = textMessage;
    senddate = currenttime();
    socket.emit("sendMessageToServer", {
      textMessage,
      username: usernamevalue,
      senddate,
      code: codenamevalue,
    });
  }
  input.value = "";
});

socket.on("takeMessage", ({ textMessage, username, senddate }) => {
  if (username === usernamevalue) {
    appendRight(textMessage, senddate, "You");
  } else {
    appendleft(textMessage, senddate, usernamevalue);
  }
});

//for bubble typing animation
// const userleft = document.createElement("div");
// userleft.classList.add("d-flex", "flex-row", "justify-content-start");
// const fbchatdiv = document.createElement("div");
// const span1 = document.createElement("span");
// const span2 = document.createElement("span");
// const span3 = document.createElement("span");
// fbchatdiv.classList.add("fb-chat", "--bubbles");
// fbchatdiv.appendChild(span1);
// fbchatdiv.appendChild(span2);
// fbchatdiv.appendChild(span3);
// userleft.appendChild(fbchatdiv);

const span = document.querySelectorAll("span");
input.addEventListener("input", function(e) {
  socket.emit("typing");
  document.addEventListener("keydown", function(e) {
    setTimeout(() => {
      socket.emit("stoptyping");
    }, 10000);
  });
});

socket.on("showtyping", () => {
  messageContainer.scrollTop = messageContainer.scrollHeight;
  span.forEach((e) => {
    e.style.visibility = "visible";
  });

  // messageContainer.appendChild(userleft);
});
socket.on("typingfinish", () => {
  messageContainer.scrollTop = messageContainer.scrollHeight;
  span.forEach((e) => {
    e.style.visibility = "hidden";
  });
  // messageContainer.removeChild(userleft);
});
