import sql from 'mssql';

export const dbSettings = {
    user: 'sas',
    password: 'saicobi#',
    server: '127.0.0.1',  //pongan el nombre de su servidor o la dirección IP si no funciona el nombre
    database: 'Zuleykas',  //usar EXEC xp_readerrorlog 0, 1, N'Server is listening on'; en MSSQL para ver el ip y el puerto que usa
    port: 1434, //en mi caso el puerto es 57794, pero puede variar en cada caso 
                // configurar el puerto en el firewall de windows para que no lo bloquee
                //configurar en sql server para que acepte conexiones TCP/IP y poner el puerto que ocupa
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        const result = await pool.request().query('SELECT GETDATE() as fecha');
        console.log(result)
        return pool;
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
};
