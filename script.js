const apiKey = '23f02372'; 
const movieInput = document.getElementById("movieInput");
const movieInfo = document.getElementById("movieInfo");
const loader = document.getElementById("loader");
const errorDiv = document.getElementById("error");

// Toggle dark/light mode
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

getMovie(API_URL);

async function getMovie(url) {
  const res = await fetch(url);
  const data = await res.json();
  showMovies(data.results);
}
function showMovies(movies) {
  main.innerHTML = "";

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}" loading="lazy" />
        <div class="movie-info">
            <h3>${title}</h3>
            <span class="${getClassByRate(vote_average)}">${vote_average}</span>
        </div>
        <div class="overview">
            <h3>Overview</h3>
            <p>${overview}</p>
        </div>
      `;

    main.appendChild(movieEl);
  });
}

// Main movie search function
function searchMovie() {
  const query = movieInput.value.trim();
  if (!query) return;


  movieInfo.innerHTML = '';
  errorDiv.textContent = '';
  loader.style.display = 'block';

  //  Search movies by name (s=)
  fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        const imdbFetches = data.Search.map(movie =>
          fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
            .then(response => response.json())
        );

        //  Fetch full IMDb details
        Promise.all(imdbFetches).then(fullDetails => {
          loader.style.display = 'none';
          movieInfo.innerHTML = fullDetails.map(movie => `
            <div class="movie-card">
              <img src="${movie.Poster}" alt="${movie.Title} Poster" />
              <h3>${movie.Title} (${movie.Year})</h3>
              <p><strong>Rating:</strong> ${movie.imdbRating}</p>
              <p><strong>Runtime:</strong> ${movie.Runtime}</p>
              <p><strong>Plot:</strong> ${movie.Plot}</p>
              <button onclick="saveFavorite('${movie.imdbID}')">❤️ Save</button>
            </div>
          `).join('');
        });
      } else {
        loader.style.display = 'none';
        errorDiv.textContent = "Movie not found. Try again.";
      }
    })
    .catch(() => {
      loader.style.display = 'none';
      errorDiv.textContent = "Error fetching movie data.";
    });
}

// Save favorite to localStorage
function saveFavorite(imdbID) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(imdbID)) {
    favorites.push(imdbID);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Movie saved to favorites!");
  } else {
    alert("This movie is already in favorites!");
  }
}
