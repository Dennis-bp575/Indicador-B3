// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

// Substitui a lista de 50 planilhas. Adicione os tickers das suas 50 ações aqui.
const meusAtivos = ["B3SA3", "PETR4", "CSAN3", "ITSA4", "ITUB4",
            "COGN3", "BBDC4", "CVCB3", "VIVT3", "CMIN3",  
            "MGLU3", "CSMG3", "NATU3", "ABEV3", "BBAS3",
            "BBSE3", "CPLE3", "VALE3", "MOTV3", "GOAU4",
            "SBSP3", "CSNA3", "LREN3", "ASAI3", "VAMO3",
            "DIRR3", "GGBR4", "EQTL3", "RAPT4", "CYRE3",
            "AXIA3", "MRVE3", "RENT3", "USIM5", "CEAB3",
            "EGIE3", "BPAC11", "RADL3", "BRKM5", "PETR3", 
            "BEEF3", "POMO4", "CMIG4", "PRIO3", "MBRF3",
            "CPFE3", "ENEV3", "WEGE3", "ALOS3"]; 

// VARIÁVEL FIXA COM AS 24 PALAVRAS DE INDICAÇÃO (PADRÕES SEQUENCIAIS)
const TOKENS_INDICADORES = [
  "AAAAAAAVVAAAAA", "AAAAVAVAVAAAAA", "AAVAVAVAVAAAAA", "AVAVAAAAAVAAAA",
  "AVAVAVAAVVVVVV", "AVAVAVAVAVVVAA", "AVAVAVAVVAVVAA", "AVAVAVAVVVVVVV",
  "VAAVVAAVAVAAAA", "VAVAVAVAVAAAAA", "VAVAVAVAVAAAVV", "VAVAVAVAVAVVVV",
  "VAVAVAVVVVVVVV", "VAVAVVVVVAVVVV", "VAVVVAVVAVAAAA", "VAVVVVVVAAVVVV",
  "VAVVVVVVAVVVVV", "VVVVAVAVVAVVVV", "VVVVVAVVAVVVVV", "VVVVVVAVVAVVVV",
  "VVVVVVAVVVVVVV", "VVVVVVVVAAVVVV", "VVVVVVVVVAVAAA", "VVVVVVVVVVVVVV"
];

const TOKENS_FONTE_SECUNDARIA = [
  "AIAAAAAVAVVAAV", "AVAAAAAVAVAIAA", "AVAAAAAVAVIAAA", "AVAAAAAVAVVIAV",
  "AVAAAVAAAVAAAA", "AVAIAVAAAVAAAA", "AVVAAAIVAVVAAV", "AVVAAAVVAVVAAV",
  "AVVAAAVVAVVIAV", "AVVAAAVVVVVAVV", "AVVAAAVVVVVIAV", "AVVAAVIAAVAAAA",
  "AVVAAVVAAVAAAA", "AVVAAVVAAVVAAA", "AVVAAVVAAVVAAV", "AVVIAVVAAVAAAA",
  "AVVIAVVAAVVAAV", "VVVAAAVVVVVIVV", "VVVAAVAAIVVAAA", "VVVIAVAAAVAAAA",
  "VVVIVVVAAVVAAA"
];


// Token de autenticação da Brapi (Substitua pelo seu token gratuito gerado no site deles)
const token = "whN8hFPcawDXwGhjRLAoN7"; 

// Objeto global que vai armazenar o resultado final processado de todas as ações
// Ele seguirá a lógica da sua antiga 'interface AtivoResultado'
let resultadosProcessados = [];
// Função auxiliar para gerar o delay de 100ms que você criou
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. CAPTURA DOS ELEMENTOS DA TELA (HTML)
// ==========================================
const botaoAtualizar = document.getElementById('btn-atualizar');
const blocoResultadoAtual = document.getElementById('resultado-atual');
const blocoListaHistorico = document.getElementById('lista-historico');

desenharHistoricoNaTela();


// ==========================================
// 3. FUNÇÃO PRINCIPAL DO SCANNER
// ==========================================
async function executarScanner() {
    let resultadosProcessados = [];
    let totalMatchesHoje = 0;
    let totalMatchesPalavras = 0; // O primeiro número
    let totalReversoesCandle = 0; // O segundo número (Martelo OU Engolfo)
    let direcaoIbovespaHoje = "estavel";
    let dataSinal = ""; 
    let dataHojeFormatada; 
    let totalMatchesFonteSecundaria = 0; 

    // Efeito Visual: Transforma o botão em "Carregando..."
    botaoAtualizar.disabled = true;
    botaoAtualizar.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
        </svg>
        <span>Analisando 50 ações...</span>
    `;

    // Loop que varre seus ativos (O seu código original)
    for (const ticker of meusAtivos) {
        try {
            await esperar(100);
            const url =
                `https://brapi.dev/api/quote/${ticker}` +
                `?range=3mo&interval=1d&token=${token}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }

            const dadosBrutos = await response.json();
            
            if (dadosBrutos.results && dadosBrutos.results[0] && dadosBrutos.results[0].historicalDataPrice) {
                const ativo = dadosBrutos.results[0];
                const historicoCompleto = ativo.historicalDataPrice;

                // 1. Extrai apenas os preços de fechamento para alimentar a ALMA
                const precosFechamento = historicoCompleto.map(c => c.close);

                // 2. Calcula as duas ALMAs para cada linha do histórico
                // AJUSTE AQUI: Mude os números 9 e 21 para os períodos exatos que você usa no Excel
                const periodoAlma1 = 9;  
                const periodoAlma2 = 21; 

                historicoCompleto.forEach((candle, index) => {
                    candle.alma1 = calcularALMA(precosFechamento, index, periodoAlma1);
                    candle.alma2 = calcularALMA(precosFechamento, index, periodoAlma2);
                });

                // 3. Agora sim, captura os últimos 3 dias com as ALMAs calculadas inseridas neles!
                const ultimos3Dias = historicoCompleto.slice(-3);
                const c51 = ultimos3Dias[2]; // Linha 51
                const c50 = ultimos3Dias[1]; // Linha 50
                const c49 = ultimos3Dias[0]; // Linha 49

                // if(!dataSinal) dataSinal = new Date(c51.date * 1000).toLocaleDateString('pt-BR');
                // Captura a data real do pregão apenas uma vez (na primeira ação válida)
                if (!dataSinal && c51 && c51.date) { 
                    dataSinal = new Date(c51.date * 1000).toLocaleDateString('pt-BR');
                }
               

                // Mapeamento exato das 7 colunas (B até H) do seu Excel
                const chavesColunas = ['open', 'high', 'low', 'close', 'volume', 'alma1', 'alma2']; 

                let palavraGerada = "";

                // Monta a palavra de 14 letras cruzando dados e médias
                for (let i = 0; i < 7; i++) {
                    const propriedade = chavesColunas[i];

                    const v51 = Number(c51[propriedade]) || 0;
                    const v50 = Number(c50[propriedade]) || 0;
                    const v49 = Number(c49[propriedade]) || 0;

                    palavraGerada += v51 > v50 ? "A" : v51 < v50 ? "V" : "I";
                    palavraGerada += v50 > v49 ? "A" : v50 < v49 ? "V" : "I";
                }

                // Verifica match com os tokens matemáticos de 14 letras
                let deuMatch = TOKENS_INDICADORES.includes(palavraGerada);

                if (deuMatch) {
                    totalMatchesPalavras++;
                }

                        // --- SISTEMA NOVO (Abertura B e Fechamento E contra as outras = 14 letras) ---
                        // Mapeando as variáveis direto das propriedades do seu objeto de dados
                        const B51 = Number(c51["open"]) || 0; // Ajuste o nome da propriedade se for diferente
                        const C51 = Number(c51["high"]) || 0;
                        const D51 = Number(c51["low"]) || 0;
                        const E51 = Number(c51["close"]) || 0;
                        
                        const B50 = Number(c50["open"]) || 0;
                        const C50 = Number(c50["high"]) || 0;
                        const D50 = Number(c50["low"]) || 0;
                        const E50 = Number(c50["close"]) || 0;
                        console.log(B51, C51, D51, E51);
                        let novaPalavraGerada = "";
                        
                        // Bloco B51 (7 letras)
                        novaPalavraGerada += B51 > B50 ? "A" : B51 < B50 ? "V" : "I";
                        novaPalavraGerada += B51 > C51 ? "A" : B51 < C51 ? "V" : "I";
                        novaPalavraGerada += B51 > C50 ? "A" : B51 < C50 ? "V" : "I";
                        novaPalavraGerada += B51 > D51 ? "A" : B51 < D51 ? "V" : "I";
                        novaPalavraGerada += B51 > D50 ? "A" : B51 < D50 ? "V" : "I";
                        novaPalavraGerada += B51 > E51 ? "A" : B51 < E51 ? "V" : "I";
                        novaPalavraGerada += B51 > E50 ? "A" : B51 < E50 ? "V" : "I";
                        
                        // Bloco E51 (7 letras)
                        novaPalavraGerada += E51 > B51 ? "A" : E51 < B51 ? "V" : "I";
                        novaPalavraGerada += E51 > B50 ? "A" : E51 < B50 ? "V" : "I";
                        novaPalavraGerada += E51 > C51 ? "A" : E51 < C51 ? "V" : "I";
                        novaPalavraGerada += E51 > C50 ? "A" : E51 < C50 ? "V" : "I";
                        novaPalavraGerada += E51 > D51 ? "A" : E51 < D51 ? "V" : "I";
                        novaPalavraGerada += E51 > D50 ? "A" : E51 < D50 ? "V" : "I";
                        novaPalavraGerada += E51 > E50 ? "A" : E51 < E50 ? "V" : "I";
                        
                        // Verifica match com os novos tokens e conta na variável separada
                        if (TOKENS_FONTE_SECUNDARIA.includes(novaPalavraGerada)) {
                            totalMatchesFonteSecundaria++;
                        }
                      console.log(novaPalavraGerada, totalMatchesFonteSecundaria)

                // Lógica do Martelo (Candle 51)
                const corpo51 = Math.abs(c51.close - c51.open);
                const sombraInf51 = Math.min(c51.open, c51.close) - c51.low;
                const sombraSup51 = c51.high - Math.max(c51.open, c51.close);
                const ehMartelo = (sombraInf51 >= 2 * corpo51) && (sombraSup51 <= corpo51 * 0.1);

                // Lógica do Engolfo de Alta (Candle 50 + Candle 51)
                const candle50Baixa = c50.close < c50.open;
                const candle51Alta = c51.close > c51.open;
                const ehEngolfo = candle50Baixa && candle51Alta && (c51.open <= c50.close) && (c51.close > c50.open);

                // Validação 2: Aconteceu Martelo OU Engolfo de Alta?
                if (ehMartelo || ehEngolfo) {
                    totalReversoesCandle++;
                }

            
                resultadosProcessados.push({
                    ticker: ticker,
                    nome: ativo.shortName,
                    preco: ativo.regularMarketPrice,
                    palavra: palavraGerada,
                    match: deuMatch
                });

                //console.log(`✅ ${ticker} processado. Assinatura: ${palavraGerada} | Match: ${deuMatch}`);
            }

        } catch (error) {
            console.error(`❌ Erro em ${ticker}:`, error.message);
        }
    } // Fim do for

 try {
    console.log("Consultando o fechamento oficial do Ibovespa...");
         
    const urlIbov =  `https://brapi.dev/api/quote/${"%5EBVSP"}` +
            `?range=3mo&interval=1d&token=${token}`;
         
    const respostaIbov = await fetch(urlIbov);
    
    if (respostaIbov.ok) {
        const dadosIbov = await respostaIbov.json();
        if (dadosIbov.results && dadosIbov.results[0].historicalDataPrice) {
            const historicoIbov = dadosIbov.results[0].historicalDataPrice;
            
            // Pega os dois últimos dias do índice para comparar o fechamento
            const ibovHoje = historicoIbov[historicoIbov.length - 1];
            const ibovOntem = historicoIbov[historicoIbov.length - 2];

            const dataHojeRaw = ibovHoje.date; 
            dataHojeFormatada = new Date(dataHojeRaw * 1000).toLocaleDateString('pt-BR');

            // Define se o fechamento oficial foi de Alta ou Baixa
            direcaoIbovespaHoje = ibovHoje.close > ibovOntem.close ? "subiu" : "desceu";
            
            console.log(`📊 Ibovespa em ${dataHojeFormatada}: ${direcaoIbovespaHoje} (Fechamento: ${ibovHoje.close})`);
        }
    }
} catch (erroIbov) {
    console.error("Erro ao recuperar dados do Ibovespa:", erroIbov.message);
    direcaoIbovespaHoje = "estavel"; 
}


    // Atualiza a tela com o total de matches encontrados
    blocoResultadoAtual.innerHTML = `<span 
                class="text-emerald-400">${totalMatchesPalavras} e ${totalReversoesCandle} e ${totalMatchesFonteSecundaria}</span>`;

    // Restaura o botão ao estado original
    botaoAtualizar.disabled = false;
    botaoAtualizar.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
        </svg>
        <span>Atualizar Dados da Bolsa</span>
    `;

    if (!dataSinal) {
        dataSinal = new Date().toLocaleDateString('pt-BR');
    }
    // Executa a rotina do LocalStorage para processar palpites passados e salvar o de hoje
    processarEGravarLocalStorage(
                dataSinal, 
                totalMatchesPalavras, 
                totalMatchesFonteSecundaria,
                totalReversoesCandle, 
                direcaoIbovespaHoje,
                dataHojeFormatada // ⬅️ Nova variável adicionada aqui
            );

    desenharHistoricoNaTela();

    return resultadosProcessados;
}

// ==========================================================
// FUNÇÃO ALMA EM JAVASCRIPT PURO
// ==========================================================
function calcularALMA(precos, indexAtual, tamanhoDesejado) {
    if (indexAtual === 0) return precos[0];

    const windowSize = Math.min(tamanhoDesejado, indexAtual + 1);
    const offset = 0.85;
    const sigma = 6;

    const m = offset * (windowSize - 1);
    const s = windowSize / sigma;

    let somaPesos = 0;
    let somaPonderada = 0;

    for (let i = 0; i < windowSize; i++) {
        const precoIndex = indexAtual - (windowSize - 1) + i;
        const preco = precos[precoIndex];

        const peso = Math.exp(-Math.pow(i - m, 2) / (2 * Math.pow(s, 2)));

        somaPonderada += preco * peso;
        somaPesos += peso;
    }

    return somaPesos === 0 ? 0 : (somaPonderada / somaPesos);
}

// ==========================================
// 4. GERENCIADOR DO LOCALSTORAGE
// ==========================================

function processarEGravarLocalStorage(dataSinal, totalMatchesPalavras, totalMatchesFonteSecundaria, totalReversoesCandle, direcaoIbovespaHoje, dataIbov) {
    // 1. Pega o histórico existente ou cria um array vazio
    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];

    // 1. CONVERTE AS DATAS PARA COMPARAÇÃO (Formato brasileiro dd/mm/aaaa para Objeto Date)
    function converterData(stringData) {
        if (!stringData) return new Date(0);
        const [dia, mes, ano] = stringData.split('/');
        return new Date(ano, mes - 1, dia);
    }

    // 2. BUSCA O SINAL MAIS RECENTE QUE FICOU AGUARDANDO
    const registroAguardando = [...historicoSalvo].reverse().find(reg => reg.resultadoBolsa === "AGUARDANDO...");

    if (registroAguardando) {
        const dataDoSinalSalvo = converterData(registroAguardando.dataSinal);
        const dataDoFechamentoAtual = converterData(dataIbov);

        // Só atualiza se o fechamento atual for de um dia posterior ao sinal gerado
        if (dataDoFechamentoAtual > dataDoSinalSalvo) {
            registroAguardando.resultadoBolsa = direcaoIbovespaHoje === "subiu" ? "▲ subiu" : "▼ desceu";
            console.log(`✅ Sinal de ${registroAguardando.dataSinal} atualizado com o pregão posterior de ${dataIbov}: ${direcaoIbovespaHoje}`);
        } else {
            console.log(`⏳ Aguardando o pregão do dia posterior para o sinal de ${registroAguardando.dataSinal}. O fechamento de ${dataIbov} não é posterior.`);
        }
    }

    // 3. CRIA O NOVO SINAL DA RODADA ATUAL (Previsão para o próximo pregão)
    const novoRegistro = {
        dataSinal: dataSinal, 
        matches: totalMatchesPalavras,
        matchesSecundario: totalMatchesFonteSecundaria,
        reversoes: totalReversoesCandle,
        placar: `${totalMatchesPalavras} e ${totalReversoesCandle} e ${totalMatchesFonteSecundaria}`, 
        resultadoBolsa: "AGUARDANDO..." 
    };
    // Evita duplicar a linha de previsão se o app rodar mais de uma vez no mesmo dia
    const jaExisteSinalHoje = historicoSalvo.some(reg => reg.dataSinal === dataSinal);
    if (!jaExisteSinalHoje) {
        historicoSalvo.push(novoRegistro);
    }

    // 4. GRAVAÇÃO SEGURA NO LOCAL STORAGE
    localStorage.setItem('historico_B3', JSON.stringify(historicoSalvo));
}
// ==========================================
// 5. RENDERIZADOR DO HISTÓRICO VISUAL
// ==========================================
function desenharHistoricoNaTela() {
    blocoListaHistorico.innerHTML = "";
    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
            console.log(historicoSalvo.dataSinal)
    // Inverte a ordem para exibir o mais recente no topo
    historicoSalvo.reverse().forEach(item => {
        let classeCor = "bg-gray-800 border-gray-700 text-gray-400";
        
        if (item.resultadoBolsa.includes("subiu") || item.resultadoBolsa) {
            classeCor = "bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400";
        } else if (item.resultadoBolsa.includes("desceu") || item.resultadoBolsa) {
            classeCor = "bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400";
        }

        const linhaHtml = `
            <div class="flex items-center justify-between bg-gray-850 border border-gray-800 rounded-xl p-4 shadow-sm">
                <div class="flex flex-col">
                    <span class="font-bold text-white text-base">Matches: ${item.placar}</span>
                    <span class="text-xs text-gray-500">Data do Sinal: ${item.dataSinal}</span>
                </div>
                <div class="flex items-center gap-2 font-bold px-3 py-1 rounded-full text-xs ${classeCor}">
                    Bolsa: ${item.resultadoBolsa}
                </div>
            </div>
        `;
        blocoListaHistorico.insertAdjacentHTML('beforeend', linhaHtml);
    });
}

botaoAtualizar.addEventListener('click', executarScanner);

