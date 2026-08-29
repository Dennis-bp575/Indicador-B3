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

const pesosAtivos = [
  2, 3, 2, 2, 3, // B3SA3 (2), PETR4 (3), CSAN3 (2), ITSA4 (2), ITUB4 (3)
  1, 2, 1, 2, 1, // COGN3 (1), BBDC4 (2), CVCB3 (1), VIVT3 (2), CMIN3 (1)
  1, 2, 1, 2, 3, // MGLU3 (1), CSMG3 (2), NATU3 (1), ABEV3 (2), BBAS3 (3)
  3, 2, 3, 1, 2, // BBSE3 (3), CPLE3 (2), VALE3 (3), MOTV3 (1), GOAU4 (2)
  2, 1, 2, 2, 1, // SBSP3 (2), CSNA3 (1), LREN3 (2), ASAI3 (2), VAMO3 (1)
  2, 2, 2, 1, 2, // DIRR3 (2), GGBR4 (2), EQTL3 (2), RAPT4 (1), CYRE3 (2)
  1, 1, 3, 1, 1, // AXIA3 (1), MRVE3 (1), RENT3 (3), USIM5 (1), CEAB3 (1)
  3, 2, 3, 1, 3, // EGIE3 (3), BPAC11 (2), RADL3 (3), BRKM5 (1), PETR3 (3)
  1, 1, 2, 2, 1, // BEEF3 (1), POMO4 (1), CMIG4 (2), PRIO3 (2), MBRF3 (1)
  2, 1, 3, 2, 0  // CPFE3 (2), ENEV3 (1), WEGE3 (3), ALOS3 (2), %5EBVSP (0)
];



// VARIÁVEL FIXA COM AS 24 PALAVRAS DE INDICAÇÃO (PADRÕES SEQUENCIAIS)
const TOKENS_INDICADORES = [ 
            "AAAAAAAVVAAAAA", "AAAAVAVAVAAAAA", "AVAVAVAAVVVVVV", "AVAVAVAVAVVVAA",
            "AVAVAVAVVVVVVV", "VAVAVAVAVAAAVV", "VAVAVVVVVAVVVV", "VAVVVVVVAAVVVV",
            "VAVVVVVVAVVVVV", "VVVVAVAVVAVVVV", "VVVVVAVVAVVVVV", "VVVVVVAVVAVVVV",
            "VVVVVVAVVVVVVV", "VVVVVVVVAAVVVV", "VVVVVVVVVAVAAA"
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
                                    let historicoReatualizado;
                                    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                    historicoReatualizado = structuredClone(historicoSalvo);
                                    
                                    diasParaProcessar.forEach((diaDoCalendario) => {
                                                
                                                
                                                const timestampDoDia = diaDoCalendario.date;
                                                
                                                const dataDesseDia = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR');
                                                //console.log(dataDesseDia)
                                                dataDesseDiaGlobal = dataDesseDia;
                                                
                                                let registroExistente = historicoReatualizado.find(item => 
                                                    String(item.dataSinal).trim() === String(dataDesseDia).trim()
                                                );

                                                
                                                if (registroExistente) {
        
                                                    const dadosIbov = dadosBrutos.results.find(item => item.symbol === "^BVSP");
                                                    if (dadosIbov && dadosIbov.historicalDataPrice) {
                                                        const historicoIbov = dadosIbov.historicalDataPrice;
                                                        // Achamos a posição do dia anterior no histórico do Ibov
                                                        const idxIbov = historicoIbov.findIndex(c => c.date === timestampDoDia);
                                                        
                                                        const idxDiaSeguinte = idxIbov + 1;
                                                
                                                        //gravUltimoResult = false
                                                        //calculaUltimoResult = false       
                                                        
                                                        if (idxDiaSeguinte < historicoIbov.length) {
                                                                        const ibovAmanha = historicoIbov[idxDiaSeguinte]; // O dia 11 real!
                                                                        const ibovHoje = historicoIbov[idxIbov];         // O dia 10 real
                                                            
                                                                        const dataAmanhaFormatada = new Date(ibovAmanha.date * 1000).toLocaleDateString('pt-BR');
                                                                        
                                                                        const agora = new Date();
                                                                        const horaAtual = agora.getHours();
                                                                        const amanhaEHoje = dataAmanhaFormatada === agora.toLocaleDateString('pt-BR');
                                                                        
                                                                        if (!amanhaEHoje) {

                                                                            registroExistente.resultadoBolsa = ibovAmanha.close > ibovHoje.close ? "subiu" : "desceu";
                                                                            registroExistente.aberturaBolsa = ibovAmanha.open > ibovHoje.close ? "alta" : "baixa";
            
                                                                            let possuiDiaSeguinteNoBanco = historicoSalvo.some(item => item.dataSinal === dataAmanhaFormatada);
                            
                                                                            if (!possuiDiaSeguinteNoBanco) {
                                                                                historicoReatualizado.push({
                                                                                    placar: "AGUARDANDO...",
                                                                                    dataSinal: dataAmanhaFormatada,
                                                                                    aberturaBolsa: "...",
                                                                                    resultadoBolsa: "..."
                                                                                });
                                                                                //console.log(`📅 Criada base em 'AGUARDANDO...' para o dia posterior: ${dataAmanhaFormatada}`);
                                                                            }
                                                                   
                                                                            localStorage.setItem('historico_B3', JSON.stringify(historicoSalvo));
                                                                            //console.log(`✅ Palpite do dia ${dataDesseDia} validado com o resultado do dia ${dataAmanhaFormatada}!`);
                                                                        }
                                                        } else {
                                                                
                                                                calculaUltimoResult = true;
                                                                //console.log(gravUltimoResult);
                                                        }
                                                    }
                                                }   
                                    });

                                    diasParaProcessar.forEach((diaDoCalendario) => {
                                    
                                                const timestampDoDia = diaDoCalendario.date; // Dia 10
                                                
                                                const dataDesseDia = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR');
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
                                                            if (ativo.symbol === "^BVSP") return; 
                                                            
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
                                                                const nomeAtivo = ativo.symbol; 
                                                                const indice = meusAtivos.indexOf(nomeAtivo);
                                                                const pesoDoAtivo = pesosAtivos[indice];                                      
                                                                totalMatchesPalavras += pesoDoAtivo;
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
                                                                    const nomeAtivo = ativo.symbol; 
                                                                    const indice = meusAtivos.indexOf(nomeAtivo);
                                                                    const pesoDoAtivo = pesosAtivos[indice];    
                                                                    totalMatchesFonteSecundaria += pesoDoAtivo;                                                               
                                                            }           
                                                            
                                                            // Lógica do Martelo Adaptada (Dando margem para o ruído do mercado)
                                                            const corpo51 = Math.abs(c51.close - c51.open);
                                                            const sombraInf51 = Math.min(c51.open, c51.close) - c51.low;
                                                            const sombraSup51 = c51.high - Math.max(c51.open, c51.close);
                                                            
                                                            // Ajuste: Sombra inferior pelo menos 2x o corpo, e permitimos uma sombra superior de até 25% do corpo (em vez de 10%)
                                                            const ehMartelo = (sombraInf51 >= 2 * corpo51) && (sombraSup51 <= corpo51 * 0.25) && (corpo51 > 0);
                                                            
                                                            // Lógica do Engolfo de Alta Adaptada (Ignorando micro-gaps de leilão)
                                                            const candle50Baixa = c50.close < c50.open;
                                                            const candle51Alta = c51.close > c51.open;
                                                            // Ajuste: O corpo do candle 51 precisa engolir pelo menos 90% do corpo do candle 50, tolerando pequenas variações de abertura
                                                            const ehEngolfo = candle50Baixa && candle51Alta && (c51.close >= c50.open * 0.99) && (c51.open <= c50.close * 1.01);
                                                            
                                                            // NEW 🌟: Padrão Extra 1 - Piercing Line (Perfuração - quase um engolfo, muito comum na B3)
                                                            const ehPiercing = candle50Baixa && candle51Alta && (c51.open < c50.close) && (c51.close > (c50.open + c50.close) / 2);
                                                            
                                                            // NEW 🌟: Padrão Extra 2 - Marubozu de Alta (Candle de força bruta comprador)
                                                            const ehMarubozu = candle51Alta && (corpo51 >= (c51.high - c51.low) * 0.85);
                                                            
                                                            // Validação Atualizada: Se acontecer QUALQUER uma das reversões clássicas de fundo
                                                            if (ehMartelo || ehEngolfo || ehPiercing || ehMarubozu) {
                                                                const nomeAtivo = ativo.symbol; 
                                                                const indice = meusAtivos.indexOf(nomeAtivo);
                                                                
                                                                if (indice !== -1) {
                                                                    const pesoDoAtivo = pesosAtivos[indice];
                                                                    totalReversoesCandle += pesoDoAtivo; 
                                                                }
                                                            }

                                                });

                                                // 1. Buscamos o histórico atualizado do localStorage para não atropelar dados
                                                //let historicoAtual = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                                const placarFormatado = `${totalMatchesPalavras}-${totalMatchesFonteSecundaria}-${totalReversoesCandle}`;
                                                
                                                const agora = new Date();
                                                const horaAtual = agora.getHours();
                                                const ehHoje = dataDesseDia === agora.toLocaleDateString('pt-BR');
                                                
                                                const index = historicoReatualizado.findIndex(c => 
                                                    String(c.dataSinal).trim() === String(dataDesseDia).trim()
                                                );
                                                
                                                if (index !== -1) {
                                                    historicoReatualizado[index] = {
                                                        ...historicoReatualizado[index],
                                                        placar: placarFormatado,
                                                        dataSinal: dataDesseDia,       
                                                    };
                                                   // console.log(`✅ Item encontrado no índice ${index} e atualizado com sucesso!`);
                                                } else {
                                                  //  console.warn(`❌ Mesmo com o trim, a data "${timestampDoDia}" não foi encontrada no histórico.`);
                                                }
                                                                                                
                                                
                                                
                                              //  console.log(`🔮 Novo sinal gerado para ${dataDesseDia} com o placar: ${placarFormatado}`);
                                               
                                    });
                                  //  console.log("Chegamos aqui?")
                                    
                                    
                                    
                                    localStorage.setItem('historico_B3', JSON.stringify(historicoReatualizado));
                                    desenharHistoricoNaTela();
                        } // Fechamento do: if (dadosBrutos.results && Array.isArray...)
            
            } catch (error) {
                // 1. Pega a pilha de execução (stack) ou deixa vazio se não existir
                const stack = error.stack || "";
                
                // 2. Extrai a linha que originou o erro usando Regex
                const linhaErro = stack.split('\n')[1] || "Linha desconhecida";
            
                // Log detalhado para o desenvolvedor ver no console (F12)
                console.error("❌ Erro detectado:", error.message);
                console.error("📍 Local do erro:", linhaErro.trim());

            } finally {
                        // Esse bloco roda SEMPRE para não deixar o seu botão travado com o "Analisando..."
                        botaoAtualizar.disabled = false;
                        botaoAtualizar.innerHTML = `<span>Atualizar Scanner</span>`;
            }

            if (blocoResultadoAtual) {

                const t2 = totalMatchesPalavras;
                const t3 = totalMatchesFonteSecundaria;
                const somaTendencia = t2 + t3; 
                const resultado = `${totalReversoesCandle} e ${t2}+${t3}=${somaTendencia}`;

                // 🧠 Lógica Dinâmica das Etiquetas de Previsão
                let etiquetaSinal = "[⚪ MERCADO NEUTRO]";
                let classeCorEtiqueta = "text-gray-400"; // Cor padrão neutra

                if (totalReversoesCandle > t2 && somaTendencia >= 25 && t3 > t2 && somaTendencia <= 60) {
                    etiquetaSinal = "[🟢 Mantém ⚠️ Atenção na abertura]";
                    classeCorEtiqueta = "text-emerald-400"; // Destaca em verde
                } 
                if (totalReversoesCandle <= 2 && (somaTendencia >= 35 && somaTendencia <= 48)) {
                    // Texto curto e objetivo mantendo a bolinha amarela ao lado da compra
                    etiquetaSinal = "[🟢 Mantém]";
                    classeCorEtiqueta = "text-emerald-400"; // Mantém o texto em destaque verde
                }
                        
                if (totalReversoesCandle <= 2 && somaTendencia > 49) {
                    etiquetaSinal = "[⚠️ EXCESSO DE TOPO]";
                    classeCorEtiqueta = "text-orange-600"; // Destaca em rosa/vermelho
                }
                if (somaTendencia < 10) {
                    etiquetaSinal = "[🛑 INDICATIVO DE VENDA]";
                    classeCorEtiqueta = "text-rose-400"; // Destaca em rosa/vermelho
                }

                const agora15 = new Date();
                const hora15Formatada = agora15.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                blocoResultadoAtual.innerHTML = `
                    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-lg">
                        <div class="text-2xl font-extrabold ${classeCorEtiqueta} mb-2">${etiquetaSinal}</div>
                        <span class="font-bold text-white text-base">${resultado}</span>
                        <p class="font-bold text-white text-base">Atualizado às ${hora15Formatada}</p>
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

        // Processamento matemático dos tokens mapeados na escala de Peso 3
        const placar = item.placar; // Exemplo: "2-35-6"
        const numeros = placar.split('-').map(Number);
        const tokenExaustao = numeros[0]; 
        const t2 = numeros[1];
        const t3 = numeros[2];
        const somaTendencia = t2 + t3; 
        const resultado = `${tokenExaustao} e ${t2}+${t3}=${somaTendencia}`;

        // 🧠 Lógica Dinâmica das Etiquetas de Previsão
        let etiquetaSinal = "[⚪NEUTRO]";
        let classeCorEtiqueta = "text-gray-400"; // Cor padrão neutra

        if (tokenExaustao > t2 && somaTendencia >= 25 && t3 > t2 && somaTendencia <= 60) {
            etiquetaSinal = "[🟢COMPRA⚠️Open]";
            classeCorEtiqueta = "text-emerald-400"; // Destaca em verde
        } 
        if (tokenExaustao <= 2 && (somaTendencia >= 35 && somaTendencia <= 48)) {
            // Texto curto e objetivo mantendo a bolinha amarela ao lado da compra
            etiquetaSinal = "[🟢 COMPRA] ";
            classeCorEtiqueta = "text-emerald-400"; // Mantém o texto em destaque verde
        }
                
        if (tokenExaustao <= 2 && somaTendencia > 49) {
            etiquetaSinal = "[⚠️TOPANDO]";
            classeCorEtiqueta = "text-orange-600"; // Destaca em rosa/vermelho
        }
        if (somaTendencia < 10) {
            etiquetaSinal = "[🚨VENDER🚨]";
            classeCorEtiqueta = "text-rose-400"; // Destaca em rosa/vermelho
        }

        tocarBeep();

        // A sua constante com o HTML atualizado contendo os Avisos Inteligentes
        const linhaHtml = `
            <div class="flex items-center justify-between bg-gray-850 border border-gray-800 rounded-xl p-4 shadow-sm">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black ${classeCorEtiqueta}">${etiquetaSinal}</span>
                        <span class="font-bold text-white text-base">${resultado}</span>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">Data do Sinal: ${item.dataSinal}</span>
                </div>
                
                <!-- Grupo de Badges à direita -->
                <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <!-- Novo Badge de Abertura -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCorAbertura}">
                        Open: ${item.aberturaBolsa || "..."}
                    </div>
                    
                    <!-- Seu Badge Antigo de Fechamento -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCor}">
                        Close: ${item.resultadoBolsa}
                    </div>
                </div>
            </div>
        `;


        blocoListaHistorico.insertAdjacentHTML('beforeend', linhaHtml);
    });
}


botaoAtualizar.addEventListener('click', () => {
    // 1. Destrava o áudio se estiver suspenso pelo navegador
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    // 2. Executa a lógica do seu scanner de ações
    executarScanner();
});

// Função que verifica o horário e simula o clique do botão
function agendarCliqueAutomatizado() {
    setInterval(() => {
        const agora = new Date();
        const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
        const hora = agora.getHours();
        const minuto = agora.getMinutes();

        // Se for Sábado (6) ou Domingo (0), o robô não faz nada
        if (diaDaSemana === 0 || diaDaSemana === 6) {
            return; 
        }

        const minutosAtuais = (hora * 60) + minuto;
        const inicioBolsa = (10 * 60) + 15; // 10:15
        const fimBolsa = (17 * 60) + 0;     // 17:00

        if (minutosAtuais >= inicioBolsa && minutosAtuais <= fimBolsa) {
            console.log(`[Automação] Disparando atualização: ${hora}:${minuto.toString().padStart(2, '0')}`);
            botaoAtualizar.click();
        }
    }, 15 * 60 * 1000); // Executa a checagem a cada 15 minutos
}

agendarCliqueAutomatizado();

let audioCtx = null;

function tocarBeep() {
    try {
        // Inicializa o áudio apenas na primeira execução para economizar RAM
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Se o navegador suspendeu o áudio por falta de clique, tenta reativar
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            return; // Ignora o primeiro bipe silencioso até o usuário interagir
        }

        // Gera o som compartilhando o mesmo contexto global
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 600; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15); 
        
    } catch (erro) {
        // Evita que o erro trave a execução do restante do seu scanner
        console.log("Aviso de áudio contido:", erro.message);
    }
}



