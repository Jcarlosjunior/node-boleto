var formatters = require('../../lib/formatters');
var nossoNumeroFormatter = require('./nossoNumeroFormatter');

exports.options = {
    logoURL: 'http://borboleto.com.br/boletos/bb/imagens/logo_bb.gif',
    codigo: '001'
};

exports.dvBarra = function(barra) {
    var resto2 = formatters.mod11(barra, 9);
    var digito = 11 - resto2;
    return (digito === 0 || digito === 1 || digito > 9) ? 1 : digito;
};


exports.barcodeData = function(boleto){
    var codigoBanco = this.options.codigo;
    var numMoeda = "9";
    var fatorVencimento = formatters.fatorVencimento(boleto.data_vencimento);
    var valor = formatters.addTrailingZeros(boleto.valor, 10);
    var carteira = boleto.carteira;
    var nossoNumero = nossoNumeroFormatter.getNossoNumero(boleto);
    var agencia = formatters.addTrailingZeros(boleto.agencia, 4);
    var conta = formatters.addTrailingZeros(boleto.conta, 8);

    var barra = codigoBanco + numMoeda + fatorVencimento + valor;

    var convenioLength = boleto.convenio_cedente.toString().length;

    if (['11', '16'].indexOf(boleto.carteira) !== -1){
        if (convenioLength === 6){
            if (boleto.tipo_modalidade === '21'){
                barra = barra + boleto.convenio_cedente + nossoNumero + '21';
            }
        } else {
            barra = barra + nossoNumero + agencia + conta + carteira;
        }
    }

    if (boleto.carteira === '17'){
        if (convenioLength === 7){
            barra = barra + '000000' + nossoNumero + formatters.addTrailingZeros(carteira.split('-')[0], 2);
        } else {
            if (convenioLength === 6){
                barra = barra +nossoNumero.substring(0, 11);
            } else {
                barra = barra + nossoNumero;
            }

            barra = barra + agencia + conta + carteira;
        }
    }

    if (boleto.carteira === '17-019'){
        if (convenioLength === 7){
            barra = barra + '000000' + nossoNumero + formatters.addTrailingZeros(carteira.split('-')[0], 2);
        } else if([4, 6].indexOf(convenioLength) !== -1) {
            barra = barra + nossoNumero + agencia + conta + carteira.split('-')[0];
        }
    }

    if (['18', '31'].indexOf(boleto.carteira) !== -1){
        barra = barra + nossoNumero + agencia + conta + carteira;
    }

    if (['18-019', '18-027', '18-035', '18-140'].indexOf(boleto.carteira) !== -1){
        if (convenioLength === 7){
            barra = barra + '000000' + nossoNumero + formatters.addTrailingZeros(carteira.split('-')[0], 2);
        } else if (convenioLength === 6){
            if (boleto.tipo_modalidade === '21'){
                barra = barra + boleto.convenio_cedente + nossoNumero + '21';
            } else {
                barra = barra + nossoNumero + agencia + conta + carteira.split('-')[0];
            }
        } else  if (convenioLength === 4){
            barra = barra + nossoNumero + agencia + conta + carteira.split('-')[0];
        }
    }

    var dvBarra = this.dvBarra(barra);

    var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length);

    return lineData;
};

exports.linhaDigitavel = function(barcodeData) {

    var campoLivre = barcodeData.substring(19, 45);

    function primeiroGrupo(){

        var campo1 = barcodeData.substring(0, 4) + campoLivre.substring(0, 5);
        var dvGrupo = formatters.mod10(campo1);
        var grupo = campo1 + dvGrupo; 

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function segundoGrupo(){

        var campo2 = campoLivre.substring(5, 15);
        var dvGrupo = formatters.mod10(campo2);
        var grupo = campo2 + dvGrupo; 

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function terceiroGrupo(){

        var campo3 = campoLivre.substring(15, 25);
        var dvGrupo = formatters.mod10(campo3);
        var grupo = campo3 + dvGrupo; 

        return grupo.substring(0, 5) + '.' + grupo.substring(5, grupo.length);
    }

    function quartoGrupo() {

        return barcodeData.substring(5, 6);
    }

    function quintoGrupo() {

        var intCampo5 = parseInt(barcodeData.substring(5, 19));

        if (intCampo5 === 0){
            return '000';
        } else {
            return intCampo5.toString();
        }
    }

    var campos = [];

    campos.push(primeiroGrupo());
    campos.push(segundoGrupo());
    campos.push(terceiroGrupo());
    campos.push(quartoGrupo());
    campos.push(quintoGrupo());

    return campos.join(" ");
};


