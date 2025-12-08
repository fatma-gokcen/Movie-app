export function productList(items) {
    return `
    <div class="movie-list">
      ${items
            .map(
                (item) => `
          <div class="movie-card">
            <img src="${item.Poster}" alt="${item.Title}" />
            <h3>${item.Title}</h3>
            <p>${item.Year}</p>
          </div>
        `
            )
            .join("")}
    </div>
  `;
}
