var formatters = require('../../lib/formatters');


exports.getNossoNumero = function (boleto){

    var convenioLength = boleto.convenio_cedente.toString().length;
    var formattedNossoNumero;

    if (['11', '16'].indexOf(boleto.carteira) !== -1){
        if (boleto.tipo_modalidade === '21'){
            return formatters.addTrailingZeros(boleto.nosso_numero, 17);
        } else {
            if (boleto.convenio_cedente.toString().length === 6){
                return boleto.convenio_cedente + formatters.addTrailingZeros(boleto.nosso_numero, 11);
            } else {
                return formatters.addTrailingZeros(boleto.nosso_numero, 11);
            }
        }
    }

    if (boleto.carteira === '17'){

        if (convenioLength === 6){
            return formatters.addTrailingZeros(boleto.nosso_numero, 12);
        }

        if (convenioLength === 7){
            return boleto.convenio_cedente + formatters.addTrailingZeros(boleto.nosso_numero, 10);
        }
    }

    if (['17-019', '18-019', '18-027', '18-035', '18-140'].indexOf(boleto.carteira) !== -1){

        if (convenioLength === 6){
            
            if (['18-019', '18-027', '18-035', '18-140'].indexOf(boleto.carteira) !== -1 && boleto.tipo_modalidade === '21'){
                return formatters.addTrailingZeros(boleto.nosso_numero, 17);
            } else {
                formattedNossoNumero = formatters.addTrailingZeros(boleto.nosso_numero, 5);
            }

        } else if (convenioLength === 7){

            formattedNossoNumero = formatters.addTrailingZeros(boleto.nosso_numero, 10);

        } else if (convenioLength === 4){

            formattedNossoNumero = formatters.addTrailingZeros(boleto.nosso_numero, 7);

        } else {

            return formatters.addTrailingZeros(boleto.nosso_numero, 11); 
        }

        return boleto.convenio_cedente.toString() + formattedNossoNumero;
    }

    if (boleto.carteira === '18'){
        return formatters.addTrailingZeros(boleto.nosso_numero, 11); 
    }

    if (boleto.carteira === '31'){
        if ([5, 6].indexOf(convenioLength) !== -1){
            return formatters.addTrailingZeros(boleto.nosso_numero, 10); 
        }

        if (convenioLength === 7){
           return boleto.convenio_cedente.toString() + formatters.addTrailingZeros(boleto.nosso_numero, 10); 
        }
    }

};
