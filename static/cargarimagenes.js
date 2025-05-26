
  const inputImagen = document.getElementById("imagen");
  const dropArea = document.getElementById("drop-area");
  const preview = document.getElementById("preview");
  const quitarImagenBtn = document.getElementById("quitarImagen");
  const labelImagen = document.getElementById("label-imagen");

  function mostrarPreview(file) {
    if (file && file.type.startsWith("image/")) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
      quitarImagenBtn.style.display = "inline-block";
      labelImagen.style.display = "none";
    }
  }

  function limpiarImagen() {
    inputImagen.value = "";
    preview.src = "";
    preview.style.display = "none";
    quitarImagenBtn.style.display = "none";
    labelImagen.style.display = "inline-block";
  }

  inputImagen.addEventListener("change", () => {
    mostrarPreview(inputImagen.files[0]);
  });

  quitarImagenBtn.addEventListener("click", () => {
    limpiarImagen();
  });

  // Drag and drop
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#999";
    dropArea.style.backgroundColor = "#f9f9f9";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "#ddd";
    dropArea.style.backgroundColor = "white";
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#ddd";
    dropArea.style.backgroundColor = "white";

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      inputImagen.files = e.dataTransfer.files;
      mostrarPreview(file);
    } else {
      alert("Solo se permiten archivos de imagen.");
    }
  });

  // Envío del formulario
  document.getElementById("form-agregar-producto").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert("Producto registrado correctamente");
        form.reset();
        limpiarImagen();
      } else {
        alert("Error al registrar: " + (data.message || "Desconocido"));
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  });

  document.getElementById("Cancelar").addEventListener("click", () => {
    document.getElementById("form-agregar-producto").reset();
    limpiarImagen();
    document.getElementById("Agregar-Producto").style.display = "none";
  });

