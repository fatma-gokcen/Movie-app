export function movieDetailsComponent(movie) {
    const poster = (movie.Poster && movie.Poster !== "N/A")
        ? movie.Poster
        : "https://via.placeholder.com/300x450?text=Poster+Yok";

    // Arama sorgusu oluştur (Örn: "Inception 2010 official trailer")
    const trailerQuery = encodeURIComponent(`${movie.Title} ${movie.Year} official trailer`);

    return `
        <div class="details-container">
            <h2 class="details-title">${movie.Title} (${movie.Year})</h2>
            
            <div class="details-content">
                <div class="details-poster-area">
                    <img 
                        src="${poster}" 
                        alt="${movie.Title}"
                        class="details-poster"
                        onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=Yüklenemedi';"
                    >
                    <div class="rating-box">IMDB Puanı: ${movie.imdbRating} / 10</div>
                    
                    <a href="https://www.youtube.com/results?search_query=${trailerQuery}" 
                       target="_blank" 
                       class="trailer-btn">
                       🎬 Fragmanı İzle
                    </a>
                </div>

                <div class="details-info-area"> 
                    <div class="key-info">
                        <p><strong>Yönetmen:</strong> ${movie.Director}</p>
                        <p><strong>Oyuncular:</strong> ${movie.Actors}</p>
                        <p><strong>Tür:</strong> ${movie.Genre}</p>
                        <p><strong>Süre:</strong> ${movie.Runtime}</p>
                        <p><strong>Çıkış Tarihi:</strong> ${movie.Released}</p>
                        <p><strong>Ödüller:</strong> ${movie.Awards !== 'N/A' ? movie.Awards : 'Yok'}</p>
                        <p><strong>Box Office:</strong> ${movie.BoxOffice !== 'N/A' ? movie.BoxOffice : 'Veri Yok'}</p>
                    </div>

                    <div class="details-plot-area">
                        <h3>Özet</h3>
                        <p>${movie.Plot}</p>
                    </div>
                </div>
            </div>
            
            <button id="backToListBtn" class="primary-btn" onclick="history.back()">← Geri Dön</button>
        </div>
    `;
}