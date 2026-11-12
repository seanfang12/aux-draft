const roomCards = document.querySelectorAll(".room-card");
const roomStatus = document.querySelector("#room-status");
const startButton = document.querySelector("#start-draft");
const playerOneInput = document.querySelector("#player-one");
const playerTwoInput = document.querySelector("#player-two");
const homeScreen = document.querySelector(".hero");
const roomsScreen = document.querySelector(".rooms-section");
const auctionScreen = document.querySelector("#auction-screen");
const gameView = document.querySelector("#game-view");
const resultsScreen = document.querySelector("#results-screen");
const songTitle = document.querySelector("#song-title");
const songArtist = document.querySelector("#song-artist");
const songStatus = document.querySelector("#song-status");
const retryButton = document.querySelector("#retry-song");
const albumArt = document.querySelector("#album-art");
const albumArtImage = document.querySelector("#album-art-image");
const passButton = document.querySelector("#pass-button");
const bidButton = document.querySelector("#bid-button");
const bidAmount = document.querySelector("#bid-amount");
const bidLabel = document.querySelector("#bid-label");
const bidStatus = document.querySelector("#bid-status");
const bidLimitNote = document.querySelector("#bid-limit-note");
const turnText = document.querySelector("#turn-text");
const roundMessage = document.querySelector("#round-message");
const playersResults = document.querySelector("#results-players");
const savedDraftPrompt = document.querySelector("#saved-draft-prompt");
const savedDraftMessage = document.querySelector("#saved-draft-message");
const copyResultsButton = document.querySelector("#copy-results");
const copyStatus = document.querySelector("#copy-status");

const savedGameKey = "auxDraftSavedGame";
let selectedRoom = "";
let players = [];
let draftSongs = [];
let previousGameSongKeys = [];
let savedDraftToResume = null;
let currentSongIndex = 0;
let currentBid = 0;
let highBidderIndex = null;
let currentTurnIndex = 0;
let openingPlayerIndex = 0;
let openingPassCount = 0;
let declinedPlayers = [false, false];
let requestNumber = 0;
let advanceTimer;
let gameReady = false;
let roundIsResolving = false;
let artworkReady = false;

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

function getSongKey(song) {
  return `${normalizeText(song.title)}|${normalizeText(song.artist)}`;
}

function saveDraft() {
  if (!gameReady || players.length !== 2 || draftSongs.length !== 10 || currentSongIndex >= 10) return;

  const savedGame = {
    version: 1,
    room: selectedRoom,
    players,
    songs: draftSongs,
    previousGameSongKeys,
    currentSongIndex,
    currentBid,
    highBidderIndex,
    currentTurnIndex,
    openingPlayerIndex,
    openingPassCount,
    declinedPlayers,
    roundIsResolving
  };

  try {
    localStorage.setItem(savedGameKey, JSON.stringify(savedGame));
  } catch (error) {
    // The draft can still be played when browser storage is unavailable.
  }
}

function clearSavedDraft() {
  try {
    localStorage.removeItem(savedGameKey);
  } catch (error) {
    // Nothing else needs to happen if storage is unavailable.
  }

  savedDraftToResume = null;
  savedDraftPrompt.hidden = true;
}

function discardInvalidSavedDraft() {
  try {
    localStorage.removeItem(savedGameKey);
  } catch (error) {
    // Ignore storage errors while recovering from invalid saved data.
  }
}

function isSavedSong(song) {
  return Boolean(song)
    && typeof song.trackName === "string"
    && song.trackName.length > 0
    && typeof song.artistName === "string"
    && song.artistName.length > 0
    && typeof song.artworkUrl100 === "string"
    && song.artworkUrl100.length > 0;
}

function readSavedDraft() {
  try {
    const savedText = localStorage.getItem(savedGameKey);
    if (!savedText) return null;

    const savedGame = JSON.parse(savedText);
    const validGame = savedGame.version === 1
      && songPools[savedGame.room]
      && Array.isArray(savedGame.songs)
      && savedGame.songs.length === 10
      && savedGame.songs.every(isSavedSong)
      && Array.isArray(savedGame.players)
      && savedGame.players.length === 2
      && savedGame.players.every((player) => typeof player.name === "string"
        && Array.isArray(player.songs)
        && player.songs.length <= 5
        && player.songs.every(isSavedSong)
        && Number.isInteger(player.budget)
        && player.budget >= 0
        && player.budget <= 20)
      && savedGame.players[0].songs.length + savedGame.players[1].songs.length
        === savedGame.currentSongIndex + (savedGame.roundIsResolving ? 1 : 0)
      && Number.isInteger(savedGame.currentSongIndex)
      && savedGame.currentSongIndex >= 0
      && savedGame.currentSongIndex < 10
      && Number.isInteger(savedGame.currentBid)
      && savedGame.currentBid >= 0
      && (savedGame.highBidderIndex === null || savedGame.highBidderIndex === 0 || savedGame.highBidderIndex === 1)
      && (savedGame.currentBid === 0 ? savedGame.highBidderIndex === null : savedGame.highBidderIndex !== null)
      && (savedGame.currentTurnIndex === 0 || savedGame.currentTurnIndex === 1)
      && (savedGame.openingPlayerIndex === 0 || savedGame.openingPlayerIndex === 1)
      && (savedGame.openingPassCount === 0 || savedGame.openingPassCount === 1)
      && (savedGame.declinedPlayers === undefined
        || (Array.isArray(savedGame.declinedPlayers)
          && savedGame.declinedPlayers.length === 2
          && savedGame.declinedPlayers.every((declined) => typeof declined === "boolean")))
      && Array.isArray(savedGame.previousGameSongKeys)
      && savedGame.previousGameSongKeys.every((key) => typeof key === "string")
      && typeof savedGame.roundIsResolving === "boolean";

    if (!validGame) {
      discardInvalidSavedDraft();
      return null;
    }

    return savedGame;
  } catch (error) {
    discardInvalidSavedDraft();
    return null;
  }
}

function showSavedDraftPrompt() {
  savedDraftToResume = readSavedDraft();
  if (!savedDraftToResume) {
    savedDraftPrompt.hidden = true;
    return;
  }

  savedDraftMessage.textContent = `${savedDraftToResume.room} draft saved · song ${savedDraftToResume.currentSongIndex + 1} of 10`;
  savedDraftPrompt.hidden = false;
}

function resumeSavedDraft() {
  const savedGame = savedDraftToResume || readSavedDraft();
  if (!savedGame) {
    showSavedDraftPrompt();
    return;
  }

  if (advanceTimer) clearTimeout(advanceTimer);
  requestNumber += 1;
  selectedRoom = savedGame.room;
  players = savedGame.players;
  draftSongs = savedGame.songs;
  previousGameSongKeys = savedGame.previousGameSongKeys || draftSongs.map((song) =>
    getSongKey({ title: song.trackName, artist: song.artistName })
  );
  currentSongIndex = savedGame.currentSongIndex;
  currentBid = savedGame.currentBid;
  highBidderIndex = savedGame.highBidderIndex;
  currentTurnIndex = savedGame.currentTurnIndex;
  openingPlayerIndex = savedGame.openingPlayerIndex;
  openingPassCount = savedGame.openingPassCount;
  declinedPlayers = savedGame.declinedPlayers || [false, false];
  if (savedGame.declinedPlayers === undefined && openingPassCount === 1) {
    declinedPlayers[1 - savedGame.currentTurnIndex] = true;
  }
  roundIsResolving = savedGame.roundIsResolving;
  gameReady = true;
  artworkReady = false;

  roomCards.forEach((card) => {
    const isSelected = card.dataset.room === selectedRoom;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
  roomStatus.textContent = `${selectedRoom} selected`;
  playerOneInput.value = players[0].name;
  playerTwoInput.value = players[1].name;
  document.querySelector("#auction-genre").textContent = `${selectedRoom} ROOM`;
  document.querySelector("#player-one-name").textContent = players[0].name;
  document.querySelector("#player-two-name").textContent = players[1].name;

  savedDraftPrompt.hidden = true;
  savedDraftToResume = null;
  homeScreen.hidden = true;
  roomsScreen.hidden = true;
  auctionScreen.hidden = false;
  gameView.hidden = false;
  resultsScreen.hidden = true;
  roundMessage.hidden = true;
  songStatus.hidden = true;
  retryButton.hidden = true;
  setAuctionControlsEnabled(false);
  renderPlayerLineups();
  window.scrollTo(0, 0);

  if (roundIsResolving) {
    currentSongIndex += 1;
    openingPlayerIndex = 1 - openingPlayerIndex;
    roundIsResolving = false;
    beginCurrentSong();
  } else {
    displayCurrentSong();
  }
}

function startFreshAfterSavedDraft() {
  if (savedDraftToResume) {
    selectedRoom = savedDraftToResume.room;
    previousGameSongKeys = savedDraftToResume.songs.map((song) =>
      getSongKey({ title: song.trackName, artist: song.artistName })
    );
    playerOneInput.value = savedDraftToResume.players[0].name;
    playerTwoInput.value = savedDraftToResume.players[1].name;
    roomCards.forEach((card) => {
      const isSelected = card.dataset.room === selectedRoom;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    });
    roomStatus.textContent = `${selectedRoom} selected`;
  }

  clearSavedDraft();
  updateStartButton();
}

function getBalancedAllGenresOrder(eligibleSongs) {
  const eligibleKeys = eligibleSongs.map((song) => getSongKey(song));
  const categoryPools = shuffleSongs(allGenreCategoryPools).map((pool) =>
    shuffleSongs(pool.filter((song) => eligibleKeys.includes(getSongKey(song))))
  );
  const positions = categoryPools.map(() => 0);
  const usedKeys = [];
  const balancedOrder = [];
  let addedSong = true;

  while (addedSong) {
    addedSong = false;

    categoryPools.forEach((pool, categoryIndex) => {
      while (positions[categoryIndex] < pool.length
        && usedKeys.includes(getSongKey(pool[positions[categoryIndex]]))) {
        positions[categoryIndex] += 1;
      }

      if (positions[categoryIndex] < pool.length) {
        const song = pool[positions[categoryIndex]];
        positions[categoryIndex] += 1;
        usedKeys.push(getSongKey(song));
        balancedOrder.push(song);
        addedSong = true;
      }
    });
  }

  return balancedOrder;
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

async function getTenRealSongs(activeRequest) {
  const uniquePool = [];
  const poolKeys = [];

  songPools[selectedRoom].forEach((song) => {
    const key = getSongKey(song);
    if (!poolKeys.includes(key)) {
      poolKeys.push(key);
      uniquePool.push(song);
    }
  });

  const songsFromPreviousGame = uniquePool.filter((song) => previousGameSongKeys.includes(getSongKey(song)));
  const freshSongs = uniquePool.filter((song) => !previousGameSongKeys.includes(getSongKey(song)));
  let poolOrder;

  if (freshSongs.length >= 10) {
    const freshOrder = selectedRoom === "All Genres"
      ? getBalancedAllGenresOrder(freshSongs)
      : shuffleSongs(freshSongs);
    const repeatOrder = selectedRoom === "All Genres"
      ? getBalancedAllGenresOrder(songsFromPreviousGame)
      : shuffleSongs(songsFromPreviousGame);
    poolOrder = freshOrder.concat(repeatOrder);
  } else {
    poolOrder = selectedRoom === "All Genres"
      ? getBalancedAllGenresOrder(uniquePool)
      : shuffleSongs(uniquePool);
  }

  const realSongs = [];
  const usedTrackIds = [];
  const usedSongKeys = [];

  for (const poolSong of poolOrder) {
    if (activeRequest !== requestNumber) return [];
    if (realSongs.length === 10) break;

    songStatus.textContent = `Finding track ${realSongs.length + 1} of 10…`;
    songStatus.hidden = false;

    const result = await findSongOnItunes(poolSong);
    if (!result) continue;
    if (result.trackId && usedTrackIds.includes(result.trackId)) continue;
    const resultKey = getSongKey({ title: result.trackName, artist: result.artistName });
    if (usedSongKeys.includes(resultKey)) continue;

    if (result.trackId) usedTrackIds.push(result.trackId);
    usedSongKeys.push(resultKey);
    realSongs.push(result);
  }

  if (realSongs.length < 10) {
    throw new Error("We couldn't find ten matching songs in this room. Please try again.");
  }

  return realSongs;
}

function setPlayerNames(names) {
  players = names.map((name) => ({ name, budget: 20, songs: [] }));
  document.querySelector("#player-one-name").textContent = players[0].name;
  document.querySelector("#player-two-name").textContent = players[1].name;
  renderPlayerLineups();
}

function startDraft(names) {
  if (advanceTimer) clearTimeout(advanceTimer);
  clearSavedDraft();
  startButton.disabled = true;
  requestNumber += 1;
  const activeRequest = requestNumber;

  setPlayerNames(names);
  draftSongs = [];
  currentSongIndex = 0;
  currentBid = 0;
  highBidderIndex = null;
  currentTurnIndex = 0;
  openingPlayerIndex = 0;
  openingPassCount = 0;
  declinedPlayers = [false, false];
  roundIsResolving = false;
  gameReady = false;
  artworkReady = false;

  document.querySelector("#auction-genre").textContent = `${selectedRoom} ROOM`;
  gameView.hidden = false;
  resultsScreen.hidden = true;
  auctionScreen.hidden = false;
  homeScreen.hidden = true;
  roomsScreen.hidden = true;
  songTitle.textContent = "";
  songArtist.textContent = "";
  albumArtImage.hidden = true;
  albumArtImage.removeAttribute("src");
  albumArt.classList.remove("has-artwork");
  document.querySelector("#song-progress").textContent = "1 / 10";
  roundMessage.hidden = true;
  songStatus.textContent = "Preparing your ten-song auction…";
  songStatus.hidden = false;
  retryButton.hidden = true;
  setAuctionControlsEnabled(false);
  renderPlayerLineups();
  window.scrollTo(0, 0);

  loadDraftSongs(activeRequest);
}

async function loadDraftSongs(activeRequest) {
  try {
    draftSongs = await getTenRealSongs(activeRequest);
    if (activeRequest !== requestNumber) return;

    previousGameSongKeys = draftSongs.map((song) => getSongKey({ title: song.trackName, artist: song.artistName }));
    gameReady = true;
    songStatus.hidden = true;
    beginCurrentSong();
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

function showSongError(message) {
  artworkReady = false;
  songTitle.textContent = "";
  songArtist.textContent = "";
  albumArtImage.hidden = true;
  albumArtImage.removeAttribute("src");
  albumArt.classList.remove("has-artwork");
  songStatus.textContent = message;
  songStatus.hidden = false;
  retryButton.hidden = false;
  setAuctionControlsEnabled(false);
}

function showSong(song) {
  artworkReady = false;
  songTitle.textContent = song.trackName;
  songArtist.textContent = song.artistName;
  albumArtImage.hidden = false;
  albumArtImage.alt = `Album artwork for ${song.trackName} by ${song.artistName}`;
  albumArt.classList.add("has-artwork");
  albumArtImage.src = song.artworkUrl100.replace("100x100bb", "600x600bb");
  songStatus.hidden = true;
  retryButton.hidden = true;
}

albumArtImage.addEventListener("load", () => {
  artworkReady = true;
  songStatus.hidden = true;
  retryButton.hidden = true;
  updateAuctionScreen();
});

albumArtImage.addEventListener("error", () => {
  if (!albumArtImage.hidden) {
    showSongError("We found the song, but couldn't load its album artwork. Try again.");
  }
});

function showCurrentArtRetry() {
  if (!gameReady || currentSongIndex >= draftSongs.length) return;

  const currentSong = draftSongs[currentSongIndex];
  artworkReady = false;
  songTitle.textContent = currentSong.trackName;
  songArtist.textContent = currentSong.artistName;
  songStatus.textContent = "Trying to reload the album artwork…";
  songStatus.hidden = false;
  retryButton.hidden = true;
  albumArtImage.hidden = false;
  albumArtImage.alt = `Album artwork for ${currentSong.trackName} by ${currentSong.artistName}`;
  albumArt.classList.add("has-artwork");
  albumArtImage.src = `${currentSong.artworkUrl100}?retry=${Date.now()}`;
}

retryButton.addEventListener("click", () => {
  if (gameReady) {
    showCurrentArtRetry();
  } else {
    startDraft(players.map((player) => player.name));
  }
});

document.querySelector("#start-draft").addEventListener("click", () => {
  if (startButton.disabled || !selectedRoom) return;
  startDraft([playerOneInput.value.trim(), playerTwoInput.value.trim()]);
});

function canPlayerRaiseBid(playerIndex) {
  const player = players[playerIndex];
  if (!player || player.songs.length >= 5 || declinedPlayers[playerIndex]) return false;

  const nextBid = currentBid === 0 ? 1 : currentBid + 1;
  const emptySlotsAfterWinning = 5 - (player.songs.length + 1);
  return player.budget - nextBid >= emptySlotsAfterWinning;
}

function updateAuctionScreen() {
  if (!gameReady || !artworkReady || roundIsResolving) {
    setAuctionControlsEnabled(false);
    return;
  }

  document.querySelector("#song-progress").textContent = `${currentSongIndex + 1} / 10`;
  bidAmount.textContent = currentBid === 0 ? "1" : String(currentBid);
  bidLabel.textContent = "SONG PRICE";
  turnText.textContent = `Your turn, ${players[currentTurnIndex].name}!`;
  bidStatus.textContent = highBidderIndex === null
    ? "No bids yet."
    : `${players[highBidderIndex].name} is winning at $${currentBid}.`;
  bidButton.textContent = `Bid $${currentBid === 0 ? 1 : currentBid + 1}`;
  passButton.textContent = highBidderIndex === null ? "Skip This Song" : "Let Them Have It";

  setAuctionControlsEnabled(true);
  bidButton.disabled = !canPlayerRaiseBid(currentTurnIndex);
  passButton.disabled = false;
  bidLimitNote.hidden = true;
  if (bidButton.disabled && players[currentTurnIndex].songs.length < 5) {
    const songsLeftAfterWinning = 4 - players[currentTurnIndex].songs.length;
    bidLimitNote.textContent = `Keep $${songsLeftAfterWinning} for your remaining songs.`;
    bidLimitNote.hidden = false;
  }
  roundMessage.hidden = true;
}

function setAuctionControlsEnabled(enabled) {
  passButton.disabled = !enabled;
  bidButton.disabled = !enabled;
}

function beginCurrentSong() {
  if (currentSongIndex >= draftSongs.length) {
    showResults();
    return;
  }

  roundIsResolving = false;
  currentBid = 0;
  highBidderIndex = null;
  openingPassCount = 0;
  declinedPlayers = [false, false];
  currentTurnIndex = openingPlayerIndex;
  displayCurrentSong();
}

function displayCurrentSong() {
  roundMessage.hidden = true;
  document.querySelector("#song-progress").textContent = `${currentSongIndex + 1} / 10`;
  showSong(draftSongs[currentSongIndex]);
  renderPlayerLineups();
  saveDraft();

  if (players[0].songs.length === 5) {
    awardSong(1, 1, `${players[0].name} has five songs. ${players[1].name} gets this song for $1.`);
  } else if (players[1].songs.length === 5) {
    awardSong(0, 1, `${players[1].name} has five songs. ${players[0].name} gets this song for $1.`);
  }
}

function chooseUnclaimedWinner() {
  if (players[openingPlayerIndex].songs.length < 5) return openingPlayerIndex;
  return 1 - openingPlayerIndex;
}

function awardSong(winnerIndex, price, reason = "") {
  if (roundIsResolving) return;

  const winner = players[winnerIndex];
  const song = draftSongs[currentSongIndex];
  if (!winner || winner.songs.length >= 5 || winner.budget < price) return;

  roundIsResolving = true;
  winner.budget -= price;
  winner.songs.push(song);
  renderPlayerLineups();
  roundMessage.textContent = reason || `${winner.name} wins “${song.trackName}” for $${price}.`;
  roundMessage.hidden = false;
  setAuctionControlsEnabled(false);
  saveDraft();

  advanceTimer = setTimeout(() => {
    currentSongIndex += 1;
    openingPlayerIndex = 1 - openingPlayerIndex;
    beginCurrentSong();
  }, 1100);
}

function bidOnSong() {
  if (!gameReady || !artworkReady || roundIsResolving || !canPlayerRaiseBid(currentTurnIndex)) return;

  currentBid = currentBid === 0 ? 1 : currentBid + 1;
  highBidderIndex = currentTurnIndex;
  currentTurnIndex = 1 - currentTurnIndex;
  openingPassCount = 0;

  if (declinedPlayers[currentTurnIndex]) {
    const winner = players[highBidderIndex];
    const song = draftSongs[currentSongIndex];
    awardSong(highBidderIndex, currentBid, `${players[currentTurnIndex].name} had already skipped. ${winner.name} wins “${song.trackName}” for $${currentBid}.`);
    return;
  }

  updateAuctionScreen();
  saveDraft();
}

function passOnSong() {
  if (!gameReady || !artworkReady || roundIsResolving) return;

  if (highBidderIndex !== null) {
    declinedPlayers[currentTurnIndex] = true;
    const winner = players[highBidderIndex];
    const song = draftSongs[currentSongIndex];
    awardSong(highBidderIndex, currentBid, `${players[currentTurnIndex].name} let it go. ${winner.name} wins “${song.trackName}” for $${currentBid}.`);
    return;
  }

  declinedPlayers[currentTurnIndex] = true;

  if (openingPassCount === 0) {
    openingPassCount = 1;
    currentTurnIndex = 1 - currentTurnIndex;
    updateAuctionScreen();
    saveDraft();
    return;
  }

  const winnerIndex = chooseUnclaimedWinner();
  const song = draftSongs[currentSongIndex];
  const winner = players[winnerIndex];
  awardSong(winnerIndex, 1, `Both skipped. ${winner.name} gets “${song.trackName}” for $1.`);
}

bidButton.addEventListener("click", bidOnSong);
passButton.addEventListener("click", passOnSong);

function renderPlayerLineups() {
  if (players.length !== 2) return;

  const lineupLists = [
    document.querySelector("#player-one-lineup"),
    document.querySelector("#player-two-lineup")
  ];

  players.forEach((player, playerIndex) => {
    document.querySelector(`#player-${playerIndex === 0 ? "one" : "two"}-budget`).textContent = `$${player.budget} left · ${player.songs.length}/5 songs`;
    const slots = lineupLists[playerIndex].querySelectorAll("li");

    slots.forEach((slot, slotIndex) => {
      slot.textContent = "";

      const song = player.songs[slotIndex];
      if (!song) {
        slot.textContent = String(slotIndex + 1);
        slot.setAttribute("aria-label", `Empty lineup spot ${slotIndex + 1}`);
        return;
      }

      const artwork = document.createElement("img");
      artwork.src = song.artworkUrl100;
      artwork.alt = "";
      artwork.title = `${song.trackName} — ${song.artistName}`;
      slot.appendChild(artwork);
      slot.setAttribute("aria-label", `${song.trackName} by ${song.artistName}`);
    });
  });
}

function showResults() {
  clearSavedDraft();
  gameView.hidden = true;
  resultsScreen.hidden = false;
  playersResults.textContent = "";
  copyStatus.hidden = true;
  copyStatus.textContent = "";

  players.forEach((player) => {
    const board = document.createElement("section");
    board.className = "result-player";

    const summary = document.createElement("div");
    summary.className = "result-summary";
    const name = document.createElement("h3");
    name.textContent = player.name;
    const budget = document.createElement("p");
    budget.textContent = `$${player.budget} remaining`;
    summary.append(name, budget);

    const lineup = document.createElement("ol");
    lineup.className = "result-lineup";

    player.songs.forEach((song, songIndex) => {
      const item = document.createElement("li");
      const artwork = document.createElement("img");
      artwork.src = song.artworkUrl100;
      artwork.alt = `Album artwork for ${song.trackName} by ${song.artistName}`;
      const details = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = song.trackName;
      const artist = document.createElement("span");
      artist.textContent = song.artistName;
      const number = document.createElement("small");
      number.textContent = String(songIndex + 1).padStart(2, "0");
      details.append(title, artist);
      item.append(number, artwork, details);
      lineup.appendChild(item);
    });

    board.append(summary, lineup);
    playersResults.appendChild(board);
  });
}

async function copyResults() {
  const resultLines = [];

  players.forEach((player) => {
    resultLines.push(`${player.name} — $${player.budget} remaining`);
    player.songs.forEach((song, songIndex) => {
      resultLines.push(`${songIndex + 1}. ${song.trackName} — ${song.artistName}`);
    });
    resultLines.push("");
  });

  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Clipboard access is unavailable.");
    }

    await navigator.clipboard.writeText(resultLines.join("\n").trim());
    copyStatus.textContent = "Results copied.";
  } catch (error) {
    copyStatus.textContent = "Couldn't copy results. Clipboard access may be blocked by your browser.";
  }

  copyStatus.hidden = false;
}

copyResultsButton.addEventListener("click", copyResults);

document.querySelector("#resume-saved-draft").addEventListener("click", resumeSavedDraft);
document.querySelector("#start-fresh-draft").addEventListener("click", startFreshAfterSavedDraft);

document.querySelector("#new-draft").addEventListener("click", () => {
  startDraft(players.map((player) => player.name));
});

document.querySelector("#return-home").addEventListener("click", () => {
  requestNumber += 1;
  if (advanceTimer) clearTimeout(advanceTimer);
  saveDraft();
  auctionScreen.hidden = true;
  homeScreen.hidden = false;
  roomsScreen.hidden = false;
  updateStartButton();
  showSavedDraftPrompt();
  window.scrollTo(0, 0);
});

showSavedDraftPrompt();
