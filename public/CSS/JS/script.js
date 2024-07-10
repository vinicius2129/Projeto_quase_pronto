document.getElementById("form-cadastro").addEventListener("submit", function(event) {
    var opcoes = document.getElementsByName("opcao-sexo");
    var selecionado = false;
    for (var i = 0; i < opcoes.length; i++) {
        if (opcoes[i].checked) {
            selecionado = true;
            break;
        }
    }
    if (!selecionado) {
        var errorMessageElement = document.getElementById("error-message");
        errorMessageElement.textContent = "Por favor, selecione uma das opções de sexo.";
        event.preventDefault();
    }
});

