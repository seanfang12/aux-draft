const roomCards = document.querySelectorAll(".room-card");
const roomStatus = document.querySelector("#room-status");
const startButton = document.querySelector("#start-draft");
const playerOneInput = document.querySelector("#player-one");
const playerTwoInput = document.querySelector("#player-two");
const homeScreen = document.querySelector(".hero");
const roomsScreen = document.querySelector(".rooms-section");
const auctionScreen = document.querySelector("#auction-screen");
let selectedRoom = "";

function updateStartButton() {
  startButton.disabled = !selectedRoom || !playerOneInput.value.trim() || !playerTwoInput.value.trim();
}

roomCards.forEach((card) => {
  card.addEventListener("click", () => {
    roomCards.forEach((roomCard) => {
      roomCard.classList.remove("is-selected");
      roomCard.setAttribute("aria-pressed", "false");
    });

    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
    selectedRoom = card.dataset.room;
    roomStatus.textContent = `${selectedRoom} selected`;
    updateStartButton();
  });
});

roomCards.forEach((card) => card.setAttribute("aria-pressed", "false"));

playerOneInput.addEventListener("input", updateStartButton);
playerTwoInput.addEventListener("input", updateStartButton);

startButton.addEventListener("click", () => {
  if (startButton.disabled) return;

  document.querySelector("#auction-genre").textContent = `${selectedRoom} ROOM`;
  document.querySelector("#player-one-name").textContent = playerOneInput.value.trim();
  document.querySelector("#player-two-name").textContent = playerTwoInput.value.trim();
  document.querySelector("#turn-text").textContent = `${playerOneInput.value.trim().toUpperCase()}’S TURN`;
  homeScreen.hidden = true;
  roomsScreen.hidden = true;
  auctionScreen.hidden = false;
  window.scrollTo(0, 0);
});

document.querySelector("#return-home").addEventListener("click", () => {
  auctionScreen.hidden = true;
  homeScreen.hidden = false;
  roomsScreen.hidden = false;
  window.scrollTo(0, 0);
});
