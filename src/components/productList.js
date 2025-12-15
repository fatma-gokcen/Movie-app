export function productList(items) {
  return `
    <div class="movie-list">
      ${items
      .map(
        (item) => {
          // Posteri kontrol et: N/A ise veya boş ise yer tutucu kullan
          const poster = (item.Poster && item.Poster !== "N/A")
            ? item.Poster
            : "https://via.placeholder.com/300x450?text=Poster+Bulunamadı"; // <-- Yer tutucu URL

          return `
                  <div class="movie-card" data-imdbid="${item.imdbID}">
                    <img 
                      src="${poster}" 
                      alt="${item.Title}" 
                      onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=Yüklenemedi';" // <-- ÖNEMLİ: Hata durumunda resim değiştirme
                    />
                    <h3>${item.Title}</h3>
                    <p>${item.Year}</p>
                  </div>
                `;
        }
      )
      .join("")}
    </div>
  `;
}