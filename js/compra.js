// ---------- ELEMENTOS DEL DOM ----------
const cartTbody = document.getElementById("cart-tbody");
const numProductosSpan = document.getElementById("num-productos");
const subtotalSpan = document.getElementById("subtotal");
const envioSpan = document.getElementById("envio");
const totalSpan = document.getElementById("total");
const totalModalSpan = document.getElementById("total-modal");

const btnPago = document.getElementById("btn-pago");
const ventanaDatos = document.getElementById("ventana-datos");
const btnCancelar = document.getElementById("btn-cancelar");
const formDatos = document.getElementById("form-datos");

const COSTO_ENVIO = 1000; // Puedes ajustar el costo de envío fijo o hacerlo dinámico

// ---------- CARRITO (localStorage) ----------
const leerCarrito = () => JSON.parse(localStorage.getItem("carrito") || "[]");
const guardarCarrito = (c) => localStorage.setItem("carrito", JSON.stringify(c));

// ---------- RENDERIZAR CARRITO ----------
function renderCarrito() {
  const carrito = leerCarrito();
  cartTbody.innerHTML = "";

  if (carrito.length === 0) {
    cartTbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
          Tu carrito está vacío. <a href="./catalogo.html" style="color: inherit; text-decoration: underline;">Ir al catálogo</a>
        </td>
      </tr>
    `;
    actualizarResumen(0, 0);
    btnPago.disabled = true;
    return;
  }

  btnPago.disabled = false;
  let subtotalAcumulado = 0;
  let totalCantidadItems = 0;

  carrito.forEach((item, index) => {
    // Si el item no tiene cantidad asignada por defecto, le ponemos 1
    const cantidad = item.cantidad || 1;
    subtotalAcumulado += item.precio * cantidad;
    totalCantidadItems += cantidad;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.img}" alt="${esc(item.nombre)}" width="80" style="border-radius: 6px; object-fit: cover;">
          <div>
            <strong>${esc(item.nombre)}</strong><br>
            <small style="color: #666;">Talla: ${item.talla} MX</small>
          </div>
        </div>
      </td>
      <td><span class="precio">${dinero(item.precio * cantidad)}</span></td>
      <td>
        <button type="button" class="menos" onclick="cambiarCantidad(${index}, -1)">-</button>
        <span class="cantidad">${cantidad}</span>
        <button type="button" class="mas" onclick="cambiarCantidad(${index}, 1)">+</button>
      </td>
    `;
    cartTbody.appendChild(tr);
  });

  actualizarResumen(totalCantidadItems, subtotalAcumulado);
}

// ---------- CAMBIAR CANTIDADES O ELIMINAR ----------
window.cambiarCantidad = function(index, delta) {
  const carrito = leerCarrito();
  if (!carrito[index]) return;

  carrito[index].cantidad = (carrito[index].cantidad || 1) + delta;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1); // Si baja a 0, se elimina del carrito
  }

  guardarCarrito(carrito);
  renderCarrito();
};

// ---------- ACTUALIZAR RESUMEN ----------
function actualizarResumen(cantidadItems, subtotal) {
  const totalConEnvio = subtotal > 0 ? subtotal + COSTO_ENVIO : 0;

  numProductosSpan.textContent = cantidadItems;
  subtotalSpan.textContent = dinero(subtotal);
  envioSpan.textContent = subtotal > 0 ? dinero(COSTO_ENVIO) : "$0.00";
  totalSpan.textContent = dinero(totalConEnvio);
  totalModalSpan.textContent = dinero(totalConEnvio);
}

// ---------- CONTROL DEL MODAL (DIALOG) ----------
btnPago.addEventListener("click", () => {
  const carrito = leerCarrito();
  if (carrito.length === 0) return;
  ventanaDatos.showModal();
});

btnCancelar.addEventListener("click", () => {
  ventanaDatos.close();
});

// ---------- CONFIRMAR PEDIDO Y DESCONTAR STOCK ----------
formDatos.addEventListener("submit", (e) => {
  e.preventDefault();
  const carrito = leerCarrito();
  if (carrito.length === 0) return;

  // Agrupar compras por id para calcular el stock total a descontar
  const lineas = [];
  carrito.forEach((item) => {
    const cant = item.cantidad || 1;
    const existe = lineas.find((l) => l.id === item.id);
    if (existe) {
      existe.cantidad += cant;
    } else {
      lineas.push({ id: item.id, cantidad: cant });
    }
  });

  // Descontar del inventario centralizado (función de productos.js)
  if (typeof descontarStock === 'function') {
    descontarStock(lineas);
  }

  alert("¡Compra exitosa! Gracias por tu pedido en Nerds Snkrz.");
  
  // Limpiar carrito
  guardarCarrito([]);
  ventanaDatos.close();
  
  // Redirigir al inicio o catálogo
  window.location.href = "catalogo.html";
});

// ---------- INICIALIZACIÓN ----------
renderCarrito();