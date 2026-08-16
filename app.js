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
            "CPFE3", "ENEV3", "WEGE3", "ALOS3", "%5EBVSP"]; 

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

const token = "whN8hFPcawDXwGhjRLAoN7"; 

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const botaoAtualizar = document.getElementById('btn-atualizar');
const blocoResultadoAtual = document.getElementById('resultado-atual');
const blocoListaHistorico = document.getElementById('lista-historico');
let ultimaAtualizacao = null;

desenharHistoricoNaTela();
// ==========================================
// 3. FUNÇÃO PRINCIPAL DO SCANNER
// ==========================================
async function executarScanner() {
            
            let totalMatchesHoje = 0;
            let totalMatchesPalavras = 0; 
            let totalReversoesCandle = 0;
            let direcaoIbovespaHoje = "estavel";
            let dataSinal = "";
            let dataHojeFormatada = new Date().toLocaleDateString('pt-BR');
            let totalMatchesFonteSecundaria = 0; 
            let direcaoAberturaHoje = "";  
            let dataDesseDiaGlobal;
            let calculaUltimoResult;
            let gravaUltimoResult;
            
            botaoAtualizar.disabled = true;
            botaoAtualizar.innerHTML = `
                        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
                        </svg>
                        <span>Analisando 50 ações...</span>
            `;

            try {
                               
                        // 1. Criamos a estrutura que o resto do código já espera receber
                        const dadosBrutos = { results: [] };
                        // 2. Criamos uma lista combinando os 50 ativos + o Ibovespa no final
                        for (const ticker of meusAtivos) {
                                    await esperar(100); // Pausa de segurança de 100ms do plano gratuito
                                    
                                    const url = `https://brapi.dev/api/quote/${ticker}?range=3mo&interval=1d&token=${token}`;
                                    const response = await fetch(url);
                                    
                                    if (response.ok) {
                                                const jsonAtivo = await response.json();
                                                // Se o ativo retornou dados válidos, jogamos para o nosso lote na memória
                                                if (jsonAtivo.results && jsonAtivo.results[0]) {
                                                dadosBrutos.results.push(jsonAtivo.results[0]);
                                                }
                                    } else {
                                                console.warn(`⚠️ Não foi possível carregar os dados de ${ticker}`);
                                    }
                        }
                        
                        // 1. Verificamos se a Brapi realmente devolveu a lista de resultados
                        if (dadosBrutos.results && Array.isArray(dadosBrutos.results)) {
                                    const historicoCalendario = dadosBrutos.results[0].historicalDataPrice;                    
                                    // Encontramos onde paramos no tempo
                                    const indiceParada = historicoCalendario.findIndex(candle => {
                                        return new Date(candle.date * 1000).toLocaleDateString('pt-BR') === ultimaAtualizacao;
                                    });
                                    
                                    // Criamos a lista com os dias que faltam processar dali para frente!
                                    const diasParaProcessar = historicoCalendario.slice(indiceParada);

                                    // ==========================================
                                    // 🚀 O LOOP PRINCIPAL DE DIAS (Ajustado)
                                    // ==========================================
                                    diasParaProcessar.forEach((diaDoCalendario) => {
                                                
                                                // O robô está processando o dia 10 no calendário de lacunas
                                                const timestampDoDia = diaDoCalendario.date; // Dia 10
                                                
                                                const dataDesseDia = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR'); // "10/08/2026"
                                                //console.log(dataDesseDia)
                                                dataDesseDiaGlobal = dataDesseDia;
                                                let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                                let registroExistente = historicoSalvo.find(item => item.dataSinal === dataDesseDia);
                                                
                                                if (registroExistente && registroExistente.resultadoBolsa === "AGUARDANDO...") {
                                                    console.log("chegamos aqui no resultado bolsa")
                                                    
                                                    const dadosIbov = dadosBrutos.results.find(item => item.symbol === "^BVSP");
                                                    if (dadosIbov && dadosIbov.historicalDataPrice) {
                                                        console.log("chegamos aqui no historicalDataPrice")
                                                        const historicoIbov = dadosIbov.historicalDataPrice;
                                                        
                                                        // Achamos a posição do dia 10 no histórico do Ibov
                                                        const idxIbov = historicoIbov.findIndex(c => c.date === timestampDoDia);
                                                        
                                                        const idxDiaSeguinte = idxIbov + 1;
                                                
                                                        gravUltimoResult = false
                                                        calculaUltimoResult = false       
                                                        
                                                        if (idxDiaSeguinte < historicoIbov.length) {
                                                                        const ibovAmanha = historicoIbov[idxDiaSeguinte]; // O dia 11 real!
                                                                        const ibovHoje = historicoIbov[idxIbov];         // O dia 10 real
                                                            
                                                                        const dataAmanhaFormatada = new Date(ibovAmanha.date * 1000).toLocaleDateString('pt-BR');
                                                                        
                                                                        const agora = new Date();
                                                                        const horaAtual = agora.getHours();
                                                                        const amanhaEHoje = dataAmanhaFormatada === agora.toLocaleDateString('pt-BR');
                                                                        
                                                                        // ⏱️ TRAVA DAS 17H: Se o dia posterior (dia 11) for HOJE e ainda for antes das 17h:
                                                                        if (!amanhaEHoje) {

                                                                            registroExistente.resultadoBolsa = ibovAmanha.close > ibovHoje.close ? "subiu" : "desceu";
                                                                            registroExistente.aberturaBolsa = ibovAmanha.open > ibovHoje.close ? "alta" : "baixa";
            
                                                                            let possuiDiaSeguinteNoBanco = historicoSalvo.some(item => item.dataSinal === dataAmanhaFormatada);
                            
                                                                            if (!possuiDiaSeguinteNoBanco) {
                                                                                historicoSalvo.push({
                                                                                    // placar: "AGUARDANDO...",
                                                                                    dataSinal: dataAmanhaFormatada,
                                                                                    aberturaBolsa: "AGUARDANDO...",
                                                                                    resultadoBolsa: "AGUARDANDO..."
                                                                                });
                                                                                console.log(`📅 Criada base em 'AGUARDANDO...' para o dia posterior: ${dataAmanhaFormatada}`);
                                                                            }
                                                                            calculaUltimoResult = true;
                                                                            localStorage.setItem('historico_B3', JSON.stringify(historicoSalvo));
                                                                            console.log(`✅ Palpite do dia ${dataDesseDia} validado com o resultado do dia ${dataAmanhaFormatada}!`);
                                                                        }
                                                        } else {
                                                                
                                                                calculaUltimoResult = true;
                                                                //console.log(gravUltimoResult);
                                                        }
                                                    }
                                                    console.log(`calcula ult = ${calculaUltimoResult}`);
                                                    if (!calculaUltimoResult) return;
                                                }

                                                // Zeramos os contadores para consolidar este dia específico
                                                totalMatchesHoje = 0;
                                                totalMatchesPalavras = 0; 
                                                totalReversoesCandle = 0;
                                                totalMatchesFonteSecundaria = 0;
                                    
                                                // ==========================================
                                                // Agora as 50 ações entram para trabalhar:
                                                // ==========================================
                                                dadosBrutos.results.forEach(ativo => {
                                                            // Se for o Ibov, pula (tratamos ele no fechamento do dia)
                                                            if (ativo.symbol === "%5EBVSP") return; 
                                                            
                                                            const historicoCompleto = ativo.historicalDataPrice;
                                                            if (!historicoCompleto || historicoCompleto.length === 0) return;
                                    
                                                            // 1. Procuramos o índice desse dia específico no histórico DESTA ação
                                                            const idx51 = historicoCompleto.findIndex(c => c.date === timestampDoDia);
                                                            
                                                            // Se a ação não tiver pregão nesse dia (ex: IPO recente ou suspensa), pula ela
                                                            if (idx51 === -1 || idx51 < 2) return;
                                                            
                                                            // 2. Mapeamos os índices cronológicos corretos com segurança total!
                                                            const idx50 = idx51 - 1; // Ontem real da ação
                                                            const idx49 = idx51 - 2; // Anteontem real da ação
                                                            
                                                            const c51 = historicoCompleto[idx51];
                                                            const c50 = historicoCompleto[idx50];
                                                            const c49 = historicoCompleto[idx49];

                                                            const periodoAlma1 = 9;  
                                                            const periodoAlma2 = 21; 
                                                            const precosFechamento = historicoCompleto.map(c => c.close);

                                                            historicoCompleto.forEach((candle, index) => {
                                                                    candle.alma1 = calcularALMA(precosFechamento, index, periodoAlma1);
                                                                    candle.alma2 = calcularALMA(precosFechamento, index, periodoAlma2);
                                                            });


         
                                                            // 3. Atualizamos a dataSinal com base no candle decidido
                                                            dataSinal = new Date(c51.date * 1000).toLocaleDateString('pt-BR');
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
                                                            // console.log(palavraGerada, totalMatchesPalavras);
                                                            if (deuMatch) {
                                                                        totalMatchesPalavras++;
                                                            }

                                                            const B51 = Number(c51["open"]) || 0; // Ajuste o nome da propriedade se for diferente
                                                            const C51 = Number(c51["high"]) || 0;
                                                            const D51 = Number(c51["low"]) || 0;
                                                            const E51 = Number(c51["close"]) || 0;
                                                            
                                                            const B50 = Number(c50["open"]) || 0;
                                                            const C50 = Number(c50["high"]) || 0;
                                                            const D50 = Number(c50["low"]) || 0;
                                                            const E50 = Number(c50["close"]) || 0;
                                                                        
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
                                                });

                                                // 1. Buscamos o histórico atualizado do localStorage para não atropelar dados
                                                let historicoAtual = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                                const placarFormatado = `${totalMatchesPalavras}-${totalMatchesFonteSecundaria}-${totalReversoesCandle}`;

                                                const agora = new Date();
                                                const horaAtual = agora.getHours();
                                                const ehHoje = dataDesseDia === agora.toLocaleDateString('pt-BR');
                                                
                                                // 3. Criamos o novo objeto com a assinatura do seu App Guru
                                                const novoPalpite = {
                                                            placar: placarFormatado,
                                                            dataSinal: dataDesseDia,       // A data em que o sinal foi gerado
                                                            aberturaBolsa: "AGUARDANDO...", // O amanhã ainda não abriu
                                                            resultadoBolsa: "AGUARDANDO..." // O amanhã ainda não fechou
                                                };
                                                
                                                // 4. Empurramos o novo palpite para dentro do banco de dados do navegador
                                                historicoAtual.push(novoPalpite);
                                                const agoraH = new Date();
                                                const horaAtualH = agoraH.getHours();
                                                gravUltimoResult = horaAtualH > 17 || dataAmanhaFormatada < agoraH.toLocaleDateString('pt-BR');
                                                console.log(gravUltimoResult, horaAtualH, agoraH.toLocaleDateString('pt-BR'));
                                                if (gravaUltimoResult) {
                                                            localStorage.setItem('historico_B3', JSON.stringify(historicoAtual));
                                                }
                                                console.log(`🔮 Novo sinal gerado para ${dataDesseDia} com o placar: ${placarFormatado}`);
                                               
                                    });
                        } // Fechamento do: if (dadosBrutos.results && Array.isArray...)
            
            } catch (error) {
                        // Captura qualquer erro na requisição em lote ou no processamento dos dias
                        console.error("❌ Erro geral no Scanner:", error.message);
                        alert("Ocorreu um erro ao rodar o scanner: " + error.message);
                        
            } finally {
                        // Esse bloco roda SEMPRE para não deixar o seu botão travado com o "Analisando..."
                        botaoAtualizar.disabled = false;
                        botaoAtualizar.innerHTML = `<span>Atualizar Scanner</span>`;
            }

            if (blocoResultadoAtual) {
                blocoResultadoAtual.innerHTML = `
                    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-lg">
                        <div class="text-5xl font-extrabold text-white mb-2">${totalMatchesPalavras}-${totalMatchesFonteSecundaria}-${totalReversoesCandle}</div>
                        <p class="text-2xl text-gray-400">Baseado nos dados consolidados em: <span class="text-emerald-400 font-semibold">${dataDesseDiaGlobal}</span></p>
                    </div>
                `;
            }

} // Fechamento definitivo da: async function executarScanner()



desenharHistoricoNaTela();
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

function desenharHistoricoNaTela() {
    blocoListaHistorico.innerHTML = "";
    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
   
    // Inverte a ordem para exibir o mais recente no topo
    const historicoInvertido = historicoSalvo.reverse();

    // Captura a data do registro mais recente (o primeiro da lista invertida)
    if (historicoInvertido.length > 0) {
        ultimaAtualizacao = historicoInvertido[0].dataSinal;
    } else {
        ultimaAtualizacao = "Sem registros";
    }

    // O loop agora roda sobre a lista invertida
    historicoInvertido.forEach(item => {
        let classeCor = "bg-gray-800 border-gray-700 text-gray-400";
        
        // Correção do BUG: Removido o '|| item.resultadoBolsa' para que o 'else if' funcione
        if (item.resultadoBolsa && item.resultadoBolsa.includes("subiu")) {
            classeCor = "bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400";
        } else if (item.resultadoBolsa && item.resultadoBolsa.includes("desceu")) {
            classeCor = "bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400";
        }

        // Mantém a sua lógica para a cor do badge da Abertura
        const classeCorAbertura = item.aberturaBolsa?.includes("alta") 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : item.aberturaBolsa?.includes("baixa") 
            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
            : "bg-gray-800 text-gray-400"; // Caso esteja "AGUARDANDO..."
        
        // A sua constante com o HTML atualizado
        const linhaHtml = `
            <div class="flex items-center justify-between bg-gray-850 border border-gray-800 rounded-xl p-4 shadow-sm">
                <div class="flex flex-col">
                    <span class="font-bold text-white text-base">Matches: ${item.placar}</span>
                    <span class="text-xs text-gray-500">Data do Sinal: ${item.dataSinal}</span>
                </div>
                
                <!-- Grupo de Badges à direita -->
                <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <!-- Novo Badge de Abertura -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCorAbertura}">
                        Abertura: ${item.aberturaBolsa || "AGUARDANDO..."}
                    </div>
                    
                    <!-- Seu Badge Antigo de Fechamento -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCor}">
                        Fechamento: ${item.resultadoBolsa}
                    </div>
                </div>
            </div>
        `;

        blocoListaHistorico.insertAdjacentHTML('beforeend', linhaHtml);
    });
}

botaoAtualizar.addEventListener('click', executarScanner);

