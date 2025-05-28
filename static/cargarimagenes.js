const inputImagen = document.getElementById("imagen")
const dropArea = document.getElementById("drop-area")
const preview = document.getElementById("preview")
const quitarImagenBtn = document.getElementById("quitarImagen")
const labelImagen = document.getElementById("label-imagen")

function mostrarPreview(file) {
  if (file && file.type.startsWith("image/")) {
    // Revocar URL anterior para evitar memory leaks
    if (preview.src && preview.src.startsWith("blob:")) {
      URL.revokeObjectURL(preview.src)
    }

    preview.src = URL.createObjectURL(file)
    preview.style.display = "block"
    quitarImagenBtn.style.display = "inline-block"
    labelImagen.style.display = "none"
  }
}

function limpiarImagen() {
  // Revocar URL para liberar memoria
  if (preview.src && preview.src.startsWith("blob:")) {
    URL.revokeObjectURL(preview.src)
  }

  inputImagen.value = ""
  preview.src = ""
  preview.style.display = "none"
  quitarImagenBtn.style.display = "none"
  labelImagen.style.display = "inline-block"
}

if (inputImagen) {
  inputImagen.addEventListener("change", () => {
    mostrarPreview(inputImagen.files[0])
  })
}

if (quitarImagenBtn) {
  quitarImagenBtn.addEventListener("click", () => {
    limpiarImagen()
  })
}

// Drag and drop mejorado
if (dropArea) {
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropArea.style.borderColor = "#999"
    dropArea.style.backgroundColor = "#f9f9f9"
  })

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "#ddd"
    dropArea.style.backgroundColor = "white"
  })

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault()
    dropArea.style.borderColor = "#ddd"
    dropArea.style.backgroundColor = "white"

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      inputImagen.files = e.dataTransfer.files
      mostrarPreview(file)
    } else {
      alert("Solo se permiten archivos de imagen.")
    }
  })
}

// Envío del formulario optimizado
const formAgregarProducto = document.getElementById("form-agregar-producto")
if (formAgregarProducto) {
  formAgregarProducto.addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = document.getElementById("Agregar")
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Registrando..."
    submitBtn.disabled = true

    const formData = new FormData(formAgregarProducto)

    // Validaciones del lado del cliente
    const nombre = formData.get("nombre")
    const precio = formData.get("precio_venta")
    const stock = formData.get("cantidad")
    const categoria = formData.get("categoria")

    if (!nombre || !precio || !stock || !categoria) {
      alert("Por favor, complete todos los campos obligatorios (nombre, precio, stock, categoría).")
      submitBtn.textContent = originalText
      submitBtn.disabled = false
      return
    }

    if (isNaN(precio) || Number.parseFloat(precio) <= 0) {
      alert("El precio debe ser un número mayor a 0.")
      submitBtn.textContent = originalText
      submitBtn.disabled = false
      return
    }

    if (isNaN(stock) || Number.parseInt(stock) < 0) {
      alert("El stock debe ser un número mayor o igual a 0.")
      submitBtn.textContent = originalText
      submitBtn.disabled = false
      return
    }

    // Validar tamaño de imagen
    if (inputImagen.files[0]) {
      const file = inputImagen.files[0]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (file.size > maxSize) {
        alert("La imagen es demasiado grande. El tamaño máximo permitido es 5MB.")
        submitBtn.textContent = originalText
        submitBtn.disabled = false
        return
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP).")
        submitBtn.textContent = originalText
        submitBtn.disabled = false
        return
      }
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        alert("Producto registrado correctamente" + (data.imagen_subida ? " con imagen" : ""))
        formAgregarProducto.reset()
        limpiarImagen()

        // Cerrar el modal
        document.getElementById("Agregar-Producto").style.display = "none"
        document.getElementById("overlay").style.display = "none"

        // Refrescar tabla y catálogo
        if (window.refrescarTablaProductos) {
          window.refrescarTablaProductos()
        }
        if (window.refrescarCatalogo) {
          window.refrescarCatalogo()
        }
      } else {
        alert("Error al registrar: " + (data.error || data.message || "Error desconocido"))
      }
    } catch (err) {
      console.error(err)
      alert("Error al conectar con el servidor. Verifique su conexión.")
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  })
}

// Cancelar mejorado
const cancelarBtn = document.getElementById("Cancelar")
if (cancelarBtn) {
  cancelarBtn.addEventListener("click", () => {
    if (formAgregarProducto) {
      formAgregarProducto.reset()
    }
    limpiarImagen()
    document.getElementById("Agregar-Producto").style.display = "none"
    document.getElementById("overlay").style.display = "none"
  })
}
