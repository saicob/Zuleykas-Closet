import app from "./src/app.js"
import { getConnection } from "./src/database/connection.js"

getConnection()

app.listen(3000, () => {
    console.log("Servidor iniciado en http://localhost:3000/VerProductos.html");
  });
  
