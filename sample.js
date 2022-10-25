let today = new Date();
function currentdate() {
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let date = today.getDate();
  let current_date = `${month}/${date}/${year}`;
  return current_date;
}

console.log(currentdate());
// output.innerText = current_date;
function currenttime() {
  let hours = addZero(today.getHours());
  let minutes = addZero(today.getMinutes());
  let current_time = `${hours}:${minutes}`;
  return current_time;
}

console.log(currenttime());

function addZero(num) {
  return num < 10 ? `0${num}` : num;
}
