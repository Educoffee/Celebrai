function agendar() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const data = document.getElementById('data').value;

    // Validação simples
    if (!nome || !telefone || !data) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Criar o objeto do agendamento
    const novoAgendamento = {
        nome,
        telefone,
        data
    };

    // Buscar lista existente ou criar uma nova
    let lista = JSON.parse(localStorage.getItem('agenda')) || [];

    // Adicionar o novo agendamento à lista
    lista.push(novoAgendamento);

    // Salvar de volta no LocalStorage
    localStorage.setItem('agenda', JSON.stringify(lista));

    // Limpar os campos do formulário
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('data').value = '';

    // Atualizar a visualização dos círculos
    mostrar();
}

// Função para renderizar os círculos na tela
function mostrar() {
    let lista = JSON.parse(localStorage.getItem('agenda')) || [];
    const div = document.getElementById('lista');

    // Limpa a lista antes de renderizar para não duplicar
    div.innerHTML = '';

    lista.forEach((item, index) => {
        // Usando o index para variar a foto de exemplo do Pravatar
        const fotoId = (index % 70) + 1; 

        div.innerHTML += `
            <div class="card-item-circular">
                <div class="foto-cliente" style="background-image: url('https://i.pravatar.cc/150?img=${fotoId}')"></div>
                <strong>${item.nome}</strong>
                <span>${item.telefone}</span>
                <span style="font-size: 10px; margin-top: 5px;">📅 ${item.data}</span>
            </div>
        `;
    });
}