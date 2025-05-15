//import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", async () => {
    // Cargar Chart.js desde CDN
    await loadScript("https://cdn.jsdelivr.net/npm/chart.js")
    await loadScript("https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns")

    // Cargar datos iniciales
    await cargarResumenDashboard()
    await cargarGraficos()

    // Configurar filtros de fecha
    const fechaInicio = document.getElementById("fecha-inicio")
    const fechaFin = document.getElementById("fecha-fin")

    if (fechaInicio && fechaFin) {
        // Establecer fecha fin como hoy
        const hoy = new Date()
        fechaFin.value = formatDate(hoy)

        // Establecer fecha inicio como hace un mes
        const unMesAtras = new Date()
        unMesAtras.setMonth(unMesAtras.getMonth() - 1)
        fechaInicio.value = formatDate(unMesAtras)

        // Añadir event listeners
        fechaInicio.addEventListener("change", filtrarPorFecha)
        fechaFin.addEventListener("change", filtrarPorFecha)
    }

    // Configurar filtros de categoría
    const filtroCategoria = document.getElementById("filtro-categoria")
    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", filtrarPorCategoria)
    }
})

// Función para cargar scripts externos
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = url
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

// Función para formatear fechas
function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// Cargar datos de resumen
async function cargarResumenDashboard() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard/resumen")
        if (!response.ok) {
            throw new Error("Error al cargar datos de resumen")
        }

        const data = await response.json()

        // Actualizar tarjetas de resumen
        document.getElementById("total-ventas").textContent = `$${data.totalVentas ? data.totalVentas.toFixed(2) : "0.00"}`
        document.getElementById("productos-stock").textContent = data.totalStock || "0"
        document.getElementById("proveedores-activos").textContent = data.totalProveedores || "0"
    } catch (error) {
        console.error("Error al cargar resumen del dashboard:", error)
        mostrarError("Error al cargar datos de resumen")
    }
}

// Cargar todos los gráficos
async function cargarGraficos() {
    try {
        await Promise.all([
            cargarGraficoVentasPorPeriodo(),
            cargarGraficoProductosMasVendidos(),
            cargarGraficoVentasPorCategoria(),
            cargarGraficoProveedoresActivos(),
            cargarGraficoRentabilidadPorMarca(),
        ])
    } catch (error) {
        console.error("Error al cargar gráficos:", error)
        mostrarError("Error al cargar gráficos")
    }
}

// Gráfico de ventas por período
async function cargarGraficoVentasPorPeriodo() {
    try {
        const fechaInicio = document.getElementById("fecha-inicio")?.value
        const fechaFin = document.getElementById("fecha-fin")?.value

        let url = "http://localhost:3000/api/dashboard/ventas-periodo"
        if (fechaInicio && fechaFin) {
            url += `?inicio=${fechaInicio}&fin=${fechaFin}`
        }

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error("Error al cargar datos de ventas por período")
        }

        const data = await response.json()

        // Preparar datos para el gráfico
        const labels = data.map((item) => item.fecha)
        const valores = data.map((item) => item.total)

        // Crear o actualizar gráfico
        const ctx = document.getElementById("grafico-ventas")
        if (!ctx) return

        if (window.graficoVentas) {
            window.graficoVentas.data.labels = labels
            window.graficoVentas.data.datasets[0].data = valores
            window.graficoVentas.update()
        } else {
            window.graficoVentas = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Ventas ($)",
                            data: valores,
                            backgroundColor: "rgba(221, 156, 186, 0.2)",
                            borderColor: "rgba(221, 156, 186, 1)",
                            borderWidth: 2,
                            tension: 0.3,
                            pointBackgroundColor: "rgba(221, 156, 186, 1)",
                            pointRadius: 4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Ventas por Período",
                            font: {
                                size: 16,
                            },
                        },
                        legend: {
                            position: "top",
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `$${context.parsed.y.toFixed(2)}`,
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => "$" + value,
                            },
                        },
                    },
                },
            })
        }
    } catch (error) {
        console.error("Error al cargar gráfico de ventas por período:", error)
        mostrarError("Error al cargar gráfico de ventas")
    }
}

// Gráfico de productos más vendidos
async function cargarGraficoProductosMasVendidos() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard/productos-mas-vendidos")
        if (!response.ok) {
            throw new Error("Error al cargar datos de productos más vendidos")
        }

        const data = await response.json()

        // Preparar datos para el gráfico
        const labels = data.map((item) => item.nombre)
        const cantidades = data.map((item) => item.cantidad_vendida)

        // Crear o actualizar gráfico
        const ctx = document.getElementById("grafico-productos")
        if (!ctx) return

        if (window.graficoProductos) {
            window.graficoProductos.data.labels = labels
            window.graficoProductos.data.datasets[0].data = cantidades
            window.graficoProductos.update()
        } else {
            window.graficoProductos = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Unidades vendidas",
                            data: cantidades,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.7)",
                                "rgba(54, 162, 235, 0.7)",
                                "rgba(255, 206, 86, 0.7)",
                                "rgba(75, 192, 192, 0.7)",
                                "rgba(153, 102, 255, 0.7)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Productos Más Vendidos",
                            font: {
                                size: 16,
                            },
                        },
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                },
            })
        }
    } catch (error) {
        console.error("Error al cargar gráfico de productos más vendidos:", error)
        mostrarError("Error al cargar gráfico de productos")
    }
}

// Gráfico de ventas por categoría
async function cargarGraficoVentasPorCategoria() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard/ventas-por-categoria")
        if (!response.ok) {
            throw new Error("Error al cargar datos de ventas por categoría")
        }

        const data = await response.json()

        // Preparar datos para el gráfico
        const labels = data.map((item) => item.categoria)
        const valores = data.map((item) => item.total_ventas)

        // Crear o actualizar gráfico
        const ctx = document.getElementById("grafico-categorias")
        if (!ctx) return

        if (window.graficoCategorias) {
            window.graficoCategorias.data.labels = labels
            window.graficoCategorias.data.datasets[0].data = valores
            window.graficoCategorias.update()
        } else {
            window.graficoCategorias = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            data: valores,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.7)",
                                "rgba(54, 162, 235, 0.7)",
                                "rgba(255, 206, 86, 0.7)",
                                "rgba(75, 192, 192, 0.7)",
                                "rgba(153, 102, 255, 0.7)",
                                "rgba(255, 159, 64, 0.7)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Ventas por Categoría",
                            font: {
                                size: 16,
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || ""
                                    const value = context.parsed || 0
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                    const percentage = Math.round((value / total) * 100)
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`
                                },
                            },
                        },
                    },
                },
            })
        }
    } catch (error) {
        console.error("Error al cargar gráfico de ventas por categoría:", error)
        mostrarError("Error al cargar gráfico de categorías")
    }
}

// Gráfico de proveedores activos
async function cargarGraficoProveedoresActivos() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard/proveedores-activos")
        if (!response.ok) {
            throw new Error("Error al cargar datos de proveedores activos")
        }

        const data = await response.json()

        // Preparar datos para el gráfico
        const labels = data.map((item) => item.proveedor)
        const valores = data.map((item) => item.total_productos)

        // Crear o actualizar gráfico
        const ctx = document.getElementById("grafico-proveedores")
        if (!ctx) return

        if (window.graficoProveedores) {
            window.graficoProveedores.data.labels = labels
            window.graficoProveedores.data.datasets[0].data = valores
            window.graficoProveedores.update()
        } else {
            window.graficoProveedores = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            data: valores,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.7)",
                                "rgba(54, 162, 235, 0.7)",
                                "rgba(255, 206, 86, 0.7)",
                                "rgba(75, 192, 192, 0.7)",
                                "rgba(153, 102, 255, 0.7)",
                                "rgba(255, 159, 64, 0.7)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Proveedores Activos",
                            font: {
                                size: 16,
                            },
                        },
                    },
                },
            })
        }
    } catch (error) {
        console.error("Error al cargar gráfico de proveedores activos:", error)
        mostrarError("Error al cargar gráfico de proveedores")
    }
}

// Gráfico de rentabilidad por marca
async function cargarGraficoRentabilidadPorMarca() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard/rentabilidad-por-marca")
        if (!response.ok) {
            throw new Error("Error al cargar datos de rentabilidad por marca")
        }

        const data = await response.json()

        // Preparar datos para el gráfico
        const labels = data.map((item) => item.marca)
        const ventas = data.map((item) => item.ventas_totales)
        const costos = data.map((item) => item.costo_total)
        const ganancias = data.map((item) => item.ganancia)

        // Crear o actualizar gráfico
        const ctx = document.getElementById("grafico-rentabilidad")
        if (!ctx) return

        if (window.graficoRentabilidad) {
            window.graficoRentabilidad.data.labels = labels
            window.graficoRentabilidad.data.datasets[0].data = ventas
            window.graficoRentabilidad.data.datasets[1].data = costos
            window.graficoRentabilidad.data.datasets[2].data = ganancias
            window.graficoRentabilidad.update()
        } else {
            window.graficoRentabilidad = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Ventas",
                            data: ventas,
                            backgroundColor: "rgba(54, 162, 235, 0.7)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                        },
                        {
                            label: "Costos",
                            data: costos,
                            backgroundColor: "rgba(255, 99, 132, 0.7)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                        },
                        {
                            label: "Ganancias",
                            data: ganancias,
                            backgroundColor: "rgba(75, 192, 192, 0.7)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Rentabilidad por Marca",
                            font: {
                                size: 16,
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => "$" + value,
                            },
                        },
                    },
                },
            })
        }
    } catch (error) {
        console.error("Error al cargar gráfico de rentabilidad por marca:", error)
        mostrarError("Error al cargar gráfico de rentabilidad")
    }
}

// Filtrar datos por fecha
async function filtrarPorFecha() {
    const fechaInicio = document.getElementById("fecha-inicio").value
    const fechaFin = document.getElementById("fecha-fin").value

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
        mostrarError("Por favor, seleccione ambas fechas")
        return
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarError("La fecha de inicio no puede ser posterior a la fecha final")
        return
    }

    // Recargar gráficos con filtro de fecha
    await cargarGraficoVentasPorPeriodo()
}

// Filtrar datos por categoría
async function filtrarPorCategoria() {
    const categoria = document.getElementById("filtro-categoria").value

    // Implementar filtrado por categoría
    // Este es un ejemplo básico, se puede expandir según necesidades
    console.log(`Filtrando por categoría: ${categoria}`)

    // Recargar gráficos con filtro de categoría
    // Aquí se implementaría la lógica específica
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const contenedorError = document.getElementById("error-container")
    if (contenedorError) {
        contenedorError.textContent = mensaje
        contenedorError.style.display = "block"

        // Ocultar después de 5 segundos
        setTimeout(() => {
            contenedorError.style.display = "none"
        }, 5000)
    } else {
        alert(mensaje)
    }
}
