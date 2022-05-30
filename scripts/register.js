class FormField{
    constructor(label, id, field_type='text', required=false, regex=undefined, max_length=128){
        this.label = label;
        this.id = id;
        this.field_type = field_type;
        this.required = required;
        this.regex = undefined;
        this.max_length = max_length
    }

    writeHtmlField(){
        return (
            "<div class='form-field'>"+
            "<p>"+ this.label +": </p>" +
            "<input type='"+ this.field_type +
            "' id='"+ this.id +
            "' name='"+ this.id +
            "' "+ ((this.required) ? 'required' : '') +
            " maxlength='"+ this.max_length +
            "' onfocus='this.parentElement.style.backgroundColor = \"rgba(0,0,0,0)\"'; style='width:100%'>"+
            "</div>"
        );
    }

    static cleanUp(val){
        return 418;
    }

    validate(value){
        if (!this.required){
            if (value == 1){
                return true;                
            }
            return false;
            
        }
    }
};

const REGISTRATION_FIELDS = [
    new FormField('First Name', 'fname'),
    new FormField('Middle Name', 'mname', 'text', false),
    new FormField('Last Name', 'lname'),
    new FormField('Email', 'email', 'email'),
    new FormField('Personal Phone', 'pphone', 'phone'),
    new FormField('Commercial Phone', 'cphone', 'phone', false),
    new FormField('Address', 'address'),  
    new FormField('City', 'city'),  
    new FormField('State / Province', 'state'),
    new FormField('Country', 'country'),
    new FormField('Postal Code', 'pcode'),
    new FormField('Username', 'uname'),
    new FormField('Password', 'pwd', 'password'),
    new FormField('I consent to the Travel Experts privacy poicy', 'agrees', 'checkbox'),
    new FormField('I want to receive promotional material via email', 'promo', 'checkbox', false)
]

function verifyFormFields(){
    let any_field_is_invalid = false;
    for(let i=0; i<REGISTRATION_FIELDS.length; i++){
        let field = document.getElementById(REGISTRATION_FIELDS[i].id);
        if (!REGISTRATION_FIELDS[i].validate(field.value)){
            any_field_is_invalid = true
            field.parentElement.style.backgroundColor = "rgba(255,0,0,0.3)";
        }
    }
    if (any_field_is_invalid)
        return false;
    else
        return true;
}

function writeAllFields(){
    for(let i=0; i<REGISTRATION_FIELDS.length; i++){
        document.write(REGISTRATION_FIELDS[i].writeHtmlField());
    }
}