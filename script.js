function novoElemento(tagName, className){
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div','borda');
    const corpo = novoElemento('div','corpo');
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
};

function EndGame(){
    this.elemento = novoElemento('div', 'EndGame')
    this.elemento.innerHTML = 'YOU LOST...\nRefresh to Try Again!';
    this.elemento.style.display = 'none';
}



function parDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => { 
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}


function Barreiras(altura, largura, abertura, espaço, notificarPonto){
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaço),
        new parDeBarreiras(altura, abertura, largura + espaço * 2),
        new parDeBarreiras(altura, abertura, largura + espaço * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento) 
            if (par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaço * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura/2;
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
                if(cruzouOMeio) notificarPonto();
                // cruzouOMeio && notificarPonto;
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        
        if(novoY <= 0){
            this.setY(0)
        } else if (novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
this.setY(alturaJogo / 2);
}



function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0);
}


function estaoSobrepostos (elementoA, elementoB){
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const esquerdaA = a.left
    const direitaA = a.width
    const esquerdaB = b.left
    const direitaB = b.width

    const superiorA = a.top
    const inferiorA = a.height
    const superiorB = b.top
    const inferiorB = b.height  


    const horizontal = esquerdaA + direitaA >= esquerdaB
    && esquerdaB + direitaB >= esquerdaA
    const vertical = superiorA + inferiorA >= superiorB
    && superiorB + inferiorB >= superiorA
    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
    
    }
})
return colidiu
}

function flappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)
    const endGame = new EndGame();

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    areaDoJogo.appendChild(endGame.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador);
                endGame.elemento.style.display = 'block';
            }
        }, 20)
    }
}

new flappyBird().start();

