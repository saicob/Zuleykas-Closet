const inputImagen = document.getElementById("imagen")
const dropArea = document.getElementById("drop-area")
const preview = document.getElementById("preview")
const quitarImagenBtn = document.getElementById("quitarImagen")
const labelImagen = document.getElementById("label-imagen")
const formAgregarProducto = document.getElementById("form-agregar-producto")
const cancelarBtn = document.getElementById("Cancelar")
let enviandoProducto = false

// ===== FUNCIONES PARA AGREGAR PRODUCTO =====
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

// ===== EVENTOS PARA AGREGAR PRODUCTO =====
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

  // EVENTO CLIC EN EL ÁREA PARA AGREGAR
  dropArea.addEventListener("click", (e) => {
    // Solo abrir si no se hizo clic en el botón de quitar
    if (!e.target.matches("#quitarImagen")) {
      console.log("Clic en área agregar - abriendo selector")
      inputImagen.click()
    }
  })
}

// ===== FUNCIONES Y EVENTOS PARA ACTUALIZAR PRODUCTO =====
function mostrarPreviewActualizar(file) {
  const previewActualizar = document.getElementById("preview-actualizar")
  const quitarImagenBtnActualizar = document.getElementById("quitarImagen-actualizar")
  const labelImagenActualizar = document.getElementById("label-imagen-actualizar")

  if (file && file.type.startsWith("image/")) {
    // Revocar URL anterior para evitar memory leaks
    if (previewActualizar.src && previewActualizar.src.startsWith("blob:")) {
      URL.revokeObjectURL(previewActualizar.src)
    }

    previewActualizar.src = URL.createObjectURL(file)
    previewActualizar.style.display = "block"
    quitarImagenBtnActualizar.style.display = "inline-block"
    labelImagenActualizar.style.display = "none"
  }
}

function limpiarImagenActualizar() {
  const inputImagenActualizar = document.getElementById("imagen-actualizar")
  const previewActualizar = document.getElementById("preview-actualizar")
  const quitarImagenBtnActualizar = document.getElementById("quitarImagen-actualizar")
  const labelImagenActualizar = document.getElementById("label-imagen-actualizar")

  // Revocar URL para liberar memoria
  if (previewActualizar.src && previewActualizar.src.startsWith("blob:")) {
    URL.revokeObjectURL(previewActualizar.src)
  }

  inputImagenActualizar.value = ""
  previewActualizar.src = ""
  previewActualizar.style.display = "none"
  quitarImagenBtnActualizar.style.display = "none"
  labelImagenActualizar.style.display = "inline-block"
}

// Usar delegación de eventos para elementos que se crean dinámicamente
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "imagen-actualizar") {
    console.log("Archivo seleccionado para actualizar")
    mostrarPreviewActualizar(e.target.files[0])
  }
})

document.addEventListener("click", (e) => {
  // Clic en área de actualizar
  if (e.target && e.target.id === "drop-area-actualizar") {
    const quitarBtn = document.getElementById("quitarImagen-actualizar")
    if (!e.target.contains(quitarBtn) || e.target !== quitarBtn) {
      console.log("Clic en área actualizar - abriendo selector")
      const inputActualizar = document.getElementById("imagen-actualizar")
      if (inputActualizar) {
        inputActualizar.click()
      }
    }
  }

  // Clic en label de actualizar
  if (e.target && e.target.id === "label-imagen-actualizar") {
    e.preventDefault()
    console.log("Clic en label actualizar - abriendo selector")
    const inputActualizar = document.getElementById("imagen-actualizar")
    if (inputActualizar) {
      inputActualizar.click()
    }
  }

  // Clic en botón quitar de actualizar
  if (e.target && e.target.id === "quitarImagen-actualizar") {
    e.stopPropagation()
    console.log("Quitando imagen actualizar")
    limpiarImagenActualizar()
  }
})

// Drag and drop para actualizar
document.addEventListener("dragover", (e) => {
  if (e.target && e.target.id === "drop-area-actualizar") {
    e.preventDefault()
    e.target.style.borderColor = "#999"
    e.target.style.backgroundColor = "#f9f9f9"
  }
})

document.addEventListener("dragleave", (e) => {
  if (e.target && e.target.id === "drop-area-actualizar") {
    e.preventDefault()
    e.target.style.borderColor = "#ddd"
    e.target.style.backgroundColor = "white"
  }
})

document.addEventListener("drop", (e) => {
  if (e.target && e.target.id === "drop-area-actualizar") {
    e.preventDefault()
    e.target.style.borderColor = "#ddd"
    e.target.style.backgroundColor = "white"

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const inputActualizar = document.getElementById("imagen-actualizar")
      if (inputActualizar) {
        inputActualizar.files = e.dataTransfer.files
        mostrarPreviewActualizar(file)
      }
    } else {
      alert("Solo se permiten archivos de imagen.")
    }
  }
})

// Envío del formulario optimizado
if (formAgregarProducto) {
  formAgregarProducto.addEventListener("submit", async (e) => {
    e.preventDefault()
    if (enviandoProducto) return // Evita doble envío
    enviandoProducto = true

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
      enviandoProducto = false
      return
    }

    if (isNaN(precio) || Number.parseFloat(precio) <= 0) {
      alert("El precio debe ser un número mayor a 0.")
      submitBtn.textContent = originalText
      submitBtn.disabled = false
      enviandoProducto = false
      return
    }

    if (isNaN(stock) || Number.parseInt(stock) < 0) {
      alert("El stock debe ser un número mayor o igual a 0.")
      submitBtn.textContent = originalText
      submitBtn.disabled = false
      enviandoProducto = false
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
        enviandoProducto = false
        return
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP).")
        submitBtn.textContent = originalText
        submitBtn.disabled = false
        enviandoProducto = false
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
      enviandoProducto = false
    }
  })
}

// Cancelar mejorado
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
