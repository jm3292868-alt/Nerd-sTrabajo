// ---------- ELEMENTOS ----------
const grid          = document.getElementById("grid");
const vacio         = document.getElementById("vacio");
const buscador      = document.getElementById("buscador");
const overlay       = document.getElementById("overlay");
const modalImg      = document.getElementById("modal-img");
const modalNombre   = document.getElementById("modal-nombre");
const modalDesc     = document.getElementById("modal-desc");
const tallasBox     = document.getElementById("tallas");
const btnConfirmar  = document.getElementById("btn-confirmar");
const btnCerrar     = document.getElementById("modal-cerrar");
const cartCount     = document.getElementById("cart-count");
const btnCarritoNav = document.getElementById("btn-carrito");

// Elementos del Modal Carrito
const overlayCarrito = document.getElementById("overlay-carrito");
const cartCerrar     = document.getElementById("cart-cerrar");
const cartItemsBox   = document.getElementById("cart-items");
const cartVacioMsg   = document.getElementById("cart-vacio-msg");
const cartTotalCant  = document.getElementById("cart-total-cant");
const btnVaciar      = document.getElementById("btn-vaciar");
const btnComprar     = document.getElementById("btn-comprar");

let productoActual = null;
let tallaActual = null;
let ultimoBoton = null;

// ---------- CARRITO (localStorage) ----------
const leerCarrito = () => JSON.parse(localStorage.getItem("carrito") || "[]");
const guardarCarrito = (c) => localStorage.setItem("carrito", JSON.stringify(c));

function actualizarContador() {
  const total = leerCarrito().length;
  cartCount.textContent = total;
  cartCount.hidden = total === 0;
}

// ---------- RENDER DEL CATÁLOGO ----------
function renderCatalogo(lista) {
  grid.innerHTML = "";
  vacio.hidden = lista.length > 0;

  lista.forEach((p) => {
    const sinStock = Number(p.stock) <= 0;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <button class="card__img-btn" data-id="${p.id}" aria-label="Ver tallas de ${esc(p.nombre)}">
        <img class="card__img" src="${p.img}" alt="${esc(p.nombre)}">
      </button>
      <h3 class="card__nombre">${esc(p.nombre)}</h3>
      <p class="card__precio">${dinero(p.precio)}</p>
      <button class="btn-agregar" data-id="${p.id}" ${sinStock ? "disabled" : ""}>
        ${sinStock ? "Agotado" : "Agregar"}
      </button>
    `;
    grid.appendChild(card);
  });
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn || btn.disabled) return;
  const lista = getProductos();
  const producto = lista.find((p) => p.id === Number(btn.dataset.id));
  if (!producto) return;

  ultimoBoton = btn;
  abrirModal(producto);
});

// ---------- BÚSQUEDA ----------
buscador.addEventListener("input", () => {
  const q = buscador.value.trim().toLowerCase();
  const lista = getProductos();
  renderCatalogo(lista.filter((p) => p.nombre.toLowerCase().includes(q)));
});

// ---------- MODAL TALLAS ----------
function abrirModal(producto) {
  productoActual = producto;
  tallaActual = null;

  modalImg.src = producto.img;
  modalImg.alt = producto.nombre;
  modalNombre.textContent = producto.nombre;
  modalDesc.textContent = producto.descripcion;

  tallasBox.innerHTML = "";
  producto.tallas.forEach((t) => {
    const b = document.createElement("button");
    b.className = "talla";
    b.type = "button";
    b.role = "radio";
    b.setAttribute("aria-checked", "false");
    b.textContent = t;
    b.addEventListener("click", () => seleccionarTalla(t));
    tallasBox.appendChild(b);
  });

  btnConfirmar.disabled = true;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  tallasBox.querySelector(".talla")?.focus();
}

function seleccionarTalla(t) {
  tallaActual = t;
  tallasBox.querySelectorAll(".talla").forEach((b) => {
    b.setAttribute("aria-checked", String(Number(b.textContent) === t));
  });
  btnConfirmar.disabled = false;
}

function cerrarModal() {
  overlay.hidden = true;
  document.body.style.overflow = "";
  ultimoBoton?.focus();
}

btnConfirmar.addEventListener("click", () => {
  if (!productoActual || tallaActual === null) return;

  const carrito = leerCarrito();
  carrito.push({
    id: productoActual.id,
    nombre: productoActual.nombre,
    precio: productoActual.precio,
    img: productoActual.img,
    talla: tallaActual,
  });
  guardarCarrito(carrito);

  actualizarContador();
  cerrarModal();
});

btnCerrar.addEventListener("click", cerrarModal);

// ---------- MODAL DEL CARRITO DE COMPRAS ----------
function renderCarritoModal() {
  const carrito = leerCarrito();
  cartItemsBox.innerHTML = "";
  
  const tieneItems = carrito.length > 0;
  cartVacioMsg.hidden = tieneItems;
  btnComprar.disabled = !tieneItems;
  cartTotalCant.textContent = carrito.length;

  carrito.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "cart__item";
    el.innerHTML = `
      <div class="cart__item-info">
        <img class="cart__item-img" src="${item.img}" alt="${esc(item.nombre)}">
        <div class="cart__item-detalles">
          <h4>${esc(item.nombre)}</h4>
          <p>Talla: ${item.talla} MX — ${dinero(item.precio)}</p>
        </div>
      </div>
      <button class="cart__item-eliminar" onclick="eliminarDelCarrito(${index})" aria-label="Eliminar producto">&times;</button>
    `;
    cartItemsBox.appendChild(el);
  });
}

window.eliminarDelCarrito = function(index) {
  const carrito = leerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  actualizarContador();
  renderCarritoModal();
};

function abrirCarrito() {
  renderCarritoModal();
  overlayCarrito.hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarCarritoModal() {
  overlayCarrito.hidden = true;
  document.body.style.overflow = "";
}

btnCarritoNav.addEventListener("click", abrirCarrito);
cartCerrar.addEventListener("click", cerrarCarritoModal);

btnVaciar.addEventListener("click", () => {
  guardarCarrito([]);
  actualizarContador();
  renderCarritoModal();
});

// FINALIZAR COMPRA: Resta del stock real usando descontarStock()
btnComprar.addEventListener("click", () => {
  const carrito = leerCarrito();
  if (carrito.length === 0) return;

  // Agrupar compras por id para calcular la cantidad a restar
  const lineas = [];
  carrito.forEach((item) => {
    const existe = lineas.find((l) => l.id === item.id);
    if (existe) {
      existe.cantidad++;
    } else {
      lineas.push({ id: item.id, cantidad: 1 });
    }
  });

  // Descontar del inventario centralizado
  descontarStock(lineas);

  alert("¡Gracias por tu compra en Nerds Snkrz! Tu pedido está en camino.");
  guardarCarrito([]);
  actualizarContador();
  cerrarCarritoModal();
  renderCatalogo(getProductos()); // Actualiza el catálogo en pantalla
});

// Cerrar overlays con clic fuera o tecla ESC
overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrarModal(); });
overlayCarrito.addEventListener("click", (e) => { if (e.target === overlayCarrito) cerrarCarritoModal(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!overlay.hidden) cerrarModal();
    if (!overlayCarrito.hidden) cerrarCarritoModal();
  }
});

// Sincronizar en tiempo real si se modifica el inventario desde otra pestaña
window.addEventListener("storage", (e) => {
  if (e.key === CLAVE_PRODUCTOS) {
    renderCatalogo(getProductos());
  }
});

// ---------- INICIALIZACIÓN ----------
renderCatalogo(getProductos());
actualizarContador();