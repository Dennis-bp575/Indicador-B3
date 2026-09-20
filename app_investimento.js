// === ENCAIXAR ESTA NOVA FUNÇÃO AQUI ===
const SUPABASE_URL = 'https://zqdjkazwinzmmtwgpycn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s3vcDX41fY9DA48qO8k80g_cZTOckMg';
// const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

(function() {
    // 1. Localiza o container das novas abas estruturadas
    const containerAbasAtivos = document.getElementById('container-abas-ativos');
    
    if (!containerAbasAtivos) return;

    // Remove o painel antigo caso ele já exista na tela (evita duplicar ao alternar scripts)
    const painelAntigo = document.getElementById('painel-simulacao-ativos');
    if (painelAntigo) painelAntigo.remove();

    // Cria a estrutura visual do painel logo abaixo das abas
    const painelSimulacao = document.createElement('div');
    painelSimulacao.id = 'painel-simulacao-ativos';
    painelSimulacao.className = 'mt-6 bg-gray-850 bg-opacity-40 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5 transition-all duration-300';
    
    // Injeta o HTML estrutural atualizado com o campo de data e o card de última negociação abaixo do botão
    painelSimulacao.innerHTML = `
        <!-- Cabeçalho do Ativo Selecionado -->
        <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <div class="flex items-baseline gap-2">
                <h3 id="simulacao-ticket" class="text-xl font-bold text-gray-100 tracking-wide">---</h3>
                <span id="simulacao-data-inicio" class="text-xs text-gray-500 font-medium">Início: --/--</span>
            </div>
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Simulador 16:45</span>
        </div>

        <!-- Grid de Informações: Preço de Entrada da Simulação e Estado -->
        <div class="grid grid-cols-2 gap-4 text-center">
            <!-- Bloco de Preço de Entrada -->
            <div class="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col justify-center">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Preço Entrada</span>
                <div id="simulacao-preco" class="text-2xl font-black text-gray-200">R$ --,--</div>
            </div>

            <!-- Bloco de Estado/Posição -->
            <div id="simulacao-estado-card" class="rounded-xl p-4 border transition-all duration-300 flex flex-col justify-center">
                <span class="text-xs font-semibold uppercase tracking-wider block mb-1">Posição Atual</span>
                <div id="simulacao-estado-texto" class="text-xl font-black uppercase">---</div>
            </div>
        </div>

        <!-- Botão Unificado de Inversão de Posição -->
        <div class="flex justify-center pt-1">
            <button id="btn-inverter-posicao" class="w-full max-w-sm flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-100 font-bold py-3 px-6 rounded-xl shadow-lg transform active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 text-base gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                <span>Inverter Posição</span>
            </button>
        </div>

        <!-- NOVO CARD: ÚLTIMA NEGOCIAÇÃO DA BOLSA -->
        <div class="bg-gray-900/30 border border-gray-800 rounded-xl p-3 flex justify-between items-center text-sm px-4">
            <div class="flex items-center gap-2">
                <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-gray-400 font-medium">Última Negociação (B3)</span>
                <span id="simulacao-rentabilidade" class="text-xs font-bold ml-1 transition-all duration-300"></span>
            </div>
            <div id="simulacao-preco-mercado" class="font-bold text-gray-100 text-base">R$ --,--</div>
        </div>

        <!-- NOVO CONTAINER: LISTA DO HISTÓRICO EMPILHADO -->
        <div class="space-y-2 mt-4 pt-3 border-t border-gray-800">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">Histórico de Reversões</span>
            <div id="simulacao-lista-historico" class="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                <!-- Os itens do histórico serão injetados aqui via JavaScript -->
                <div class="text-gray-600 text-center py-2 italic">Nenhuma reversão registrada para este ativo...</div>
            </div>
        </div>
    `;

    // Insere o painel logo após o bloco de abas
    containerAbasAtivos.parentNode.insertBefore(painelSimulacao, containerAbasAtivos.nextSibling);

    // 2. Banco de dados local contendo as posições e datas atualizadas dos testes
    const dadosAtivos = {
        // PRIMEIRO GRUPO: Entrou SHORT em 10/09
        'CEAB3': { precoEntrada: '8,92', precoMercado: '8,94', posicao: 'SHORT', inicio: '10/09' },
        'VAMO3': { precoEntrada: '3,46', precoMercado: '3,35', posicao: 'SHORT', inicio: '10/09' },
        'BEEF3': { precoEntrada: '6,20', precoMercado: '6,15', posicao: 'SHORT', inicio: '10/09' },
        
        // SEGUNDO GRUPO: Entrou LONG em 17/09
        'CSAN3': { precoEntrada: '12,50', precoMercado: '12,42', posicao: 'LONG', inicio: '17/09' },
        'CVCB3': { precoEntrada: '2,10', precoMercado: '2,15', posicao: 'LONG', inicio: '17/09' }
    };


    let ativoAtual = 'CEAB3'; // Iniciando na primeira aba por padrão (em formato com "3")

    // Elementos internos do painel para manipulação
    const txtTicket = document.getElementById('simulacao-ticket');
    const txtDataInicio = document.getElementById('simulacao-data-inicio');
    const txtPrecoEntrada = document.getElementById('simulacao-preco');
    const txtPrecoMercado = document.getElementById('simulacao-preco-mercado');
    const txtRentabilidade = document.getElementById('simulacao-rentabilidade'); 
    const cardEstado = document.getElementById('simulacao-estado-card');
    const txtEstado = document.getElementById('simulacao-estado-texto');
    const btnInverter = document.getElementById('btn-inverter-posicao');

    // 3. Função para renderizar as informações e aplicar as cores correspondentes
    async function atualizarPainelVisual(ticketCom3) {
        ativoAtual = ticketCom3;
        
        // Busca os dados atualizados na nuvem antes de renderizar na tela
        await buscarDadosSupabase(ticketCom3);

        const dados = dadosAtivos[ticketCom3];
        if (!dados) return;

        // Limpa o "3" apenas no título do cabeçalho para o seu filho ver (ex: "CEAB")
        txtTicket.innerText = ticketCom3.endsWith('3') ? ticketCom3.slice(0, -1) : ticketCom3;
        
        txtDataInicio.innerText = `Início: ${dados.inicio}`;
        txtPrecoEntrada.innerText = `R$ ${dados.precoEntrada}`;
        txtPrecoMercado.innerText = `R$ ${dados.precoMercado}`;

        if (dados.posicao === 'LONG') {
            cardEstado.className = "rounded-xl p-4 border bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400 transition-all duration-300 flex flex-col justify-center";
            txtEstado.innerText = "LONG";
        } else {
            cardEstado.className = "rounded-xl p-4 border bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400 transition-all duration-300 flex flex-col justify-center";
            txtEstado.innerText = "SHORT";
        }
        buscarPrecoB3(ticketCom3); 
        carregarHistoricoVisual(ticketCom3);
    }

    // 4. Escuta os cliques nas abas do HTML principal
    const botoesAbas = document.querySelectorAll('.aba-ativo');
    botoesAbas.forEach(botao => {
        botao.addEventListener('click', function() {
            // Remove as classes de destaque ativo de absolutamente todas as abas
            botoesAbas.forEach(b => {
                b.className = "aba-ativo flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50";
            });

            // Aplica a estilização de selecionado (Fundo verde, texto escuro) na aba clicada
            this.className = "aba-ativo flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-emerald-500 text-emerald-950 shadow-md";

            // Pega o valor do HTML (ex: "CEAB") e trata para colocar o "3" antes de mandar pro painel
            const ativoHTML = this.getAttribute('data-ativo');
            const ticketTratado = ativoHTML.endsWith('3') ? ativoHTML : ativoHTML + '3';
            
            atualizarPainelVisual(ticketTratado);
        });
    });

    // 5. Evento assíncrono do botão de inversão de posição
    btnInverter.addEventListener('click', async function() {
        const posicaoAtual = dadosAtivos[ativoAtual].posicao;
        const novaPosicao = posicaoAtual === 'LONG' ? 'SHORT' : 'LONG';
        
        // PEGA O PREÇO DE MERCADO DA TELA E CONVERTE PARA O BANCO
        const precoMercadoTexto = dadosAtivos[ativoAtual].precoMercado; // Ex: "8,94"
        const novoPrecoEntradaNum = parseFloat(precoMercadoTexto.replace(',', '.'));

        // GERA A DATA DE HOJE NO FORMATO DO BANCO (AAAA-MM-DD)
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const dataHojeBanco = `${ano}-${mes}-${dia}`;
        
        btnInverter.disabled = true;
        btnInverter.innerText = "Salvando na Nuvem...";

        try {
            const url = `${SUPABASE_URL}/rest/v1/simulacao_ativos?ticket=eq.${ativoAtual}`;
        
            const resposta = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    posicao: novaPosicao,
                    preco_atual: novoPrecoEntradaNum, 
                    data_inicio: dataHojeBanco       
                })
            });

            if (!resposta.ok) throw new Error(`Erro ao salvar: ${resposta.status}`);

            const urlHistorico = `${SUPABASE_URL}/rest/v1/historico_ativos`;
            await fetch(urlHistorico, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticket: ativoAtual,
                    posicao_antiga: posicaoAtual,
                    posicao_nova: novaPosicao,
                    preco_inversao: novoPrecoEntradaNum
                })
            });

            // Se salvou na nuvem, atualiza a memória local para refletir na tela
            dadosAtivos[ativoAtual].posicao = novaPosicao;
            dadosAtivos[ativoAtual].precoEntrada = precoMercadoTexto; 
            dadosAtivos[ativoAtual].inicio = `${dia}/${mes}`;        

            // Recarrega o painel visual
            atualizarPainelVisual(ativoAtual);
            
            console.log(`[Supabase PATCH] Inversão completa para ${ativoAtual}! Preço: R$ ${precoMercadoTexto}, Data: ${dia}/${mes}`);

        } catch (erro) {
            console.error("Erro ao inverter posição no Supabase:", erro);
            alert("Não foi possível salvar a inversão. Tente novamente.");
            atualizarPainelVisual(ativoAtual);
        } finally {
            btnInverter.disabled = false;
            btnInverter.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                <span>Inverter Posição</span>
            `;
        }
    });

    // Inicializa exibindo CEAB3 por padrão
    atualizarPainelVisual('CEAB3');

    async function buscarDadosSupabase(ticket) {
        try {
            const url = `${SUPABASE_URL}/rest/v1/simulacao_ativos?ticket=eq.${ticket}&select=posicao,preco_atual,data_inicio`;
        
            const resposta = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY, 
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Accept': 'application/vnd.pgrst.object+json' 
                }
            });

            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

            const data = await resposta.json();

            if (data) {
                const [ano, mes, dia] = data.data_inicio.split('-');
                const dataFormatada = `${dia}/${mes}`;

                // Cria o nó dinamicamente caso o ativo consultado não exista por padrão no objeto local
                if(!dadosAtivos[ticket]) dadosAtivos[ticket] = { precoMercado: '--,--' };

                dadosAtivos[ticket].posicao = data.posicao;
                dadosAtivos[ticket].precoEntrada = data.preco_atual.toString().replace('.', ',');
                dadosAtivos[ticket].inicio = dataFormatada;

                console.log(`[Supabase REST] Dados carregados para ${ticket}:`, data);
                return true;
            }
        } catch (erro) {
            console.error(`Erro ao buscar dados de ${ticket} no Supabase via REST:`, erro);
        }
        return false;
    }

    async function carregarHistoricoVisual(ticket) {
        const containerLista = document.getElementById('simulacao-lista-historico');
        if (!containerLista) return;

        try {
            const url = `${SUPABASE_URL}/rest/v1/historico_ativos?ticket=eq.${ticket}&order=data_inversao.desc&limit=5`;
            const resposta = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const dados = await resposta.json();
            
            if (dados && dados.length > 0) {
                containerLista.innerHTML = dados.map(item => {
                    const dataObj = new Date(item.data_inversao);
                    const dataFormatada = `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')} ${String(dataObj.getHours()).padStart(2, '0')}:${String(dataObj.getMinutes()).padStart(2, '0')}`;
                    
                    const corBadge = item.posicao_nova === 'LONG' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50' : 'text-rose-400 bg-rose-950/40 border-rose-900/50';

                    return `
                        <div class="flex items-center justify-between bg-gray-900/40 border border-gray-800 rounded-lg p-2.5">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 font-mono text-[10px]">${dataFormatada}</span>
                                <span class="text-gray-300 font-medium">Reverteu para</span>
                                <span class="border px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${corBadge}">${item.posicao_nova}</span>
                            </div>
                            <span class="font-bold text-gray-200 font-mono">R$ ${item.preco_inversao.toFixed(2).replace('.', ',')}</span>
                        </div>
                    `;
                }).join('');
            } else {
                containerLista.innerHTML = `<div class="text-gray-600 text-center py-2 italic">Nenhuma reversão registrada para este ativo...</div>`;
            }
        } catch (erro) {
            console.error("Erro ao carregar histórico:", erro);
        }
    }
    
    async function buscarPrecoB3(ticket) {
        try {
            txtPrecoMercado.innerText = "Atualizando...";
            
            const token = "whN8hFPcawDXwGhjRLAoN7";
            const url = `https://brapi.dev/api/quote/${ticket}?token=${token}`;
            const resposta = await fetch(url);
            
            const dadosApi = await resposta.json();
            
            if (dadosApi && dadosApi.results && dadosApi.results[0]) {
                const precoFechamento = dadosApi.results[0].regularMarketPrice;
                
                const precoFormatado = precoFechamento.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                dadosAtivos[ticket].precoMercado = precoFormatado;
              
                const pEntrada = parseFloat(dadosAtivos[ticket].precoEntrada.replace(',', '.'));
                const pMercado = precoFechamento; 
                const posicaoAtual = dadosAtivos[ticket].posicao;
                
                let rentabilidade = 0;
                
                if (posicaoAtual === 'LONG') {
                    rentabilidade = ((pMercado - pEntrada) / pEntrada) * 100; 
                } else {
                    rentabilidade = ((pEntrada - pMercado) / pEntrada) * 100;
                }

                if (rentabilidade > 0) {
                    txtRentabilidade.innerText = `(+${rentabilidade.toFixed(2)}%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded";
                } else if (rentabilidade < 0) {
                    txtRentabilidade.innerText = `(${rentabilidade.toFixed(2)}%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded";
                } else {
                    txtRentabilidade.innerText = `(0.00%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded";
                }

                txtPrecoMercado.innerText = `R$ ${precoFormatado}`;
            } else {
                txtPrecoMercado.innerText = "Erro ao ler dados";
            }
        } catch (erro) {
            console.error("Erro ao buscar cotação na B3:", erro);
            txtPrecoMercado.innerText = "Erro de conexão";
        }
    }
})();
