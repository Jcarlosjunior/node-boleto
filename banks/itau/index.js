var formatters = require('../../lib/formatters'),
    helper = require('./helper');

exports.options = {
    logoURL: '',
    codigo: '341'
}

exports.dvBarra = function(barra) {
    var resto2 = formatters.mod11(barra, 9, 1);
    var digito = 11 - resto2;
    return (digito== 0 || digito== 1 || digito== 10 || digito== 11) ? 1 : digito;
}

exports.barcodeData = function(boleto){
    var codigoBanco = this.options.codigo;
    var numMoeda = "9";
    var fixo = "9"; // Numero fixo para a posição 05-05

    var fatorVencimento = formatters.fatorVencimento(boleto['data_vencimento']);

    var valor = formatters.addTrailingZeros(boleto['valor'], 10);
    var agencia = formatters.addTrailingZeros(boleto['agencia'], 4);
    var conta = formatters.addTrailingZeros(boleto['conta'], 5);
    var conta_dv = formatters.addTrailingZeros(boleto['conta_dv'], 1);
    var carteira = boleto['carteira'];

    var nossoNumero = formatters.addTrailingZeros(boleto['nosso_numero'], 8);
    var dac_nossoNumero = formatters.mod10(agencia + conta + carteira + nossoNumero);
    
    var barra = codigoBanco + numMoeda + fatorVencimento + valor + carteira + nossoNumero + dac_nossoNumero + 
                agencia + conta + formatters.mod10(agencia + conta) + '000';
                

    var dvBarra = this.dvBarra(barra);

    var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length);

    return lineData;
}

exports.linhaDigitavel = function(barcodeData) {
    // Posição 	Conteúdo
    // 1 a 3    Número do banco
    // 4        Código da Moeda - 9 para Real ou 8 - outras moedas
    // 5 a 7    Carteira 
    // 8 a 9    2 primeiros digitos do Nosso Numero
    // ? a ?    Mod 10 (banco + codigo moeda + 2 primeiros digitos Nosso Numero) 
    // ? a ?    7 primeiros digitos do Nosso Numero
    // ? a ?    Restante do Nosso numero (8 digitos) - total 13 (incluindo digito verificador)
    // 26 a 26  IOS
    // 27 a 29  Tipo Modalidade Carteira
    // 30 a 30  Dígito verificador do código de barras
    // 31 a 34  Fator de vencimento (qtdade de dias desde 07/10/1997 até a data de vencimento)
    // 35 a 44  Valor do título

    var campos = new Array();

    //1. Primero Grupo
    var numeroBanco = barcodeData.substring(0, 3);
    var codigoMoeda = bbarcodeData.substring(3, 4);
    var carteira = barcodeData.substring(19, 21);
    var ddNossoNumero =  barcodeData.substring(22, 23);
    var dacCampo1Mod10 = formatters.mod10(numeroBanco + codigoMoeda + carteira + ddNossoNumero);
    
    var campo1 =  numeroBanco + codigoMoeda + carteira + ddNossoNumero + dacCampo1Mod10;
    campo1 = formatters.mod10(campo);
    campo1 = campo.substring(0, 5) + '.' + campo.substring(5, campo.length);
    campos.push(campo1);

    // 2. Segundo Grupo 
    var campo2 = '';
    campo2 = campo + formatters.mod10(campo);
    campo2 = campo.substring(0, 5) + '.' + campo.substring(5, campo.length);
    campos.push(campo2);

    return campos.join(" ");
}


