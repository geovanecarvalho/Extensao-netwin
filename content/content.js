(() => {
  "use strict";

  if (window.__netwinSurveyLoaded) {
    return;
  }
  window.__netwinSurveyLoaded = true;

  const NAV_XPATH = "//nav";
  const BUTTON_ID = "nw-survey-btn";
  const OVERLAY_ID = "nw-survey-overlay";
  const FALLBACK_DELAY_MS = 8000;
  const MAX_XML_BYTES = 5 * 1024 * 1024;
  const MAX_CSV_BYTES = 25 * 1024 * 1024;
  const GENERATION_PROGRESS_SHARE = 80;

  const MORADIA_BUTTON_ID = "nw-moradia-btn";
  const MORADIA_OVERLAY_ID = "nw-moradia-overlay";

  const IMAGE_MAP = [
    { zipName: "IMG PRETA.jpg", asset: "assets/img_preta_1.jpg" },
    { zipName: "img preta_1.jpg", asset: "assets/img_preta_2.jpg" },
    { zipName: "img preta_2.jpg", asset: "assets/img_preta_3.jpg" }
  ];

  const CODIGOS_COMPLEMENTO = {
    "AC": 1,
    "AA": 2,
    "AF": 3,
    "AL": 4,
    "AS": 5,
    "AB": 6,
    "AN": 7,
    "AX": 8,
    "AP": 9,
    "AZ": 10,
    "AT": 11,
    "BS": 12,
    "BA": 13,
    "BR": 14,
    "BC": 15,
    "BL": 16,
    "BX": 17,
    "CS": 18,
    "CM": 20,
    "CP": 21,
    "CA": 22,
    "CE": 23,
    "CT": 24,
    "CB": 25,
    "CL": 26,
    "CD": 27,
    "CJ": 28,
    "CR": 29,
    "CO": 30,
    "DP": 31,
    "DT": 32,
    "DV": 34,
    "ED": 35,
    "EN": 36,
    "ES": 37,
    "EC": 38,
    "ET": 39,
    "EP": 40,
    "FO": 42,
    "FR": 43,
    "FU": 44,
    "GL": 45,
    "GP": 46,
    "GA": 47,
    "GB": 48,
    "GJ": 49,
    "GR": 50,
    "GH": 52,
    "HG": 53,
    "LD": 55,
    "LM": 56,
    "LH": 57,
    "LE": 58,
    "LJ": 59,
    "LT": 60,
    "LO": 61,
    "M": 62,
    "MT": 63,
    "MC": 64,
    "MZ": 65,
    "MD": 66,
    "NC": 67,
    "OM": 68,
    "OG": 69,
    "PC": 70,
    "PR": 71,
    "PP": 72,
    "PV": 73,
    "PM": 74,
    "PS": 75,
    "PA": 76,
    "PL": 77,
    "P": 78,
    "PO": 80,
    "PT": 81,
    "PD": 82,
    "PE": 83,
    "QU": 85,
    "QT": 86,
    "KM": 87,
    "QN": 88,
    "QQ": 89,
    "RM": 90,
    "RP": 91,
    "RF": 92,
    "RT": 93,
    "RL": 95,
    "SL": 96,
    "SC": 97,
    "SR": 98,
    "SB": 100,
    "SJ": 101,
    "SD": 102,
    "SU": 103,
    "SS": 104,
    "SQ": 105,
    "TN": 106,
    "TO": 107,
    "TE": 109,
    "TV": 110,
    "TR": 111,
    "VL": 112,
    "VZ": 113,
    "AD": 114,
    "BI": 115,
    "SA": 116,
    "NA": 117,
    "SK": 118,
    "ND": 119,
    "SE": 120,
    "AM": 121,
    "NR": 122,
    "CH": 124
  };

  const ui = {
    overlay: null,
    modal: null,
    nameInput: null,
    namePreview: null,
    xmlInput: null,
    csvInput: null,
    xmlFileName: null,
    csvFileName: null,
    infraSelect: null,
    infraBlock: null,
    pisoInicialInput: null,
    pisoFinalInput: null,
    tipoSelect: null,
    destinacaoSelect: null,
    numInicialInput: null,
    numFinalInput: null,
    status: null,
    bar: null,
    barTrack: null,
    percent: null,
    generateBtn: null,
    downloadLink: null,
    closeButtons: [],
    busy: false,
    blobUrl: null,
    zipName: "",
    imagesPromise: null,
    lastFocused: null
  };

  const uiMoradia = {
    overlay: null,
    modal: null,
    nameInput: null,
    namePreview: null,
    xmlInput: null,
    csvInput: null,
    xmlFileName: null,
    csvFileName: null,
    status: null,
    bar: null,
    barTrack: null,
    percent: null,
    generateBtn: null,
    downloadLink: null,
    closeButtons: [],
    busy: false,
    blobUrl: null,
    zipName: "",
    imagesPromise: null,
    lastFocused: null
  };

  let fallbackMode = false;
  let fallbackTimer = null;
  let placementScheduled = false;
  let observer = null;

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  function findNav() {
    try {
      const result = document.evaluate(
        NAV_XPATH,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const node = result.singleNodeValue;
      if (node && node.nodeType === Node.ELEMENT_NODE) {
        return node;
      }
    } catch (error) {
      console.warn("[Netwin Survey] XPath da nav inválido:", error);
    }
    return (
      document.querySelector("nav") ||
      document.querySelector("header nav") ||
      document.querySelector('[role="navigation"]') ||
      null
    );
  }

  function createSurveyButton() {
    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Edifício";
    button.addEventListener("click", () => openModal(button));
    return button;
  }

  function createMoradiaButton() {
    const button = document.createElement("button");
    button.id = MORADIA_BUTTON_ID;
    button.type = "button";
    button.textContent = "Moradia";
    button.className = "nw-survey-btn--nav";
    button.addEventListener("click", () => openMoradiaModal(button));
    return button;
  }

  function placeButton() {
    if (!document.body) {
      return;
    }

    let edificioBtn = document.getElementById(BUTTON_ID);
    let moradiaBtn = document.getElementById(MORADIA_BUTTON_ID);
    const nav = findNav();

    if (!edificioBtn || !moradiaBtn) {
      if (!nav && !fallbackMode) {
        return;
      }
      if (!edificioBtn) {
        edificioBtn = createSurveyButton();
      }
      if (!moradiaBtn) {
        moradiaBtn = createMoradiaButton();
      }
      if (nav) {
        edificioBtn.classList.add("nw-survey-btn--nav");
        moradiaBtn.classList.add("nw-survey-btn--nav");
        nav.appendChild(edificioBtn);
        nav.appendChild(moradiaBtn);
      } else {
        edificioBtn.classList.add("nw-survey-btn--floating");
        moradiaBtn.classList.add("nw-survey-btn--floating");
        edificioBtn.title = "Menu de navegação não encontrado; botão em modo flutuante.";
        moradiaBtn.title = "Menu de navegação não encontrado; botão em modo flutuante.";
        document.body.appendChild(edificioBtn);
        document.body.appendChild(moradiaBtn);
      }
      return;
    }

    if (nav) {
      if (!nav.contains(edificioBtn)) {
        edificioBtn.classList.remove("nw-survey-btn--floating");
        edificioBtn.classList.add("nw-survey-btn--nav");
        edificioBtn.removeAttribute("title");
        nav.appendChild(edificioBtn);
      }
      if (!nav.contains(moradiaBtn)) {
        moradiaBtn.classList.remove("nw-survey-btn--floating");
        moradiaBtn.classList.add("nw-survey-btn--nav");
        moradiaBtn.removeAttribute("title");
        nav.appendChild(moradiaBtn);
      }
    }
  }

  function schedulePlacement() {
    if (placementScheduled || !document.body) {
      return;
    }
    placementScheduled = true;
    window.requestAnimationFrame(() => {
      placementScheduled = false;
      placeButton();
    });
  }

  function startButtonInjection() {
    placeButton();

    fallbackTimer = window.setTimeout(() => {
      fallbackMode = true;
      schedulePlacement();
    }, FALLBACK_DELAY_MS);

    observer = new MutationObserver(() => {
      schedulePlacement();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener(
      "beforeunload",
      () => {
        if (observer) {
          observer.disconnect();
        }
        if (fallbackTimer) {
          window.clearTimeout(fallbackTimer);
        }
      },
      { once: true }
    );
  }

  function createFileField(id, labelText, accept, hintText) {
    const field = createElement("label", "nw-survey-field");
    const label = createElement("span", "nw-survey-label", labelText);
    const input = document.createElement("input");
    input.type = "file";
    input.id = id;
    input.accept = accept;
    input.className = "nw-survey-file-input";

    const fileName = createElement(
      "small",
      "nw-survey-file-name",
      "Nenhum arquivo selecionado"
    );

    field.append(label, input, fileName);

    if (hintText) {
      field.append(createElement("small", "nw-survey-hint", hintText));
    }

    return { field, input, fileName };
  }

  function buildModal() {
    if (ui.overlay) {
      return;
    }

    const staleOverlay = document.getElementById(OVERLAY_ID);
    if (staleOverlay) {
      staleOverlay.remove();
    }

    const overlay = createElement("div", "nw-survey-overlay");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");

    const modal = createElement("div", "nw-survey-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "nw-survey-title");

    const header = createElement("div", "nw-survey-header");
    const title = createElement("h2", "nw-survey-title", "Edifício");
    title.id = "nw-survey-title";
    const headerClose = createElement("button", "nw-survey-icon-btn", "\u00d7");
    headerClose.type = "button";
    headerClose.setAttribute("aria-label", "Fechar");
    headerClose.title = "Fechar";
    headerClose.addEventListener("click", requestClose);
    header.append(title, headerClose);

    const body = createElement("div", "nw-survey-body");

    const nameField = createElement("label", "nw-survey-field");
    const nameLabel = createElement("span", "nw-survey-label", "Nome do arquivo *");
    const nameInput = document.createElement("input");
    nameInput.id = "nw-survey-name";
    nameInput.type = "text";
    nameInput.maxLength = 80;
    nameInput.placeholder = "Ex.: CATALAO";
    nameInput.autocomplete = "off";
    nameInput.spellcheck = false;
    nameInput.addEventListener("input", () => {
      updateNamePreview();
      updateGenerateState();
    });
    const nameHint = createElement("small", "nw-survey-hint");
    nameHint.append("Nome final: ");
    const namePreview = createElement("span", "nw-survey-name-preview", "\u2014");
    namePreview.id = "nw-survey-name-preview";
    nameHint.appendChild(namePreview);
    nameField.append(
      nameLabel,
      nameInput,
      nameHint,
      createElement(
        "small",
        "nw-survey-hint",
        "Espaços são removidos e caracteres inválidos para nomes de arquivo são descartados."
      )
    );

    const xmlField = createFileField(
      "nw-survey-xml",
      "Roteiro XML *",
      ".xml,application/xml,text/xml",
      "Arquivo de configuração (roteiro.xml)."
    );
    const csvField = createFileField(
      "nw-survey-csv",
      "Survey CSV *",
      ".csv,text/csv",
      "Cada linha de dados gera uma pasta edificioN."
    );

    xmlField.input.addEventListener("change", () => handleFileChange("xml"));
    csvField.input.addEventListener("change", () => handleFileChange("csv"));

    const btnDownloadModelo = document.createElement("button");
    btnDownloadModelo.type = "button";
    btnDownloadModelo.className = "nw-survey-btn nw-survey-btn--ghost";
    btnDownloadModelo.textContent = "Baixar planilha base (modelo.csv)";
    btnDownloadModelo.addEventListener("click", () => {
      const headers = [
        "UF",
        "MUNICIPIO",
        "BAIRRO",
        "NOME_ZONA",
        "LOGRADOURO",
        "COD_LOGRAD",
        "NUMERO DE FACHADA",
        "COMPLEMENTO 1",
        "COMPLEMENTO 2",
        "COMPLEMENTO 3",
        "LATITUDE",
        "LONGITUDE"
      ];
      const exemplo = [
        "GO",
        "GOIANIA",
        "SETOR DOS FUNCIONARIOS",
        "GO-GNA-SDO-CEOS-426",
        "RUA P 36",
        "2601500970",
        "SN",
        "QU 10",
        "LT 5",
        "CA 3",
        "-16.666750023",
        "-49.27583788"
      ];
      const csvContent = [headers.join(";"), exemplo.join(";")].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modelo_planilha.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    const infraField = createElement("label", "nw-survey-field");
    const infraLabel = createElement("span", "nw-survey-label", "Infraestrutura *");
    const infraSelect = document.createElement("select");
    infraSelect.id = "nw-survey-infra";
    infraSelect.className = "nw-survey-select";
    const optSem = document.createElement("option");
    optSem.value = "sem";
    optSem.textContent = "Sem Infraestrutura";
    const optCom = document.createElement("option");
    optCom.value = "com";
    optCom.textContent = "Com Infraestrutura";
    infraSelect.append(optSem, optCom);
    infraField.append(infraLabel, infraSelect);

    const infraBlock = createElement("div", "nw-survey-infra-block");
    infraBlock.hidden = true;

    const campoNumero = (id, labelText, min, placeholder) => {
      const field = createElement("label", "nw-survey-field");
      const label = createElement("span", "nw-survey-label", labelText);
      const input = document.createElement("input");
      input.id = id;
      input.type = "number";
      input.min = min;
      input.placeholder = placeholder;
      input.className = "nw-survey-number-input";
      field.append(label, input);
      return { field, input };
    };

    const campoSelect = (id, labelText, options) => {
      const field = createElement("label", "nw-survey-field");
      const label = createElement("span", "nw-survey-label", labelText);
      const select = document.createElement("select");
      select.id = id;
      select.className = "nw-survey-select";
      options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
      });
      field.append(label, select);
      return { field, select };
    };

    const pisoInicial = campoNumero("nw-survey-piso-inicial", "Piso inicial", "1", "Ex.: 1");
    const pisoFinal = campoNumero("nw-survey-piso-final", "Piso final", "1", "Ex.: 4");
    const tipo = campoSelect("nw-survey-tipo", "Tipo", [
      { value: "loja", label: "Loja" },
      { value: "sala", label: "Sala" },
      { value: "apartamento", label: "Apartamento" }
    ]);
    const destinacao = campoSelect("nw-survey-destinacao", "Destinação", [
      { value: "residencia", label: "Residência" },
      { value: "administracao", label: "Administração" },
      { value: "comercio_externo", label: "Comércio Externo" },
      { value: "comercio_interno", label: "Comércio Interno" }
    ]);
    const numInicial = campoNumero("nw-survey-num-inicial", "Numeração inicial", "1", "Ex.: 101");
    const numFinal = campoNumero("nw-survey-num-final", "Numeração final", "1", "Ex.: 408");

    infraBlock.append(
      pisoInicial.field,
      pisoFinal.field,
      tipo.field,
      destinacao.field,
      numInicial.field,
      numFinal.field
    );

    pisoInicial.input.addEventListener("input", updateGenerateState);
    pisoFinal.input.addEventListener("input", updateGenerateState);
    numInicial.input.addEventListener("input", updateGenerateState);
    numFinal.input.addEventListener("input", updateGenerateState);
    tipo.select.addEventListener("change", updateGenerateState);
    destinacao.select.addEventListener("change", updateGenerateState);

    infraSelect.addEventListener("change", () => {
      const sem = infraSelect.value === "sem";
      infraBlock.hidden = !sem;
      updateGenerateState();
    });

    const status = createElement(
      "div",
      "nw-survey-status",
      "Informe o nome do arquivo e selecione os dois arquivos."
    );
    status.id = "nw-survey-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const progressRow = createElement("div", "nw-survey-progress-row");
    const barTrack = createElement("div", "nw-survey-bar-track");
    barTrack.setAttribute("role", "progressbar");
    barTrack.setAttribute("aria-valuemin", "0");
    barTrack.setAttribute("aria-valuemax", "100");
    barTrack.setAttribute("aria-valuenow", "0");
    barTrack.setAttribute("aria-label", "Progresso da geração do ZIP");
    const bar = createElement("div", "nw-survey-bar-fill");
    barTrack.appendChild(bar);
    const percent = createElement("span", "nw-survey-percent", "0%");
    progressRow.append(barTrack, percent);

    body.append(
      nameField,
      xmlField.field,
      csvField.field,
      btnDownloadModelo,
      infraField,
      infraBlock,
      status,
      progressRow
    );

    const footer = createElement("div", "nw-survey-footer");
    const footerClose = createElement("button", "nw-survey-btn nw-survey-btn--ghost", "Fechar");
    footerClose.type = "button";
    footerClose.addEventListener("click", requestClose);

    const generateBtn = createElement(
      "button",
      "nw-survey-btn nw-survey-btn--primary",
      "Gerar ZIP"
    );
    generateBtn.type = "button";
    generateBtn.disabled = true;
    generateBtn.addEventListener("click", handleGenerate);

    const downloadLink = document.createElement("a");
    downloadLink.id = "nw-survey-download";
    downloadLink.className = "nw-survey-btn nw-survey-btn--download is-disabled";
    downloadLink.textContent = "Download ZIP";
    downloadLink.setAttribute("aria-disabled", "true");
    downloadLink.addEventListener("click", (event) => {
      if (!ui.blobUrl) {
        event.preventDefault();
        setStatus("Gere o ZIP antes de baixar.", "error");
      }
    });

    footer.append(footerClose, generateBtn, downloadLink);
    modal.append(header, body, footer);
    overlay.appendChild(modal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        requestClose();
      }
    });

    document.body.appendChild(overlay);

    ui.overlay = overlay;
    ui.modal = modal;
    ui.nameInput = nameInput;
    ui.namePreview = namePreview;
    ui.xmlInput = xmlField.input;
    ui.csvInput = csvField.input;
    ui.xmlFileName = xmlField.fileName;
    ui.csvFileName = csvField.fileName;
    ui.status = status;
    ui.bar = bar;
    ui.barTrack = barTrack;
    ui.percent = percent;
    ui.generateBtn = generateBtn;
    ui.downloadLink = downloadLink;
    ui.closeButtons = [headerClose, footerClose];
    ui.infraSelect = infraSelect;
    ui.infraBlock = infraBlock;
    ui.pisoInicialInput = pisoInicial.input;
    ui.pisoFinalInput = pisoFinal.input;
    ui.tipoSelect = tipo.select;
    ui.destinacaoSelect = destinacao.select;
    ui.numInicialInput = numInicial.input;
    ui.numFinalInput = numFinal.input;
  }

  function buildMoradiaModal() {
    if (uiMoradia.overlay) {
      return;
    }

    const staleOverlay = document.getElementById(MORADIA_OVERLAY_ID);
    if (staleOverlay) {
      staleOverlay.remove();
    }

    const overlay = createElement("div", "nw-survey-overlay");
    overlay.id = MORADIA_OVERLAY_ID;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");

    const modal = createElement("div", "nw-survey-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "nw-moradia-title");

    const header = createElement("div", "nw-survey-header");
    const title = createElement("h2", "nw-survey-title", "Moradia");
    title.id = "nw-moradia-title";
    const headerClose = createElement("button", "nw-survey-icon-btn", "\u00d7");
    headerClose.type = "button";
    headerClose.setAttribute("aria-label", "Fechar");
    headerClose.title = "Fechar";
    headerClose.addEventListener("click", closeMoradiaModal);
    header.append(title, headerClose);

    const body = createElement("div", "nw-survey-body");

    const nameField = createElement("label", "nw-survey-field");
    const nameLabel = createElement("span", "nw-survey-label", "Nome do arquivo *");
    const nameInput = document.createElement("input");
    nameInput.id = "nw-moradia-name";
    nameInput.type = "text";
    nameInput.maxLength = 80;
    nameInput.placeholder = "Ex.: CATALAO";
    nameInput.autocomplete = "off";
    nameInput.spellcheck = false;
    nameInput.addEventListener("input", () => {
      updateMoradiaNamePreview();
      updateMoradiaGenerateState();
    });
    const nameHint = createElement("small", "nw-survey-hint");
    nameHint.append("Nome final: ");
    const namePreview = createElement("span", "nw-survey-name-preview", "\u2014");
    namePreview.id = "nw-moradia-name-preview";
    nameHint.appendChild(namePreview);
    nameField.append(
      nameLabel,
      nameInput,
      nameHint,
      createElement(
        "small",
        "nw-survey-hint",
        "Espaços são removidos e caracteres inválidos para nomes de arquivo são descartados."
      )
    );

    const xmlField = createFileField(
      "nw-moradia-xml",
      "Roteiro XML *",
      ".xml,application/xml,text/xml",
      "Arquivo de configuração (roteiro.xml)."
    );
    const csvField = createFileField(
      "nw-moradia-csv",
      "Survey CSV *",
      ".csv,text/csv",
      "Cada linha de dados gera uma pasta moradiaN."
    );

    xmlField.input.addEventListener("change", () => {
      if (uiMoradia.xmlInput.files && uiMoradia.xmlInput.files[0]) {
        uiMoradia.xmlFileName.textContent = uiMoradia.xmlInput.files[0].name;
      } else {
        uiMoradia.xmlFileName.textContent = "Nenhum arquivo selecionado";
      }
      updateMoradiaFileStatus();
    });
    csvField.input.addEventListener("change", () => {
      if (uiMoradia.csvInput.files && uiMoradia.csvInput.files[0]) {
        uiMoradia.csvFileName.textContent = uiMoradia.csvInput.files[0].name;
      } else {
        uiMoradia.csvFileName.textContent = "Nenhum arquivo selecionado";
      }
      updateMoradiaFileStatus();
    });

    const btnDownloadModeloMoradia = document.createElement("button");
    btnDownloadModeloMoradia.type = "button";
    btnDownloadModeloMoradia.className = "nw-survey-btn nw-survey-btn--ghost";
    btnDownloadModeloMoradia.textContent = "Baixar planilha base (modelo.csv)";
    btnDownloadModeloMoradia.addEventListener("click", () => {
      const headers = [
        "UF",
        "MUNICIPIO",
        "BAIRRO",
        "NOME_ZONA",
        "LOGRADOURO",
        "COD_LOGRAD",
        "NUMERO DE FACHADA",
        "COMPLEMENTO 1",
        "COMPLEMENTO 2",
        "COMPLEMENTO 3",
        "LATITUDE",
        "LONGITUDE"
      ];
      const exemplo = [
        "GO",
        "GOIANIA",
        "SETOR DOS FUNCIONARIOS",
        "GO-GNA-SDO-CEOS-426",
        "RUA P 36",
        "2601500970",
        "SN",
        "QU 10",
        "LT 5",
        "CA 3",
        "-16.666750023",
        "-49.27583788"
      ];
      const csvContent = [headers.join(";"), exemplo.join(";")].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modelo_planilha.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    const status = createElement(
      "div",
      "nw-survey-status",
      "Informe o nome do arquivo e selecione os dois arquivos."
    );
    status.id = "nw-moradia-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const progressRow = createElement("div", "nw-survey-progress-row");
    const barTrack = createElement("div", "nw-survey-bar-track");
    barTrack.setAttribute("role", "progressbar");
    barTrack.setAttribute("aria-valuemin", "0");
    barTrack.setAttribute("aria-valuemax", "100");
    barTrack.setAttribute("aria-valuenow", "0");
    barTrack.setAttribute("aria-label", "Progresso da geração do ZIP");
    const bar = createElement("div", "nw-survey-bar-fill");
    barTrack.appendChild(bar);
    const percent = createElement("span", "nw-survey-percent", "0%");
    progressRow.append(barTrack, percent);

    body.append(
      nameField,
      xmlField.field,
      csvField.field,
      btnDownloadModeloMoradia,
      status,
      progressRow
    );

    const footer = createElement("div", "nw-survey-footer");
    const footerClose = createElement("button", "nw-survey-btn nw-survey-btn--ghost", "Fechar");
    footerClose.type = "button";
    footerClose.addEventListener("click", closeMoradiaModal);

    const generateBtn = createElement(
      "button",
      "nw-survey-btn nw-survey-btn--primary",
      "Gerar ZIP"
    );
    generateBtn.type = "button";
    generateBtn.disabled = true;
    generateBtn.addEventListener("click", handleMoradiaGenerate);

    const downloadLink = document.createElement("a");
    downloadLink.id = "nw-moradia-download";
    downloadLink.className = "nw-survey-btn nw-survey-btn--download is-disabled";
    downloadLink.textContent = "Download ZIP";
    downloadLink.setAttribute("aria-disabled", "true");
    downloadLink.addEventListener("click", (event) => {
      if (!uiMoradia.blobUrl) {
        event.preventDefault();
        setMoradiaStatus("Gere o ZIP antes de baixar.", "error");
      }
    });

    footer.append(footerClose, generateBtn, downloadLink);
    modal.append(header, body, footer);
    overlay.appendChild(modal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeMoradiaModal();
      }
    });

    document.body.appendChild(overlay);

    uiMoradia.overlay = overlay;
    uiMoradia.modal = modal;
    uiMoradia.nameInput = nameInput;
    uiMoradia.namePreview = namePreview;
    uiMoradia.xmlInput = xmlField.input;
    uiMoradia.csvInput = csvField.input;
    uiMoradia.xmlFileName = xmlField.fileName;
    uiMoradia.csvFileName = csvField.fileName;
    uiMoradia.status = status;
    uiMoradia.bar = bar;
    uiMoradia.barTrack = barTrack;
    uiMoradia.percent = percent;
    uiMoradia.generateBtn = generateBtn;
    uiMoradia.downloadLink = downloadLink;
    uiMoradia.closeButtons = [headerClose, footerClose];
  }

  function openMoradiaModal(trigger) {
    buildMoradiaModal();

    if (!document.body.contains(uiMoradia.overlay)) {
      document.body.appendChild(uiMoradia.overlay);
    }

    resetMoradiaModal();
    uiMoradia.lastFocused = trigger || document.activeElement;
    uiMoradia.overlay.hidden = false;
    uiMoradia.overlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => uiMoradia.nameInput.focus(), 0);
  }

  function closeMoradiaModal() {
    if (!uiMoradia.overlay) {
      return;
    }

    revokeMoradiaBlobUrl();
    uiMoradia.overlay.hidden = true;
    uiMoradia.overlay.setAttribute("aria-hidden", "true");

    const lastFocused = uiMoradia.lastFocused;
    uiMoradia.lastFocused = null;
    if (lastFocused && typeof lastFocused.focus === "function" && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }

  function resetMoradiaModal() {
    revokeMoradiaBlobUrl();
    uiMoradia.nameInput.value = "";
    uiMoradia.xmlInput.value = "";
    uiMoradia.csvInput.value = "";
    uiMoradia.xmlFileName.textContent = "Nenhum arquivo selecionado";
    uiMoradia.csvFileName.textContent = "Nenhum arquivo selecionado";
    setMoradiaProgress(0);
    setMoradiaStatus("Informe o nome do arquivo e selecione os dois arquivos.");
    updateMoradiaNamePreview();
    updateMoradiaGenerateState();
  }

  function setMoradiaBusy(busy) {
    uiMoradia.busy = busy;
    uiMoradia.overlay.classList.toggle("nw-survey-busy", busy);
    uiMoradia.nameInput.disabled = busy;
    uiMoradia.xmlInput.disabled = busy;
    uiMoradia.csvInput.disabled = busy;
    uiMoradia.closeButtons.forEach((button) => {
      button.disabled = busy;
    });
    updateMoradiaGenerateState();
  }

  function updateMoradiaGenerateState() {
    const hasName = Boolean(sanitizeBaseName(uiMoradia.nameInput.value));
    const hasFiles = Boolean(
      uiMoradia.xmlInput.files && uiMoradia.xmlInput.files[0] &&
      uiMoradia.csvInput.files && uiMoradia.csvInput.files[0]
    );
    const formValido = hasName && hasFiles;

    uiMoradia.generateBtn.disabled = uiMoradia.busy || !formValido;
  }

  function updateMoradiaNamePreview() {
    const cleaned = sanitizeBaseName(uiMoradia.nameInput.value);
    uiMoradia.namePreview.textContent = cleaned ? `${cleaned}_yyyyMMddHHmmss.zip` : "\u2014";
  }

  function updateMoradiaFileStatus() {
    const hasXml = Boolean(uiMoradia.xmlInput.files && uiMoradia.xmlInput.files[0]);
    const hasCsv = Boolean(uiMoradia.csvInput.files && uiMoradia.csvInput.files[0]);

    if (hasXml && hasCsv) {
      setMoradiaStatus("Arquivos selecionados. Clique em Gerar ZIP.");
    } else if (hasXml) {
      setMoradiaStatus("Roteiro selecionado. Selecione o survey.csv.");
    } else if (hasCsv) {
      setMoradiaStatus("CSV selecionado. Selecione o roteiro.xml.");
    } else {
      setMoradiaStatus("Informe o nome do arquivo e selecione os dois arquivos.");
    }
    updateMoradiaGenerateState();
  }

  function setMoradiaStatus(message, tone) {
    uiMoradia.status.textContent = message;
    uiMoradia.status.classList.toggle("nw-survey-status--error", tone === "error");
    uiMoradia.status.classList.toggle("nw-survey-status--success", tone === "success");
  }

  function setMoradiaProgress(percent, message, tone) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    uiMoradia.bar.style.width = `${value}%`;
    uiMoradia.barTrack.setAttribute("aria-valuenow", String(Math.round(value)));
    uiMoradia.percent.textContent = `${Math.round(value)}%`;
    if (message) {
      setMoradiaStatus(message, tone);
    }
  }

  function revokeMoradiaBlobUrl() {
    if (uiMoradia.blobUrl) {
      URL.revokeObjectURL(uiMoradia.blobUrl);
      uiMoradia.blobUrl = null;
    }
    uiMoradia.zipName = "";
    if (uiMoradia.downloadLink) {
      uiMoradia.downloadLink.removeAttribute("href");
      uiMoradia.downloadLink.classList.add("is-disabled");
      uiMoradia.downloadLink.setAttribute("aria-disabled", "true");
    }
  }

  function openModal(trigger) {
    buildModal();

    if (!document.body.contains(ui.overlay)) {
      document.body.appendChild(ui.overlay);
    }

    resetModal();
    ui.lastFocused = trigger || document.activeElement;
    ui.overlay.hidden = false;
    ui.overlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => ui.nameInput.focus(), 0);
  }

  function requestClose() {
    if (ui.busy) {
      setStatus("Processando o ZIP. Aguarde a conclusão.", "error");
      return;
    }
    closeModal();
  }

  function closeModal() {
    if (!ui.overlay) {
      return;
    }

    revokeBlobUrl();
    ui.overlay.hidden = true;
    ui.overlay.setAttribute("aria-hidden", "true");

    const lastFocused = ui.lastFocused;
    ui.lastFocused = null;
    if (lastFocused && typeof lastFocused.focus === "function" && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }

  function resetModal() {
    revokeBlobUrl();
    ui.nameInput.value = "";
    ui.xmlInput.value = "";
    ui.csvInput.value = "";
    ui.xmlFileName.textContent = "Nenhum arquivo selecionado";
    ui.csvFileName.textContent = "Nenhum arquivo selecionado";
    ui.infraSelect.value = "sem";
    ui.infraBlock.hidden = false;
    ui.pisoInicialInput.value = "";
    ui.pisoFinalInput.value = "";
    ui.tipoSelect.value = "loja";
    ui.destinacaoSelect.value = "residencia";
    ui.numInicialInput.value = "";
    ui.numFinalInput.value = "";
    setProgress(0);
    setStatus("Informe o nome do arquivo e selecione os dois arquivos.");
    updateNamePreview();
    updateGenerateState();
  }

  function setBusy(busy) {
    ui.busy = busy;
    ui.overlay.classList.toggle("nw-survey-busy", busy);
    ui.nameInput.disabled = busy;
    ui.xmlInput.disabled = busy;
    ui.csvInput.disabled = busy;
    ui.closeButtons.forEach((button) => {
      button.disabled = busy;
    });
    updateGenerateState();
  }

  function updateGenerateState() {
    const hasName = Boolean(sanitizeBaseName(ui.nameInput.value));
    const hasFiles = Boolean(
      ui.xmlInput.files && ui.xmlInput.files[0] &&
      ui.csvInput.files && ui.csvInput.files[0]
    );
    let formValido = hasName && hasFiles;

    if (ui.infraSelect.value === "sem") {
      const pisoInicial = Number(ui.pisoInicialInput.value);
      const pisoFinal = Number(ui.pisoFinalInput.value);
      const numInicial = Number(ui.numInicialInput.value);
      const numFinal = Number(ui.numFinalInput.value);
      formValido =
        formValido &&
        Number.isInteger(pisoInicial) && pisoInicial > 0 &&
        Number.isInteger(pisoFinal) && pisoFinal > 0 &&
        Number.isInteger(numInicial) && numInicial > 0 &&
        Number.isInteger(numFinal) && numFinal > 0 &&
        pisoFinal >= pisoInicial &&
        numFinal >= numInicial;
    }

    ui.generateBtn.disabled = ui.busy || !formValido;
  }

  function updateNamePreview() {
    const cleaned = sanitizeBaseName(ui.nameInput.value);
    ui.namePreview.textContent = cleaned ? `${cleaned}_yyyyMMddHHmmss.zip` : "\u2014";
  }

  function sanitizeBaseName(value) {
    return String(value)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "");
  }

  function handleFileChange(kind) {
    const isXml = kind === "xml";
    const input = isXml ? ui.xmlInput : ui.csvInput;
    const fileName = isXml ? ui.xmlFileName : ui.csvFileName;
    const expectedExtension = isXml ? ".xml" : ".csv";
    const label = isXml ? "roteiro.xml" : "survey.csv";
    const maxBytes = isXml ? MAX_XML_BYTES : MAX_CSV_BYTES;
    const file = input.files && input.files[0];

    if (!file) {
      fileName.textContent = "Nenhum arquivo selecionado";
      updateFileStatus();
      return;
    }

    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      input.value = "";
      fileName.textContent = "Nenhum arquivo selecionado";
      setStatus(`Selecione um arquivo ${expectedExtension.toUpperCase()} válido para ${label}.`, "error");
      return;
    }

    if (file.size === 0) {
      input.value = "";
      fileName.textContent = "Nenhum arquivo selecionado";
      setStatus(`O arquivo ${label} está vazio.`, "error");
      return;
    }

    if (file.size > maxBytes) {
      input.value = "";
      fileName.textContent = "Nenhum arquivo selecionado";
      setStatus(
        `O arquivo ${label} excede o limite de ${Math.round(maxBytes / (1024 * 1024))} MB.`,
        "error"
      );
      return;
    }

    fileName.textContent = file.name;
    updateFileStatus();
  }

  function updateFileStatus() {
    const hasXml = Boolean(ui.xmlInput.files && ui.xmlInput.files[0]);
    const hasCsv = Boolean(ui.csvInput.files && ui.csvInput.files[0]);

    if (hasXml && hasCsv) {
      setStatus("Arquivos selecionados. Clique em Gerar ZIP.");
    } else if (hasXml) {
      setStatus("Roteiro selecionado. Selecione o survey.csv.");
    } else if (hasCsv) {
      setStatus("CSV selecionado. Selecione o roteiro.xml.");
    } else {
      setStatus("Informe o nome do arquivo e selecione os dois arquivos.");
    }
    updateGenerateState();
  }

  function setStatus(message, tone) {
    ui.status.textContent = message;
    ui.status.classList.toggle("nw-survey-status--error", tone === "error");
    ui.status.classList.toggle("nw-survey-status--success", tone === "success");
  }

  function setProgress(percent, message, tone) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    ui.bar.style.width = `${value}%`;
    ui.barTrack.setAttribute("aria-valuenow", String(Math.round(value)));
    ui.percent.textContent = `${Math.round(value)}%`;
    if (message) {
      setStatus(message, tone);
    }
  }

  function formatTimestamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join("");
  }

  function yieldToUi() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
    });
  }

  async function readTextFile(file, maxBytes, label) {
    if (file.size === 0) {
      throw new Error(`O arquivo ${label} está vazio.`);
    }
    if (file.size > maxBytes) {
      throw new Error(
        `O arquivo ${label} excede o limite de ${Math.round(maxBytes / (1024 * 1024))} MB.`
      );
    }
    return file.text();
  }

  function detectDelimiter(text) {
    const candidates = [",", ";", "\t"];
    const firstLine = text.split(/\r?\n/).find((line) => line.trim() !== "") || "";
    let best = ",";
    let bestCount = 0;

    candidates.forEach((delimiter) => {
      let count = 0;
      let inQuotes = false;

      for (let i = 0; i < firstLine.length; i += 1) {
        const char = firstLine[i];
        if (char === '"') {
          if (inQuotes && firstLine[i + 1] === '"') {
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          count += 1;
        }
      }

      if (count > bestCount) {
        bestCount = count;
        best = delimiter;
      }
    });

    return best;
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(field);
        field = "";
      } else if (char === "\r") {
        continue;
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (inQuotes) {
      throw new Error("survey.csv inválido: há aspas não fechadas.");
    }

    if (field !== "" || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  function parseSurveyCsv(text) {
    const normalized = String(text)
      .replace(/^\uFEFF/, "")
      .replace(/\u0000/g, "");
    if (!normalized.trim()) {
      throw new Error("survey.csv está vazio.");
    }

    const tryDelimiters = [",", ";", "\t", "|"];
    let matrix = null;
    let chosenDelimiter = ",";
    for (const delim of tryDelimiters) {
      const candidate = parseDelimited(normalized, delim);
      const nonEmpty = candidate.filter((row) =>
        row.some((cell) => String(cell).trim() !== "")
      );
      if (nonEmpty.length > 1 && nonEmpty[0].length > 1) {
        matrix = candidate;
        chosenDelimiter = delim;
        break;
      }
    }

    if (!matrix) {
      matrix = parseDelimited(normalized, detectDelimiter(normalized));
    }

    const nonEmptyRows = matrix.filter((row) =>
      row.some((cell) => String(cell).trim() !== "")
    );

    if (nonEmptyRows.length === 0) {
      throw new Error("survey.csv está vazio.");
    }

    if (nonEmptyRows.length === 1) {
      throw new Error("survey.csv não contém linhas de dados (apenas cabeçalho).");
    }

    const headerRow = nonEmptyRows[0];
    const dataRows = nonEmptyRows.slice(1);
    const headers = headerRow.map(
      (cell, index) => String(cell).trim() || `coluna${index + 1}`
    );
    const width = Math.max(
      headers.length,
      ...dataRows.map((row) => row.length)
    );

    while (headers.length < width) {
      headers.push(`coluna${headers.length + 1}`);
    }

    const rows = dataRows.map((row) => {
      const cells = row.map((cell) => String(cell));
      while (cells.length < width) {
        cells.push("");
      }
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cells[i] ?? "";
      });
      return obj;
    });

    return { headers, rows };
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function normalizarCoordenada(valor) {
    const s = String(valor).trim();
    if (!s) return "";
    const negativo = s.startsWith("-");
    const limpo = s.replace(/-/g, "").replace(/\./g, "").replace(/,/g, ".");
    const partes = limpo.split(".");
    let inteiro = "";
    let decimal = "";
    if (partes.length > 1) {
      inteiro = partes[0].slice(0, 2);
      decimal = partes[0].slice(2) + "." + partes.slice(1).join("");
      decimal = decimal.replace(/\./g, "");
    } else {
      inteiro = limpo.slice(0, 2);
      decimal = limpo.slice(2);
    }
    if (!inteiro) inteiro = "0";
    if (!decimal) decimal = "0";
    const resultado = (negativo ? "-" : "") + inteiro + "." + decimal;
    return resultado;
  }

  function parseComplemento2(valor) {
    const s = String(valor).trim();
    if (!s) return "";
    const match = s.match(/\d+/);
    return match ? match[0] : "";
  }

  function parseComplemento(valor) {
    const s = String(valor).trim();
    if (!s) return { id: "", argumento: "" };
    const codigo = s.slice(0, 2);
    const resto = s.slice(2).trim();
    const argumento = resto.length > 0 ? resto : "";
    const id = CODIGOS_COMPLEMENTO[codigo] !== undefined ? String(CODIGOS_COMPLEMENTO[codigo]) : "";
    return { id, argumento };
  }

  function parseRoteiroXml(text) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error("roteiro.xml inválido.");
    }
    const roteiros = [];
    const elementos = doc.querySelectorAll("roteiro");
    for (const el of elementos) {
      const get = (tag) => {
        const node = el.querySelector(tag);
        return node ? node.textContent.trim() : "";
      };
      roteiros.push({
        id: get("id"),
        uf: get("uf"),
        uf_abrev: get("uf_abrev"),
        cod_municipio: get("cod_municipio"),
        municipio: get("municipio"),
        id_localidade: get("id_localidade"),
        cod_localidade: get("cod_localidade"),
        localidade: get("localidade"),
        localidade_abrev: get("localidade_abrev"),
        cod_bairro: get("cod_bairro"),
        bairro: get("bairro"),
        cod_lograd: get("cod_lograd"),
        nome_lograd: get("nome_lograd"),
        id_tipo_lograd: get("id_tipo_lograd"),
        tipo_lograd: get("tipo_lograd"),
        tipo_lograd_abrev: get("tipo_lograd_abrev"),
        id_titulo: get("id_titulo"),
        titulo: get("titulo"),
        titulo_abrev: get("titulo_abrev"),
        cep: get("cep")
      });
    }
    return roteiros;
  }

  function buscarRoteiro(roteiros, linha) {
    const codLograd = String(linha.COD_LOGRAD || "").trim();
    const logradouro = String(linha.LOGRADOURO || "").trim();
    const bairro = String(linha.BAIRRO || "").trim();

    if (codLograd) {
      const match = roteiros.find((r) => String(r.cod_lograd).trim() === codLograd);
      if (match) return match;
    }

    if (logradouro && bairro) {
      return roteiros.find(
        (r) => String(r.nome_lograd).trim().toLowerCase() === logradouro.toLowerCase()
          && String(r.bairro).trim().toLowerCase() === bairro.toLowerCase()
      );
    }

    return null;
  }

  function buildPlaceholderXml(index, headers, cells) {
    const fields = headers.map(
      (header, fieldIndex) =>
        `    <campo nome="${escapeXml(header)}">${escapeXml(cells[fieldIndex] ?? "")}</campo>`
    );
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<edificio id="${index}">`,
      ...fields,
      "</edificio>",
      ""
    ].join("\n");
  }

  function validateXml(text, label) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      const detail = parserError.textContent.trim().replace(/\s+/g, " ").slice(0, 180);
      throw new Error(`${label} inválido${detail ? `: ${detail}` : "."}`);
    }
    return doc;
  }

  function loadImages() {
    if (!ui.imagesPromise) {
      ui.imagesPromise = Promise.all(
        IMAGE_MAP.map(async (image) => {
          const response = await fetch(chrome.runtime.getURL(image.asset));
          if (!response.ok) {
            throw new Error(
              `Não foi possível carregar ${image.asset} (HTTP ${response.status}).`
            );
          }
          const data = await response.arrayBuffer();
          if (!data.byteLength) {
            throw new Error(`A imagem ${image.asset} está vazia.`);
          }
          return { zipName: image.zipName, data };
        })
      ).catch((error) => {
        ui.imagesPromise = null;
        throw error;
      });
    }
    return ui.imagesPromise;
  }

  function revokeBlobUrl() {
    if (ui.blobUrl) {
      URL.revokeObjectURL(ui.blobUrl);
      ui.blobUrl = null;
    }
    ui.zipName = "";
    if (ui.downloadLink) {
      ui.downloadLink.removeAttribute("href");
      ui.downloadLink.classList.add("is-disabled");
      ui.downloadLink.setAttribute("aria-disabled", "true");
    }
  }

  function gerarUcs(config) {
    const ucs = [];
    const pisoInicial = Number(config.pisoInicial);
    const pisoFinal = Number(config.pisoFinal);
    const numInicial = Number(config.numInicial);
    const numFinal = Number(config.numFinal);
    const destinacaoMap = {
      residencia: "RESIDENCIA",
      administracao: "ADMINISTRACAO",
      comercio_externo: "COMERCIOEXTERNO",
      comercio_interno: "COMERCIOINTERNO"
    };
    const destinacao = destinacaoMap[config.destinacao] || "RESIDENCIA";

    const tipoMap = { loja: "LJ", sala: "SL", apartamento: "AP" };
    const codigoTipo = tipoMap[config.tipo] || "AP";
    const idComplemento3 = CODIGOS_COMPLEMENTO[codigoTipo] !== undefined
      ? CODIGOS_COMPLEMENTO[codigoTipo]
      : 9;

    const offsetInicial = numInicial % 100;
    const offsetFinal = numFinal % 100;
    const salasPorAndar = offsetFinal - offsetInicial + 1;

    if (salasPorAndar <= 0) {
      return ucs;
    }

    for (let piso = pisoInicial; piso <= pisoFinal; piso += 1) {
      const base = piso * 100;
      for (let offset = offsetInicial; offset <= offsetFinal; offset += 1) {
        const num = base + offset;
        ucs.push({
          destinacao,
          id_complemento3: idComplemento3,
          argumento3: num,
          id_complemento4: 7,
          argumento4_logico: piso,
          argumento4_real: piso
        });
      }
    }
    return ucs;
  }

  function buildCaixasEntradaXml(ucs) {
    const totalUCs = ucs.length;
    const ucsXml = ucs.map(
      (uc) => `        <uc>
          <destinacao>${escapeXml(uc.destinacao)}</destinacao>
          <id_complemento3>${escapeXml(uc.id_complemento3)}</id_complemento3>
          <argumento3>${escapeXml(uc.argumento3)}</argumento3>
          <id_complemento4>${escapeXml(uc.id_complemento4)}</id_complemento4>
          <argumento4_logico>${escapeXml(uc.argumento4_logico)}</argumento4_logico>
          <argumento4_real>${escapeXml(uc.argumento4_real)}</argumento4_real>
        </uc>`
    ).join("\n");

    return [
      "  <caixasEntrada>",
      "    <caixaEntrada>",
      "      <id>1</id>",
      "      <dimensoes>",
      "        <x>600</x>",
      "        <y>600</y>",
      "        <z>100</z>",
      "      </dimensoes>",
      `      <totalUCs>${totalUCs}</totalUCs>`,
      "      <piso>0</piso>",
      "      <localizacao>Corredor</localizacao>",
      "      <id_divisao_int>117</id_divisao_int>",
      "      <entradasCabos>",
      "        <entradaCabos>",
      "          <tipo>Subterrânea</tipo>",
      "          <comprimento>50</comprimento>",
      "          <passagemFO>Entre 1 cm e 2 cm</passagemFO>",
      "        </entradaCabos>",
      "      </entradasCabos>",
      "      <alojamentos>",
      "        <alojamento>",
      "          <modelo>",
      "            <id>10430</id>",
      "            <descricao>12 / 320 x 187 x 105 / CDOI 12 SC-APC (FURUKAWA)</descricao>",
      "          </modelo>",
      "        </alojamento>",
      "      </alojamentos>",
      "      <prumadas>",
      "        <prumada>",
      "          <id>1</id>",
      "          <idCE>1</idCE>",
      "          <valoresPassagemFO>Entre 1 cm e 2 cm</valoresPassagemFO>",
      `          <totalUCs>${totalUCs}</totalUCs>`,
      "          <totalPisos>4</totalPisos>",
      "          <id_divisao_int>117</id_divisao_int>",
      "          <atendimento>P</atendimento>",
      "          <distanciaCE>50</distanciaCE>",
      "          <caixasPiso>",
      "            <caixaPiso>",
      "              <id>1</id>",
      "              <piso>1</piso>",
      "              <idPrumada>1</idPrumada>",
      "              <dimensoes>",
      "                <x>600</x>",
      "                <y>600</y>",
      "                <z>100</z>",
      "              </dimensoes>",
      "              <alojamentos>",
      "                <alojamento>",
      "                  <modelo>",
      "                    <id>10489</id>",
      "                    <descricao>16 / 200 x 126 x 50 / CDOIA 16 (FURUKAWA)</descricao>",
      "                  </modelo>",
      "                </alojamento>",
      "              </alojamentos>",
      "            </caixaPiso>",
      "          </caixasPiso>",
      "          <ucs>",
      ucsXml,
      "          </ucs>",
      "        </prumada>",
      "      </prumadas>",
      "    </caixaEntrada>",
      "  </caixasEntrada>"
    ].join("\n");
  }

  function buildEdificioXml(index, linha, roteiro, config, ucs, infra) {
    const match = buscarRoteiro(roteiro, linha);
    const cep = match ? match.cep : "";
    const id_roteiro = match ? match.id : "";
    const id_localidade = match ? match.id_localidade : "";
    const cod_lograd = match ? match.cod_lograd : String(linha.COD_LOGRAD || "").trim();
    const nomeZona = String(linha.NOME_ZONA || "").trim();
    const localidade = match ? String(match.localidade || "").trim() : "";
    const tipoLograd = match ? String(match.tipo_lograd || "").trim() : "";
    const nomeLograd = match ? String(match.nome_lograd || "").trim() : "";
    const logradouro = (tipoLograd || nomeLograd) ? `${tipoLograd} ${nomeLograd}`.trim() : "";
    const numero_fachada = String(linha["NUMERO DE FACHADA"] || "").trim();
    const comp1 = parseComplemento(linha["COMPLEMENTO 1"] || "");
    const comp2 = parseComplemento(linha["COMPLEMENTO 2"] || "");
    const comp3 = parseComplemento(linha["COMPLEMENTO 3"] || "");
    const id_complemento1 = comp1.id;
    const argumento1 = comp1.argumento;
    const id_complemento2 = comp2.id;
    const argumento2 = comp2.argumento;
    const id_complemento3 = comp3.id;
    const argumento3 = comp3.argumento;
    const bairro = String(linha.BAIRRO || "").trim();
    const coordX = normalizarCoordenada(linha.LONGITUDE || "");
    const coordY = normalizarCoordenada(linha.LATITUDE || "");
    const data = formatTimestamp(new Date());
    const totalUCs = ucs.length;

    const redeInterna = config.infra === "com" ? "S" : "N";

    const complemento2Xml = (id_complemento2 || argumento2) ? [
      `    <id_complemento2>${escapeXml(id_complemento2)}</id_complemento2>`,
      `    <argumento2>${escapeXml(argumento2)}</argumento2>`
    ].join("\n") : "";

    const complemento3Xml = (id_complemento3 || argumento3) ? [
      `    <id_complemento3>${escapeXml(id_complemento3)}</id_complemento3>`,
      `    <argumento3>${escapeXml(argumento3)}</argumento3>`
    ].join("\n") : "";

    const complemento1Xml = (id_complemento1 || argumento1) ? [
      `    <id_complemento1>${escapeXml(id_complemento1)}</id_complemento1>`,
      `    <argumento1>${escapeXml(argumento1)}</argumento1>`
    ].join("\n") : "";

    const ucsXml = ucs.map(
      (uc) => `    <uc>
      <destinacao>${escapeXml(uc.destinacao)}</destinacao>
      <id_complemento3>${escapeXml(uc.id_complemento3)}</id_complemento3>
      <argumento3>${escapeXml(uc.argumento3)}</argumento3>
      <id_complemento4>${escapeXml(uc.id_complemento4)}</id_complemento4>
      <argumento4_logico>${escapeXml(uc.argumento4_logico)}</argumento4_logico>
      <argumento4_real>${escapeXml(uc.argumento4_real)}</argumento4_real>
    </uc>`
    ).join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8" standalone=\'yes\' ?>',
      '<edificio xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '          xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
      '          versao="7.9.2" autorizacao="5590eeaed0604e85ba7a72fe5dc92e1e" tipo="E">',
      "  <gravado>false</gravado>",
      "  <idCEMobile>1</idCEMobile>",
      `  <coordX>${escapeXml(coordX)}</coordX>`,
      `  <coordY>${escapeXml(coordY)}</coordY>`,
      `  <codigoZona>${escapeXml(nomeZona)}</codigoZona>`,
      `  <nomeZona>${escapeXml(nomeZona)}</nomeZona>`,
      `  <localidade>${escapeXml(localidade)}</localidade>`,
      "  <enderecoEdificio>",
      `    <logradouro>${escapeXml(logradouro)}</logradouro>`,
      `    <numero_fachada>${escapeXml(numero_fachada)}</numero_fachada>`,
      ...(complemento1Xml ? [`\n${complemento1Xml}`] : []),
      ...(complemento2Xml ? [`\n${complemento2Xml}`] : []),
      ...(complemento3Xml ? [`\n${complemento3Xml}`] : []),
      `    <cep>${escapeXml(cep)}</cep>`,
      `    <bairro>${escapeXml(bairro)}</bairro>`,
      `    <id_roteiro>${escapeXml(id_roteiro)}</id_roteiro>`,
      `    <id_localidade>${escapeXml(id_localidade)}</id_localidade>`,
      `    <cod_lograd>${escapeXml(cod_lograd)}</cod_lograd>`,
      "  </enderecoEdificio>",
      "  <tecnico>",
      "    <id>4382171061</id>",
      "    <nome>PROJETO TELEMONT</nome>",
      "  </tecnico>",
      "  <empresa>",
      "    <id>42541126</id>",
      "    <nome>TELEMONT</nome>",
      "  </empresa>",
      `  <data>${escapeXml(data)}</data>`,
      `  <totalUCs>${totalUCs}</totalUCs>`,
      "  <ocupacao>EDIFICACAOCOMPLETA</ocupacao>",
      `  <redeInterna>${redeInterna}</redeInterna>`,
      "  <infoFotos>",
      "    <fotoInteriorEdificio>IMG PRETA.jpg</fotoInteriorEdificio>",
      "    <fotoExteriorEdificio>img preta_1.jpg</fotoExteriorEdificio>",
      "    <fotoFachadaEdificio>img preta_2.jpg</fotoFachadaEdificio>",
      "  </infoFotos>",
      "  <fibrasConcorrencia>133856749</fibrasConcorrencia>",
      ...(infra === "com" ? [buildCaixasEntradaXml(ucs)] : []),
      ...(infra === "com" ? [] : ["  <ucs>", ucsXml, "  </ucs>"]),
      "</edificio>",
      ""
    ].join("\n");
  }

  function buildMoradiaXml(index, linha, roteiro) {
    const match = buscarRoteiro(roteiro, linha);
    const cep = match ? match.cep : "";
    const id_roteiro = match ? match.id : "";
    const id_localidade = match ? match.id_localidade : "";
    const cod_lograd = match ? match.cod_lograd : String(linha.COD_LOGRAD || "").trim();
    const nomeZona = String(linha.NOME_ZONA || "").trim();
    const localidade = match ? String(match.localidade || "").trim() : "";
    const tipoLograd = match ? String(match.tipo_lograd || "").trim() : "";
    const nomeLograd = match ? String(match.nome_lograd || "").trim() : "";
    const logradouro = (tipoLograd || nomeLograd) ? `${tipoLograd} ${nomeLograd}`.trim() : "";
    const numero_fachada = String(linha["NUMERO DE FACHADA"] || "").trim();
    const bairro = String(linha.BAIRRO || "").trim();
    const coordX = normalizarCoordenada(linha.LONGITUDE || "");
    const coordY = normalizarCoordenada(linha.LATITUDE || "");
    const data = formatTimestamp(new Date());

    const comp1 = parseComplemento(linha["COMPLEMENTO 1"] || "");
    const comp2 = parseComplemento(linha["COMPLEMENTO 2"] || "");
    const comp3 = parseComplemento(linha["COMPLEMENTO 3"] || "");

    const id_complemento1 = comp1.id;
    const argumento1 = comp1.argumento;
    const id_complemento2 = comp2.id;
    const argumento2 = comp2.argumento;
    const id_complemento3 = comp3.id;
    const argumento3 = comp3.argumento;

    const complemento2Xml = (id_complemento2 || argumento2) ? [
      `    <id_complemento2>${escapeXml(id_complemento2)}</id_complemento2>`,
      `    <argumento2>${escapeXml(argumento2)}</argumento2>`
    ].join("\n") : "";

    const complemento3Xml = (id_complemento3 || argumento3) ? [
      `    <id_complemento3>${escapeXml(id_complemento3)}</id_complemento3>`,
      `    <argumento3>${escapeXml(argumento3)}</argumento3>`
    ].join("\n") : "";

    return [
      '<?xml version="1.0" encoding="UTF-8" standalone=\'yes\' ?>',
      '<edificio xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '          xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
      '          versao="7.9.2" autorizacao="5590eeaed0604e85ba7a72fe5dc92e1e" tipo="M">',
      "  <gravado>false</gravado>",
      "  <idCEMobile>1</idCEMobile>",
      `  <coordX>${escapeXml(coordX)}</coordX>`,
      `  <coordY>${escapeXml(coordY)}</coordY>`,
      `  <codigoZona>${escapeXml(nomeZona)}</codigoZona>`,
      `  <nomeZona>${escapeXml(nomeZona)}</nomeZona>`,
      `  <localidade>${escapeXml(localidade)}</localidade>`,
      "  <enderecoEdificio>",
      `    <logradouro>${escapeXml(logradouro)}</logradouro>`,
      `    <numero_fachada>${escapeXml(numero_fachada)}</numero_fachada>`,
      `    <id_complemento1>${escapeXml(id_complemento1)}</id_complemento1>`,
      `    <argumento1>${escapeXml(argumento1)}</argumento1>`,
      ...(complemento2Xml ? [`\n${complemento2Xml}`] : []),
      ...(complemento3Xml ? [`\n${complemento3Xml}`] : []),
      `    <cep>${escapeXml(cep)}</cep>`,
      `    <bairro>${escapeXml(bairro)}</bairro>`,
      `    <id_roteiro>${escapeXml(id_roteiro)}</id_roteiro>`,
      `    <id_localidade>${escapeXml(id_localidade)}</id_localidade>`,
      `    <cod_lograd>${escapeXml(cod_lograd)}</cod_lograd>`,
      "  </enderecoEdificio>",
      "  <tecnico>",
      "    <id>4382171061</id>",
      "    <nome>PROJETO TELEMONT</nome>",
      "  </tecnico>",
      "  <empresa>",
      "    <id>42541126</id>",
      "    <nome>TELEMONT</nome>",
      "  </empresa>",
      `  <data>${escapeXml(data)}</data>`,
      "  <totalUCs>1</totalUCs>",
      "  <ocupacao>EDIFICACAOCOMPLETA</ocupacao>",
      "  <numPisos>1</numPisos>",
      "  <destinacao>RESIDENCIA</destinacao>",
      "</edificio>",
      ""
    ].join("\n");
  }

  async function handleGenerate() {
    if (ui.busy) {
      return;
    }

    if (typeof JSZip === "undefined") {
      setStatus("Biblioteca JSZip não carregada. Recarregue a página e tente novamente.", "error");
      return;
    }

    const baseName = sanitizeBaseName(ui.nameInput.value);
    if (!baseName) {
      setStatus("Informe o nome do arquivo (espaços e caracteres inválidos não são aceitos).", "error");
      ui.nameInput.focus();
      return;
    }

    const xmlFile = ui.xmlInput.files && ui.xmlInput.files[0];
    const csvFile = ui.csvInput.files && ui.csvInput.files[0];

    if (!xmlFile) {
      setStatus("Selecione o roteiro.xml.", "error");
      ui.xmlInput.focus();
      return;
    }

    if (!csvFile) {
      setStatus("Selecione o survey.csv.", "error");
      ui.csvInput.focus();
      return;
    }

    if (!xmlFile.name.toLowerCase().endsWith(".xml")) {
      setStatus("O roteiro precisa ser um arquivo .xml.", "error");
      return;
    }

    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      setStatus("O survey precisa ser um arquivo .csv.", "error");
      return;
    }

    setBusy(true);
    revokeBlobUrl();
    setProgress(0, "Lendo arquivos...");

    try {
      const roteiroText = await readTextFile(xmlFile, MAX_XML_BYTES, "roteiro.xml");
      validateXml(roteiroText, "roteiro.xml");
      const roteiro = parseRoteiroXml(roteiroText);
      const csvText = await readTextFile(csvFile, MAX_CSV_BYTES, "survey.csv");
      const { headers, rows } = parseSurveyCsv(csvText);
      const images = await loadImages();
      const timestamp = formatTimestamp(new Date());
      const zipName = `${baseName}_${timestamp}.zip`;
      const zip = new JSZip();

      const infra = ui.infraSelect.value;
      const config = {
        pisoInicial: ui.pisoInicialInput.value,
        pisoFinal: ui.pisoFinalInput.value,
        tipo: ui.tipoSelect.value,
        destinacao: ui.destinacaoSelect.value,
        numInicial: ui.numInicialInput.value,
        numFinal: ui.numFinalInput.value,
        infra: infra
      };

      const totalUnits = rows.length * (1 + images.length);
      let completedUnits = 0;

      for (let index = 0; index < rows.length; index += 1) {
        const folderName = `edificio${index + 1}`;
        const folder = zip.folder(folderName);

        let ucs = [];
        if (infra === "sem" || infra === "com") {
          ucs = gerarUcs(config);
        }
        const xml = buildEdificioXml(index + 1, rows[index], roteiro, config, ucs, infra);

        folder.file(`${folderName}.xml`, xml);
        completedUnits += 1;
        setProgress(
          (completedUnits / totalUnits) * GENERATION_PROGRESS_SHARE,
          `Gerando ${folderName} (${index + 1} de ${rows.length})...`
        );
        await yieldToUi();

        for (const image of images) {
          folder.file(image.zipName, image.data);
          completedUnits += 1;
          setProgress(
            (completedUnits / totalUnits) * GENERATION_PROGRESS_SHARE,
            `Adicionando imagens de ${folderName} (${index + 1} de ${rows.length})...`
          );
        }

        await yieldToUi();
      }

      setProgress(GENERATION_PROGRESS_SHARE, "Compactando ZIP...");
      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          const percent =
            GENERATION_PROGRESS_SHARE +
            (metadata.percent / 100) * (100 - GENERATION_PROGRESS_SHARE);
          setProgress(
            percent,
            `Compactando ZIP... ${Math.round(metadata.percent)}%`
          );
        }
      );

      if (!blob || blob.size === 0) {
        throw new Error("O ZIP gerado está vazio.");
      }

      ui.blobUrl = URL.createObjectURL(blob);
      ui.zipName = zipName;
      ui.downloadLink.href = ui.blobUrl;
      ui.downloadLink.download = zipName;
      ui.downloadLink.classList.remove("is-disabled");
      ui.downloadLink.setAttribute("aria-disabled", "false");
      setProgress(
        100,
        `ZIP pronto: ${zipName} (${rows.length} edificio${rows.length === 1 ? "" : "s"}). Clique em Download ZIP.`,
        "success"
      );
    } catch (error) {
      console.error("[Netwin Survey] Falha ao gerar ZIP:", error);
      revokeBlobUrl();
      setProgress(0);
      setStatus(
        error instanceof Error ? error.message : "Falha inesperada ao gerar o ZIP.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleMoradiaGenerate() {
    if (uiMoradia.busy) {
      return;
    }

    if (typeof JSZip === "undefined") {
      setMoradiaStatus("Biblioteca JSZip não carregada. Recarregue a página e tente novamente.", "error");
      return;
    }

    const baseName = sanitizeBaseName(uiMoradia.nameInput.value);
    if (!baseName) {
      setMoradiaStatus("Informe o nome do arquivo (espaços e caracteres inválidos não são aceitos).", "error");
      uiMoradia.nameInput.focus();
      return;
    }

    const xmlFile = uiMoradia.xmlInput.files && uiMoradia.xmlInput.files[0];
    const csvFile = uiMoradia.csvInput.files && uiMoradia.csvInput.files[0];

    if (!xmlFile) {
      setMoradiaStatus("Selecione o roteiro.xml.", "error");
      uiMoradia.xmlInput.focus();
      return;
    }

    if (!csvFile) {
      setMoradiaStatus("Selecione o survey.csv.", "error");
      uiMoradia.csvInput.focus();
      return;
    }

    if (!xmlFile.name.toLowerCase().endsWith(".xml")) {
      setMoradiaStatus("O roteiro precisa ser um arquivo .xml.", "error");
      return;
    }

    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      setMoradiaStatus("O survey precisa ser um arquivo .csv.", "error");
      return;
    }

    setMoradiaBusy(true);
    revokeMoradiaBlobUrl();
    setMoradiaProgress(0, "Lendo arquivos...");

    try {
      const roteiroText = await readTextFile(xmlFile, MAX_XML_BYTES, "roteiro.xml");
      validateXml(roteiroText, "roteiro.xml");
      const roteiro = parseRoteiroXml(roteiroText);
      const csvText = await readTextFile(csvFile, MAX_CSV_BYTES, "survey.csv");
      const { headers, rows } = parseSurveyCsv(csvText);
      const timestamp = formatTimestamp(new Date());
      const zipName = `${baseName}_${timestamp}.zip`;
      const zip = new JSZip();

      const totalUnits = rows.length;
      let completedUnits = 0;

      for (let index = 0; index < rows.length; index += 1) {
        const folderName = `moradia${index + 1}`;
        const folder = zip.folder(folderName);

        const xml = buildMoradiaXml(index + 1, rows[index], roteiro);

        folder.file(`${folderName}.xml`, xml);
        completedUnits += 1;
        setMoradiaProgress(
          (completedUnits / totalUnits) * GENERATION_PROGRESS_SHARE,
          `Gerando ${folderName} (${index + 1} de ${rows.length})...`
        );
        await yieldToUi();

        await yieldToUi();
      }

      setMoradiaProgress(GENERATION_PROGRESS_SHARE, "Compactando ZIP...");
      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          const percent =
            GENERATION_PROGRESS_SHARE +
            (metadata.percent / 100) * (100 - GENERATION_PROGRESS_SHARE);
          setMoradiaProgress(
            percent,
            `Compactando ZIP... ${Math.round(metadata.percent)}%`
          );
        }
      );

      if (!blob || blob.size === 0) {
        throw new Error("O ZIP gerado está vazio.");
      }

      uiMoradia.blobUrl = URL.createObjectURL(blob);
      uiMoradia.zipName = zipName;
      uiMoradia.downloadLink.href = uiMoradia.blobUrl;
      uiMoradia.downloadLink.download = zipName;
      uiMoradia.downloadLink.classList.remove("is-disabled");
      uiMoradia.downloadLink.setAttribute("aria-disabled", "false");
      setMoradiaProgress(
        100,
        `ZIP pronto: ${zipName} (${rows.length} moradia${rows.length === 1 ? "" : "s"}). Clique em Download ZIP.`,
        "success"
      );
    } catch (error) {
      console.error("[Netwin Survey Moradia] Falha ao gerar ZIP:", error);
      revokeMoradiaBlobUrl();
      setMoradiaProgress(0);
      setMoradiaStatus(
        error instanceof Error ? error.message : "Falha inesperada ao gerar o ZIP.",
        "error"
      );
    } finally {
      setMoradiaBusy(false);
    }
  }

  function trapFocus(event) {
    const focusable = Array.from(
      ui.modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((node) => node.offsetParent !== null);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", (event) => {
    if (!ui.overlay || ui.overlay.hidden) {
      if (!uiMoradia.overlay || uiMoradia.overlay.hidden) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeMoradiaModal();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    } else if (event.key === "Tab") {
      trapFocus(event);
    }
  });

  function init() {
    if (!document.body) {
      return;
    }
    startButtonInjection();
    buildModal();
    buildMoradiaModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
