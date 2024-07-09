const mysql = require("mysql2"); // LEMBRAR: $ npm install mysql

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: process.env.port,
});
// Conexão com o banco de dados
connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conexão bem-sucedida ao banco de dados MySQL");
});



module.exports = connection;

