import mssql from 'mssql';

const config = {
    user: 'test-AI2',
    password: 'test-AI2',
    server: '192.168.1.50',
    database: 'test-AI2',
    options: {
        encrypt: true, // Use this if you're on Azure or need encryption
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

export const getPool = () => {
    if (!poolPromise) {
        poolPromise = mssql.connect(config) 
            .then(pool => {
                console.log('Connected to MSSQL');
                return pool;
            })
            .catch(err => {
                console.error('Database Connection Failed! Bad Config: ', err);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
};


/**
 * Executes a SQL block with a JSON input.
 * The SQL block should handle OPENJSON to decode the input.
 */
export const executeJsonQuery = async (query, jsonPayload = {}) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('json', mssql.NVarChar, JSON.stringify(jsonPayload))
            .query(`
                BEGIN TRY
                    ${query}
                END TRY
                BEGIN CATCH
                    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
                    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
                    DECLARE @ErrorState INT = ERROR_STATE();
                    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
                END CATCH
            `);
        return result;
    } catch (error) {
        console.error('SQL JSON Execution Error:', error);
        throw error;
    }
};

export { mssql };

