// --- 1. MODÜL İMPORTLARI ---
import { loadingSpinner } from "./components/loadingSpinner.js";
import { errorMessage } from "./components/errorMessage.js";
import { productList } from "./components/productList.js";
import { movieDetailsComponent } from "./components/movieDetailsComponent.js"; // Detay component import edildi


// --- 2. TEMEL DEĞİŞKENLER VE YAPILANDIRMA ---

// HTML içindeki "app" elementini seçiyoruz.
const app = document.getElementById("app");

// Uygulama yapısı (Başlık, Watchlist Butonu ve Arama Kutusu)
app.innerHTML = `
    <div class="header-container">
        <h1 id="appTitle"> 🎥CineTrack</h1>
        <button id="watchlistBtn" class="primary-btn">İzleme Listem</button> 
    </div>
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="Dizi veya film arayın...">
        <button id="searchBtn">Ara</button>
    </div>

<div class="filter-container">
        <select id="genreFilter">
            <option value="all">Tüm Türler</option>
            <option value="Action">Aksiyon</option>
            <option value="Comedy">Komedi</option>
            <option value="Drama">Dram</option>
            <option value="Horror">Korku</option>
            <option value="Sci-Fi">Bilim Kurgu</option>
        </select>
</div>
    <div id="content"></div>
`;

const content = document.getElementById("content");

const API_KEY = import.meta.env.VITE_API_KEY;
const movies = ["batman", "joker", "avengers", "inception"];
const randomMovie = movies[Math.floor(Math.random() * movies.length)];
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${randomMovie}`;


// --- 3. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---

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

// Başlığa tıklanıldığında ana sayfaya yönlendirme
document.getElementById("appTitle").addEventListener("click", () => {
    // URL'deki tüm parametreleri ve rotayı temizleyip kök dizine döner
    history.pushState(null, '', window.location.pathname.split('?')[0]);
    loadMovies();
    document.getElementById("searchInput").value = "";
});

// Watchlist butonu tıklama dinleyicisi
document.getElementById("watchlistBtn").addEventListener("click", () => {
    navigateToWatchlist();
});

// URL değiştiğinde (geri/ileri butonu) içeriği güncelle
window.addEventListener('popstate', (event) => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const movieID = params.get('movie');

    if (movieID) {
        renderMovieDetails(movieID);
    } else if (path === '/watchlist') {
        renderWatchlist();
    } else {
        loadMovies();
    }
});

// Uygulama ilk yüklendiğinde URL kontrolü
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const movieID = params.get('movie');

    if (movieID) {
        renderMovieDetails(movieID);
    } else if (path === '/watchlist') {
        renderWatchlist();
    } else {
        loadMovies();
    }
});

document.getElementById("genreFilter").addEventListener("change", applyGenreFilter);

// --- 4. TEMEL İŞLEV FONKSİYONLARI ---

// Ana sayfa açılışında rastgele filmleri yükler.
async function loadMovies() {
    content.innerHTML = loadingSpinner();

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.Search) {
            throw new Error(data.Error || "Movie not found!");
        }

        content.innerHTML = productList(data.Search);
        addMovieCardListeners();
        addWatchlistButtonListeners(); // Watchlist dinleyicisi eklendi
    } catch (err) {
        content.innerHTML = errorMessage(err.message);
    }
}


/**
 * Kullanıcının girdiği sorgu ile film arar.
 */
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
        addMovieCardListeners();
        addWatchlistButtonListeners(); // Watchlist dinleyicisi eklendi
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
            const id = card.dataset.imdbid;
            navigateToDetails(id);
        });
    });
}

/**
 * URL'yi günceller ve film detaylarını yükler.
 * @param {string} id - OMDB ID
 */
function navigateToDetails(id) {
    history.pushState({ id: id }, '', `?movie=${id}`);
    renderMovieDetails(id);
}


// --- 5. İZLEME LİSTESİ (WATCHLIST) FONKSİYONLARI ---

// LocalStorge'dan izlenme listesini çeker.
/** * @returns  {string[]} İzleme listesindeki ID'ler dizisi
 */
export function getWatchlist() { // Dışa aktarıldı
    const watchlistJSON = localStorage.getItem('watchlist')
    return watchlistJSON ? JSON.parse(watchlistJSON) : []
}

/**
 * Güncel izleme listesi dizisini LocalStorage'a kaydeder.
 * @param {string[]} watchlist - Yeni izleme listesi dizisi
 */
export function saveWatchlist(watchlist) { // Dışa aktarıldı
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

/**
 * Filmi listeden çıkarır veya ekler.
 * @param {string} imdbID
 * @returns {boolean} Filmin listede olup olmadığı (son durum)
 */
export function toggleWatchList(imdbID) { // Dışa aktarıldı
    const watchlist = getWatchlist();
    const index = watchlist.indexOf(imdbID)

    if (index === -1) {
        watchlist.push(imdbID)
        saveWatchlist(watchlist);
        return true;
    } else {
        watchlist.splice(index, 1);
        saveWatchlist(watchlist);
        return false;
    }
}

/**
 * İzleme listesi butonlarına tıklama olay dinleyicisi ekler.
 */
export function addWatchlistButtonListeners() {
    document.querySelectorAll(".watchlist-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();

            const imdbID = button.dataset.imdbid;
            const isAdded = toggleWatchList(imdbID);

            if (isAdded) {
                button.textContent = "✅ İzlenme Listesine Eklendi";
                button.classList.add('listed');
            } else {
                button.textContent = "➕ İzleme Listesine Ekle";
                button.classList.remove('listed');
            }
        });
    });
}

/**
 * URL'yi /watchlist rotasına yönlendirir.
 */
function navigateToWatchlist() {
    history.pushState(null, '', '/watchlist');
    renderWatchlist();
    document.getElementById("searchInput").value = "";
}


/**
 * İzleme Listesindeki filmleri LocalStorage'dan çeker ve API'den detaylarını alır.
 */
async function renderWatchlist() {
    const watchlistIDs = getWatchlist();
    content.innerHTML = loadingSpinner();

    if (watchlistIDs.length === 0) {
        content.innerHTML = errorMessage("İzleme listenizde henüz film bulunmamaktadır.");
        return;
    }

    try {
        const detailPromises = watchlistIDs.map(id =>
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=short`)
                .then(res => res.json())
        );

        const moviesDetails = await Promise.all(detailPromises);
        const validMovies = moviesDetails.filter(movie => movie.Response === "True");

        if (validMovies.length === 0) {
            content.innerHTML = errorMessage("İzleme listenizdeki filmlerin detayları alınamadı.");
            return;
        }

        // Global değişkene ata
        watchlistMovies = validMovies;

        // Arayüzü oluştur: Temizle butonu + Film listesi
        content.innerHTML = `
            <div class="watchlist-actions">
                <button id="clearAllBtn" class="danger-btn">🗑️ Tümünü Temizle</button>
            </div>
            <div id="watchlistContent">${productList(validMovies)}</div>
        `;

        // Olay dinleyicilerini ekle
        addMovieCardListeners();
        addWatchlistButtonListeners();

        // Temizle butonuna tıklandığında
        document.getElementById("clearAllBtn").addEventListener("click", () => {
            if (confirm("Tüm izleme listenizi silmek istediğinize emin misiniz?")) {
                saveWatchlist([]); // LocalStorage temizle
                renderWatchlist(); // Sayfayı yenile
            }
        });

    } catch (err) {
        console.error(err);
        content.innerHTML = errorMessage("İzleme listesi yüklenirken bir hata oluştu.");
    }
}

// --- 6. DETAY SAYFASI İŞLEVİ ---

async function renderMovieDetails(id) {
    content.innerHTML = loadingSpinner();
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
        const movieDetails = await response.json();

        if (movieDetails.Response === "False") {
            throw new Error(movieDetails.Error || "Movie details not found!");
        }

        content.innerHTML = movieDetailsComponent(movieDetails);
    } catch (error) {
        content.innerHTML = errorMessage(error.message);
    }
}
// FİLTRELEME SAYFASI İŞLEVİ
let watchlistMovies = []; // İzleme listesindeki detaylı verileri burada tutacağız

function applyGenreFilter() {
    const selectedGenre = document.getElementById("genreFilter").value;

    if (selectedGenre === "all") {
        content.innerHTML = productList(watchlistMovies);
    } else {
        const filtered = watchlistMovies.filter(movie =>
            movie.Genre && movie.Genre.includes(selectedGenre)
        );
        content.innerHTML = productList(filtered);
    }

    // Filtrelemeden sonra dinleyicileri tekrar eklemeliyiz
    addMovieCardListeners();
    addWatchlistButtonListeners();
}
