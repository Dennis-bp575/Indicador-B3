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


// Token de autenticação da Brapi (Substitua pelo seu token gratuito gerado no site deles)
const token = "whN8hFPcawDXwGhjRLAoN7"; 

// Objeto global que vai armazenar o resultado final processado de todas as ações
// Ele seguirá a lógica da sua antiga 'interface AtivoResultado'
let resultadosProcessados = [];
