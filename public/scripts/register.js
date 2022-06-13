const e = require("express");
const { format } = require("mysql");

const ALPHA_NUMERIC = /[a-z0-9 .]+/i;

class FormField{
    constructor(label, id, field_type='text', required=true, regex=undefined, max_length=128){
        this.label = label;
        this.id = id;
        this.field_type = field_type;
        this.required = required;
        this.regex = undefined;
        this.max_length = max_length;
    }

    validate(value){
        var valid = false;
        var cleanValue = [];
        for(let subStr of value.match(/[\w,.-]*/ig)){
            if(subStr != '') cleanValue.push(subStr);
        }
        cleanValue = cleanValue.join(' ');

        if(cleanValue.length >= 2){
            if(this.regex != undefined){
                valid = this.regex.test(cleanValue);
            }
            else
                valid = true;
        }
        else if(!this.required && cleanValue.length == 0) valid = true;

            return {cleanValue: cleanValue, valid: valid}
    }
};

class Checkbox extends FormField{
    constructor(label, id, required=true){
        super(label, id, 'checkbox', required, undefined, 16);
    }

    validate(value){
        if(value == undefined)
            value = false;
        else if(value == 'on')
            value = true;
        
        var valid = !(this.required && !value);
        var cleanValue = value;

        return {cleanValue: cleanValue, valid: valid}
    }
}

class NoCleanupField extends FormField{
    constructor(label, id, field_type='text', required=true){
        super(label, id, field_type, required, undefined, 32)
    }

    validate(value){
        return {cleanValue: value, valid: value.length >= 6}
    }
}

class ConcatField extends FormField{
    constructor(label, id, field_type='text', required=true, regex=undefined, max_length=128){
        super(label, id, field_type, required, regex, max_length)
    }

    validate(value){
        var valid = false;
        var cleanValue = value.match(/[a-z0-9]*/ig).join('');

        if(cleanValue.length >=6){
            if(this.regex != undefined){
                valid = this.regex.test(cleanValue);
            }
            else
                valid = true;
        }
        else if(!this.required && cleanValue.length == 0) valid = true;

        return {cleanValue: cleanValue, valid: valid};        
    }
}

const REGISTRATION_FIELDS = [
    new FormField('First Name', 'CustFirstName'),
    new FormField('Last Name', 'CustLastName'),
    new FormField('Address', 'CustAddress'),  
    new FormField('City', 'CustCity'),  
    new FormField('Province Code', 'CustProv', 'text', true, /[a-z]{2}/i, 2),
    new ConcatField('Postal Code', 'CustPostal', 'text', true, /^[a-z]\d[a-z][ -]?\d[a-z]\d$/i),
    new FormField('Country', 'CustCountry'),
    new ConcatField('Home Phone', 'CustHomePhone', 'phone', false, /[( ]{0,}\d{3}[)]?\d{3}[ -]{0,}\d{4}$/),
    new ConcatField('Business Phone', 'CustBusPhone', 'phone', true, /[( ]{0,}\d{3}[)]?\d{3}[ -]{0,}\d{4}$/),
    new NoCleanupField('Email', 'CustEmail', 'email'), //already cleaned-up by the email field type
    new NoCleanupField('Username', 'uname'), //keep all the data the user typed
    new NoCleanupField('Password', 'pwd', 'password'), //keep all the data the user typed
    new Checkbox('I consent to the Travel Experts privacy policy', 'agrees'),
    new Checkbox('I want to receive promotional material via email', 'promo', false)
]

function verifyFormFields(values){
    var cleanValues = {};
    var validFields = [];
    var error = false;

    for(let field of REGISTRATION_FIELDS){
        try{
        //res = {cleanValue: ..., valid: true/false}
        let res = field.validate(values[field.id]);
        cleanValues[field.id] = res['cleanValue'];
        validFields.push(res['valid']);
        }catch (err) {error = true;}
    }
    if(Object.values(cleanValues).length != REGISTRATION_FIELDS.length)
        error = true;

    return {error: error, cleanValues: cleanValues, validFields: validFields}
}

function getAllFields(){
    return REGISTRATION_FIELDS
}

module.exports = {getAllFields, verifyFormFields};