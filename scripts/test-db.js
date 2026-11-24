import sql from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE || 'Zuleykas',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: { max: 2, min: 0 }
}

;(async () => {
  console.log('Testing DB connection with settings:')
  console.log({ server: dbSettings.server, port: dbSettings.port, database: dbSettings.database, user: dbSettings.user })
  try {
    const pool = await sql.connect(dbSettings)
    const res = await pool.request().query('SELECT 1 AS ok')
    console.log('Connection successful, query result:', res.recordset)
    await pool.close()
    process.exit(0)
  } catch (err) {
    console.error('Connection failed:')
    console.error(err && err.message ? err.message : err)
    // print nested SQL driver error if present
    if (err && err.originalError) console.error('Original error:', err.originalError)
    process.exit(1)
  }
})()
