function confirmar() {
  // Exibe a caixa de confirmação com a mensagem
  let resposta = confirm("Confirmar agendamento?");

  // Verifica a resposta do usuário
  if (resposta) {"Confirmar"
    // Se o usuário clicar em OK (true)
    alert("Agendado.");
    // Aqui você adicionaria o código para realmente excluir o item
  } else {
    // Se o usuário clicar em Cancelar (false)
    alert("Ação cancelada.");
  }}

  export default confirmar();
