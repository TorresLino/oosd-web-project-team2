var text = 'aaaaa       bbb';
var filter = text.split(" ");
var result = []
for(let i=0; i<filter.length; i++){
    if(filter[i] != '')
        result.push(filter[i]);
}
console.log(result.join(" "));