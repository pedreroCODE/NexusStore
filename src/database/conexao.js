const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'nexus_store_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


(async () => {
    try {
        const conexao = await pool.getConnection();
        console.log('[DATABASE] Integração com o MySQL 8 realizada com sucesso!');
        conexao.release();
    } catch (erro) {
        console.error('[DATABASE] Erro crítico de conexão com o MySQL:', erro.message);
    }
})();

module.exports = pool;
