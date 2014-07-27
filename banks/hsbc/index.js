var formatters = require('../../lib/formatters');

exports.options = {
    logoURL: 'https://wwws8.hsbc.com.br/EPU/atualiza_boleto/img/logo-hsbc.gif',
    codigo: '399'
};

function digitoVerificadorNossoNumero(nossoNumero){
    var resto2 = formatters.mod11(barra, 9, 1);
    var digito = 11 - resto2;
    return (resto2 === 11 || resto2 === 10) ? 1 : digito;
}

exports.dvBarra = function(barra) {
    var resto2 = formatters.mod11(barra, 9, 1);
    var digito = 11 - resto2;
    return (resto2 === 0 || resto2 === 1 || resto2 === 10) ? 1 : digito;
};

function carteiraCSB(barcodeData){
    var csbSuffix = '001';
    return barcodeData.indexOf(csbSuffix, barcodeData.length - csbSuffix) !== -1;
}

exports.barcodeData = function(boleto){
    var codigoBanco = this.options.codigo;
    var numMoeda = "9";
    var fatorVencimento = formatters.fatorVencimento(boleto['data_vencimento']);
    var valor = formatters.addTrailingZeros(boleto['valor'], 10);
    var carteira = boleto['carteira'];

    var nossoNumero = formatters.addTrailingZeros(boleto['nosso_numero'], (carteira.toUpperCase() === "CSB") ? 10 : 13);
    var dvNossoNumero = formatters.mod11(nossoNumero, 7);

    var agencia = formatters.addTrailingZeros(boleto['agencia'], 4);
    var conta = formatters.addTrailingZeros(boleto['conta'], 7);
    var numeroDocumento = formatters.addTrailingZeros(boleto['numero_documento'], 13);
    var codigoCedente = formatters.addTrailingZeros(boleto['codigo_cedente'], 7);

    var barra = codigoBanco + numMoeda + fatorVencimento + valor;


    if (carteira.toUpperCase() === "CSB") 
    {
        barra = barra + nossoNumero + dvNossoNumero + agencia + conta + '001';
    } 
    else
    {
        var formatoDataVencimento = formatters.addTrailingZeros(formatters.dayOfYear(boleto['data_vencimento']) + boleto['data_vencimento'].getFullYear().toString().substring(3, 5), 4);

        barra = barra + codigoCedente + nossoNumero + formatoDataVencimento + '2';
    }

    var dvBarra = this.dvBarra(barra);

    var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length);

    return lineData;
};

exports.linhaDigitavel = function(barcodeData) {

    var carteira = barcodeData.substring(19, 22);

    function primeiroGrupo(){

        var numeroBanco = barcodeData.substring(0, 3);
        var codigoMoeda = barcodeData.substring(3, 4);
        var ddddd_NossoNumero_CodigoCedente =  barcodeData.substring(20, 25);
        var dvGrupo = formatters.mod10(numeroBanco + codigoMoeda + ddddd_NossoNumero_CodigoCedente);
        var grupo =  numeroBanco + codigoMoeda + ddddd_NossoNumero_CodigoCedente + dvGrupo;

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function segundoGrupo(){

        var grupo; 

        if (carteiraCSB(barcodeData))
        {
            var restanteNossoNumero = barcodeData.substring(25, 31);
            var ddddAgencia = barcodeData.substring(31, 35);
            var dvGrupoCBS = formatters.mod10(restanteNossoNumero + ddddAgencia);

            grupo = restanteNossoNumero + ddddAgencia + dvGrupoCBS;
        } else {

            var restanteCodigoCedente = barcodeData.substring(25, 27);
            var nossoNumero = barcodeData.substring(27, 35);
            var dvGrupoCNR = formatters.mod10(restanteCodigoCedente + nossoNumero);

            grupo = restanteCodigoCedente + nossoNumero + dvGrupoCNR;
        }

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function terceiroGrupo(){

        var grupo;

        if (carteiraCSB(barcodeData)){

            var conta = barcodeData.substring(35, 42);
            var dvGrupoCSB = formatters.mod10(conta + '001');

            grupo = conta + '001' + dvGrupoCSB;

        } else {

            var restanteNossoNumero = barcodeData.substring(35, 40);
            var codigoDataVencimento = barcodeData.substring(40, 45);
            var dvGrupoCNR = formatters.mod10(restanteNossoNumero + codigoDataVencimento);

            grupo = restanteNossoNumero + codigoDataVencimento + dvGrupoCNR;
        }

        return  grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function quartoGrupo() {

        if (carteiraCSB(barcodeData)){
            return barcodeData.substring(30, 31);
        } else {
            return formatters.mod11(formatters.removeTrailingZeros(barcodeData.substring(27, 35)), 7);
        }
    }

    function quintoGrupo() {

        var fator = barcodeData.substring(5, 9);
        var valor = barcodeData.substring(9, 19);

        return fator + valor;
    }

    var campos = [];

    campos.push(primeiroGrupo());
    campos.push(segundoGrupo());
    campos.push(terceiroGrupo());
    campos.push(quartoGrupo());
    campos.push(quintoGrupo());

    return campos.join(" ");
};


