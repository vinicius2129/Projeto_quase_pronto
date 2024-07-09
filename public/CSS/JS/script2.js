document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Coleta dos dados do formulário
    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;
    const quantidade = document.getElementById('quantidade').value;
    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('data').value;

    // Construção do objeto de transação
    const transacao = {
        descricao: descricao,
        categoria: categoria,
        quantidade: quantidade,
        tipo: tipo,
        data: data
    };

    // Envio dos dados via AJAX para o servidor
    fetch('/addTransicao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transacao),
    })
    .then(response => response.text())
    .then(message => {
        alert(message); // Exibe uma mensagem de sucesso
        // Limpar o formulário ou fazer outras operações necessárias após a submissão
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao adicionar a transação. Por favor, tente novamente.');
    });
});