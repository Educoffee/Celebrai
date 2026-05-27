from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Banco de dados simulado
agendamentos_db = [
    {"id": 1, "cliente": "João", "data": "2024-06-15"},
    {"id": 2, "cliente": "Maria", "data": "2024-06-16"},
]


@app.route("/agendamentos", methods=["GET"])
def listar_agendamentos():
    # datas utilizadas
    datas_utilizadas = [agendamento["data"] for agendamento in agendamentos_db]
    return jsonify(datas_utilizadas)


@app.route('/agendamentos', methods=["POST"])
def criar_agendamento():
    dados = request.get_json()

    # validação dos dados
    if not dados or 'cliente' not in dados or 'data' not in dados:
        return jsonify({"erro": "Dados incompletos. 'cliente' e 'data' são obrigatórios."}), 400

    nova_data = dados['data']

    # verificação se a data já está agendada
    for agendamento in agendamentos_db:
        if agendamento['data'] == nova_data:
            return jsonify({"erro": "Data já agendada. Por favor, escolha outra data."}), 400

    # Data livre, salva
    nova_id = len(agendamentos_db) + 1
    novo_agendamento = {
        "id": nova_id,
        "cliente": dados['cliente'],
        "data": nova_data
    }
    agendamentos_db.append(novo_agendamento)
    return jsonify({"mensagem": "Agendamento realizado com sucesso!", "dados": novo_agendamento}), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)
