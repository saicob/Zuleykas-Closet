import { getConnection } from "../database/connection.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sql from "mssql"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directorio donde se guardarán los backups
const BACKUP_DIR = path.join(__dirname, "../../backups")

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

export const createBackup = async (req, res) => {
    try {
        const pool = await getConnection()

        // Generar nombre único para el backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const backupFileName = `Zuleykas_backup_${timestamp}.bak`
        const backupPath = path.join(BACKUP_DIR, backupFileName)

        // Comando SQL para crear backup
        const backupQuery = `
            BACKUP DATABASE Zuleykas 
            TO DISK = '${backupPath.replace(/\\/g, "\\\\")}'
            WITH FORMAT, INIT, NAME = 'Zuleykas-Full Database Backup', 
            SKIP, NOREWIND, NOUNLOAD, STATS = 10
        `

        await pool.request().query(backupQuery)

        // Obtener información del archivo creado
        const stats = fs.statSync(backupPath)
        const fileSize = (stats.size / (1024 * 1024)).toFixed(2) // MB

        res.json({
            success: true,
            message: "Backup creado exitosamente",
            backup: {
                filename: backupFileName,
                path: backupPath,
                size: `${fileSize} MB`,
                date: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error("Error creando backup:", error)
        res.status(500).json({
            success: false,
            message: "Error al crear el backup",
            error: error.message,
        })
    }
}

export const getBackups = async (req, res) => {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return res.json({
                success: true,
                backups: [],
            })
        }

        const files = fs.readdirSync(BACKUP_DIR)
        const backupFiles = files.filter((file) => file.endsWith(".bak"))

        const backups = backupFiles.map((filename) => {
            const filePath = path.join(BACKUP_DIR, filename)
            const stats = fs.statSync(filePath)
            const fileSize = (stats.size / (1024 * 1024)).toFixed(2)

            return {
                filename,
                path: filePath,
                size: `${fileSize} MB`,
                date: stats.mtime.toISOString(),
                dateFormatted: stats.mtime.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }
        })

        // Ordenar por fecha (más recientes primero)
        backups.sort((a, b) => new Date(b.date) - new Date(a.date))

        res.json({
            success: true,
            backups,
        })
    } catch (error) {
        console.error("Error obteniendo backups:", error)
        res.status(500).json({
            success: false,
            message: "Error al obtener la lista de backups",
            error: error.message,
        })
    }
}

export const restoreBackup = async (req, res) => {
    let masterPool = null

    try {
        const { filename } = req.body

        if (!filename) {
            return res.status(400).json({
                success: false,
                message: "Nombre de archivo requerido",
            })
        }

        const backupPath = path.join(BACKUP_DIR, filename)

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: "Archivo de backup no encontrado",
            })
        }

        // Crear una conexión completamente nueva y separada a master
        const masterConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            port: Number.parseInt(process.env.DB_PORT),
            database: "master", // Conectar directamente a master
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
                requestTimeout: 300000, // 5 minutos
                connectionTimeout: 60000, // 1 minuto
            },
            pool: {
                max: 1,
                min: 0,
                idleTimeoutMillis: 30000,
            },
        }

        console.log("Conectando a master database...")
        masterPool = new sql.ConnectionPool(masterConfig)
        await masterPool.connect()

        console.log("Cerrando conexiones activas a Zuleykas...")
        // Paso 1: Matar todas las conexiones activas a la base de datos Zuleykas
        await masterPool.request().query(`
      DECLARE @kill varchar(8000) = '';  
      SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';'  
      FROM sys.dm_exec_sessions
      WHERE database_id = db_id('Zuleykas')
      EXEC(@kill);
    `)

        // Paso 2: Poner la base de datos en modo single user
        await masterPool.request().query(`
      ALTER DATABASE [Zuleykas] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
    `)

        console.log("Restaurando base de datos...")
        // Paso 3: Restaurar la base de datos
        const restoreQuery = `
      RESTORE DATABASE [Zuleykas] 
      FROM DISK = '${backupPath.replace(/\\/g, "\\\\")}'
      WITH REPLACE, STATS = 10
    `

        await masterPool.request().query(restoreQuery)

        // Paso 4: Volver a modo multi-usuario
        await masterPool.request().query(`
      ALTER DATABASE [Zuleykas] SET MULTI_USER
    `)

        console.log("Restauración completada exitosamente")

        res.json({
            success: true,
            message: "Base de datos restaurada exitosamente",
        })
    } catch (error) {
        console.error("Error restaurando backup:", error)

        // Intentar volver a modo multi-usuario en caso de error
        try {
            if (masterPool && masterPool.connected) {
                await masterPool.request().query(`
          ALTER DATABASE [Zuleykas] SET MULTI_USER
        `)
            }
        } catch (rollbackError) {
            console.error("Error en rollback:", rollbackError)
        }

        res.status(500).json({
            success: false,
            message: "Error al restaurar el backup",
            error: error.message,
        })
    } finally {
        // Cerrar la conexión a master
        if (masterPool) {
            try {
                await masterPool.close()
                console.log("Conexión a master cerrada")
            } catch (closeError) {
                console.error("Error cerrando conexión master:", closeError)
            }
        }
    }
}

export const deleteBackup = async (req, res) => {
    try {
        const { filename } = req.params
        const backupPath = path.join(BACKUP_DIR, filename)

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: "Archivo de backup no encontrado",
            })
        }

        fs.unlinkSync(backupPath)

        res.json({
            success: true,
            message: "Backup eliminado exitosamente",
        })
    } catch (error) {
        console.error("Error eliminando backup:", error)
        res.status(500).json({
            success: false,
            message: "Error al eliminar el backup",
            error: error.message,
        })
    }
}
