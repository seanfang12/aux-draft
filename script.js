const roomCards = document.querySelectorAll(".room-card");
const roomStatus = document.querySelector("#room-status");

roomCards.forEach((card) => {
  card.addEventListener("click", () => {
    roomCards.forEach((roomCard) => {
      roomCard.classList.remove("is-selected");
      roomCard.setAttribute("aria-pressed", "false");
    });

    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
    roomStatus.textContent = `${card.dataset.room} selected — drafts opening soon`;
  });
});

roomCards.forEach((card) => card.setAttribute("aria-pressed", "false"));
