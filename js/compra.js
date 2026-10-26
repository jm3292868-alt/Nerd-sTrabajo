document.querySelectorAll("tbody tr").forEach(function (fila) {
  const cantidad = fila.querySelector(".cantidad");

  fila.querySelector(".mas").addEventListener("click", function () {
    cantidad.textContent = Number(cantidad.textContent) + 1;
  });

  fila.querySelector(".menos").addEventListener("click", function () {
    if (Number(cantidad.textContent) > 1) {
      cantidad.textContent = Number(cantidad.textContent) - 1;
    }
  });
});