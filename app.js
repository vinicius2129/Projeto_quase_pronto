// Importar as dependências
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const db = require("./bd"); 

const app = express();

// Configurar o motor de visualização EJS
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração do express-session
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware de autenticação
function ensureAuthenticated(req, res, next) {
  if (req.session.username) {
    next(); // Usuário está autenticado, continua para a rota
  } else {
    res.redirect("/pagina_login"); // Usuário não autenticado, redireciona para a página de login
  }
}

// Rota para a página de cadastro
app.get("/pagina_cadastro", (req, res) => {
  const errorMessage = req.query.error ? req.query.error : null;
  res.render("pagina_cadastro", { error: errorMessage });
});

app.post("/pagina_cadastro", (req, res) => {
  const { name, email, password, confirmPassword, inpnascimento } = req.body;

  // Verificações de validação
  if (!name) {
    return res.redirect("/pagina_cadastro?error=Nome é obrigatório.");
  }
  if (!email || !email.includes('@')) {
    return res.redirect("/pagina_cadastro?error=Email inválido.");
  }
  if (password !== confirmPassword) {
    return res.redirect("/pagina_cadastro?error=As senhas não coincidem.");
  }

  
  // Caso todos os campos estejam válidos
  registerUserModel(name, email, password);
  res.redirect("./pagina_login");
});


// Rota para a página de login
app.get("/pagina_login", (req, res) => {
  const errorMessage = req.query.error
    ? "Credenciais inválidas! Tente novamente."
    : null;
  res.render("pagina_login", { error: errorMessage });
});

app.post("/pagina_login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT nome FROM users WHERE email = ? AND senha = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      res.redirect("/pagina_login?error=true");
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      req.session.username = user.nome; // Armazenar o nome na sessão
      res.cookie("userEmail", email, { httpOnly: true });
      res.redirect("/pagina_login/success");
    } else {
      res.redirect("/pagina_login?error=true");
    }
  });
});

// Rota para a página de sucesso do login
app.get("/pagina_login/success", (req, res) => {
  const username = req.session.username; // Pegar o nome do usuário da sessão
  if (username) {
    res.render("login-success", { username: username }); // Passar o nome para a view
  } else {
    res.redirect("/pagina_login");
  }
});

// Rota para visualizar os cookies
app.get("/cookies", (req, res) => {
  res.send(req.cookies);
});

// Rota inicial agora redireciona para a página de login se não estiver autenticado
app.get("/", (req, res) => {
  // Verifica se a sessão já está iniciada
  if (req.session.username) {
    res.redirect("/pagina_login/success"); // Redireciona para a página de sucesso se estiver autenticado
  } else {
    res.redirect("/pagina_login"); // Redireciona para a página de login se não estiver autenticado
  }
});

// Rota para cadastro de usuários, acessível apenas para usuários autenticados
app.get("/cadastro_usuarios", ensureAuthenticated, (req, res) => {
  res.render("cadastro_usuarios"); // Renderiza a página de cadastro de usuários
});

// Rota para listar os usuários
app.get("/usuarios", ensureAuthenticated, (req, res) => {
  const query = "SELECT id, nome, email FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuários:", err);
      res.status(500).send("Erro ao buscar usuários");
      return;
    }
    res.render("lista_usuarios", { usuarios: results });
  });
});

// Rota para logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid"); // Limpa o cookie da sessão
    res.redirect("/pagina_login");
  });
});

function registerUser(nome, email, senha, callback) {
  const query = "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)";
  db.query(query, [nome, email, senha], (err, result) => {
    if (err) {
      console.error("Erro ao registrar usuário:", err);
      callback(err);
      return;
    }
    callback(null);
  });
}

function registerUserModel(nome, email, senha) {
  registerUser(nome, email, senha, (err, result) => {
    console.log(result);
  });
}

let transacoes = []; // Array para armazenar as transações

// Rota para lidar com o envio do formulário
app.post('/addTransicao', (req, res) => {
    const descricao = req.body.descricao;
    const categoria = req.body.categoria;
    const quantidade = req.body.quantidade;
    const tipo = req.body.tipo;
    const data = req.body.data;

    // Criar objeto da transação
    const transacao = {
        descricao: descricao,
        categoria: categoria,
        quantidade: quantidade,
        tipo: tipo,
        data: data
    };

    // Adicionar transação ao array
    transacoes.push(transacao);

    // Enviar uma resposta ao cliente (opcional)
    res.send('Transação adicionada com sucesso!');
});
// Rota para excluir um usuário
app.get('/usuarios/excluir/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            res.status(500).send('Erro ao excluir usuário');
            return;
        }
        console.log('Usuário excluído com sucesso');
        res.redirect('/usuarios');
    });
});
// Rota para exibir o formulário de atualização de usuários
app.get('/usuarios/atualizar/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuário para atualização:', err);
            res.status(500).send('Erro ao buscar usuário para atualização');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.render('atualizacao', { usuario: result[0] });
    });
});
// Rota para processar o formulário de atualização de usuários
app.post('/usuarios/atualizar/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const sql = 'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id = ?';
    db.query(sql, [nome, email, senha, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            res.status(500).send('Erro ao atualizar usuário');
            return;
        }
        console.log('Usuário atualizado com sucesso');
        res.redirect('/usuarios');
    });
});
// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
