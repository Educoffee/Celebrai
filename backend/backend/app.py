from flask import Flask, jsonify, request
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sqlite3  # Importa o banco de dados nativo do Python

app = Flask(__name__)
CORS(app)

# CONFIGURAÇÃO DE E-MAIL
EMAIL_REMETENTE = "eduardomenezes.8080@gmail.com"
SENHA_REMETENTE = "mcwrtkzpfhtoehrc" 
EMAIL_DONO_DA_CASA = "deboraewerbeth@gmail.com"

# --- FUNÇÕES DO BANCO DE DADOS (SQLITE) ---

def conectar_banco():
    """Conecta ao arquivo do banco de dados e configura para retornar dicionários."""
    conn = sqlite3.connect('banco.db')
    conn.row_factory = sqlite3.Row
    return conn

def inicializar_banco():
    """Cria a tabela de agendamentos caso ela ainda não exista no computador/servidor."""
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            data TEXT NOT NULL UNIQUE
        )
    ''')
    conn.commit()
    conn.close()

# Inicializa o banco assim que o Python liga
inicializar_banco()


# --- ROTAS DA API ---

@app.route('/agendamentos', methods=['GET'])
def listar_agendamentos():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        cursor.execute('SELECT data FROM agendamentos')
        linhas = cursor.fetchall()
        conn.close()
        
        # Pega apenas as strings das datas: ["2026-06-12", "2026-06-20"]
        datas_ocupadas = [linha['data'] for linha in linhas]
        return jsonify(datas_ocupadas), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar dados: {str(e)}"}), 500


@app.route('/agendamentos', methods=['POST'])
def criar_agendamento():
    dados = request.get_json()
    cliente = dados.get('cliente')
    data = dados.get('data') # Recebe "YYYY-MM-DD"
    
    if not cliente or not data:
        return jsonify({"erro": "Campos obrigatórios faltando!"}), 400

    try:
        # Salva no banco de dados SQLite
        conn = conectar_banco()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO agendamentos (cliente, data) VALUES (?, ?)', (cliente, data))
        conn.commit()
        conn.close()
        
        # Dispara o e-mail de notificação (Sua função existente)
        enviar_email_notificacao(cliente, data)
        
        return jsonify({"mensagem": "Agendamento realizado com sucesso!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Esta data já está ocupada!"}), 400
    except Exception as e:
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500


def enviar_email_notificacao(cliente, data):
    """Sua função de envio de e-mail existente"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_REMETENTE
        msg['To'] = EMAIL_DONO_DA_CASA
        msg['Subject'] = f"🚨 Novo Agendamento - Celebrai: {cliente}"
        
        # Formata a data para exibir bonito no e-mail (DD/MM/YYYY)
        ano, mes, dia = data.split('-')
        data_formatada = f"{dia}/{mes}/{ano}"

        corpo = f"""
        <h2>Olá, Débora!</h2>
        <p>Um novo pré-agendamento foi realizado pelo site do Celebrai:</p>
        <ul>
            <li><strong>Cliente:</strong> {cliente}</li>
            <li><strong>Data Solicitada:</strong> {data_formatada}</li>
        </ul>
        <p>O cliente foi direcionado para a tela de pagamento do PIX. Valide o recebimento na sua conta antes de confirmar em definitivo!</p>
        """
        msg.attach(MIMEText(corpo, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 5000) # Ou a porta que você configurou (ex: 587)
        server.starttls()
        server.login(EMAIL_REMETENTE, SENHA_REMETENTE)
        server.sendmail(EMAIL_REMETENTE, EMAIL_DONO_DA_CASA, msg.as_string())
        server.quit()
        print(f"E-mail enviado com sucesso para {EMAIL_DONO_DA_CASA}")
    except Exception as e:
        print(f"Erro ao enviar e-mail: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)