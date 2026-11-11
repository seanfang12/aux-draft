// Curated starter pools for each room. Titles and artists are used to verify
// the matching result returned by the iTunes Search API.
const hipHopSongs = [
  { title: "Lose Yourself", artist: "Eminem" },
  { title: "In da Club", artist: "50 Cent" },
  { title: "Hey Ya!", artist: "Outkast" },
  { title: "Ms. Jackson", artist: "Outkast" },
  { title: "Juicy", artist: "The Notorious B.I.G." },
  { title: "Still D.R.E.", artist: "Dr. Dre" },
  { title: "Work It", artist: "Missy Elliott" },
  { title: "Drop It Like It's Hot", artist: "Snoop Dogg" },
  { title: "HUMBLE.", artist: "Kendrick Lamar" },
  { title: "Hotline Bling", artist: "Drake" },
  { title: "Empire State of Mind", artist: "JAY-Z" },
  { title: "Sicko Mode", artist: "Travis Scott" },
  { title: "Savage", artist: "Megan Thee Stallion" },
  { title: "Rapper's Delight", artist: "The Sugarhill Gang" },
  { title: "California Love", artist: "2Pac" }
];

const throwbackSongs = [
  { title: "Crazy in Love", artist: "Beyoncé" },
  { title: "Since U Been Gone", artist: "Kelly Clarkson" },
  { title: "Toxic", artist: "Britney Spears" },
  { title: "Mr. Brightside", artist: "The Killers" },
  { title: "Yeah!", artist: "Usher" },
  { title: "Hips Don't Lie", artist: "Shakira" },
  { title: "Umbrella", artist: "Rihanna" },
  { title: "Poker Face", artist: "Lady Gaga" },
  { title: "I Gotta Feeling", artist: "Black Eyed Peas" },
  { title: "Low", artist: "Flo Rida" },
  { title: "Gold Digger", artist: "Kanye West" },
  { title: "Complicated", artist: "Avril Lavigne" },
  { title: "Seven Nation Army", artist: "The White Stripes" },
  { title: "American Idiot", artist: "Green Day" },
  { title: "No One", artist: "Alicia Keys" },
  { title: "Beautiful Day", artist: "U2" }
];

const popSongs = [
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Shake It Off", artist: "Taylor Swift" },
  { title: "Bad Romance", artist: "Lady Gaga" },
  { title: "Firework", artist: "Katy Perry" },
  { title: "Uptown Funk", artist: "Mark Ronson" },
  { title: "Happy", artist: "Pharrell Williams" },
  { title: "Call Me Maybe", artist: "Carly Rae Jepsen" },
  { title: "Rolling in the Deep", artist: "Adele" },
  { title: "I Wanna Dance with Somebody (Who Loves Me)", artist: "Whitney Houston" },
  { title: "Dancing Queen", artist: "ABBA" },
  { title: "Levitating", artist: "Dua Lipa" },
  { title: "Billie Jean", artist: "Michael Jackson" },
  { title: "Espresso", artist: "Sabrina Carpenter" },
  { title: "I Want It That Way", artist: "Backstreet Boys" },
  { title: "...Baby One More Time", artist: "Britney Spears" }
];

const countrySongs = [
  { title: "Friends in Low Places", artist: "Garth Brooks" },
  { title: "Man! I Feel Like a Woman!", artist: "Shania Twain" },
  { title: "Before He Cheats", artist: "Carrie Underwood" },
  { title: "Tennessee Whiskey", artist: "Chris Stapleton" },
  { title: "Jolene", artist: "Dolly Parton" },
  { title: "Chicken Fried", artist: "Zac Brown Band" },
  { title: "Wagon Wheel", artist: "Darius Rucker" },
  { title: "Take Me Home, Country Roads", artist: "John Denver" },
  { title: "Need You Now", artist: "Lady A" },
  { title: "The Gambler", artist: "Kenny Rogers" },
  { title: "Ring of Fire", artist: "Johnny Cash" },
  { title: "Fancy", artist: "Reba McEntire" },
  { title: "Austin", artist: "Blake Shelton" },
  { title: "The Dance", artist: "Garth Brooks" }
];

const rockSongs = [
  { title: "Mr. Brightside", artist: "The Killers" },
  { title: "Seven Nation Army", artist: "The White Stripes" },
  { title: "Smells Like Teen Spirit", artist: "Nirvana" },
  { title: "Bohemian Rhapsody", artist: "Queen" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
  { title: "Don't Stop Believin'", artist: "Journey" },
  { title: "Everlong", artist: "Foo Fighters" },
  { title: "Wonderwall", artist: "Oasis" },
  { title: "Livin' on a Prayer", artist: "Bon Jovi" },
  { title: "Basket Case", artist: "Green Day" },
  { title: "Dream On", artist: "Aerosmith" },
  { title: "Back in Black", artist: "AC/DC" },
  { title: "Creep", artist: "Radiohead" },
  { title: "We Will Rock You", artist: "Queen" }
];

const rAndBSongs = [
  { title: "No Scrubs", artist: "TLC" },
  { title: "Yeah!", artist: "Usher" },
  { title: "Crazy", artist: "Gnarls Barkley" },
  { title: "I Will Always Love You", artist: "Whitney Houston" },
  { title: "Let's Stay Together", artist: "Al Green" },
  { title: "Respect", artist: "Aretha Franklin" },
  { title: "Superstition", artist: "Stevie Wonder" },
  { title: "My Girl", artist: "The Temptations" },
  { title: "Fallin'", artist: "Alicia Keys" },
  { title: "Adorn", artist: "Miguel" },
  { title: "Ordinary People", artist: "John Legend" },
  { title: "Say My Name", artist: "Destiny's Child" },
  { title: "End of the Road", artist: "Boyz II Men" },
  { title: "Let's Get It On", artist: "Marvin Gaye" }
];

const edmSongs = [
  { title: "Titanium", artist: "David Guetta" },
  { title: "Clarity", artist: "Zedd" },
  { title: "Wake Me Up", artist: "Avicii" },
  { title: "Levels", artist: "Avicii" },
  { title: "Music Sounds Better with You", artist: "Stardust" },
  { title: "One More Time", artist: "Daft Punk" },
  { title: "Sandstorm", artist: "Darude" },
  { title: "The Nights", artist: "Avicii" },
  { title: "Scary Monsters and Nice Sprites", artist: "Skrillex" },
  { title: "Animals", artist: "Martin Garrix" },
  { title: "Everytime We Touch", artist: "Cascada" },
  { title: "We Found Love", artist: "Rihanna" },
  { title: "Don't You Worry Child", artist: "Swedish House Mafia" },
  { title: "Rather Be", artist: "Clean Bandit" }
];

const allGenreSongs = [];
const allRoomSongs = hipHopSongs.concat(throwbackSongs, popSongs, countrySongs, rockSongs, rAndBSongs, edmSongs);
const allGenreKeys = [];

allRoomSongs.forEach((song) => {
  const songKey = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
  if (!allGenreKeys.includes(songKey)) {
    allGenreKeys.push(songKey);
    allGenreSongs.push(song);
  }
});

const songPools = {
  "Hip-Hop & Rap": hipHopSongs,
  "2000s Throwbacks": throwbackSongs,
  "Pop": popSongs,
  "Country": countrySongs,
  "Rock & Alternative": rockSongs,
  "R&B & Soul": rAndBSongs,
  "EDM & Dance": edmSongs,
  "All Genres": allGenreSongs
};
