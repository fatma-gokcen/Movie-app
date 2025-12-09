import { loadingSpinner } from "./components/loadingSpinner.js";
import { errorMessage } from "./components/errorMessage.js";
import { productList } from "./components/productList.js";

// HTML içindeki "app" elementini seçiyoruz.
const app = document.getElementById("app");

// backtick (template litreal) kullanıldı çünkü: çok satırlı string + değişken eklemek için en pratik yol.
app.innerHTML = `
  <h1>Movie App</h1>
  <div class = "search-box">
  <input type= "text" id= "searchInput" placeholder = "Search movie...">
  <button id = "searchBtn">Search</button>
  </div>
  <div id="content"></div>
`;

const content = document.getElementById("content");

const API_KEY = import.meta.env.VITE_API_KEY;
const movies = ["batman", "joker", "avengers", "inception"];
const randomMovie = movies[Math.floor(Math.random() * movies.length)];
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${randomMovie}`;

loadMovies();

// Arama butonuna tıklandığında arama
document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim();
    searchMovies(query);

});
// Enter ile arama
document.getElementById("searchInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const query = document.getElementById("searchInput").value.trim();
        searchMovies(query);
    }
});


async function searchMovies(query) {
    if (!query) {
        content.innerHTML = errorMessage("Please enter a movie name!");
        return;
    }

    content.innerHTML = loadingSpinner();

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);

        const data = await response.json();

        if (data.Response === "False") {
            throw new Error(data.Error || "Movie not found!");
        }

        content.innerHTML = productList(data.Search);

    } catch (err) {
        content.innerHTML = errorMessage(err.message);
    }
}

async function loadMovies() {
    content.innerHTML = loadingSpinner();

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        console.log(data);

        if (!data.Search) {
            throw new Error(data.Error || "Movie not found!");
        }

        content.innerHTML = productList(data.Search);

    } catch (err) {
        content.innerHTML = errorMessage(err.message);
    }
}
