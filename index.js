const API_URL = 'https://celebrai-1.onrender.com';
let calendarioInstancia = null;

// 1. FUNÇÃO PARA ENVIAR O AGENDAMENTO
async function agendar() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value; 
    const data = document.getElementById('data').value;

    if (!nome || !telefone || !data) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const novoAgendamento = { cliente: nome, data: data };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoAgendamento)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
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
                    </div>
                `;
            }
            atualizarCalendario();
        } else {
            alert(`Erro: ${resultado.erro}`);
        }
    } catch (error) {
        console.error('Erro ao conectar:', error);
    }
}

// 2. INICIALIZAÇÃO DO CALENDÁRIO COM PROTEÇÃO CONTRA TRAVAMENTOS
async function atualizarCalendario() {
    let datasOcupadas = [];
    
    try {
        // Tenta buscar as datas do Python ativo
        const resposta = await fetch(API_URL);
        if (resposta.ok) {
            datasOcupadas = await resposta.json();
        }
    } catch (error) {
        console.log('Modo offline: Carregando calendário vazio sem dados do Python.');
        // Se o Python estiver desligado, usamos datas vazias ou fictícias para o teste
        datasOcupadas = ["2026-06-12", "2026-06-20"]; 
    }

    if (calendarioInstancia) {
        calendarioInstancia.destroy();
    }

    // Cria o calendário independente de o Python estar respondendo ou não
    calendarioInstancia = flatpickr("#data", {
        locale: "pt", 
        dateFormat: "Y-m-d", 
        altInput: true,
        altFormat: "d/m/Y", 
        minDate: "today", 
        disable: datasOcupadas, 
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const ano = dayElem.dateObj.getFullYear();
            const mes = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
            const dia = String(dayElem.dateObj.getDate()).padStart(2, '0');
            const dataFormatada = `${ano}-${mes}-${dia}`;

            if (datasOcupadas.includes(dataFormatada)) {
                dayElem.style.backgroundColor = "#e44d4d"; 
                dayElem.style.color = "#fff";
                dayElem.style.borderRadius = "50%";
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', atualizarCalendario);