const ENVIO = 1000;
const cuerpoTabla = document.querySelector("tbody");

function leerPrecio(texto) {
  return Number(texto.replace(/[^0-9.]/g, ""));
}

function formato(numero) {
  return "$" + numero.toLocaleString("es-MX");
}


function actualizarResumen() {
  let subtotal = 0;
  let productos = 0;

  cuerpoTabla.querySelectorAll("tr").forEach(function (fila) {
    const precio = leerPrecio(fila.children[1].textContent);
    const cantidad = Number(fila.querySelector(".cantidad").textContent);

    subtotal += precio * cantidad;
    productos += cantidad;
  });

  document.getElementById("num-productos").textContent = productos;
  document.getElementById("subtotal").textContent = formato(subtotal);
  document.getElementById("envio").textContent = formato(ENVIO);
  document.getElementById("total").textContent = formato(subtotal + ENVIO);
}


cuerpoTabla.addEventListener("click", function (evento) {
  const boton = evento.target;
  const fila = boton.closest("tr");
  if (!fila) return;

  const cantidad = fila.querySelector(".cantidad");

  if (boton.classList.contains("mas")) {
    cantidad.textContent = Number(cantidad.textContent) + 1;
    actualizarResumen();
  }

  if (boton.classList.contains("menos") && Number(cantidad.textContent) > 1) {
    cantidad.textContent = Number(cantidad.textContent) - 1;
    actualizarResumen();
  }
});


function agregarProducto(imagen, nombre, precio) {
  const fila = document.createElement("tr");
  fila.innerHTML =
    '<td><img src="' + imagen + '" alt="' + nombre + '" width="80"></td>' +
    '<td><span class="precio">$ ' + precio.toLocaleString("es-MX") + '.00</span></td>' +
    '<td>' +
      '<button type="button" class="menos">-</button> ' +
      '<span class="cantidad">1</span> ' +
      '<button type="button" class="mas">+</button>' +
    '</td>';

  cuerpoTabla.appendChild(fila);
  actualizarResumen();
}

actualizarResumen();

const ventana = document.getElementById("ventana-datos");
const formDatos = document.getElementById("form-datos");


document.getElementById("btn-pago").addEventListener("click", function () {
  document.getElementById("total-modal").textContent =
    document.getElementById("total").textContent;
  ventana.showModal();
});


document.getElementById("btn-cancelar").addEventListener("click", function () {
  ventana.close();
});


ventana.addEventListener("click", function (evento) {
  if (evento.target === ventana) {
    ventana.close();
  }
});


formDatos.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    direccion:
      document.getElementById("calle").value + " " +
      document.getElementById("numero").value + ", " +
      document.getElementById("colonia").value + ", " +
      document.getElementById("ciudad").value + ", " +
      document.getElementById("estado").value + ", CP " +
      document.getElementById("cp").value,
    entrega: document.getElementById("tipo-entrega").value,
    referencias: document.getElementById("referencias").value
  };

  console.log("Datos del pedido:", datos);

  ventana.close();
  formDatos.reset();
  alert("¡Gracias, " + datos.nombre + "! Tu pedido fue registrado.");
});