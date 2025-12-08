import { productCard } from "./productCard";

export function productList(items) {
    return `
    <div class ="product-list">${items.map(i => productCard(i)).join('')}</div>
    `;
}