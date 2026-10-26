/// ============================================================
// productos.js — datos compartidos entre catalogo.html e inventario.html
// ============================================================
const CLAVE_PRODUCTOS = "productos";

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#0f121a"/>' +
  '<text x="150" y="158" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#aab">Sin imagen</text></svg>'
);

// Productos iniciales apuntando a tu carpeta imgs/
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Jordan",  descripcion: "Alta, edición azul",    precio: 3499, stock: 10, img: "imgs/JORDAN.jpg",  tallas: [27, 28, 29, 30] },
  { id: 2, nombre: "Dunk",    descripcion: "Clásico urbano",        precio: 2899, stock: 5,  img: "imgs/DUNK.jpg",    tallas: [26, 27, 28, 29, 30] },
  { id: 3, nombre: "Air Max", descripcion: "Amortiguación visible", precio: 3199, stock: 0,  img: "imgs/AIRMAX.jpg",  tallas: [27, 28, 29] },
  { id: 4, nombre: "Gazelle", descripcion: "Gamuza retro",          precio: 2499, stock: 8,  img: "imgs/GAZELLE.jpg", tallas: [26, 27, 28, 29, 30] },
];

function getProductos() {
  try {
    const crudo = localStorage.getItem(CLAVE_PRODUCTOS);
    if (crudo) return JSON.parse(crudo);
  } catch (e) { /* error de parseo */ }
  saveProductos(PRODUCTOS_INICIALES);
  return PRODUCTOS_INICIALES.map((p) => ({ ...p }));
}

function saveProductos(lista) {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(lista));
    return true;
  } catch (e) {
    return false;
  }
}

function descontarStock(lineas) {
  const lista = getProductos();
  lineas.forEach((l) => {
    const p = lista.find((x) => x.id === l.id);
    if (p) p.stock = Math.max(0, p.stock - (l.cantidad || 1));
  });
  saveProductos(lista);
}

const dinero = (n) => Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
const esc = (t) => String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));