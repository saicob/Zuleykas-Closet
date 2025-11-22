import sql from 'mssql'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE || 'Zuleykas',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  options: { encrypt: false, trustServerCertificate: true },
}

async function usage() {
  console.log('Usage: node scripts/hash-user.js <username> <password>')
  process.exit(1)
}

async function main() {
  const [, , username, password] = process.argv
  if (!username || !password) return usage()

  try {
    console.log('Connecting to DB...')
    const pool = await sql.connect(dbSettings)
    const hash = await bcrypt.hash(password, 10)
    const res = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('hash', sql.NVarChar, hash)
      .query('UPDATE usuarios SET password_hash = @hash WHERE username = @username; SELECT @@ROWCOUNT AS affected')

    const affected = res.recordset && res.recordset[0] ? res.recordset[0].affected : 0
    if (affected > 0) {
      console.log(`Password updated for user '${username}'.`)
    } else {
      console.log(`No rows updated. Is the user '${username}' present in 'usuarios' table?`)
    }

    await pool.close()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

main()
