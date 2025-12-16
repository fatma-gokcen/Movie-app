import { getWatchlist } from "../app.js";

export function productList(items) {
  const currentWatchlist = getWatchlist();
  return `
    <div class="movie-list">
      ${items
      .map(
        (item) => {
          // Posteri kontrol et: N/A ise veya boş ise yer tutucu kullan
          const poster = (item.Poster && item.Poster !== "N/A")
            ? item.Poster
            : // Doğru format
            "https://via.placeholder.com/300x450?text=Poster+Bulunamadı"; // <-- Yer tutucu URL

          // 2. ADIM: LİSTEDEKİ DURUMU KONTROL ETME
          const isWatchlisted = currentWatchlist.includes(item.imdbID);
          const buttonText = isWatchlisted ? "✅ Listedeki Filmler" : "➕ İzleme Listesine Ekle";
          const buttonClass = isWatchlisted ? "watchlist-btn listed" : "watchlist-btn";


          return `
              <div class="movie-card" data-imdbid="${item.imdbID}">
                <img 
                  src="${poster}" 
                  alt="${item.Title}" 
                  onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=Yüklenemedi';" 
                />
                <h3>${item.Title}</h3>
                <p>${item.Year}</p>
                
                <button 
                    class="${buttonClass}" 
                    data-imdbid="${item.imdbID}"
                >
                    ${buttonText}
                </button>
                </div>
            `;
        }
      )
      .join("")}
    </div>
  `;
}