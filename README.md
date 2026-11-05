# Netwin - Cadastro Survey

Extensão para Google Chrome / Edge (Manifest V3) que gera pacotes de survey (arquivos XML de edifício + imagens incorporadas) a partir de um arquivo CSV de dados e um arquivo XML de roteiro, empacotando tudo em um ZIP para download.

## 📋 O que faz

- Injeta um botão **"Edifício"** na navegação do site alvo (com fallback flutuante quando a nav não é encontrada).
- Abre um modal acessível (ARIA, foco preso, ESC para fechar) onde você:
  - Define o nome do arquivo (com preview ao vivo e sanitização).
  - Anexa o **Roteiro XML** (máx. 5 MB).
  - Anexa o **Survey CSV** (máx. 25 MB, detecção automática de delimitador: `,`, `;`, tab, `|`).
  - Configura infraestrutura (com / sem), pisos, numeração, tipo e destinação.
- Gera um **ZIP** com:
  - Uma pasta `edificioN` por linha de dados do CSV.
  - XML de edifício por pasta, preenchido com dados do roteiro + CSV.
  - 3 imagens embutidas em cada pasta.
  - Compactação DEFLATE nível 6.
- Disponibiliza botão para baixar a **planilha base (modelo.csv)** com cabeçalhos padronizados.
- Inclui também a funcionalidade **Moradia** (XML tipo `M`, pastas `moradiaN`, sem infraestrutura/UCs).

## 🔒 Restrições

- Execução restrita ao domínio: `*://netwin.vtal.intra/*`
- Sem servidor backend — todo o processamento é feito client-side no navegador.
- Limites de arquivo para evitar travar o navegador (5 MB XML / 25 MB CSV).

## 🚀 Como instalar

1. Abra o Chrome ou Edge.
2. Acesse `chrome://extensions` (ou `edge://extensions`).
3. Ative o **Modo do Desenvolvedor** (toggle no canto superior direito).
4. Clique em **Carregar descompactada**.
5. Selecione a pasta raiz deste repositório.
6. A extensão "Netwin - Cadastro Survey" estará instalada e ativa.

## 📖 Como usar

1. Acesse qualquer página dentro do domínio `netwin.vtal.intra`.
2. Clique no botão **"Edifício"** (injetado na navegação ou flutuante).
3. No modal:
   - Informe o **nome do arquivo**.
   - Selecione o **Roteiro XML**.
   - Selecione o **Survey CSV**.
   - Escolha **Infraestrutura** (com ou sem).
   - Se "sem", preencha pisos e numeração.
4. Clique em **Gerar ZIP**.
5. Ao finalizar, clique em **Download ZIP**.

## 📁 Estrutura do repositório

```
Netwin-extensao/
├── manifest.json              # Manifesto da extensão (MV3)
├── project.md                 # PDS (Project Design Specification)
├── check.md                   # Checklist de não-regressão para IA
├── README.md                  # Este arquivo
├── background/
│   └── service-worker.js      # Service worker da extensão
├── content/
│   ├── content.js             # Lógica principal (injeção, modais, geração ZIP)
│   └── content.css            # Estilos dos modais e botões
├── lib/
│   ├── jszip.min.js           # Biblioteca JSZip (vendored)
│   └── JSZip-LICENSE.markdown # Licença da JSZip
├── assets/
│   ├── img_preta_1.jpg
│   ├── img_preta_2.jpg
│   └── img_preta_3.jpg        # Imagens incorporadas nos ZIPs
└── Arquivos_modelo/
    ├── roteiro.xml            # Exemplo de roteiro XML
    └── MODELO PLANILHA.csv    # Exemplo de CSV de entrada
    └── edificio_modelo/
        └── edificio.xml       # Exemplo de XML de edifício
```

## 🧪 Qualidade

Consulte `check.md` para o checklist completo de não-regressão que deve ser verificado antes de qualquer alteração no código, garantindo que a versão funcionando (0.1.0) não sofra regressões.

## 📄 Licença

Esta extensão utiliza a biblioteca [JSZip](https://stukszip.github.io/jszip/) (vendored em `lib/`), sujeita à sua própria licença (MIT/Dual). Os demais arquivos são de responsabilidade do projeto Netwin.

---

> ⚠️ Extensão destinada a uso interno no domínio `netwin.vtal.intra`.
