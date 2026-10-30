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
- Injeção de botão "Cadastro Survey" na navegação do site alvo (com fallback flutuante quando a nav não é encontrada)
- Modal acessível (ARIA, foco preso, ESC para fechar) com:
- Campo de nome do arquivo (com preview ao vivo e sanitização de caracteres inválidos)
- Upload de Roteiro XML (máx. 5 MB)
- Upload de Survey CSV (máx. 25 MB, detecção automática de delimitador)
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
- Mapear linha do CSV ao roteiro via COD_LOGRADOURO ou combinação LOGRADOURO + BAIRRO
- Gerar UCs (unidades construtivas) automaticamente quando infra = "sem"
- Sanitizar nome do arquivo (remover espaços e caracteres inválidos para nomes de arquivo)
Não funcionais:
- Execução restrita ao domínio netwin.vtal.intra
- Sem servidor backend (tudo processado client-side)
- Limites de arquivo para evitar travar o navegador

6. Como Instalar e Usar
1. Abra chrome://extensions/ no Chrome ou Edge
2. Ative o "Modo do desenvolvedor" (toggle no canto superior direito)
3. Clique em "Carregar sem compactação" e selecione a pasta Netwin-extensao
4. Acesse qualquer página em netwin.vtal.intra
5. Clique no botão "Cadastro Survey" (na barra de navegação ou botão flutuante)
6. Preencha o nome do arquivo, anexe roteiro.xml e survey.csv, ajuste infraestrutura se necessário
7. Clique em "Gerar ZIP" e depois em "Download ZIP"
7. Roadmap / Melhorias Futuras
- Adicionar popup da extensão (ações do browser)
- Persistir configurações via chrome.storage
- Suporte a mais tipos de arquivo e validação de esquema XML
- Testes automatizados e lint/CI
- Internacionalização (i18n)