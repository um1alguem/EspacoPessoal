const mesesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const dataAtualObjeto = new Date();
const diaHojeNumero = dataAtualObjeto.getDate();
const mesActualNumero = dataAtualObjeto.getMonth();
const anoAtualNumero = dataAtualObjeto.getFullYear();
const totalDiasNoMes = new Date(anoAtualNumero, mesActualNumero + 1, 0).getDate();

function formatarData(dia) {
    return `${anoAtualNumero}-${String(mesActualNumero + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

let mesExibidoAno = anoAtualNumero;
let mesExibidoMes = mesActualNumero;

function totalDiasDoMesExibido() {
    return new Date(mesExibidoAno, mesExibidoMes + 1, 0).getDate();
}

function formatarDataExibida(dia) {
    return `${mesExibidoAno}-${String(mesExibidoMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function getDatasSemanaAtual() {
    const hoje = new Date(anoAtualNumero, mesActualNumero, diaHojeNumero);
    const diaSemana = hoje.getDay();
    const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffParaSegunda);

    const datas = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(segunda);
        d.setDate(segunda.getDate() + i);
        datas.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return datas;
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const CHAVE_DADOS = 'espacoPessoalDados';

function carregarDados() {
    const bruto = localStorage.getItem(CHAVE_DADOS);
    if (!bruto) {
        return { diario: {}, rotina: {}, listas: {} };
    }
    const dados = JSON.parse(bruto);
    if (!dados.diario) dados.diario = {};
    if (!dados.rotina) dados.rotina = {};
    if (!dados.listas) dados.listas = {};
    return dados;
}

function salvarDados(dados) {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

let dadosApp = carregarDados();
let diaSelecionadoModalData = null;
let humorSelecionadoModal = "";
let diaSelecionadoRotinaData = null;
let listaEmEdicaoId = null;

const elementoDataTopo = document.getElementById('data-topo');
if (elementoDataTopo) {
    const opcoesData = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    elementoDataTopo.textContent = dataAtualObjeto.toLocaleDateString('pt-BR', opcoesData);
}

const itensMenu = document.querySelectorAll('.menu-item');
const telas = document.querySelectorAll('.tela-secao');

itensMenu.forEach(item => {
    item.addEventListener('click', () => {
        const telaAlvo = item.getAttribute('data-tela');

        itensMenu.forEach(i => i.classList.remove('ativo'));
        item.classList.add('ativo');

        telas.forEach(tela => {
            if (tela.id === telaAlvo) {
                tela.classList.add('ativa');
            } else {
                tela.classList.remove('ativa');
            }
        });

        if (telaAlvo === 'tela-rotina') construirCalendarioRotina();
        if (telaAlvo === 'tela-listas') renderizarListas();
        if (telaAlvo === 'tela-estatisticas') renderizarEstatisticas();
    });
});

function atualizarTudoDoMes() {
    const tituloMesDiarioEl = document.getElementById('nome-mes-diario');
    const tituloMesRotinaEl = document.getElementById('nome-mes-rotina');
    const tituloMesStatsEl = document.getElementById('nome-mes-stats');
    if (tituloMesDiarioEl) tituloMesDiarioEl.textContent = `Mapeamento: ${mesesNomes[mesExibidoMes]} de ${mesExibidoAno}`;
    if (tituloMesRotinaEl) tituloMesRotinaEl.textContent = `Rotina: ${mesesNomes[mesExibidoMes]} de ${mesExibidoAno}`;
    if (tituloMesStatsEl) tituloMesStatsEl.textContent = `Estatísticas: ${mesesNomes[mesExibidoMes]} de ${mesExibidoAno}`;

    construirCalendarioDiario();
    construirCalendarioRotina();
    renderizarEstatisticas();
}

function irMesAnterior() {
    mesExibidoMes--;
    if (mesExibidoMes < 0) {
        mesExibidoMes = 11;
        mesExibidoAno--;
    }
    atualizarTudoDoMes();
}

function irMesProximo() {
    mesExibidoMes++;
    if (mesExibidoMes > 11) {
        mesExibidoMes = 0;
        mesExibidoAno++;
    }
    atualizarTudoDoMes();
}

['btn-mes-anterior-diario', 'btn-mes-anterior-rotina', 'btn-mes-anterior-stats'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', irMesAnterior);
});
['btn-mes-proximo-diario', 'btn-mes-proximo-rotina', 'btn-mes-proximo-stats'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', irMesProximo);
});

const bancoDeFrases = [
    "1 - Você é uma pessoa forte, especial e muito importante para quem tem a sorte de conhecê-lo.",
    "2 - Nunca se esqueça de que a sua existência faz diferença no mundo.",
    "3 - Seu jeito único de ser torna os dias de quem está ao seu redor mais especiais.",
    "4 - Você merece receber todo o carinho que oferece às outras pessoas.",
    "5 - Mesmo quando tudo parecer difícil, lembre-se de que você já superou muitos dias complicados.",
    "6 - Há uma beleza enorme na maneira como você enxerga e sente o mundo.",
    "7 - Você não precisa ser perfeito para ser alguém incrível.",
    "8 - Seu coração merece encontrar paz, carinho e motivos para sorrir.",
    "9 - A sua presença consegue tornar momentos simples em lembranças especiais.",
    "10 - Você é mais importante do que imagina.",
    "11 - Nunca diminua o valor das coisas boas que existem dentro de você.",
    "12 - Seu sorriso pode iluminar um dia que começou completamente cinzento.",
    "13 - Você tem uma maneira especial de fazer as pessoas se sentirem acolhidas.",
    "14 - Que você nunca se esqueça de todo o potencial que existe dentro de você.",
    "15 - Você merece dias leves, abraços sinceros e momentos que façam seu coração descansar.",
    "16 - Sua existência é uma pequena parte do mundo que faz uma diferença enorme.",
    "17 - Você tem muito mais força do que percebe nos dias difíceis.",
    "18 - Não tenha vergonha de precisar de carinho, descanso ou companhia.",
    "19 - Você merece ser tratado com a mesma gentileza que oferece aos outros.",
    "20 - O mundo ficou um pouco mais bonito porque você existe.",
    "21 - Seu jeito de cuidar das pessoas é uma qualidade rara e preciosa.",
    "22 - Mesmo quando você não percebe, existem coisas boas que só acontecem porque você está presente.",
    "23 - Você não precisa carregar tudo sozinho.",
    "24 - Que cada novo dia encontre você um pouco mais perto da felicidade que merece.",
    "25 - Você é alguém que merece ser lembrado, valorizado e cuidado.",
    "26 - Seu coração possui uma delicadeza que torna você uma pessoa única.",
    "27 - Nunca pense que seus sentimentos são pequenos demais para serem importantes.",
    "28 - Você merece encontrar motivos para sorrir até nos dias mais inesperados.",
    "29 - A sua maneira de existir já é suficiente para tornar você especial.",
    "30 - Você tem um brilho próprio que não precisa ser comparado com o de ninguém.",
    "31 - Há pessoas que são lembradas por grandes feitos, e você pode ser lembrado pela forma como fez os outros se sentirem.",
    "32 - Você merece ouvir coisas boas sobre si mesmo com mais frequência.",
    "33 - Não se esqueça de reconhecer o quanto você já cresceu.",
    "34 - Você sobreviveu a dias que um dia pensou que nunca conseguiria enfrentar.",
    "35 - Seu futuro ainda guarda momentos que podem surpreendê-lo de maneiras lindas.",
    "36 - Você merece descobrir novos motivos para gostar da própria história.",
    "37 - Seu coração merece descanso depois de todos os momentos em que precisou ser forte.",
    "38 - Você é uma pessoa que merece receber amor, respeito e compreensão.",
    "39 - A sua presença pode significar muito mais para alguém do que você imagina.",
    "40 - Você não precisa provar seu valor o tempo inteiro.",
    "41 - Existem qualidades em você que talvez sejam tão naturais que você nem perceba mais.",
    "42 - Seu jeito de demonstrar carinho pode ser exatamente o que alguém precisava naquele momento.",
    "43 - Você merece ter ao seu lado pessoas que reconheçam o seu valor.",
    "44 - Não deixe um dia ruim convencer você de que a sua vida inteira é ruim.",
    "45 - Você ainda vai viver momentos que hoje parecem impossíveis.",
    "46 - Seu coração é capaz de guardar esperança mesmo depois de momentos difíceis.",
    "47 - Você merece se orgulhar das pequenas coisas que consegue fazer todos os dias.",
    "48 - Nunca subestime o impacto de uma palavra gentil que você oferece a alguém.",
    "49 - Você é uma presença especial na vida de muitas pessoas.",
    "50 - A sua história ainda está sendo escrita, e existem páginas bonitas esperando por você.",
    "51 - Você merece comemorar cada pequena conquista.",
    "52 - Mesmo quando ninguém percebe seu esforço, ele continua sendo importante.",
    "53 - Você tem o direito de descansar sem sentir que precisa merecer isso.",
    "54 - Seu valor não depende de notas, aparência, produtividade ou opiniões alheias.",
    "55 - Você continua sendo importante mesmo nos dias em que não consegue fazer tudo.",
    "56 - Há beleza na sua maneira particular de pensar, sentir e existir.",
    "57 - Você merece ser ouvido quando precisa falar.",
    "58 - Você merece silêncio e tranquilidade quando precisa descansar.",
    "59 - Nunca tenha vergonha de demonstrar que se importa.",
    "60 - Seu carinho pode transformar momentos comuns em memórias inesquecíveis.",
    "61 - Você é uma pessoa que merece receber boas surpresas da vida.",
    "62 - Seu coração merece encontrar lugares onde possa se sentir seguro.",
    "63 - Você não precisa enfrentar cada dificuldade com um sorriso no rosto.",
    "64 - Permita-se reconhecer quando você precisa de ajuda.",
    "65 - Você merece pessoas que permaneçam ao seu lado nos dias bons e ruins.",
    "66 - A sua existência não precisa ter uma grande explicação para possuir valor.",
    "67 - Você pode recomeçar quantas vezes precisar.",
    "68 - Nenhum erro apaga todas as coisas boas que existem em você.",
    "69 - Você não é definido pelos seus piores momentos.",
    "70 - Seu passado faz parte da sua história, mas não precisa decidir todo o seu futuro.",
    "71 - Você merece olhar para si mesmo com mais gentileza.",
    "72 - Que você consiga perceber pequenas felicidades escondidas nos dias comuns.",
    "73 - Você tem muito a oferecer ao mundo simplesmente sendo você.",
    "74 - Sua sensibilidade também pode ser uma das suas maiores forças.",
    "75 - Você merece encontrar pessoas que entendam até aquilo que você não consegue explicar.",
    "76 - O seu esforço diário merece reconhecimento.",
    "77 - Você pode sentir orgulho de continuar tentando.",
    "78 - Há coragem em continuar mesmo quando o caminho parece complicado.",
    "79 - Você merece momentos em que possa respirar fundo e simplesmente ficar em paz.",
    "80 - Não se cobre perfeição quando você está fazendo o melhor que consegue.",
    "81 - Você é digno de respeito mesmo quando comete erros.",
    "82 - Seu coração merece gentileza, inclusive da própria pessoa que vive dentro dele.",
    "83 - Você tem uma história que ninguém mais poderia contar exatamente como você conta.",
    "84 - Existem partes bonitas de você que ainda serão descobertas com o tempo.",
    "85 - Você merece conhecer versões de si mesmo que tragam orgulho e tranquilidade.",
    "86 - Não permita que um comentário cruel apague centenas de coisas boas sobre você.",
    "87 - Você é muito mais do que qualquer momento difícil.",
    "88 - A sua presença pode ser um conforto silencioso para alguém.",
    "89 - Você merece receber palavras bonitas sem precisar fazer algo extraordinário primeiro.",
    "90 - Seu jeito de existir tem valor mesmo quando você não está produzindo nada.",
    "91 - Você pode descansar e continuar sendo uma pessoa incrível.",
    "92 - Você merece dias em que o coração fique leve sem precisar de um motivo específico.",
    "93 - Nunca esqueça que pequenas gentilezas também podem mudar histórias.",
    "94 - Você possui qualidades que nenhuma comparação consegue medir.",
    "95 - Seu futuro não precisa ser perfeito para ser bonito.",
    "96 - Você merece encontrar felicidade em coisas simples.",
    "97 - Você é alguém que vale a pena conhecer profundamente.",
    "98 - Sua existência deixa marcas boas em lugares que talvez você nem perceba.",
    "99 - Que nunca faltem motivos para lembrar o quanto você é especial.",
    "100 - Tem alguma coisa no seu jeito de existir que faz as pessoas se sentirem mais à vontade perto de você.",
    "101 - Você consegue transformar uma conversa completamente aleatória em uma memória que fica por muito tempo.",
    "102 - Gosto da maneira como você consegue ser você mesmo sem precisar anunciar isso para ninguém.",
    "103 - Seu jeito de prestar atenção nas pequenas coisas diz muito mais sobre você do que qualquer elogio conseguiria.",
    "104 - Você tem uma presença que não precisa ser barulhenta para ser percebida.",
    "105 - É curioso como até suas manias conseguem fazer parte do que torna você tão único.",
    "106 - Você tem um jeito próprio de contar as coisas que faz até histórias simples parecerem interessantes.",
    "107 - Algumas pessoas passam pela vida deixando lembranças; você parece deixar pequenos detalhes espalhados por onde passa.",
    "108 - Seu senso de humor tem uma maneira estranha e maravilhosa de aparecer justamente quando ninguém espera.",
    "109 - Você consegue fazer companhia mesmo quando não está dizendo absolutamente nada.",
    "110 - Tem algo muito bonito na forma como você demonstra que se importa sem transformar isso em um grande acontecimento.",
    "111 - Você é o tipo de pessoa que alguém pode lembrar de repente por causa de uma música, uma frase ou uma coisa completamente aleatória.",
    "112 - Seu jeito de reagir às coisas é tão particular que às vezes basta uma expressão sua para saber exatamente o que está pensando.",
    "113 - Você consegue tornar uma conversa comum em uma daquelas que a gente continua lembrando dias depois.",
    "114 - Existe uma sinceridade no seu jeito que é difícil de imitar.",
    "115 - Você não precisa tentar parecer interessante; suas próprias peculiaridades já fazem esse trabalho.",
    "116 - Seu jeito de enxergar certas coisas provavelmente é mais bonito do que você imagina.",
    "117 - Você tem pequenas características que talvez considere normais, mas que fazem muita diferença para quem gosta de estar perto de você.",
    "118 - Às vezes, é justamente uma coisa boba que você faz que acaba sendo a parte favorita de alguém no dia.",
    "119 - Você consegue ser memorável sem precisar fazer nada extraordinário.",
    "120 - Tem pessoas que precisam falar muito para chamar atenção; você consegue ser lembrado mesmo depois de ir embora.",
    "121 - Seu jeito de conversar tem uma familiaridade difícil de explicar.",
    "122 - Você possui aquele tipo de personalidade que faz uma pessoa querer descobrir mais sobre você.",
    "123 - Existe uma calma escondida em alguns dos seus gestos que é muito bonita de observar.",
    "124 - Você tem um jeito interessante de misturar suas ideias, suas manias e seu humor e transformar tudo em algo só seu.",
    "125 - Provavelmente existem coisas que você faz no automático e que alguém já guardou como uma lembrança querida.",
    "126 - Você consegue deixar pequenos momentos com uma sensação de que valeram a pena.",
    "127 - Seu jeito de demonstrar afeto não precisa ser perfeito para ser sincero.",
    "128 - Você parece carregar um universo inteiro de pensamentos que nem sempre coloca em palavras.",
    "129 - Gosto da ideia de que ainda existem milhares de coisas sobre você que eu não descobri.",
    "130 - Você é cheio de detalhes que tornam impossível resumir quem você é em poucas palavras.",
    "131 - Tem uma diferença enorme entre ser interessante e tentar parecer interessante, e você entende isso sem precisar perceber.",
    "132 - Você tem uma maneira muito própria de transformar assuntos aleatórios em conversas que realmente prendem a atenção.",
    "133 - Até quando você está falando de algo que gosta demais, existe uma sinceridade difícil de não achar bonita.",
    "134 - Seu entusiasmo por determinadas coisas é uma das partes mais legais de observar em você.",
    "135 - Você consegue fazer alguém querer conhecer aquilo que você gosta só porque você fala sobre isso com carinho.",
    "136 - Existe algo muito especial em ver você se empolgar com uma coisa que realmente importa para você.",
    "137 - Seu jeito de ficar concentrado em alguma coisa mostra uma versão sua que talvez poucas pessoas conheçam.",
    "138 - Você tem uma personalidade cheia de pequenas contradições que, estranhamente, combinam perfeitamente.",
    "139 - Você pode ser difícil de entender às vezes, mas isso também faz conhecer você ser muito mais interessante.",
    "140 - Você não parece feito para caber em uma descrição pronta.",
    "141 - Tem coisas sobre você que só fazem sentido depois de passar bastante tempo te conhecendo.",
    "142 - Seu jeito não é facilmente substituível, e talvez você nem perceba isso.",
    "143 - Você possui características que não seriam a mesma coisa em nenhuma outra pessoa.",
    "144 - Existe uma diferença entre ser querido e ser importante, e você consegue ser os dois.",
    "145 - Você tem o tipo de presença que continua fazendo falta mesmo depois de uma conversa acabar.",
    "146 - Algumas pessoas deixam saudade de momentos; você deixa saudade até de coisas pequenas.",
    "147 - Seu nome consegue aparecer na cabeça de alguém simplesmente porque alguma coisa lembrou você.",
    "148 - Você provavelmente não sabe quantas pequenas associações as pessoas fazem com você.",
    "149 - Uma música, um lugar, uma piada ou até uma palavra podem carregar um pedaço seu para alguém.",
    "150 - Você tem o dom involuntário de transformar coisas comuns em coisas que acabam lembrando você.",
    "151 - É engraçado como certas situações ficam mais divertidas só porque você estava nelas.",
    "152 - Você tem uma forma muito sua de fazer alguém rir sem necessariamente estar tentando.",
    "153 - Seu humor consegue ser parte da sua identidade sem precisar definir quem você é.",
    "154 - Até suas respostas inesperadas conseguem ser mais memoráveis do que respostas perfeitamente planejadas.",
    "155 - Você tem uma espontaneidade que seria impossível de reproduzir de propósito.",
    "156 - Existe algo bonito em não saber exatamente o que você vai dizer quando começa a falar.",
    "157 - Você consegue surpreender sem precisar fazer esforço para isso.",
    "158 - Seu jeito de pensar às vezes encontra caminhos que outras pessoas simplesmente não enxergariam.",
    "159 - Você tem uma perspectiva própria que faz algumas coisas parecerem diferentes depois que você fala sobre elas.",
    "160 - Uma das coisas mais interessantes em você é que sempre parece existir alguma camada que ainda não conheci.",
    "161 - Você não é previsível de um jeito ruim; você simplesmente não parece caber em uma fórmula.",
    "162 - Seu silêncio também parece ter personalidade.",
    "163 - Até quando você não tem nada para dizer, sua presença continua dizendo alguma coisa.",
    "164 - Você tem uma maneira peculiar de ocupar os espaços sem precisar chamar atenção para si.",
    "165 - Existe conforto em saber que você pode simplesmente estar ali sem precisar preencher cada segundo com palavras.",
    "166 - Você tem um jeito de tornar o silêncio menos estranho.",
    "167 - Talvez você não perceba, mas estar perto de você pode ser uma coisa muito tranquila.",
    "168 - Você não precisa estar sempre de bom humor para continuar sendo uma boa companhia.",
    "169 - Até seus dias mais quietos fazem parte da pessoa que alguém gosta de ter por perto.",
    "170 - Você tem uma humanidade muito bonita quando deixa de tentar parecer que está tudo bem.",
    "171 - Existe algo genuíno em quando você admite que alguma coisa não está fácil.",
    "172 - Você não precisa esconder suas partes complicadas para continuar sendo alguém admirável.",
    "173 - Suas imperfeições não estragam quem você é; elas fazem parte da pessoa real que existe por trás de tudo.",
    "174 - Você é muito mais interessante quando simplesmente existe do seu jeito, sem tentar corresponder ao que esperam de você.",
    "175 - Talvez uma das suas melhores características seja justamente aquilo que você nunca pensou em considerar uma qualidade.",
    "176 - Você tem detalhes que só aparecem para quem realmente presta atenção.",
    "177 - É bonito pensar que existem lados seus que só aparecem quando você confia de verdade em alguém.",
    "178 - Você não entrega tudo de uma vez, e talvez seja por isso que conhecer você tenha tantas descobertas.",
    "179 - Existe uma intimidade muito bonita em conhecer as pequenas versões de você que aparecem dependendo do momento.",
    "180 - Você consegue ser diferente em situações diferentes sem parecer falso.",
    "181 - Seu jeito muda conforme você se sente confortável, e isso mostra quantas versões interessantes existem em você.",
    "182 - Você tem uma forma particular de demonstrar confiança que talvez passe despercebida para você.",
    "183 - Quanto você realmente se importa com alguma coisa, dá para perceber mesmo que você não diga nada.",
    "184 - Você possui uma sinceridade que aparece principalmente nas coisas que você não planeja dizer.",
    "185 - Seu olhar sobre determinadas situações consegue entregar pensamentos que suas palavras não contam.",
    "186 - Existe algo muito humano na maneira como você tenta entender as coisas antes de simplesmente julgá-las.",
    "187 - Você tem curiosidade suficiente para continuar descobrindo mesmo quando já poderia simplesmente ignorar.",
    "188 - Sua vontade de entender as coisas é uma das características que mais fazem você ser você.",
    "189 - Você não precisa saber todas as respostas para ser alguém que vale a pena ouvir.",
    "190 - Às vezes, a melhor parte de conversar com você é perceber que você realmente pensou sobre aquilo.",
    "191 - Você tem o costume de encontrar significado em detalhes que outras pessoas provavelmente deixariam passar.",
    "192 - Talvez você nem saiba quantas vezes uma observação sua já fez alguém enxergar uma coisa por outro ângulo.",
    "193 - Você consegue fazer uma pessoa reconsiderar uma ideia sem precisar tentar convencê-la.",
    "194 - Existe uma delicadeza na forma como você percebe algumas coisas que não aparece à primeira vista.",
    "195 - Você parece notar quando alguém não está exatamente bem, mesmo quando essa pessoa tenta esconder.",
    "196 - Seu cuidado aparece em detalhes pequenos demais para serem chamados de grandes gestos, e talvez seja justamente isso que os torna especiais.",
    "197 - Você tem uma maneira silenciosa de demonstrar que lembra das pessoas.",
    "198 - Lembrar de uma pequena coisa que alguém contou pode parecer pouco, mas vindo de você pode significar muito.",
    "199 - Você faz certas pessoas se sentirem lembradas mesmo sem perceber que está fazendo isso.",
    "200 - Existe algo muito bonito na maneira como você guarda determinadas informações sobre quem é importante para você.",
    "201 - Você tem memória para detalhes que provavelmente nem imagina que alguém percebeu que você lembrava.",
    "202 - Seu carinho aparece nas pequenas coisas, e são justamente essas pequenas coisas que costumam ficar.",
    "203 - Você pode não perceber quando está sendo gentil, porque talvez isso simplesmente faça parte de quem você é.",
    "204 - Há uma diferença entre fazer algo bonito para parecer uma boa pessoa e fazer porque realmente se importa; você parece conhecer essa diferença.",
    "205 - Você não precisa transformar seu carinho em grandes declarações para que ele seja sentido.",
    "206 - Seu jeito de se importar pode ser discreto, mas dificilmente passa completamente despercebido.",
    "207 - Você tem uma capacidade bonita de fazer alguém sentir que aquela conversa realmente importou.",
    "208 - Algumas das melhores lembranças que alguém pode ter de você provavelmente começaram como momentos completamente banais.",
    "209 - Você tem um talento estranho para fazer o banal ganhar importância depois.",
    "210 - Talvez seja esse o motivo de algumas conversas com você parecerem maiores depois que terminam.",
    "211 - Você transforma pequenos instantes em coisas que dá vontade de guardar.",
    "212 - E talvez você nem faça ideia do quanto esses pequenos instantes podem significar para alguém.",
    "213 - Você tem um jeito curioso de fazer até uma conversa sobre absolutamente nada parecer importante.",
    "214 - Algumas pessoas têm presença; você tem aquela presença que continua na cabeça mesmo depois que a conversa termina.",
    "215 - Eu gosto das pequenas mudanças na sua voz quando você começa a falar de alguma coisa que realmente gosta.",
    "216 - Você fica especialmente interessante quando esquece que está sendo observado e simplesmente age do seu jeito.",
    "217 - Tem algo muito bonito na sua concentração quando você está tentando entender alguma coisa.",
    "218 - Você consegue ficar genuinamente feliz com coisas pequenas, e isso é uma qualidade que eu espero que nunca perca.",
    "219 - Seu jeito de ficar animado com uma descoberta nova é uma das coisas mais legais em você.",
    "220 - Você tem uma coleção de pequenas manias que, juntas, formam uma personalidade impossível de confundir.",
    "221 - É engraçado como certas palavras começaram a lembrar você sem que eu tivesse planejado isso.",
    "222 - Você consegue ocupar um espaço na memória de alguém sem nem perceber que deixou uma lembrança ali.",
    "223 - Às vezes, lembrar de uma conversa sua é suficiente para melhorar um pouco o meu dia.",
    "224 - Você tem um jeito muito específico de reagir quando alguma coisa realmente surpreende você.",
    "225 - Seu senso de humor aparece nos momentos mais inesperados, e talvez seja justamente por isso que funciona tão bem.",
    "226 - Você consegue fazer uma piada ruim ficar boa só pela maneira como conta.",
    "227 - Tem uma espontaneidade em você que seria impossível de fabricar.",
    "228 - Você é cheio de pequenas histórias que provavelmente nem percebe que são interessantes.",
    "229 - Eu gosto de quando você conta alguma coisa e acaba se desviando completamente do assunto original.",
    "230 - Você tem o talento peculiar de transformar uma explicação simples em uma história cheia de detalhes.",
    "231 - Existe algo muito seu na forma como você escolhe determinadas palavras.",
    "232 - Até o jeito como você escreve consegue entregar um pouco da sua personalidade.",
    "233 - Você tem certas expressões que provavelmente nem sabe que repete, mas que já fazem parte da sua assinatura.",
    "234 - Seu jeito de responder quando está genuinamente surpreso é quase uma personalidade diferente.",
    "235 - Você consegue demonstrar muito sem precisar explicar tudo.",
    "236 - Às vezes, dá para entender o que você está sentindo só pela maneira como responde uma coisa completamente simples.",
    "237 - Você tem uma sinceridade que aparece principalmente quando você esquece de tentar encontrar a resposta certa.",
    "238 - Gosto quando você fala sem pensar demais em como aquilo vai soar.",
    "239 - Você parece mais bonito como pessoa justamente nos momentos em que não está tentando impressionar ninguém.",
    "240 - Tem alguma coisa muito honesta na sua maneira de admitir quando não sabe o que fazer.",
    "241 - Você não transforma todas as suas incertezas em vergonha, e isso é mais raro do que parece.",
    "242 - Existe coragem até na maneira como você admite que algumas coisas ainda não entende.",
    "243 - Você consegue continuar curioso mesmo depois de descobrir que estava errado.",
    "244 - Mudar de opinião quando encontra algo que faz mais sentido é uma qualidade que combina muito com você.",
    "245 - Você tem uma mente que parece gostar de voltar às coisas e enxergá-las de outro jeito.",
    "246 - Algumas conversas com você ficam melhores depois de pensar nelas por um tempo.",
    "247 - Você tem o costume de deixar uma frase na cabeça de alguém sem nem perceber.",
    "248 - Às vezes, uma coisa que você falou casualmente ganha outro significado dias depois.",
    "249 - Você tem mais influência sobre as pessoas ao seu redor do que provavelmente imagina.",
    "250 - Não porque tenta convencer alguém, mas porque faz as pessoas pensarem.",
    "251 - Você consegue apresentar uma ideia de um jeito que faz vontade de conhecê-la melhor.",
    "252 - Seu entusiasmo é contagiante quando você realmente acredita em alguma coisa.",
    "253 - Você tem uma curiosidade que parece não aceitar respostas pela metade.",
    "254 - Quando algo desperta seu interesse, dá para perceber que sua atenção muda completamente.",
    "255 - Você consegue ficar horas falando de uma coisa específica e, estranhamente, fazer alguém querer continuar ouvindo.",
    "256 - Existe uma diferença enorme entre falar muito sobre algo e realmente gostar daquilo, e você deixa essa diferença evidente.",
    "257 - Você tem assuntos que provavelmente ninguém esperaria que você soubesse tanto.",
    "258 - É justamente essa mistura inesperada de interesses que deixa você tão difícil de resumir.",
    "259 - Você parece ter sempre alguma referência escondida que aparece quando menos se espera.",
    "260 - Seu cérebro faz conexões muito específicas, e eu gosto de descobrir quais são elas.",
    "261 - Você consegue relacionar duas coisas que ninguém pensaria em colocar juntas.",
    "262 - Tem momentos em que sua linha de raciocínio parece completamente aleatória, mas chega em algum lugar que faz sentido.",
    "263 - Você tem uma criatividade que aparece principalmente quando não está tentando ser criativo.",
    "264 - As melhores ideias parecem surgir de você justamente quando você está apenas brincando com uma possibilidade.",
    "265 - Você tem um jeito interessante de pegar uma ideia simples e imaginar dez possibilidades diferentes para ela.",
    "266 - Existe algo muito divertido em descobrir como você chegou a determinada conclusão.",
    "267 - Você não pensa exatamente como todo mundo, e ainda bem.",
    "268 - Seu jeito diferente de enxergar algumas situações pode ser surpreendentemente necessário.",
    "269 - Às vezes, você percebe uma coisa que estava bem na frente de todo mundo.",
    "270 - Você tem olhos atentos para detalhes que muita gente simplesmente ignora.",
    "271 - Talvez você não perceba, mas sua atenção aos detalhes é uma das coisas que mais individualizam você.",
    "272 - Você consegue lembrar de coisas pequenas que outras pessoas já teriam esquecido.",
    "273 - É bonito perceber que determinadas lembranças realmente ficam guardadas em você.",
    "274 - Você dá importância a detalhes que, para outra pessoa, talvez nem merecessem atenção.",
    "275 - Existe carinho até naquilo que você escolhe lembrar.",
    "276 - Você tem uma maneira muito particular de demonstrar que prestou atenção.",
    "277 - Às vezes, uma pequena lembrança sua vale mais do que uma grande demonstração.",
    "278 - Você consegue fazer alguém perceber que foi ouvido sem precisar dizer que estava ouvindo.",
    "279 - Seu jeito de escutar tem uma qualidade que faz vontade de continuar contando as coisas.",
    "280 - Você não precisa preencher todos os silêncios para fazer alguém se sentir acompanhado.",
    "281 - Existe conforto na possibilidade de simplesmente ficar perto de você sem precisar inventar assunto.",
    "282 - Você tem uma presença que não exige esforço de quem está ao seu lado.",
    "283 - Algumas pessoas cansam depois de muito tempo; com você, parece que sempre existe mais alguma coisa para descobrir.",
    "284 - Você consegue ser familiar sem se tornar previsível.",
    "285 - Mesmo depois de conhecer bastante você, ainda aparecem detalhes inesperados.",
    "286 - Talvez essa seja uma das coisas mais interessantes em você: sempre existe alguma surpresa pequena.",
    "287 - Você tem lados que aparecem dependendo da pessoa, do lugar e até do assunto.",
    "288 - É bonito quando alguém se sente seguro o suficiente para mostrar versões diferentes de si mesmo.",
    "289 - Você parece guardar algumas partes suas para quem realmente conquistou sua confiança.",
    "290 - Quando você confia em alguém, isso aparece de maneiras pequenas e muito sinceras.",
    "291 - Existe uma diferença perceptível entre o jeito como você conversa quando está confortável e quando está apenas sendo educado.",
    "292 - Seu verdadeiro senso de humor aparece quando você para de tentar controlar a conversa.",
    "293 - Você fica mais espontâneo quando sente que não precisa medir cada palavra.",
    "294 - Gosto dessa versão sua que aparece quando você simplesmente esquece de se proteger atrás de respostas prontas.",
    "295 - Você não precisa estar sempre no controle para continuar sendo alguém admirável.",
    "296 - Há algo muito humano em quando você simplesmente admite que uma situação mexeu com você.",
    "297 - Você consegue ser sensível sem transformar isso em uma característica frágil.",
    "298 - Sua sensibilidade parece estar muito ligada à maneira como você percebe as pessoas.",
    "299 - Você nota mudanças de comportamento que passam despercebidas para quase todo mundo.",
    "300 - Talvez seja por isso que algumas pessoas se sintam tão compreendidas perto de você.",
    "301 - Você parece perceber quando alguém precisa de espaço sem transformar isso em rejeição.",
    "302 - Você consegue demonstrar preocupação sem fazer a outra pessoa se sentir pressionada.",
    "303 - Seu cuidado não precisa ser barulhento para ser verdadeiro.",
    "304 - Existem formas de carinho que aparecem em atitudes minúsculas, e você parece conhecer várias delas.",
    "305 - Você tem um jeito discreto de demonstrar que uma pessoa importa.",
    "306 - Às vezes, você cuida sem nem perceber que está cuidando.",
    "307 - Talvez você nunca descubra todas as vezes em que fez alguém se sentir um pouco melhor.",
    "308 - Algumas das coisas boas que você faz provavelmente parecem pequenas demais para você lembrar delas.",
    "309 - Mas pequenas coisas podem ocupar um espaço enorme na memória de outra pessoa.",
    "310 - Você tem mais momentos marcantes espalhados pela vida dos outros do que provavelmente consegue imaginar.",
    "311 - Talvez alguém já tenha lembrado de você hoje por causa de uma coisa completamente boba.",
    "312 - É curioso pensar em quantas lembranças suas existem na cabeça de outras pessoas sem que você saiba.",
    "313 - Você deixa rastros de si mesmo em detalhes que provavelmente nunca vai descobrir.",
    "314 - Uma frase sua pode virar uma lembrança para alguém sem que você jamais saiba disso.",
    "315 - Um momento que para você foi normal pode ter sido especial para outra pessoa.",
    "316 - Você não precisa fazer algo gigantesco para ser inesquecível.",
    "317 - Às vezes, é justamente o jeito mais simples de existir que faz alguém guardar você com carinho.",
    "318 - Você tem um jeito que é só seu.",
    "319 - Gosto de como você consegue ser engraçado sem tentar.",
    "320 - Você torna algumas conversas impossíveis de esquecer.",
    "321 - Seu jeito de pensar é uma das suas melhores características.",
    "322 - Você tem detalhes que fazem muita falta quando não estão por perto.",
    "323 - É fácil lembrar de você por coisas pequenas.",
    "324 - Você consegue ser interessante sem perceber.",
    "325 - Seu jeito de reagir às coisas é particularmente adorável.",
    "326 - Você tem uma presença que fica.",
    "327 - Gosto quando você simplesmente age naturalmente.",
    "328 - Você é cheio de pequenas surpresas.",
    "329 - Seu jeito de falar entrega mais do que você imagina.",
    "330 - Você tem uma personalidade difícil de confundir.",
    "331 - Até suas manias combinam com você.",
    "332 - Você consegue deixar o comum um pouco mais divertido.",
    "333 - Tem algo muito genuíno em você.",
    "334 - Você não precisa se esforçar para ser querido.",
    "335 - Seu jeito espontâneo é uma das coisas mais legais em você.",
    "336 - Você tem uma forma muito própria de demonstrar carinho.",
    "337 - Gosto das coisas que você faz sem perceber.",
    "338 - Você tem um humor que reconheceria em qualquer lugar.",
    "339 - Seu jeito de contar histórias é inconfundível.",
    "340 - Você consegue fazer uma conversa durar mais do que deveria.",
    "341 - Você tem uma curiosidade que combina muito com você.",
    "342 - Gosto de descobrir coisas novas sobre você.",
    "343 - Você nunca parece completamente previsível.",
    "344 - Sempre existe algum detalhe novo para notar em você.",
    "345 - Você tem mais personalidade do que imagina.",
    "346 - Seu jeito de observar as coisas é diferente.",
    "347 - Você percebe detalhes que quase ninguém percebe.",
    "348 - Gosto da maneira como você presta atenção.",
    "349 - Você lembra de coisas que eu nem esperava que lembrasse.",
    "350 - Seu cuidado aparece nos detalhes.",
    "351 - Você demonstra carinho de maneiras inesperadas.",
    "352 - Você consegue fazer alguém se sentir lembrado.",
    "353 - Seu jeito de ouvir faz diferença.",
    "354 - Você sabe quando uma pessoa precisa de companhia.",
    "355 - Você também sabe quando alguém precisa de espaço.",
    "356 - Existe muita consideração escondida no seu jeito.",
    "357 - Você parece se importar mais do que demonstra.",
    "358 - Seu silêncio nunca parece completamente vazio.",
    "359 - É confortável simplesmente estar perto de você.",
    "360 - Você não precisa falar o tempo todo para fazer companhia.",
    "361 - Seu jeito tranquilo tem seu próprio charme.",
    "362 - Você tem uma calma que aparece quando menos espero.",
    "363 - Gosto quando você fica confortável o suficiente para ser espontâneo.",
    "364 - Você fica ainda mais interessante quando esquece de se preocupar.",
    "365 - Seu jeito verdadeiro é provavelmente sua melhor versão.",
    "366 - Você não precisa impressionar ninguém.",
    "367 - Você já é interessante sendo exatamente quem é.",
    "368 - Existe muita coisa boa escondida nas suas peculiaridades.",
    "369 - Você tem manias que provavelmente ninguém mais teria iguais.",
    "370 - Até seus hábitos mais estranhos fazem parte do seu charme.",
    "371 - Você consegue ser peculiar sem tentar.",
    "372 - Seu jeito diferente é justamente o que faz você ser você.",
    "373 - Você não parece feito para caber em qualquer padrão.",
    "374 - Gosto de como você tem seus próprios jeitos de fazer as coisas.",
    "375 - Você consegue transformar pequenas situações em histórias.",
    "376 - Algumas lembranças ficam melhores porque você estava nelas.",
    "377 - Você faz certos momentos parecerem mais especiais depois.",
    "378 - Tem coisas que automaticamente me fazem lembrar de você.",
    "379 - Você aparece nas lembranças mais inesperadas.",
    "380 - Algumas músicas parecem combinar estranhamente com você.",
    "381 - Certas piadas ficam mais engraçadas porque lembram você.",
    "382 - Até algumas palavras conseguem trazer você à memória.",
    "383 - Você deixa pequenas marcas por onde passa.",
    "384 - E provavelmente nem percebe que deixou.",
    "385 - Você tem mais importância do que costuma admitir.",
    "386 - Seu jeito faz falta quando você não está por perto.",
    "387 - A ausência de você deixa algumas coisas diferentes.",
    "388 - Você é uma daquelas pessoas que fazem companhia mesmo depois de ir embora.",
    "389 - Algumas conversas suas continuam na cabeça por bastante tempo.",
    "390 - Você tem frases que ficam.",
    "391 - Às vezes você fala algo simples e aquilo fica comigo.",
    "392 - Seu jeito de explicar as coisas é muito particular.",
    "393 - Você consegue fazer assuntos aleatórios ficarem interessantes.",
    "394 - Gosto quando você começa a falar sobre algo de que realmente gosta.",
    "395 - Seu entusiasmo aparece imediatamente quando alguma coisa importa para você.",
    "396 - Você fica diferente quando está genuinamente animado.",
    "397 - É bonito ver você falando sobre aquilo que gosta.",
    "398 - Você tem uma energia muito própria quando está feliz.",
    "399 - Seu sorriso muda completamente seu jeito.",
    "400 - Você fica especialmente engraçado quando está empolgado.",
    "401 - Seu jeito de ficar concentrado é curioso de observar.",
    "402 - Você parece esquecer o resto do mundo quando algo prende sua atenção.",
    "403 - Existe muita sinceridade nesses pequenos momentos.",
    "404 - Você tem uma maneira bonita de demonstrar interesse.",
    "405 - Sua curiosidade deixa as conversas melhores.",
    "406 - Você faz perguntas que outras pessoas nem pensariam em fazer.",
    "407 - Gosto de como sua cabeça funciona.",
    "408 - Você encontra possibilidades onde ninguém estava procurando.",
    "409 - Seu jeito de conectar assuntos é muito seu.",
    "410 - Você pensa por caminhos inesperados.",
    "411 - Às vezes sua lógica é estranha, mas funciona.",
    "412 - Você tem ideias que eu não teria sozinho.",
    "413 - Você consegue mudar minha perspectiva sem tentar.",
    "414 - Uma conversa com você raramente termina exatamente onde começou.",
    "415 - Você sempre deixa alguma coisa para pensar.",
    "416 - Você é mais complexo do que aparenta.",
    "417 - E é justamente isso que torna conhecer você tão interessante.",
    "418 - Você tem um jeito de transformar o comum em algo que vale a pena lembrar.",
    "419 - Existe uma gentileza em você que não precisa de plateia para existir.",
    "420 - Até o seu silêncio tem um jeito carinhoso de dizer as coisas.",
    "421 - Você merece um dia leve, sem cobranças e sem pressa.",
    "422 - O seu esforço continua valendo muito, mesmo quando ninguém está vendo.",
    "423 - Você é o tipo de companhia que dá vontade de manter por perto.",
    "424 - Tem coisas em você que só quem presta atenção consegue enxergar, e elas são lindas.",
    "425 - Você não precisa provar nada para merecer carinho do jeito que é.",
    "426 - Seu riso é daqueles que contagiam sem pedir licença.",
    "427 - Que bom que você existe exatamente do jeito que existe.",
    "428 - Hoje, lembre-se de que descansar também é uma forma de cuidar de si.",
    "429 - Você carrega uma delicadeza que o mundo precisa mais do que imagina.",
    "430 - Seu jeito de se importar com as pequenas coisas faz toda a diferença.",
    "431 - Você tem muitas camadas, e todas elas merecem ser tratadas com carinho.",
    "432 - Ninguém enxerga o mundo como você enxerga, e isso é um presente.",
    "433 - Dias difíceis não apagam o quanto você é valioso.",
    "434 - Você é alguém que inspira vontade de cuidar e de ser cuidado.",
    "435 - Seu jeito de ouvir faz as pessoas se sentirem importantes.",
    "436 - Você tem uma força tranquila que não precisa fazer barulho para ser percebida.",
    "437 - Mesmo nos dias nublados, você continua sendo uma luz para alguém.",
    "438 - Existe muita coragem em simplesmente continuar tentando, e você faz isso todos os dias.",
    "439 - Você não está atrasado na vida, está apenas no seu próprio tempo.",
    "440 - Seu coração tem um tamanho que nem você consegue medir.",
    "441 - Você é feito de pequenos gestos que, juntos, viram algo enorme.",
    "442 - Respire fundo: você está fazendo melhor do que imagina.",
    "443 - Seu jeito simples de ser já é motivo suficiente para ser querido.",
    "444 - Você tem o dom de deixar o ambiente mais leve só por estar nele.",
    "445 - Não existe versão sua que precise pedir desculpas por existir.",
    "446 - A sua história ainda tem muitos capítulos bonitos a serem escritos.",
    "447 - Você é uma daquelas pessoas que fazem a vida de alguém ser mais colorida.",
    "448 - Seu cuidado com os outros diz muito sobre quem você é.",
    "449 - Você merece ser lembrado com ternura em todos os lugares por onde passa.",
    "450 - Existe algo muito reconfortante na sua presença.",
    "451 - Cada passo seu, por menor que pareça, é uma conquista.",
    "452 - Você tem permissão para ser humano, para errar e para recomeçar.",
    "453 - Sua sensibilidade é uma força, nunca uma fraqueza.",
    "454 - Você é mais amado do que consegue perceber.",
    "455 - Seu sorriso tem o poder de mudar o clima de um dia inteiro.",
    "456 - Tem uma bondade tão natural em você que parece ter nascido junto.",
    "457 - Você não precisa carregar o mundo inteiro nas costas hoje.",
    "458 - Você merece dias em que tudo simplesmente dá certo.",
    "459 - Seu jeito de enxergar beleza onde ninguém olha é raro e especial.",
    "460 - Você é capaz de coisas lindas, mesmo quando duvida de si.",
    "461 - Ser você já é, por si só, uma forma de fazer o mundo melhor.",
    "462 - Tem muito de bom em você que ainda vai florescer.",
    "463 - Você faz falta de um jeito bonito quando não está por perto.",
    "464 - Sua autenticidade é uma das coisas mais admiráveis em você.",
    "465 - Seu coração aguenta mais do que parece, mas também merece descanso.",
    "466 - Existe uma ternura em você que nem todo mundo tem a sorte de possuir.",
    "467 - Você é o tipo de pessoa que torna qualquer lugar mais acolhedor.",
    "468 - Mesmo quando está cansado, você continua sendo incrível.",
    "469 - O seu jeito de demonstrar carinho é inconfundível.",
    "470 - Tem sempre alguém torcendo por você, mesmo em silêncio.",
    "471 - Você merece ser feliz sem precisar justificar o motivo.",
    "472 - Cada versão sua, em cada fase, tem seu próprio brilho.",
    "473 - Você é o resultado de tudo o que já superou, e isso é admirável.",
    "474 - Seu jeito de ser leve nas horas pesadas é um verdadeiro talento.",
    "475 - Existe uma paz esperando por você, e ela está mais perto do que parece.",
    "476 - Você é daquelas pessoas que se tornam lembrança boa sem nem tentar.",
    "477 - Seu olhar tem uma profundidade que faz qualquer conversa valer mais.",
    "478 - Você tem direito de se orgulhar de cada pedacinho da sua caminhada.",
    "479 - Há muita beleza na forma como você ama as coisas que ama.",
    "480 - Seu jeito de ser corajoso nem sempre faz barulho, mas sempre faz diferença.",
    "481 - Você merece ser cuidado com a mesma delicadeza com que cuida.",
    "482 - Ser querido por você é uma sorte para qualquer um.",
    "483 - Você é mais forte do que o cansaço que sente hoje.",
    "484 - Seu jeito carinhoso de olhar o mundo ensina muita gente a olhar melhor também.",
    "485 - Você deixa marcas boas por onde passa, mesmo sem perceber.",
    "486 - O mundo fica mais gentil com você nele.",
    "487 - Você merece sentir orgulho de quem está se tornando.",
    "488 - Seus sonhos são válidos, mesmo os que você ainda não contou para ninguém.",
    "489 - Existe uma alegria guardada em você que sempre encontra um jeito de aparecer.",
    "490 - Você é uma história bonita sendo escrita todos os dias.",
    "491 - Seu jeito de acolher faz as pessoas se sentirem em casa.",
    "492 - Você tem tudo o que precisa para atravessar este dia.",
    "493 - Alguém, em algum lugar, agradece hoje por você existir.",
    "494 - Seu valor não diminui nos dias em que você não rende tanto.",
    "495 - O que você tem de mais bonito é o jeito sincero com que sente as coisas.",
    "496 - Você merece todas as coisas boas que ainda estão a caminho.",
    "497 - Seu coração é um lugar bonito, e quem o conhece sabe disso.",
    "498 - Se hoje você precisar de um motivo para sorrir, lembre-se de que você existe.",
    "499 - Que este dia seja gentil com você, assim como você é com o mundo.",
    "500 - No fim das contas, você é uma das melhores coisas que poderiam acontecer na vida de alguém."
];

const btnFrase = document.getElementById('btn-frase');
const caixaFrase = document.getElementById('caixa-frase');

if (btnFrase && caixaFrase) {
    btnFrase.addEventListener('click', () => {
        let indiceAtual = parseInt(localStorage.getItem('indiceFraseProgresso')) || 0;

        if (indiceAtual >= bancoDeFrases.length) {
            indiceAtual = 0;
        }

        const fraseSelecionada = bancoDeFrases[indiceAtual];
        caixaFrase.querySelector('p').textContent = fraseSelecionada;
        caixaFrase.classList.remove('oculto');

        indiceAtual = (indiceAtual + 1) % bancoDeFrases.length;
        localStorage.setItem('indiceFraseProgresso', indiceAtual);
    });
}

function atualizarCardsPainelInicial() {
    const hojeFormatado = formatarData(diaHojeNumero);
    const diarioHoje = dadosApp.diario[hojeFormatado];
    const rotinaHoje = dadosApp.rotina[hojeFormatado] || {};

    const resumoHumor = document.getElementById('resumo-humor');
    if (resumoHumor) {
        resumoHumor.textContent = diarioHoje ? diarioHoje.sentimento : "Não registrado";
    }

    const resumoAguaPainel = document.getElementById('resumo-agua');
    if (resumoAguaPainel) {
        const litros = ((rotinaHoje.agua || 0) / 1000).toFixed(2);
        resumoAguaPainel.textContent = `${litros} de 2 litros`;
    }

    const resumoSono = document.getElementById('resumo-sono');
    if (resumoSono) {
        if (rotinaHoje.sonoDeitar && rotinaHoje.sonoAcordar) {
            resumoSono.textContent = `${rotinaHoje.sonoDeitar} até ${rotinaHoje.sonoAcordar}`;
        } else {
            resumoSono.textContent = "Não registrado";
        }
    }

    const resumoRefeicoes = document.getElementById('resumo-refeicoes');
    if (resumoRefeicoes) {
        const r = rotinaHoje.refeicoes || {};
        const total = [r.cafeManha, r.almoco, r.cafeTarde, r.jantar].filter(Boolean).length;
        resumoRefeicoes.textContent = `${total} concluídas`;
    }

    const textoHabitosHoje = document.getElementById('texto-habitos-hoje');
    const barraHabitosHoje = document.getElementById('barra-habitos-hoje');
    if (textoHabitosHoje && barraHabitosHoje) {
        const totalListas = Object.keys(dadosApp.listas).length;
        if (totalListas === 0) {
            textoHabitosHoje.textContent = "Nenhuma lista criada ainda";
            barraHabitosHoje.style.width = '0%';
        } else {
            let totalItens = 0;
            let totalFeitos = 0;
            Object.entries(dadosApp.listas).forEach(([id, lista]) => {
                const itens = lista.itens || [];
                totalItens += itens.length;
                const feitos = (rotinaHoje.listasFeitas && rotinaHoje.listasFeitas[id]) || [];
                totalFeitos += feitos.length;
            });
            textoHabitosHoje.textContent = `${totalFeitos} de ${totalItens} hábitos concluídos`;
            const pct = totalItens > 0 ? (totalFeitos / totalItens) * 100 : 0;
            barraHabitosHoje.style.width = `${pct}%`;
        }
    }
}

const cardHabitosHoje = document.getElementById('card-habitos-hoje');
if (cardHabitosHoje) {
    cardHabitosHoje.addEventListener('click', () => {
        document.querySelector('.menu-item[data-tela="tela-rotina"]').click();
        abrirRotinaPorData(formatarData(diaHojeNumero), `Hoje, ${diaHojeNumero} de ${mesesNomes[mesActualNumero]}`);
    });
}

const tituloMesDiario = document.getElementById('nome-mes-diario');
if (tituloMesDiario) {
    tituloMesDiario.textContent = `Mapeamento: ${mesesNomes[mesExibidoMes]} de ${mesExibidoAno}`;
}

const calendarioPixels = document.getElementById('calendario-pixels');

const modalDiario = document.getElementById('modal-diario');
const modalTituloDia = document.getElementById('modal-titulo-dia');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnSalvarModal = document.getElementById('btn-salvar-modal');
const textoNotaDiario = document.getElementById('texto-nota-diario');
const btnHumorOutro = document.getElementById('btn-humor-outro');
const containerHumorOutro = document.getElementById('container-humor-outro');
const inputHumorPersonalizado = document.getElementById('input-humor-personalizado');
const botoesHumor = document.querySelectorAll('.btn-humor');

function construirCalendarioDiario() {
    if (!calendarioPixels) return;
    calendarioPixels.innerHTML = '';
    const estaNoMesAtual = mesExibidoAno === anoAtualNumero && mesExibidoMes === mesActualNumero;
    const totalDias = totalDiasDoMesExibido();

    for (let dia = 1; dia <= totalDias; dia++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel-dia');
        pixel.textContent = dia;

        if (estaNoMesAtual && dia === diaHojeNumero) pixel.classList.add('atual');

        const registro = dadosApp.diario[formatarDataExibida(dia)];
        if (registro) {
            const h = (registro.sentimento || '').toLowerCase();

            if (h === 'feliz') pixel.classList.add('preenchido-rosa');
            else if (h === 'calmo') pixel.classList.add('preenchido-azul');
            else if (h === 'cansado') pixel.classList.add('preenchido-vinho');
            else if (h === 'produtivo') pixel.classList.add('preenchido-marrom');
            else pixel.classList.add('preenchido-custom');
        }

        pixel.addEventListener('click', () => abrirDiarioPorData(formatarDataExibida(dia), `Dia ${dia} de ${mesesNomes[mesExibidoMes]}`));
        calendarioPixels.appendChild(pixel);
    }
}

function abrirDiarioPorData(dataFormatada, rotuloTitulo) {
    diaSelecionadoModalData = dataFormatada;
    modalTituloDia.textContent = `Registro: ${rotuloTitulo}`;

    botoesHumor.forEach(b => b.classList.remove('selecionado'));
    containerHumorOutro.classList.add('oculto');
    inputHumorPersonalizado.value = "";
    textoNotaDiario.value = "";
    humorSelecionadoModal = "";

    const registroExistente = dadosApp.diario[dataFormatada];
    if (registroExistente) {
        textoNotaDiario.value = registroExistente.nota || "";

        let encontrado = false;
        botoesHumor.forEach(b => {
            if (b.getAttribute('data-humor') === registroExistente.sentimento) {
                b.classList.add('selecionado');
                humorSelecionadoModal = registroExistente.sentimento;
                encontrado = true;
            }
        });

        if (!encontrado && registroExistente.sentimento) {
            btnHumorOutro.classList.add('selecionado');
            containerHumorOutro.classList.remove('oculto');
            inputHumorPersonalizado.value = registroExistente.sentimento;
            humorSelecionadoModal = "Outro";
        }
    }

    modalDiario.classList.remove('oculto');
}

botoesHumor.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesHumor.forEach(b => b.classList.remove('selecionado'));
        botao.classList.add('selecionado');

        const valorHumor = botao.getAttribute('data-humor');
        if (valorHumor) {
            humorSelecionadoModal = valorHumor;
            containerHumorOutro.classList.add('oculto');
        } else {
            humorSelecionadoModal = "Outro";
            containerHumorOutro.classList.remove('oculto');
        }
    });
});

if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
        modalDiario.classList.add('oculto');
    });
}

if (btnSalvarModal) {
    btnSalvarModal.addEventListener('click', () => {
        if (!humorSelecionadoModal) {
            alert("Por favor, selecione um humor.");
            return;
        }

        let humorFinal = humorSelecionadoModal;
        if (humorSelecionadoModal === "Outro") {
            humorFinal = inputHumorPersonalizado.value.trim();
            if (!humorFinal) {
                alert("Por favor, digite o seu sentimento.");
                return;
            }
        }

        dadosApp.diario[diaSelecionadoModalData] = {
            data: diaSelecionadoModalData,
            sentimento: humorFinal,
            nota: textoNotaDiario.value
        };
        salvarDados(dadosApp);

        modalDiario.classList.add('oculto');
        construirCalendarioDiario();
        atualizarCardsPainelInicial();
    });
}

const tituloMesRotina = document.getElementById('nome-mes-rotina');
if (tituloMesRotina) {
    tituloMesRotina.textContent = `Rotina: ${mesesNomes[mesExibidoMes]} de ${mesExibidoAno}`;
}

const calendarioRotinaPixels = document.getElementById('calendario-rotina-pixels');
const modalRotina = document.getElementById('modal-rotina');
const modalTituloDiaRotina = document.getElementById('modal-titulo-dia-rotina');
const btnFecharModalRotina = document.getElementById('btn-fechar-modal-rotina');
const progressoAguaModal = document.getElementById('progresso-agua-modal');
const textoAguaModal = document.getElementById('texto-agua-modal');
const btnAdicionarAguaModal = document.getElementById('btn-adicionar-agua-modal');
const btnSalvarRotinaModal = document.getElementById('btn-salvar-rotina-modal');

let aguaModalAtual = 0;

function diaRotinaTemDados(registro) {
    if (!registro) return false;
    const refeicoes = registro.refeicoes || {};
    const temRefeicao = Object.values(refeicoes).some(Boolean);
    const listas = registro.listasFeitas || {};
    const temLista = Object.values(listas).some(arr => arr && arr.length > 0);
    return !!(registro.agua || registro.sonoDeitar || registro.sonoAcordar ||
        registro.exercicioTipo || registro.estudoMin || registro.telaMin ||
        registro.medicacao || temRefeicao || temLista);
}

function construirCalendarioRotina() {
    if (!calendarioRotinaPixels) return;
    calendarioRotinaPixels.innerHTML = '';
    const estaNoMesAtual = mesExibidoAno === anoAtualNumero && mesExibidoMes === mesActualNumero;
    const totalDias = totalDiasDoMesExibido();

    for (let dia = 1; dia <= totalDias; dia++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel-dia');
        pixel.textContent = dia;

        if (estaNoMesAtual && dia === diaHojeNumero) pixel.classList.add('atual');

        const registro = dadosApp.rotina[formatarDataExibida(dia)];
        if (diaRotinaTemDados(registro)) {
            pixel.classList.add('preenchido-azul');
        }

        pixel.addEventListener('click', () => abrirRotinaPorData(formatarDataExibida(dia), `Dia ${dia} de ${mesesNomes[mesExibidoMes]}`));
        calendarioRotinaPixels.appendChild(pixel);
    }
}

function atualizarBarraAguaModal() {
    textoAguaModal.textContent = `${aguaModalAtual}ml / 2000ml`;
    let pct = (aguaModalAtual / 2000) * 100;
    if (pct > 100) pct = 100;
    progressoAguaModal.style.width = `${pct}%`;
}

function renderizarChecklistsNoModal(registro) {
    const container = document.getElementById('container-listas-do-dia');
    container.innerHTML = '';
    const listasArray = Object.entries(dadosApp.listas);

    if (listasArray.length === 0) {
        container.innerHTML = '<p class="aviso-vazio">Nenhuma lista criada ainda. Vá em "Listas" para criar uma.</p>';
        return;
    }

    listasArray.forEach(([listaId, lista]) => {
        const feitos = (registro.listasFeitas && registro.listasFeitas[listaId]) || [];
        const card = document.createElement('div');
        card.className = 'tracker-card checklist-card card-rosa';

        let itensHtml = '';
        (lista.itens || []).forEach(item => {
            const marcado = feitos.includes(item.id) ? 'checked' : '';
            itensHtml += `<label class="checklist-item"><input type="checkbox" class="checklist-item-input" data-lista-id="${listaId}" data-item-id="${item.id}" ${marcado}> ${item.texto}</label>`;
        });
        if (!lista.itens || lista.itens.length === 0) {
            itensHtml = '<p class="aviso-vazio">Essa lista ainda não tem itens.</p>';
        }

        card.innerHTML = `<h3>${lista.titulo}</h3><p class="lista-finalidade">${lista.finalidade || ''}</p>${itensHtml}`;
        container.appendChild(card);
    });
}

function abrirRotinaPorData(dataFormatada, rotuloTitulo) {
    diaSelecionadoRotinaData = dataFormatada;
    const registro = dadosApp.rotina[dataFormatada] || {};

    modalTituloDiaRotina.textContent = `Rotina: ${rotuloTitulo}`;

    aguaModalAtual = registro.agua || 0;
    atualizarBarraAguaModal();

    document.getElementById('rotina-sono-deitar').value = registro.sonoDeitar || '';
    document.getElementById('rotina-sono-acordar').value = registro.sonoAcordar || '';

    const r = registro.refeicoes || {};
    document.getElementById('rotina-cafe-manha').checked = !!r.cafeManha;
    document.getElementById('rotina-almoco').checked = !!r.almoco;
    document.getElementById('rotina-cafe-tarde').checked = !!r.cafeTarde;
    document.getElementById('rotina-jantar').checked = !!r.jantar;

    document.getElementById('rotina-exercicio-tipo').value = registro.exercicioTipo || '';
    document.getElementById('rotina-exercicio-duracao').value = registro.exercicioDuracao || '';
    document.getElementById('rotina-estudo-min').value = registro.estudoMin || '';
    document.getElementById('rotina-tela-min').value = registro.telaMin || '';
    document.getElementById('rotina-medicacao').value = registro.medicacao || '';

    renderizarChecklistsNoModal(registro);

    modalRotina.classList.remove('oculto');
}

if (btnAdicionarAguaModal) {
    btnAdicionarAguaModal.addEventListener('click', () => {
        aguaModalAtual += 250;
        atualizarBarraAguaModal();
    });
}

if (btnFecharModalRotina) {
    btnFecharModalRotina.addEventListener('click', () => {
        modalRotina.classList.add('oculto');
    });
}

function coletarListasFeitas() {
    const resultado = {};
    document.querySelectorAll('.checklist-item-input:checked').forEach(input => {
        const listaId = input.getAttribute('data-lista-id');
        const itemId = input.getAttribute('data-item-id');
        if (!resultado[listaId]) resultado[listaId] = [];
        resultado[listaId].push(itemId);
    });
    return resultado;
}

if (btnSalvarRotinaModal) {
    btnSalvarRotinaModal.addEventListener('click', () => {
        dadosApp.rotina[diaSelecionadoRotinaData] = {
            data: diaSelecionadoRotinaData,
            agua: aguaModalAtual,
            sonoDeitar: document.getElementById('rotina-sono-deitar').value,
            sonoAcordar: document.getElementById('rotina-sono-acordar').value,
            refeicoes: {
                cafeManha: document.getElementById('rotina-cafe-manha').checked,
                almoco: document.getElementById('rotina-almoco').checked,
                cafeTarde: document.getElementById('rotina-cafe-tarde').checked,
                jantar: document.getElementById('rotina-jantar').checked
            },
            exercicioTipo: document.getElementById('rotina-exercicio-tipo').value,
            exercicioDuracao: document.getElementById('rotina-exercicio-duracao').value,
            estudoMin: document.getElementById('rotina-estudo-min').value,
            telaMin: document.getElementById('rotina-tela-min').value,
            medicacao: document.getElementById('rotina-medicacao').value,
            listasFeitas: coletarListasFeitas()
        };
        salvarDados(dadosApp);

        modalRotina.classList.add('oculto');
        construirCalendarioRotina();
        atualizarCardsPainelInicial();
        renderizarListas();
        renderizarEstatisticas();
    });
}

const btnNovaLista = document.getElementById('btn-nova-lista');
const containerListas = document.getElementById('container-listas');
const modalLista = document.getElementById('modal-lista');
const modalTituloLista = document.getElementById('modal-titulo-lista');
const btnFecharModalLista = document.getElementById('btn-fechar-modal-lista');
const listaTituloInput = document.getElementById('lista-titulo');
const listaFinalidadeInput = document.getElementById('lista-finalidade');
const listaMetaSemanalInput = document.getElementById('lista-meta-semanal');
const containerItensLista = document.getElementById('container-itens-lista');
const btnAdicionarItemLista = document.getElementById('btn-adicionar-item-lista');
const btnSalvarLista = document.getElementById('btn-salvar-lista');
const btnExcluirLista = document.getElementById('btn-excluir-lista');

function contarConclusoesSemana(listaId, lista) {
    if (!lista.itens || lista.itens.length === 0) return 0;
    const datas = getDatasSemanaAtual();
    let total = 0;
    datas.forEach(data => {
        const registro = dadosApp.rotina[data];
        const feitos = registro && registro.listasFeitas && registro.listasFeitas[listaId];
        if (feitos && feitos.length === lista.itens.length) total++;
    });
    return total;
}

function renderizarListas() {
    if (!containerListas) return;
    containerListas.innerHTML = '';

    const entradas = Object.entries(dadosApp.listas);
    if (entradas.length === 0) {
        containerListas.innerHTML = '<p class="aviso-vazio">Você ainda não criou nenhuma lista. Toque em "+ Nova lista" para começar.</p>';
        return;
    }

    entradas.forEach(([id, lista]) => {
        const card = document.createElement('div');
        card.className = 'lista-card';
        const qtdItens = (lista.itens || []).length;

        let metaHtml = '';
        if (lista.metaSemanal && lista.metaSemanal > 0) {
            const concluidas = contarConclusoesSemana(id, lista);
            const pct = Math.min(100, (concluidas / lista.metaSemanal) * 100);
            metaHtml = `
                <div class="meta-semanal-container">
                    <p class="meta-semanal-texto">${concluidas} de ${lista.metaSemanal} esta semana</p>
                    <div class="barra-grafico-fundo"><div class="barra-grafico-fluido" style="width:${pct}%"></div></div>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>${lista.titulo}</h3>
            <p class="lista-finalidade">${lista.finalidade || ''}</p>
            <p class="lista-contagem">${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'}</p>
            ${metaHtml}
            <div class="lista-card-botoes">
                <button class="btn-pequeno btn-editar-lista">Editar</button>
                <button class="btn-pequeno btn-excluir-lista-card">Excluir</button>
            </div>
        `;
        card.querySelector('.btn-editar-lista').addEventListener('click', () => abrirModalLista(id));
        card.querySelector('.btn-excluir-lista-card').addEventListener('click', () => {
            if (confirm(`Excluir a lista "${lista.titulo}"? Isso não apaga os registros já salvos nos dias, só a lista em si.`)) {
                delete dadosApp.listas[id];
                salvarDados(dadosApp);
                renderizarListas();
            }
        });
        containerListas.appendChild(card);
    });
}

function adicionarLinhaItem(texto, id) {
    const linha = document.createElement('div');
    linha.className = 'item-lista-linha';
    linha.setAttribute('data-item-id', id || gerarId());

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-editorial';
    input.placeholder = 'Nome do item';
    input.value = texto || '';

    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover-item';
    btnRemover.textContent = '✕';
    btnRemover.type = 'button';
    btnRemover.addEventListener('click', () => linha.remove());

    linha.appendChild(input);
    linha.appendChild(btnRemover);
    containerItensLista.appendChild(linha);
}

function abrirModalLista(id) {
    listaEmEdicaoId = id;
    containerItensLista.innerHTML = '';

    if (id) {
        const lista = dadosApp.listas[id];
        modalTituloLista.textContent = "Editar Lista";
        listaTituloInput.value = lista.titulo || '';
        listaFinalidadeInput.value = lista.finalidade || '';
        listaMetaSemanalInput.value = lista.metaSemanal || '';
        (lista.itens || []).forEach(item => adicionarLinhaItem(item.texto, item.id));
        btnExcluirLista.classList.remove('oculto');
    } else {
        modalTituloLista.textContent = "Nova Lista";
        listaTituloInput.value = '';
        listaFinalidadeInput.value = '';
        listaMetaSemanalInput.value = '';
        adicionarLinhaItem('');
        btnExcluirLista.classList.add('oculto');
    }

    modalLista.classList.remove('oculto');
}

if (btnNovaLista) {
    btnNovaLista.addEventListener('click', () => abrirModalLista(null));
}

if (btnAdicionarItemLista) {
    btnAdicionarItemLista.addEventListener('click', () => adicionarLinhaItem(''));
}

if (btnFecharModalLista) {
    btnFecharModalLista.addEventListener('click', () => {
        modalLista.classList.add('oculto');
    });
}

if (btnSalvarLista) {
    btnSalvarLista.addEventListener('click', () => {
        const titulo = listaTituloInput.value.trim();
        if (!titulo) {
            alert("Dê um título para a lista.");
            return;
        }

        const itens = [];
        containerItensLista.querySelectorAll('.item-lista-linha').forEach(linha => {
            const texto = linha.querySelector('input').value.trim();
            if (texto) {
                itens.push({ id: linha.getAttribute('data-item-id'), texto });
            }
        });

        const id = listaEmEdicaoId || gerarId();
        const metaValor = parseInt(listaMetaSemanalInput.value);
        dadosApp.listas[id] = {
            titulo,
            finalidade: listaFinalidadeInput.value.trim(),
            metaSemanal: metaValor > 0 ? metaValor : null,
            itens
        };
        salvarDados(dadosApp);

        modalLista.classList.add('oculto');
        renderizarListas();
    });
}

if (btnExcluirLista) {
    btnExcluirLista.addEventListener('click', () => {
        if (!listaEmEdicaoId) return;
        if (confirm("Excluir esta lista? Isso não apaga os registros já salvos nos dias, só a lista em si.")) {
            delete dadosApp.listas[listaEmEdicaoId];
            salvarDados(dadosApp);
            modalLista.classList.add('oculto');
            renderizarListas();
        }
    });
}

const nomesHumor = ['Feliz', 'Calmo', 'Cansado', 'Produtivo'];

function calcularEstatisticasMes() {
    const totalDias = totalDiasDoMesExibido();
    const contagemHumor = {};
    let diasComSono = 0, somaMinutosSono = 0;
    let diasComAgua = 0, somaAgua = 0;
    let refeicoesTotais = 0;
    let somaMinutosExercicio = 0;

    for (let dia = 1; dia <= totalDias; dia++) {
        const dataStr = formatarDataExibida(dia);

        const diario = dadosApp.diario[dataStr];
        if (diario && diario.sentimento) {
            contagemHumor[diario.sentimento] = (contagemHumor[diario.sentimento] || 0) + 1;
        }

        const rotina = dadosApp.rotina[dataStr];
        if (rotina) {
            if (rotina.sonoDeitar && rotina.sonoAcordar) {
                const [hd, md] = rotina.sonoDeitar.split(':').map(Number);
                const [ha, ma] = rotina.sonoAcordar.split(':').map(Number);
                let minutos = (ha * 60 + ma) - (hd * 60 + md);
                if (minutos <= 0) minutos += 24 * 60;
                somaMinutosSono += minutos;
                diasComSono++;
            }
            if (rotina.agua) {
                somaAgua += rotina.agua;
                diasComAgua++;
            }
            if (rotina.refeicoes) {
                refeicoesTotais += Object.values(rotina.refeicoes).filter(Boolean).length;
            }
            if (rotina.exercicioDuracao) {
                somaMinutosExercicio += parseInt(rotina.exercicioDuracao) || 0;
            }
        }
    }

    return { contagemHumor, diasComSono, somaMinutosSono, diasComAgua, somaAgua, refeicoesTotais, somaMinutosExercicio };
}

function renderizarEstatisticas() {
    const graficoHumor = document.getElementById('grafico-humor');
    if (!graficoHumor) return;

    const stats = calcularEstatisticasMes();

    const todosHumores = Array.from(new Set([...nomesHumor, ...Object.keys(stats.contagemHumor)]));
    const maiorContagem = Math.max(1, ...Object.values(stats.contagemHumor));

    if (Object.keys(stats.contagemHumor).length === 0) {
        graficoHumor.innerHTML = '<p class="aviso-vazio">Nenhum humor registrado neste mês ainda.</p>';
    } else {
        graficoHumor.innerHTML = todosHumores
            .filter(h => stats.contagemHumor[h])
            .map(h => {
                const contagem = stats.contagemHumor[h] || 0;
                const pct = (contagem / maiorContagem) * 100;
                return `
                    <div class="linha-grafico-humor">
                        <div class="rotulo-grafico"><span>${h}</span><span>${contagem}</span></div>
                        <div class="barra-grafico-fundo"><div class="barra-grafico-fluido" style="width:${pct}%"></div></div>
                    </div>
                `;
            }).join('');
    }

    const statSonoMedio = document.getElementById('stat-sono-medio');
    if (statSonoMedio) {
        if (stats.diasComSono > 0) {
            const mediaMin = Math.round(stats.somaMinutosSono / stats.diasComSono);
            statSonoMedio.textContent = `${Math.floor(mediaMin / 60)}h ${mediaMin % 60}min`;
        } else {
            statSonoMedio.textContent = "Sem dados";
        }
    }

    const statAguaMedia = document.getElementById('stat-agua-media');
    if (statAguaMedia) {
        if (stats.diasComAgua > 0) {
            const mediaLitros = (stats.somaAgua / stats.diasComAgua / 1000).toFixed(2);
            statAguaMedia.textContent = `${mediaLitros} L`;
        } else {
            statAguaMedia.textContent = "Sem dados";
        }
    }

    const statRefeicoesTotal = document.getElementById('stat-refeicoes-total');
    if (statRefeicoesTotal) {
        statRefeicoesTotal.textContent = `${stats.refeicoesTotais}`;
    }

    const statExercicioTotal = document.getElementById('stat-exercicio-total');
    if (statExercicioTotal) {
        statExercicioTotal.textContent = `${stats.somaMinutosExercicio} min`;
    }
}

atualizarCardsPainelInicial();
construirCalendarioDiario();
construirCalendarioRotina();
renderizarListas();
renderizarEstatisticas();