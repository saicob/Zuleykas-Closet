import sql from 'mssql';

const dbSettings = {
    user: 'sas',
    password: 'saicobi#',
    server: 'LAPTOP-D7T1S5MH',  //pongan el nombre de su servidor
    database: 'Zuleyka',
    port: 1434, //probar si funciona este puerto, sino ponga el puerto de su sql server
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
