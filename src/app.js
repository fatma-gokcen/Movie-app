import { loadingSpinner } from "./components/loadingSpinner.js";
import { errorMessage } from "./components/errorMessage.js";
import { productList } from "./components/productList.js";
import { movieDetailsComponent } from "./components/movieDetailsComponent.js"; // Detay component import edildi


// HTML içindeki "app" elementini seçiyoruz.
const app = document.getElementById("app");

// Uygulama yapısı (Başlık ve Arama Kutusu)
app.innerHTML = `
    <h1>Movie App</h1>
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search movie...">
        <button id="searchBtn">Search</button>
    </div>
    <div id="content"></div>
`;

const content = document.getElementById("content");

const API_KEY = import.meta.env.VITE_API_KEY;
const movies = ["batman", "joker", "avengers", "inception"];
const randomMovie = movies[Math.floor(Math.random() * movies.length)];
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${randomMovie}`;


// --- Olay Dinleyicileri (Event Listeners) ---

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

// URL değiştiğinde (geri/ileri butonu) içeriği güncelle
window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    const movieID = params.get('movie');
    if (movieID) {
        renderMovieDetails(movieID);
    } else {
        // Ana sayfaya dönmek isterse (Bu, filmin yeniden yüklenmesini tetikler)
        loadMovies();
    }
});

// Uygulama ilk yüklendiğinde URL'de film ID'si var mı kontrol et
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const movieID = params.get('movie');
    if (movieID) {
        renderMovieDetails(movieID); // Film ID'si varsa detay sayfasını göster
    } else {
        loadMovies(); // Yoksa ana sayfayı yükle
    }
});


// --- Fonksiyonlar ---

/**
 * Ana sayfa açılışında rastgele filmleri yükler.
 */
async function loadMovies() {
    content.innerHTML = loadingSpinner();

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.Search) {
            throw new Error(data.Error || "Movie not found!");
        }

        content.innerHTML = productList(data.Search);
        addMovieCardListeners(); // <-- KRİTİK: Dinleyicileri ekle
    } catch (err) {
        content.innerHTML = errorMessage(err.message);
    }
}


/**
 * Kullanıcının girdiği sorgu ile film arar.
 */
async function searchMovies(query) {
    if (!query) {
        // Arama kutusu boşsa hata göster
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
        addMovieCardListeners(); // <-- KRİTİK: Dinleyicileri ekle

    } catch (err) {
        content.innerHTML = errorMessage(err.message);
    }
}


/**
 * Film kartlarına tıklama olay dinleyicisi ekler (Detay sayfasına yönlendirme).
 */
function addMovieCardListeners() {
    document.querySelectorAll(".movie-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.imdbid; // data-imdbid özniteliğini doğru şekilde yakalar
            navigateToDetails(id);
        });
    });
}

/**
 * URL'yi günceller ve film detaylarını yükler.
 * @param {string} id - IMDB ID
 */
function navigateToDetails(id) {
    // history.pushState ile URL'i değiştiririz (Sayfa yenilemesi olmadan detay sayfası)
    history.pushState({ id: id }, '', `?movie=${id}`);
    renderMovieDetails(id);
}

/**
 * Verilen IMDB ID'sine göre film detaylarını API'den çeker ve render eder.
 * @param {string} id - IMDB ID
 */
async function renderMovieDetails(id) {
    content.innerHTML = loadingSpinner();
    try {
        // Tek bir filmin detaylarını çekmek için 'i=' parametresi kullanılır
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
        const movieDetails = await response.json();

        if (movieDetails.Response === "False") {
            throw new Error(movieDetails.Error || "Movie details not found!");
        }

        // Detay component'ini ekrana basar
        content.innerHTML = movieDetailsComponent(movieDetails);
    } catch (error) {
        content.innerHTML = errorMessage(error.message);
    }
}