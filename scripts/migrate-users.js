import sql from 'mssql'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE || 'Zuleykas',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  options: { encrypt: false, trustServerCertificate: true },
}

function genPassword() {
  return crypto.randomBytes(6).toString('hex') // 12-char hex
}

;(async () => {
  console.log('Connecting to DB...')
  let pool
  try {
    pool = await sql.connect(dbSettings)
  } catch (err) {
    console.error('DB connection failed:', err && err.message ? err.message : err)
    process.exit(1)
  }

  try {
    // Create target table 'usuarios' if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuarios]') AND type in (N'U'))
      CREATE TABLE usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) NOT NULL UNIQUE,
        password_hash NVARCHAR(200) NOT NULL,
        role NVARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
      )
    `)

    // Read existing users from old table `usuario` (adjust if your table name differs)
    const res = await pool.request().query('SELECT codigo_usuario, nombre, hash_contraseña, codigo_rol FROM usuario')
    const rows = res.recordset || []
    if (rows.length === 0) {
      console.log('No rows found in table `usuario` to migrate.')
      await pool.close()
      process.exit(0)
    }

    console.log(`Found ${rows.length} users in 'usuario'. Starting migration...`)
    const migrated = []

    for (const r of rows) {
      const username = (r.nombre || '').toString()
      if (!username) continue

      // map role code to string
      const role = (r.codigo_rol == 1) ? 'admin' : 'cajero'

      // skip if already present in usuarios
      const check = await pool.request().input('username', sql.NVarChar, username).query('SELECT id FROM usuarios WHERE username = @username')
      if (check.recordset.length > 0) {
        console.log(`Skipping existing user: ${username}`)
        continue
      }

      const plain = genPassword()
      const hash = await bcrypt.hash(plain, 10)

      await pool.request()
        .input('username', sql.NVarChar, username)
        .input('password_hash', sql.NVarChar, hash)
        .input('role', sql.NVarChar, role)
        .query('INSERT INTO usuarios (username, password_hash, role) VALUES (@username, @password_hash, @role)')

      migrated.push({ username, password: plain, role })
      console.log(`Migrated ${username} -> role=${role}, temp-password=${plain}`)
    }

    console.log('\nMigration completed. Summary:')
    migrated.forEach(m => console.log(`${m.username} -> ${m.role} | password: ${m.password}`))
  // User system removed: ignore Users.html reference
    await pool.close()
    process.exit(0)
  } catch (err) {
    console.error('Migration error:', err && err.message ? err.message : err)
    if (pool && pool.close) await pool.close()
    process.exit(1)
  }
})()
