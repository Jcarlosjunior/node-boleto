var formatters = require('../../lib/formatters'),
helper = require('./helper');

exports.options = {
    logoURL: '',
    codigo: '341',
    carteiraComRegistro : function (carteira) {
        var carteiras = ['175', '176', '178', '109', '121'];
        return carteiras.indexOf(carteira) != -1;
    },
    carteiraSemRegistro : function (carteira) {
        var carteiras = ['198', '107', '122', '142', '143', '196'];
        return carteiras.indexOf(carteira) != -1;
    },
}

exports.dvBarra = function(barra) {
    var resto2 = formatters.mod11(barra, 9, 1);
    var digito = 11 - resto2;
    return (digito== 0 || digito== 1 || digito== 10 || digito== 11) ? 1 : digito;
}

exports.barcodeData = function(boleto){
    var codigoBanco = this.options.codigo;
    var numMoeda = "9";
    var fatorVencimento = formatters.fatorVencimento(boleto['data_vencimento']);
    var valor = formatters.addTrailingZeros(boleto['valor'], 10);
    var carteira = boleto['carteira'];
    var nossoNumero = formatters.addTrailingZeros(boleto['nosso_numero'], 8);

    var dvNossoNumero = formatters.mod10(agencia + conta + carteira + nossoNumero);
    var agencia = formatters.addTrailingZeros(boleto['agencia'], 4);
    var conta = formatters.addTrailingZeros(boleto['conta'], 5);
    var dvConta = formatters.mod10(agencia + conta);

    var numeroDocumento = formatters.addTrailingZeros(boleto['numero_documento'], 7);
    var codigoCedente = formatters.addTrailingZeros(boleto['codigo_cedente'], 5);
    var dvCabecalhoDocumento = formatters.mod10(carteira + nossoNumero + numeroDocumento + codigoCedente);

    var barra = codigoBanco + numMoeda + fatorVencimento + valor + carteira + nossoNumero;


    if (this.options.carteiraComRegistro(carteira)) 
    {
        barra = barra + dvNossoNumero + agencia + conta + dvConta + '000';
    } 
    else
    {
        barra = barra + numeroDocumento + codigoCedente + dvCabecalhoDocumento + '0';
    }

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
    // 10 a 10  Digito verificador Primeiro Grupo

    // 11 a 17  Restante do Nosso Numero (7 digitos) - total 9 (incluindo digito verificador)
    // 18 a 20  3 primeiros digitos da Agência
    // 21       Digito verificador Segundo Grupo

    // 22       Restante da Agência
    // 23 a 28  Número da Conta Corrente
    // 28 a 30  Zeros
    // 31       Digito verificador Terceiro Grupo 

    // 32       Digito verificador Código de Barras

    // 33 a 36  Fator Vencimento
    // 37 a 46  Valor


    function primeiroGrupo(){

        var numeroBanco = barcodeData.substring(0, 2);
        var codigoMoeda = barcodeData.substring(3, 3);
        var carteira = barcodeData.substring(19, 21);
        var ddNossoNumero =  barcodeData.substring(22, 23);
        var dvGrupo = formatters.mod10(numeroBanco + codigoMoeda + carteira + ddNossoNumero);

        var grupo =  numeroBanco + codigoMoeda + carteira + ddNossoNumero + dvGrupo;

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function segundoGrupo(){

        var restanteNossoNumero = barcodeData.substring(24, 29);
        var dvNossoNumero = barcodeData.substring(30, 30);
        var dddAgencia = barcodeData.substring(31, 33);
        var dvGrupo = formatters.mod10(restanteNossoNumero + dvNossoNumero + dddAgencia);

        var grupo = restanteNossoNumero + dvNossoNumero + dddAgencia + dvGrupo;

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function terceiroGrupo(){

        var restanteAgencia = barcodeData.substring(34, 34);
        var conta = barcodeData.substring(35, 39);
        var dvConta = barcodeData.substring(40, 40);
        var zeros = barcodeData.substring(41, 43);
        var dvGrupo = formatters.mod10(restanteAgencia + conta + dvConta + zeros);

        var grupo = restanteAgencia + conta_e_conta_dv + zeros + dvGrupo;

        return  grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function quartoGrupo() {

        var dvCodigoBarras =  barcodeData.substring(4, 4);

        return dvCodigoBarras;
    }

    function quintoGrupo() {

        var fator = barcodeData.substring(5, 8);
        var valor = barcodeData.substring(9, 18);

        return fator + valor;
    }

    var campos = new Array();

    campos.push(primeiroGrupo());
    campos.push(segundoGrupo());
    campos.push(terceiroGrupo());
    campos.push(quartoGrupo());
    campos.push(quintoGrupo());

    return campos.join(" ");
}


