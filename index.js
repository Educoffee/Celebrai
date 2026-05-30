const API_URL = 'http://127.0.0.1:5000/agendamentos';
let calendarioInstancia = null; // Guarda o controle do calendário na tela

// 1. FUNÇÃO PARA ENVIAR O AGENDAMENTO PARA O PYTHON
async function agendar() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value; 
    const data = document.getElementById('data').value;

    if (!nome || !telefone || !data) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const novoAgendamento = {
        cliente: nome,
        data: data // O Flatpickr já entrega no formato "YYYY-MM-DD" ideal para o Python
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoAgendamento)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            // Check-in e QR Code do PIX
            const containerForm = document.getElementById('formulario-container'); 
            
            if (containerForm) {
                containerForm.innerHTML = `
                    <div class="checkout-pix" style="text-align: center; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%;">
                        <h2 style="color: #28a745; margin-bottom: 10px;">🎉 Pré-agendamento Realizado!</h2>
                        <p style="color: #555; font-size: 14px;">Um e-mail com os detalhes foi enviado para o proprietário.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                        <h3 style="color: #333; font-size: 16px; margin-bottom: 5px;">Acesse o Pix para confirmar</h3>
                        <p style="color: #666; font-size: 13px; margin-bottom: 10px;">Escaneie o QR Code abaixo ou utilize a chave Pix:</p>
                        
                        <img src="assr/qrcode-pix.png" alt="QR Code PIX Fixo" style="width: 180px; height: 180px; margin: 10px 0; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                        
                        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px dashed #28a745; margin-top: 10px; word-break: break-all;">
                            <span style="font-size: 14px; color: #333;"><strong>Chave PIX:</strong> deboraewerbeth@gmail.com</span>
                        </div>
                        <p style="font-size: 11px; color: #888; margin-top: 15px;">
                            ℹ️ <em>A vaga só será garantida de forma definitiva após a validação do Pix pelo dono do Celebrai.</em>
                        </p>
                    </div>
                `;
            }

            // Atualiza o calendário toda vez que um novo agendamento é feito, para refletir as datas ocupadas
            atualizarCalendario();

        } else {
            alert(`Erro: ${resultado.erro}`);
        }

    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        alert('Não foi possível conectar ao servidor. Verifique se o Python está ativo!');
    }
}

// 2. CONFIGURAÇÕES PARA O CALENDÁRIO (FLATPICKR)
async function atualizarCalendario() {
    try {
        const resposta = await fetch(API_URL);
        const datasOcupadas = await resposta.json(); // Array vindo do Python: ["2026-06-12", "2026-06-20"]

        // Se o calendário já estiver na tela, destrói para criar um novo atualizado
        if (calendariaInstancia) {
            calendarioInstancia.destroy();
        }

        // Inicializa o Flatpickr apontando para o input com id="data"
        calendarioInstancia = flatpickr("#data", {
            locale: "pt", 
            dateFormat: "Y-m-d", 
            altInput: true,
            altFormat: "d/m/Y", 
            minDate: "today", // Impede agendamentos em dias passados
            disable: datasOcupadas, // Desabilita o clique nas datas que o Python retornou
            
            // Essa função roda para cada dia do calendário. Se o dia estiver na lista, pinta de vermelho
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                // Formata a data atual do loop para YYYY-MM-DD
                const ano = dayElem.dateObj.getFullYear();
                const mes = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
                const dia = String(dayElem.dateObj.getDate()).padStart(2, '0');
                const dataFormatada = `${ano}-${mes}-${dia}`;

                // Se a data do calendário constar nas datas ocupadas vindas do Python, pinta de vermelho vivo
                if (datasOcupadas.includes(dataFormatada)) {
                    dayElem.style.backgroundColor = "#e44d4d"; // Vermelho suave profissional
                    dayElem.style.color = "#fff";
                    dayElem.style.borderRadius = "50%";
                }
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar o calendário:', error);
    }
}

// Executa a busca assim que carregar a página
document.addEventListener('DOMContentLoaded', atualizarCalendario);