const roomCards = document.querySelectorAll(".room-card");
const roomStatus = document.querySelector("#room-status");
const startButton = document.querySelector("#start-draft");
const playerOneInput = document.querySelector("#player-one");
const playerTwoInput = document.querySelector("#player-two");
const homeScreen = document.querySelector(".hero");
const roomsScreen = document.querySelector(".rooms-section");
const auctionScreen = document.querySelector("#auction-screen");
const songTitle = document.querySelector("#song-title");
const songArtist = document.querySelector("#song-artist");
const songStatus = document.querySelector("#song-status");
const retryButton = document.querySelector("#retry-song");
const albumArt = document.querySelector("#album-art");
const albumArtImage = document.querySelector("#album-art-image");
let selectedRoom = "";
let draftSongs = [];
let requestNumber = 0;

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

function shuffleSongs(songs) {
  const shuffledSongs = songs.slice();

  for (let i = shuffledSongs.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const currentSong = shuffledSongs[i];
    shuffledSongs[i] = shuffledSongs[randomIndex];
    shuffledSongs[randomIndex] = currentSong;
  }

  return shuffledSongs;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isCleanMatch(result, expectedSong) {
  const blockedVersionWords = /\b(live|karaoke|tribute|remix|instrumental|cover)\b/i;
  const resultDescription = `${result.trackName || ""} ${result.collectionName || ""}`;

  return result.kind === "song"
    && normalizeText(result.trackName || "") === normalizeText(expectedSong.title)
    && normalizeText(result.artistName || "") === normalizeText(expectedSong.artist)
    && !blockedVersionWords.test(resultDescription)
    && Boolean(result.artworkUrl100);
}

async function findSongOnItunes(expectedSong) {
  const searchURL = new URL("https://itunes.apple.com/search");
  searchURL.search = new URLSearchParams({
    term: `${expectedSong.title} ${expectedSong.artist}`,
    country: "us",
    media: "music",
    entity: "song",
    limit: "25"
  });

  let response;
  try {
    response = await fetch(searchURL);
  } catch (error) {
    throw new Error("The music service is unavailable right now.");
  }

  if (!response.ok) {
    throw new Error("The music service is unavailable right now.");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("The music service is unavailable right now.");
  }

  const results = Array.isArray(data.results) ? data.results : [];
  return results.find((result) => isCleanMatch(result, expectedSong)) || null;
}

function showSong(songResult) {
  songTitle.textContent = songResult.trackName;
  songArtist.textContent = songResult.artistName;
  albumArtImage.src = songResult.artworkUrl100.replace("100x100bb", "600x600bb");
  albumArtImage.alt = `Album artwork for ${songResult.trackName} by ${songResult.artistName}`;
  albumArtImage.hidden = false;
  albumArt.classList.add("has-artwork");
  songStatus.hidden = true;
  retryButton.hidden = true;
}

function showSongError(message) {
  songTitle.textContent = "";
  songArtist.textContent = "";
  albumArtImage.hidden = true;
  albumArtImage.removeAttribute("src");
  albumArt.classList.remove("has-artwork");
  songStatus.textContent = message;
  songStatus.hidden = false;
  retryButton.hidden = false;
}

albumArtImage.addEventListener("error", () => {
  if (!albumArtImage.hidden) {
    showSongError("We found the song, but couldn't load its album artwork. Try again.");
  }
});

async function loadFirstSong(activeRequest) {
  songStatus.textContent = "Finding a song…";
  songStatus.hidden = false;
  retryButton.hidden = true;

  try {
    let matchedSong = null;
    let matchedPoolSong = null;
    const songsWithoutMatches = [];

    for (const poolSong of draftSongs) {
      if (activeRequest !== requestNumber) return;
      matchedSong = await findSongOnItunes(poolSong);
      if (matchedSong) {
        matchedPoolSong = poolSong;
        break;
      }
      songsWithoutMatches.push(poolSong);
    }

    if (activeRequest !== requestNumber) return;
    if (!matchedSong) {
      throw new Error("We couldn't find a clean match for these songs. Try again in a moment.");
    }

    const remainingSongs = draftSongs.filter((song) => song !== matchedPoolSong && !songsWithoutMatches.includes(song));
    const replacementSongs = shuffleSongs(songPools[selectedRoom].filter((song) => !draftSongs.includes(song)));
    draftSongs = [matchedPoolSong].concat(remainingSongs, replacementSongs).slice(0, 10);
    showSong(matchedSong);
  } catch (error) {
    if (activeRequest !== requestNumber) return;
    const message = error.message.includes("service is unavailable")
      ? "The music service is unavailable. Check your connection and try again."
      : error.message;
    showSongError(message);
  } finally {
    if (activeRequest === requestNumber) startButton.disabled = false;
  }
}

function startSongLookup() {
  if (startButton.disabled) return;

  const roomSongs = songPools[selectedRoom];
  draftSongs = shuffleSongs(roomSongs).slice(0, 10);
  requestNumber += 1;
  startButton.disabled = true;

  document.querySelector("#auction-genre").textContent = `${selectedRoom} ROOM`;
  document.querySelector("#player-one-name").textContent = playerOneInput.value.trim();
  document.querySelector("#player-two-name").textContent = playerTwoInput.value.trim();
  document.querySelector("#turn-text").textContent = `${playerOneInput.value.trim().toUpperCase()}’S TURN`;
  document.querySelector(".song-progress").textContent = "1 / 10";
  songTitle.textContent = "";
  songArtist.textContent = "";
  albumArtImage.hidden = true;
  albumArtImage.removeAttribute("src");
  albumArt.classList.remove("has-artwork");
  homeScreen.hidden = true;
  roomsScreen.hidden = true;
  auctionScreen.hidden = false;
  window.scrollTo(0, 0);

  loadFirstSong(requestNumber);
}

startButton.addEventListener("click", startSongLookup);
retryButton.addEventListener("click", () => {
  draftSongs = shuffleSongs(songPools[selectedRoom]).slice(0, 10);
  requestNumber += 1;
  loadFirstSong(requestNumber);
});

document.querySelector("#return-home").addEventListener("click", () => {
  requestNumber += 1;
  auctionScreen.hidden = true;
  homeScreen.hidden = false;
  roomsScreen.hidden = false;
  updateStartButton();
  window.scrollTo(0, 0);
});
