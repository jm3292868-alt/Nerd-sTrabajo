const $ = (id) => document.getElementById(id);

const tbody = $("tbody");
const form = $("form");
const formTitulo = $("form-titulo");
const msg = $("msg");
const imgBox = $("img-box");
const imgInput = $("img-input");
const imgPreview = $("img-preview");
const imgHint = $("img-hint");

const campos = {
  nombre: $("f-nombre"),
  precio: $("f-precio"),
  desc: $("f-desc"),
  tallas: $("f-tallas"),
  stock: $("f-stock"),
};

let editandoId = null;   // null = producto nuevo
let imagenActual = null; // dataURL de la imagen elegida

const ICONO_EDITAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M17.5 2.5a2.1 2.1 0 0 1 3 3L12 14l-4 1 1-4 8.5-8.5z"/></svg>`;
const ICONO_BORRAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;

// ---------- TABLA + RESUMEN ----------
function render() {
  const productos = getProductos();

  if (productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="tabla__vacio">Aún no hay productos. Agrega el primero con el formulario.</td></tr>`;
  } else {
    tbody.innerHTML = productos.map((p) => `
      <tr>
        <td><img class="thumb" src="${p.img}" alt="${esc(p.nombre)}"></td>
        <td>${esc(p.nombre)}</td>
        <td>${dinero(p.precio)}</td>
        <td>${p.stock}</td>
        <td><span class="badge ${p.stock > 0 ? "badge--ok" : "badge--agotado"}">${p.stock > 0 ? "Disponible" : "Agotado"}</span></td>
        <td class="acciones">
          <button class="icono icono--editar" data-accion="editar" data-id="${p.id}" aria-label="Editar ${esc(p.nombre)}">${ICONO_EDITAR}</button>
          <button class="icono icono--borrar" data-accion="borrar" data-id="${p.id}" aria-label="Eliminar ${esc(p.nombre)}">${ICONO_BORRAR}</button>
        </td>
      </tr>`).join("");
  }

  $("stat-pares").textContent = productos.reduce((s, p) => s + Number(p.stock), 0);
  $("stat-modelos").textContent = productos.length;
  $("stat-agotados").textContent = productos.filter((p) => Number(p.stock) === 0).length;
}

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-accion]");
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.accion === "editar") cargarParaEditar(id);

  if (btn.dataset.accion === "borrar") {
    const lista = getProductos();
    const p = lista.find((x) => x.id === id);
    if (p && confirm(`¿Eliminar "${p.nombre}" del inventario? También desaparecerá del catálogo.`)) {
      saveProductos(lista.filter((x) => x.id !== id));
      if (editandoId === id) resetForm();
      render();
    }
  }
});

// ---------- FORMULARIO ----------
function mostrarMsg(texto, esError = false) {
  msg.textContent = texto;
  msg.classList.toggle("msg--error", esError);
}

function mostrarImagen(src) {
  imagenActual = src;
  if (src) {
    imgPreview.src = src;
    imgPreview.hidden = false;
    imgHint.hidden = true;
  } else {
    imgPreview.hidden = true;
    imgHint.hidden = false;
  }
}

function resetForm() {
  form.reset();
  editandoId = null;
  mostrarImagen(null);
  formTitulo.textContent = "Agregar Producto";
  Object.values(campos).forEach((c) => c.classList.remove("error"));
}

function cargarParaEditar(id) {
  const p = getProductos().find((x) => x.id === id);
  if (!p) return;
  editandoId = id;
  campos.nombre.value = p.nombre;
  campos.precio.value = p.precio;
  campos.desc.value = p.descripcion || "";
  campos.tallas.value = Array.isArray(p.tallas) ? p.tallas.join(", ") : p.tallas;
  campos.stock.value = p.stock;
  mostrarImagen(p.img);
  formTitulo.textContent = "Editar Producto";
  mostrarMsg("");
  campos.nombre.focus();
  form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Procesar imagen manteniendo transparencias
imgBox.addEventListener("click", () => imgInput.click());
imgInput.addEventListener("change", () => {
  const file = imgInput.files[0];
  if (!file) return;
  const lector = new FileReader();
  lector.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 480;
      const escala = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext("2d");
      
      // Mantiene transparencia si es PNG o renderiza limpia la imagen
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      mostrarImagen(canvas.toDataURL("image/png"));
    };
    img.onerror = () => mostrarMsg("No se pudo leer esa imagen.", true);
    img.src = lector.result;
  };
  lector.readAsDataURL(file);
  imgInput.value = "";
});

function parseTallas(texto) {
  const nums = texto.split(/[,\s]+/).map(parseFloat).filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(nums)].sort((a, b) => a - b);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  Object.values(campos).forEach((c) => c.classList.remove("error"));

  const nombre = campos.nombre.value.trim();
  const precio = parseFloat(campos.precio.value);
  const stock = parseInt(campos.stock.value, 10);
  const tallas = parseTallas(campos.tallas.value);

  const fallos = [];
  if (!nombre) fallos.push(campos.nombre);
  if (!(precio > 0)) fallos.push(campos.precio);
  if (!tallas.length) fallos.push(campos.tallas);
  if (!(stock >= 0)) fallos.push(campos.stock);

  if (fallos.length) {
    fallos.forEach((c) => c.classList.add("error"));
    fallos[0].focus();
    mostrarMsg("Revisa los campos marcados (tallas separadas por coma, ej. 27, 28, 29).", true);
    return;
  }

  const lista = getProductos();
  const datos = {
    nombre,
    descripcion: campos.desc.value.trim(),
    precio,
    stock,
    tallas,
    img: imagenActual || PLACEHOLDER_IMG,
  };

  if (editandoId !== null) {
    const i = lista.findIndex((p) => p.id === editandoId);
    if (i >= 0) lista[i] = { ...lista[i], ...datos };
  } else {
    const nuevoId = lista.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    lista.push({ id: nuevoId, ...datos });
  }

  if (!saveProductos(lista)) {
    mostrarMsg("No hay espacio para guardar. Prueba con una imagen más pequeña.", true);
    return;
  }

  const eraEdicion = editandoId !== null;
  resetForm();
  render();
  mostrarMsg(eraEdicion ? "Cambios guardados ✓" : "Producto guardado ✓ Ya aparece en el catálogo.");
});

$("btn-cancelar").addEventListener("click", () => { resetForm(); mostrarMsg(""); });

window.addEventListener("storage", (e) => { if (e.key === CLAVE_PRODUCTOS) render(); });

render();