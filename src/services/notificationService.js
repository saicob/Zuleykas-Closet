let ioInstance = null

export const initNotificationService = (io) => {
  ioInstance = io
}

export const notify = (channel, payload) => {
  try {
    if (!ioInstance) {
      console.warn('NotificationService: io not initialized')
      return
    }
    // Emitir a todos los clientes conectados en el canal especificado
    ioInstance.emit(channel, payload)
  } catch (err) {
    console.error('Error al emitir notificación:', err)
  }
}

export default {
  initNotificationService,
  notify,
}
