import app from "./src/app.js"
import { getConnection } from "./src/database/connection.js"

getConnection()

app.listen(3000)
console.log("servidor iniciado 2")
