// components/movieDetailsComponent.js
export function movieDetailsComponent(movie) {
    const poster = movie.Poster !== "N/A"
        ? movie.Poster
        : "https://via.placeholder.com/300x450?text=No+Image";

    return `
        <div class="movie-details-container">
            <button class="back-button" onclick="history.back()">← Geri Dön</button>
            <div class="movie-details-card">
                <img src="${poster}" alt="${movie.Title}" class="details-poster">
                <div class="details-content">
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <p><strong>Yönetmen:</strong> ${movie.Director}</p>
                    <p><strong>Oyuncular:</strong> ${movie.Actors}</p>
                    <p><strong>Tür:</strong> ${movie.Genre}</p>
                    <p><strong>Çıkış Tarihi:</strong> ${movie.Released}</p>
                    <p><strong>Süre:</strong> ${movie.Runtime}</p>
                    <p><strong>IMDB Puanı:</strong> ${movie.imdbRating} / 10</p>
                    <p><strong>Özet:</strong> ${movie.Plot}</p>
                    <p><strong>Ödüller:</strong> ${movie.Awards}</p>
                </div>
            </div>
        </div>
    `;
}