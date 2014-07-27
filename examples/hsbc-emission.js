var express = require('express');

var app = express();

var Boleto = require('../index').Boleto;

var boleto = new Boleto({
  'banco': "hsbc",
  'data_emissao': new Date(),
  'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
  'valor': 1500,
  'nosso_numero': "6",
  'numero_documento': "1",
  'cedente': "Empresa Fictícia S/A",
  'cedente_cnpj': "00000000000000",
  'agencia': "1613",
  'conta': "12345",
  'codigo_cedente': "469",
  'carteira': "CNR",
  'pagador': "Nome do pagador\nCPF: 000.000.000-00",
  'local_de_pagamento': "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.",
  'instrucoes': "Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.",
});

console.log(boleto['linha_digitavel']);

app.use(express.static(__dirname + '/../'));

app.get('/', function(req, res){
  boleto.renderHTML(function(html){
	return res.send(html);
  });
});

app.listen(3003);
