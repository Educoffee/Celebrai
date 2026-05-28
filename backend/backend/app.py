from flask import Flask, jsonify, request
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# CONFIGURAÇÃO DE E-MAIL 
EMAIL_REMETENTE = "eduardomenezes.8080@gmail.com"
SENHA_REMETENTE = "mcwrtkzpfhtoehrc" # Senha do app criada pela google
EMAIL_DONO_DA_CASA = "deboraewerbeth@gmail.com"

agendamentos_db = [
    {"id": 1, "cliente": "Maria Silva", "data": "12-06-2026"},
    {"id": 2, "cliente": "João Souza", "data": "20-06-2026"}
]

# FUNÇÃO PARA ENVIAR E-MAIL DE NOTIFICAÇÃO AO DONO DO CELEBRAI, MENSAGEM PERSONALIZADA COM NOME DO CLIENTE E DATA DO AGENDAMENTO
def enviar_email_notificacao(cliente, data):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_REMETENTE
        msg['To'] = EMAIL_DONO_DA_CASA
        msg['Subject'] = f"🚨 Novo Agendamento Solicitado - Celebrai"

        corpo = f"""
        Olá! Um novo agendamento foi solicitado no site Celebrai:
        
        👤 Cliente: {cliente}
        📅 Data: {data}
        
        O cliente recebeu as instruções de pagamento via PIX na tela. 
        Verifique sua conta bancária para confirmar a reserva!
        """
        msg.attach(MIMEText(corpo, 'plain', 'utf-8'))

        # Conexão com o servidor SMTP do Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_REMETENTE, SENHA_REMETENTE)
        server.sendmail(EMAIL_REMETENTE, EMAIL_DONO_DA_CASA, msg.as_string())
        server.quit()
        print("E-mail de notificação enviado com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")

@app.route('/agendamentos', methods=['GET'])
def listar_agendamentos():
    datas_ocupadas = [agendamento["data"] for agendamento in agendamentos_db]
    return jsonify(datas_ocupadas), 200

@app.route('/agendamentos', methods=['POST'])
def criar_agendamento():
    dados = request.get_json()
    if not dados or 'cliente' not in dados or 'data' not in dados:
        return jsonify({"erro": "Dados incompletos."}), 400
    
    nova_data = dados['data']
    
    for agendamento in agendamentos_db:
        if agendamento['data'] == nova_data:
            return jsonify({"erro": "Esta data já está reservada!"}), 400
            
    novo_id = len(agendamentos_db) + 1
    novo_agendamento = {"id": novo_id, "cliente": dados['cliente'], "data": nova_data}
    agendamentos_db.append(novo_agendamento)
    
    # DISPARA O E-MAIL AUTOMÁTICO
    enviar_email_notificacao(dados['cliente'], nova_data)
    
    return jsonify({"mensagem": "Agendamento pré-registrado!", "dados": novo_agendamento}), 201

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
