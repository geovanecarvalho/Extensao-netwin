PDS - Netwin Extensão
1. Visão Geral
- Nome: Netwin - Cadastro Survey
- Tipo: Extensão para Google Chrome / Edge (Manifest V3)
- Versão: 0.1.0
- Domínio de atuação: *://netwin.vtal.intra/*
- Propósito: Gerar pacotes de survey (arquivos XML de edifício + imagens incorporadas) a partir de um arquivo CSV de dados e um arquivo XML de roteiro, empacotando tudo em um ZIP para download.

2. Arquitetura e Tecnologias
Camada	Tecnologia
Manifest	Chrome Extension MV3
Background	Service Worker
Content Script	JS puro (ES6+)
Estilos	CSS puro
Compactação	JSZip (vendored)
Recursos estáticos	3 imagens JPG

3. Estrutura de Diretórios
Netwin-extensao/
├── manifest.json
├── background/
│   └── service-worker.js
├── content/
│   ├── content.js
│   └── content.css
├── lib/
│   ├── jszip.min.js
│   └── JSZip-LICENSE.markdown
├── assets/
│   ├── img_preta_1.jpg
│   ├── img_preta_2.jpg
│   └── img_preta_3.jpg
└── img_preta_1/2/3.jpg (cópias na raiz)

4. Funcionalidades Principais
- Injeção de botão "Edifícil" na navegação do site alvo (com fallback flutuante quando a nav não é encontrada)
- Modal acessível (ARIA, foco preso, ESC para fechar) com:
- Campo de nome do arquivo (com preview ao vivo e sanitização de caracteres inválidos)
- Campo de nome do técnico (padrão: FRANCISCO RIBEIRO DE LIMA JR)
- Upload de Roteiro XML (máx. 5 MB)
- Upload de Survey CSV (máx. 25 MB, detecção automática de delimitador)
- Botão de download de planilha base (modelo.csv) com cabeçalhos padronizados
- Configuração de infraestrutura (sem / com)
- Parâmetros: pisos inicial/final, numeração inicial/final, tipo, destinação
- Geração de ZIP com:
- Uma pasta edificioN por linha de dados do CSV
- XML de edifício por pasta, preenchido com dados do roteiro + CSV
- 3 imagens embutidas em cada pasta (IMG PRETA.jpg, img preta1.jpg, img preta2.jpg)
- Compactação DEFLATE nível 6
- Barra de progresso e download direto do ZIP gerado (via blob URL)
- Nome do ZIP: <nome>_<timestamp>.zip

5. Requisitos
Funcionais:
- Validar extensão e tamanho dos arquivos enviados (rejeitar vazios e acima do limite)
- Detecção automática de delimitador do CSV (suporta `,`, `;`, tab e `|`)
- Retorno do CSV como array de objetos com chaves baseadas no cabeçalho (ex: `linha.NOME_ZONA`, `linha.LATITUDE`)
- Mapear linha do CSV ao roteiro via COD_LOGRAD ou combinação LOGRADOURO + BAIRRO
- Gerar UCs (unidades construtivas) automaticamente quando infra = "sem"
- Sanitizar nome do arquivo (remover espaços e caracteres inválidos para nomes de arquivo)
- Colunas obrigatórias do CSV: BAIRRO, NOME_ZONA, LOGRADOURO, COD_LOGRAD, NUMERO DE FACHADA, COMPLEMENTO 1, LATITUDE, LONGITUDE
- Colunas opcionais do CSV: COMPLEMENTO 2, COMPLEMENTO 3 (tags só aparecem no XML se preenchidas)
- Chave de busca no roteiro.xml: COD_LOGRAD (não COD_LOGRADOURO)
- redeInterna: "N" quando infra = "sem", "S" quando infra = "com"
- Declaração XML: <?xml version="1.0" encoding="UTF-8" standalone='yes' ?>
Não funcionais:
- Execução restrita ao domínio netwin.vtal.intra
- Sem servidor backend (tudo processado client-side)
- Limites de arquivo para evitar travar o navegador

6. Mapeamento CSV → XML
| Tag XML | Origem CSV / Regra | Obrigatório |
|---|---|---|
| coordX | Coluna LATITUDE (formato DDD.DDD.DDD → convertido para DD.DDDDDDD) | Sim |
| coordY | Coluna LONGITUDE (formato DDD.DDD.DDD → convertido para DD.DDDDDDD) | Sim |
| codigoZona | Coluna NOME_ZONA | Sim |
| nomeZona | Coluna NOME_ZONA | Sim |
| localidade | roteiro.xml (campo localidade) | Sim |
| numero_fachada | Coluna NUMERO DE FACHADA | Sim |
| id_complemento1 | CODIGOS_COMPLEMENTO[primeiras 2 letras de COMPLEMENTO 1] | Sim |
| argumento1 | Texto após 1º espaço de COMPLEMENTO 1 | Sim |
| id_complemento2 | CODIGOS_COMPLEMENTO[primeiras 2 letras de COMPLEMENTO 2] | Não (só se preenchido) |
| argumento2 | Texto após 1º espaço de COMPLEMENTO 2 | Não |
| id_complemento3 | CODIGOS_COMPLEMENTO[primeiras 2 letras de COMPLEMENTO 3] | Não (só se preenchido) |
| argumento3 | Texto após 1º espaço de COMPLEMENTO 3 | Não |
| logradouro | roteiro.xml (campo nome_lograd) | Sim |
| cep | roteiro.xml (via COD_LOGRAD) | Sim |
| bairro | roteiro.xml (campo bairro) | Sim |
| id_roteiro | roteiro.xml (campo id) | Sim |
| id_localidade | roteiro.xml (campo id_localidade) | Sim |
| cod_lograd | roteiro.xml (campo cod_lograd) ou coluna COD_LOGRAD | Sim |
| tecnico > id | 667945210 (fixo) | Sim |
| tecnico > nome | Campo do formulário "Nome do Técnico" | Sim |
| empresa > id | 42541126 (fixo) | Sim |
| empresa > nome | TELEMONT (fixo) | Sim |
| data | Timestamp yyyyMMddHHmmss | Sim |
| totalUCs | Quantidade de UCs geradas | Sim |
| ocupacao | EDIFICACAOCOMPLETA (fixo) | Sim |
| redeInterna | N (sem infra) / S (com infra) | Sim |
| fibrasConcorrencia | 133856749 (fixo) | Sim |
| uc > id_complemento3 | CODIGOS_COMPLEMENTO[LJ\|SL\|AP] conforme tipo do formulário (loja→59, sala→96, apartamento→9) | Sim |

7. Dicionário CODIGOS_COMPLEMENTO
Constante JavaScript com chave = 2 letras, valor = número. Exemplo: "QU" → 85, "LT" → 60, "LJ" → 59, "SL" → 96, "AP" → 9. Lista completa definida em content/content.js.

8. Função auxiliar parseComplemento(valor)
Extrai de uma string como "QU 10":
- id = valor do dicionário para as 2 primeiras letras ("QU" → 85)
- argumento = texto após o primeiro espaço ("10")
- Se o código não existir no dicionário, id fica vazio
- Se não houver espaço, argumento fica vazio

9. Planilha base para download
Botão no modal: "Baixar planilha base (modelo.csv)"
Gera CSV em memória (Blob) com cabeçalhos padronizados + 1 linha de exemplo.
Nome do arquivo: modelo_planilha.csv

10. Estrutura de Diretórios (sem alteração)
Manifest V3, content script JS puro, JSZip vendored, 3 imagens JPG.