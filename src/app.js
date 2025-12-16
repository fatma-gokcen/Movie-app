import { loadingSpinner } from "./components/loadingSpinner.js";
import { errorMessage } from "./components/errorMessage.js";
import { productList } from "./components/productList.js";
import { movieDetailsComponent } from "./components/movieDetailsComponent.js"; // Detay component import edildi


// HTML içindeki "app" elementini seçiyoruz.
const app = document.getElementById("app");

// Uygulama yapısı (Başlık ve Arama Kutusu)
app.innerHTML = `
<div class= "header-container">
<h1 id="appTitle">Movie App</h1>
        <button id="watchlistBtn" class="primary-btn">İzlenme  Listem</button> 
</div>
   
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

// Başlığa tıklanıldığında ana sayfaya yönlendirme
document.querySelector("h1").addEventListener("click", () => {
    history.pushState(null, '', window.location.pathname)

    loadMovies();

    // Arama kuutusu temizlenecek
    document.getElementById("searchInput").value = "";
});

// Watchlist butonu tıklama dinleyicisi
document.getElementById("watchListBtn").addEventListener("click", () => {
    navigateToWatchList();
})



//  Fonksiyonlar 

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
        addWatchlistButtonListeners();
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
        addWatchlistButtonListeners();
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

// LocalStorge'dan izlenme listesini çeker.
/** 
@returns  {string[]}
*/
export function getWatchlist() {
    const watchlistJSON = localStorage.getItem('watchlist')
    return watchlistJSON ? JSON.parse(watchlistJSON) : []
}

/**
 * Güncel izleme listesi dizisini LocalStorage'a kaydeder.
 * @param {string[]} watchlist - Yeni izleme listesi dizisi
 */
export function saveWatchlist(watchlist) {
    // JavaScript dizisini JSON string'e dönüştürerek kaydeder.
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}
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
/**
 * @params {string} imdbID
 * @returns {boolean}
 */
export function toggleWatchList(imdbID) {
    const watchlist = getWatchlist();
    const index = watchlist.indexOf(imdbID)

    if (index === -1) {
        // film listesinde yoksa ekle
        watchlist.push(imdbID)
        saveWatchlist(watchlist);
        return true;
    } else {
        // film listesinde varsa çıkar
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
            // Tıklamanın kartın ana olayını tetiklemesini engeller
            e.stopPropagation();

            const imdbID = button.dataset.imdbid;
            const isAdded = toggleWatchList(imdbID);

            // Butonun görünümünü güncelle
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

function navigateToWatchlist() {
    history.pushState(null, '', '/watchlist'); // URL'yi /watchlist olarak değiştir
    renderWatchlist();
    document.getElementById("searchInput").value = ""; // Arama kutusunu temizle
}

/**
 * İzleme Listesindeki filmleri LocalStorage'dan çeker ve API'den detaylarını alır.
 */
async function renderWatchlist() {
    content.innerHTML = loadingSpinner();
    // getWatchlist fonksiyonu zaten export edildiği için kullanılabilir.
    const watchlistIDs = getWatchlist();

    if (watchlistIDs.length === 0) {
        content.innerHTML = errorMessage("İzleme listenizde henüz film bulunmamaktadır.");
        return;
    }

    try {
        // Tüm ID'ler için detay çekme işlemlerini paralel başlat
        const detailPromises = watchlistIDs.map(id =>
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=short`)
                .then(res => res.json())
        );

        // Tüm detaylar gelene kadar bekle
        const moviesDetails = await Promise.all(detailPromises);

        // Sadece başarılı yanıtları filtrele
        const validMovies = moviesDetails.filter(movie => movie.Response === "True");

        if (validMovies.length === 0) {
            content.innerHTML = errorMessage("İzleme listenizdeki filmlerin detayları alınamadı.");
            return;
        }

        // productList'i Watchlist içeriğiyle render et
        content.innerHTML = productList(validMovies);
        addMovieCardListeners();
        addWatchlistButtonListeners();

    } catch (err) {
        content.innerHTML = errorMessage("İzleme listesi yüklenirken bir hata oluştu.");
    }
}