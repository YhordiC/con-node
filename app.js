
/* ejemplo n*1
process.stdout.write('Dime tu nombre:\n'); //mostrara el mensaje en consola
process.stdin.on('data',function(data) { // para recivir datos
    let nombre=data.toString().trim();
    process.stdout.write(`Hola ${nombre}!\n`)
    process.exit();
})
*/

let preguntas= ['Cual es tu nombre?','Cual es tu lenguaje de programacion favorito?',
'Que gusta de la tegnologuia?'];

let respuestas= [];

function pregunta(index){
    process.stdout.write(`${preguntas[index]} \n`)
}

process.stdin.on('data',function(data){
    respuestas.push(data.toString().trim());

    if(respuestas.length< preguntas.length){
        pregunta(respuestas.length);
    }else{
        for(let i=0; i<preguntas.length;i++){
          process.stdout.write(`*****************\n`)
          process.stdout.write(`->${preguntas[i]}\n`)
          process.stdout.write(`->${respuestas[i]}\n`)
        }
        process.exit();
    }
});

pregunta(0);