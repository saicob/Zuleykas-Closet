const $ = window.jQuery // Declare the $ variable

$(document).ready(() => {
    // --- Quitar imagen en formulario de actualizar producto ---
    const previewActualizar = $("#preview-actualizar")
    const inputActualizar = $("#imagen-actualizar")
    const removeBtnActualizar = $("#remove-image-actualizar")
    const dropAreaActualizar = $("#drop-area-actualizar")

    // Mostrar preview al seleccionar imagen
    inputActualizar.on("change", function (e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader()
            reader.onload = (e) => {
                previewActualizar.attr("src", e.target.result).show()
                removeBtnActualizar.show()
            }
            reader.readAsDataURL(this.files[0])
        }
    })

    // Quitar imagen al hacer click en la X
    removeBtnActualizar.on("click", () => {
        previewActualizar.hide().attr("src", "/placeholder.svg")
        inputActualizar.val("")
        removeBtnActualizar.hide()
        // Mostrar el texto de subir imagen
        dropAreaActualizar.find("span").show()
    })

    // Al hacer click en el área, abrir el input de archivo
    dropAreaActualizar.on("click", (e) => {
        // Solo abrir si no se hizo click en la X
        if (!$(e.target).is(removeBtnActualizar)) {
            inputActualizar.trigger("click")
        }
    })

    // Ocultar texto de subir imagen cuando hay preview
    inputActualizar.on("change", function () {
        if (this.files && this.files[0]) {
            dropAreaActualizar.find("span").hide()
        }
    })
})

let productoIdActual = null

$("#Actualizar").on("click", async (event) => {
    event.preventDefault()

    if (!productoIdActual) {
        alert("Error: No se ha seleccionado un producto para actualizar")
        return
    }

    // Crear FormData para enviar tanto datos como archivo
    const formData = new FormData()

    // Agregar todos los campos del formulario
    formData.append("nombre", $("#nombre-actualizar").val())
    formData.append("proveedor", $("#proveedor-input-actualizar").val())
    formData.append("precio_compra", $("#precio-compra-actualizar").val())
    formData.append("precio_venta", $("#precio-venta-actualizar").val())
    formData.append("cantidad", $("#cantidad-actualizar").val())
    formData.append("descripcion", $("#descripcion-actualizar").val())
    formData.append("local", $("#local-actualizar").val())
    formData.append("categoria", $("#categoria-actualizar").val() || "Ropa")
    formData.append("marca", $("#marca-input-actualizar").val() || "")

    // Agregar la imagen si se seleccionó una nueva
    const imagenInput = $("#imagen-actualizar")[0]
    if (imagenInput && imagenInput.files && imagenInput.files[0]) {
        formData.append("imagen", imagenInput.files[0])
    }

    let textoOriginal // Declare the textoOriginal variable

    try {
        // Cambiar el texto del botón mientras se procesa
        const botonActualizar = $("#Actualizar")
        textoOriginal = botonActualizar.text() // Assign the original text to the variable
        botonActualizar.text("Actualizando...").prop("disabled", true)

        const response = await fetch(`/products/${productoIdActual}`, {
            method: "PUT",
            body: formData,
        })

        const result = await response.json()

        if (response.ok) {
            alert("Producto actualizado exitosamente" + (result.imagen_actualizada ? " con nueva imagen" : ""))

            // Cerrar el modal
            $("#Actualizar-Producto").css("display", "none")
            $("#overlay").css("display", "none")

            // Limpiar el formulario
            $("#form-actualizar-producto")[0].reset()
            $("#preview-actualizar").hide()
            $("#remove-image-actualizar").hide()
            $("#imagen-actualizar").val("")
            productoIdActual = null

            // Recargar la página
            location.reload()
        } else {
            alert("Error al actualizar el producto: " + (result.error || result.message || "Error desconocido"))
        }
    } catch (error) {
        console.error("Error:", error)
        alert("Error de conexión al actualizar el producto")
    } finally {
        // Restaurar el botón
        $("#Actualizar").text(textoOriginal).prop("disabled", false)
    }
})

$("#productos-table tbody").on("click", "tr", async function () {
    const table = $("#productos-table").DataTable()
    const data = table.row(this).data()

    if (data) {
        try {
            // Usar el nombre del producto para obtener los detalles
            const response = await fetch(`/products/nombre/${encodeURIComponent(data.nombre)}`)
            if (response.ok) {
                const product = await response.json()

                // Guardar el ID del producto para la actualización
                productoIdActual = product.codigo_producto

                // Populate the form with the product data
                $("#nombre-actualizar").val(product.nombre)
                $("#proveedor-input-actualizar").val(product.proveedor || "")
                $("#precio-compra-actualizar").val(product.precio_compra || "")
                $("#precio-venta-actualizar").val(product.precio || "")
                $("#cantidad-actualizar").val(product.stock || "")
                $("#descripcion-actualizar").val(product.descripcion || "")
                $("#local-actualizar").val(product.codigo_tienda || "1")
                $("#categoria-actualizar").val(product.categoria || "")
                $("#marca-input-actualizar").val(product.marca || "")

                // Mostrar la imagen actual si existe
                if (product.imagen && product.imagen !== "/placeholder.svg?height=50&width=50") {
                    $("#preview-actualizar").attr("src", product.imagen).show()
                    $("#drop-area-actualizar").find("span").hide()
                } else {
                    $("#preview-actualizar").hide()
                    $("#drop-area-actualizar").find("span").show()
                }

                // Limpiar el input de imagen para nueva selección
                $("#imagen-actualizar").val("")
                $("#remove-image-actualizar").hide()

                // Show the update form
                $("#Actualizar-Producto").css("display", "block")
                $("#overlay").css("display", "block")
            } else {
                alert("Error al obtener los detalles del producto")
            }
        } catch (error) {
            console.error("Error al obtener los detalles del producto:", error)
        }
    }
})

// Cerrar modal
$("#Cancelar-Actualizar, #overlay").on("click", function (e) {
    if (e.target === this) {
        $("#Actualizar-Producto").css("display", "none")
        $("#overlay").css("display", "none")

        // Limpiar el formulario
        $("#form-actualizar-producto")[0].reset()
        $("#preview-actualizar").hide()
        $("#remove-image-actualizar").hide()
        $("#imagen-actualizar").val("")
        productoIdActual = null
    }
})
