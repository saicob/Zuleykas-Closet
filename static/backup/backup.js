class BackupManager {
    constructor() {
        this.init()
    }

    init() {
        this.bindEvents()
        this.loadBackups()
    }

    bindEvents() {
        // Botón crear backup
        document.getElementById("createBackupBtn").addEventListener("click", () => {
            this.createBackup()
        })

        // Botón actualizar
        document.getElementById("refreshBtn").addEventListener("click", () => {
            this.loadBackups()
        })

        // Modal events
        document.getElementById("closeModal").addEventListener("click", () => {
            this.closeModal()
        })

        document.getElementById("cancelRestore").addEventListener("click", () => {
            this.closeModal()
        })

        document.getElementById("confirmRestore").addEventListener("click", () => {
            this.executeRestore()
        })

        // Cerrar modal al hacer clic fuera
        document.getElementById("confirmModal").addEventListener("click", (e) => {
            if (e.target.id === "confirmModal") {
                this.closeModal()
            }
        })
    }

    async createBackup() {
        const btn = document.getElementById("createBackupBtn")
        const originalText = btn.innerHTML

        try {
            // Deshabilitar botón y mostrar loading
            btn.disabled = true
            btn.innerHTML = '<span class="btn-icon">⏳</span> Creando...'

            this.showLoading(true)

            const response = await fetch("/api/backup/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()

            if (data.success) {
                this.showToast("Backup creado exitosamente", "success")
                this.loadBackups() // Recargar lista
            } else {
                throw new Error(data.message || "Error al crear backup")
            }
        } catch (error) {
            console.error("Error creando backup:", error)
            this.showToast("Error al crear backup: " + error.message, "error")
        } finally {
            // Restaurar botón
            btn.disabled = false
            btn.innerHTML = originalText
            this.showLoading(false)
        }
    }

    async loadBackups() {
        try {
            this.showLoading(true)

            const response = await fetch("/api/backup/list")
            const data = await response.json()

            if (data.success) {
                this.renderBackups(data.backups)
            } else {
                throw new Error(data.message || "Error al cargar backups")
            }
        } catch (error) {
            console.error("Error cargando backups:", error)
            this.showToast("Error al cargar backups: " + error.message, "error")
            this.showEmptyState()
        } finally {
            this.showLoading(false)
        }
    }

    renderBackups(backups) {
        const container = document.getElementById("backupsContainer")
        const emptyState = document.getElementById("emptyState")

        if (!backups || backups.length === 0) {
            this.showEmptyState()
            return
        }

        emptyState.style.display = "none"

        container.innerHTML = backups
            .map(
                (backup) => `
              <div class="backup-card">
                  <div class="backup-info">
                      <div class="backup-icon">💾</div>
                      <div class="backup-details">
                          <h4 class="backup-name">${backup.filename}</h4>
                          <div class="backup-meta">
                              <span class="backup-date">📅 ${backup.dateFormatted}</span>
                              <span class="backup-size">📊 ${backup.size}</span>
                          </div>
                      </div>
                  </div>
                  <div class="backup-actions">
                      <button class="restore-btn" onclick="backupManager.showRestoreModal('${backup.filename}', '${backup.dateFormatted}', '${backup.size}')">
                          ↩️ Restaurar
                      </button>
                      <button class="delete-btn" onclick="backupManager.deleteBackup('${backup.filename}')">
                          🗑️ Eliminar
                      </button>
                  </div>
              </div>
          `,
            )
            .join("")
    }

    showEmptyState() {
        const container = document.getElementById("backupsContainer")
        const emptyState = document.getElementById("emptyState")

        container.innerHTML = ""
        emptyState.style.display = "block"
    }

    showRestoreModal(filename, date, size) {
        document.getElementById("modalFilename").textContent = filename
        document.getElementById("modalDate").textContent = date
        document.getElementById("modalSize").textContent = size

        const modal = document.getElementById("confirmModal")
        modal.style.display = "flex"

        // Guardar filename para usar en restore
        modal.dataset.filename = filename
    }

    closeModal() {
        document.getElementById("confirmModal").style.display = "none"
    }

    async executeRestore() {
        const modal = document.getElementById("confirmModal")
        const filename = modal.dataset.filename
        const confirmBtn = document.getElementById("confirmRestore")
        const originalText = confirmBtn.innerHTML

        try {
            // Deshabilitar botón
            confirmBtn.disabled = true
            confirmBtn.innerHTML = "⏳ Restaurando..."

            const response = await fetch("/api/backup/restore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename }),
            })

            const data = await response.json()

            if (data.success) {
                this.showToast("Backup restaurado exitosamente. Recargando página...", "success")
                this.closeModal()

                // Recargar página después de 3 segundos
                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } else {
                throw new Error(data.message || "Error al restaurar backup")
            }
        } catch (error) {
            console.error("Error restaurando backup:", error)
            this.showToast("Error al restaurar backup: " + error.message, "error")
        } finally {
            // Restaurar botón
            confirmBtn.disabled = false
            confirmBtn.innerHTML = originalText
        }
    }

    async deleteBackup(filename) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el backup "${filename}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/backup/delete/${filename}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                this.showToast("Backup eliminado exitosamente", "success")
                this.loadBackups() // Recargar lista
            } else {
                throw new Error(data.message || "Error al eliminar backup")
            }
        } catch (error) {
            console.error("Error eliminando backup:", error)
            this.showToast("Error al eliminar backup: " + error.message, "error")
        }
    }

    showLoading(show) {
        const spinner = document.getElementById("loadingSpinner")
        spinner.style.display = show ? "flex" : "none"
    }

    showToast(message, type = "info") {
        const container = document.getElementById("toastContainer")
        const toast = document.createElement("div")

        const icons = {
            success: "✅",
            error: "❌",
            info: "ℹ️",
        }

        toast.className = `toast toast-${type}`
        toast.innerHTML = `
              <span class="toast-icon">${icons[type] || icons.info}</span>
              <span class="toast-message">${message}</span>
          `

        container.appendChild(toast)

        // Mostrar toast
        setTimeout(() => {
            toast.classList.add("show")
        }, 100)

        // Ocultar y remover toast después de 5 segundos
        setTimeout(() => {
            toast.classList.remove("show")
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast)
                }
            }, 300)
        }, 5000)
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    window.backupManager = new BackupManager()
})
  