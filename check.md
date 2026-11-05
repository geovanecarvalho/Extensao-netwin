# CHECK.md — Checklist de Não-Regressão (Agente de IA)

**Projeto:** Netwin - Cadastro Survey  
**Versão:** 0.1.0 (funcionando perfeitamente)  
**Objetivo:** Verificar que nenhuma alteração quebrou o funcionamento atual.  
**Critério de aprovação:** Todos os itens devem retornar PASS. Qualquer FAIL = não liberar.

---

## 1. Pré-requisitos antes de testar

- [ ] Extensão carregada em **Modo do Desenvolvedor** (Chrome/Edge): `chrome://extensions` → "Carregar descompactada" → selecionar pasta raiz do projeto.
- [ ] Arquivo `manifest.json` presente e com `manifest_version: 3`.
- [ ] Arquivos de teste disponíveis:
  - `Arquivos_modelo/roteiro.xml` (ou similar válido)
  - `Arquivos_modelo/MODELO PLANILHA.csv` (ou similar válido)
- [ ] A extensão roda apenas no domínio `*://netwin.vtal.intra/*`.

---

## 2. Critérios Obrigatórios — Funcionalidade Edifício

| # | Item | Critério de PASS | Resultado |
|---|------|------------------|-----------|
| 2.1 | Injeção do botão | Botão "Edifício" aparece na `<nav>` do site alvo. | ☐ |
| 2.2 | Fallback flutuante | Se não houver `<nav>`, após 8s o botão aparece fixo no canto inferior direito com título informativo. | ☐ |
| 2.3 | Modal acessível | Modal abre com role="dialog", aria-modal="true", ARIA labels, foco preso dentro do modal. | ☐ |
| 2.4 | Fechar com ESC | Pressionar ESC fecha o modal e retorna o foco ao elemento anterior. | ☐ |
| 2.5 | Fechar com clique fora | Clicar sobre o overlay (fora do modal) fecha o modal. | ☐ |
| 2.6 | Validação: extensão XML | Selecionar arquivo sem `.xml` gera erro e não limpa o campo de forma inesperada. | ☐ |
| 2.7 | Validação: extensão CSV | Selecionar arquivo sem `.csv` gera erro. | ☐ |
| 2.8 | Validação: arquivo vazio | Arquivo XML ou CSV com 0 bytes gera erro "está vazio". | ☐ |
| 2.9 | Validação: limite XML | Arquivo XML acima de 5 MB gera erro de limite excedido. | ☐ |
| 2.10 | Validação: limite CSV | Arquivo CSV acima de 25 MB gera erro de limite excedido. | ☐ |
| 2.11 | Detecção de delimitador | CSV com `;`, `,`, tab ou `|` é parseado corretamente. | ☐ |
| 2.12 | Sanitização do nome | Espaços e caracteres inválidos (`<>:"/\|?*`) são removidos do nome do arquivo. | ☐ |
| 2.13 | Preview ao vivo | Enquanto digita no campo "Nome do arquivo", o preview é atualizado com sufixo `_yyyyMMddHHmmss.zip`. | ☐ |
| 2.14 | Botão "Gerar ZIP" desabilitado | Fica desabilitado enquanto não hername válido + XML + CSV selecionados. | ☐ |
| 2.15 | Infra = "sem" | Campos de piso/numeração são obrigatórios; `redeInterna` = "N" no XML. | ☐ |
| 2.16 | Infra = "com" | Campos de piso/numeração são ocultados; `redeInterna` = "S"; caixas de entrada geradas no XML. | ☐ |
| 2.17 | Estrutura ZIP | ZIP contém pastas `edificio1`, `edificio2`, … (uma por linha de dados do CSV). | ☐ |
| 2.18 | XML por pasta | Cada pasta contém `<nome>.xml` com declaração `<?xml version="1.0" encoding="UTF-8" standalone='yes' ?>`. | ☐ |
| 2.19 | Imagens embutidas | Cada pasta contém as 3 imagens: `IMG PRETA.jpg`, `img preta_1.jpg`, `img preta_2.jpg`. | ☐ |
| 2.20 | Compactação | ZIP usa DEFLATE nível 6. | ☐ |
| 2.21 | Nome do ZIP | Formato `<nome>_<timestamp>.zip` (ex: `CATALAO_20260115143022.zip`). | ☐ |
| 2.22 | Download | Link "Download ZIP" é habilitado após geração e inicia download via blob URL. | ☐ |
| 2.23 | Barra de progresso | Atinge 100% ao finalizar e exibe mensagem de sucesso. | ☐ |
| 2.24 | UCs geradas | Quando infra = "sem", UCs são geradas automaticamente com base em pisos e numeração. | ☐ |
| 2.25 | Complementos 2 e 3 vazios | Tags `id_complemento2`/`argumento2` e `id_complemento3`/`argumento3` não aparecem no XML. | ☐ |
| 2.26 | Complementos 2 e 3 preenchidos | Tags aparecem com valores corretos extraídos do dicionário `CODIGOS_COMPLEMENTO`. | ☐ |
| 2.27 | Busca no roteiro | Match por `COD_LOGRAD`; se ausente, fallback por `LOGRADOURO` + `BAIRRO`. | ☐ |
| 2.28 | Coordenadas | `normalizarCoordenada` converte formato `DDD.DDD.DDD` para `DD.DDDDDDD`. | ☐ |
| 2.29 | Dados fixos | `tecnico.id = 4382171061`, `empresa.id = 42541126`, `empresa.nome = TELEMONT`, `fibrasConcorrencia = 133856749`. | ☐ |
| 2.30 | Botão "Baixar planilha base" | Gera e faz download de `modelo_planilha.csv` com cabeçalhos padronizados + 1 linha de exemplo. | ☐ |

---

## 3. Critérios Obrigatórios — Funcionalidade Moradia

| # | Item | Critério de PASS | Resultado |
|---|------|------------------|-----------|
| 3.1 | Injeção do botão | Botão "Moradia" (verde) aparece ao lado do botão "Edifício". | ☐ |
| 3.2 | Modal Moradia | Modal separado abre com título "Moradia" e campos próprios. | ☐ |
| 3.3 | Estrutura ZIP Moradia | ZIP contém pastas `moradia1`, `moradia2`, … (uma por linha do CSV). | ☐ |
| 3.4 | XML Moradia | Cada pasta contém `<nome>.xml` com `tipo="M"` no elemento raiz. | ☐ |
| 3.5 | totalUCs = 1 | XML de moradia sempre contém `<totalUCs>1</totalUCs>`. | ☐ |
| 3.6 | numPisos = 1 | XML de moradia sempre contém `<numPisos>1</numPisos>`. | ☐ |
| 3.7 | Destinação fixa | XML de moradia contém `<destinacao>RESIDENCIA</destinacao>`. | ☐ |
| 3.8 | Sem imagens | ZIP de moradia NÃO contém as 3 imagens (apenas o XML). | ☐ |
| 3.9 | Download Moradia | Link "Download ZIP" funciona após geração. | ☐ |

---

## 4. Casos de Bordas (Edge Cases)

| # | Cenário | Resultado Esperado | Resultado |
|---|---------|-------------------|-----------|
| 4.1 | CSV apenas com cabeçalho (sem linhas de dados) | Erro: "não contém linhas de dados". | ☐ |
| 4.2 | CSV totalmente vazio | Erro: "está vazio". | ☐ |
| 4.3 | CSV com aspas não fechadas | Erro: "aspas não fechadas". | ☐ |
| 4.4 | Roteiro XML mal formado | Erro: "roteiro.xml inválido". | ☐ |
| 4.5 | COD_LOGRAD ausente no CSV | Fallback busca por LOGRADOURO + BAIRRO no roteiro. | ☐ |
| 4.6 | Arquivo com BOM (UTF-8) | BOM é removido antes do parse. | ☐ |
| 4.7 | Nome do arquivo com apenas espaços | Sanitizado fica vazio → botão Gerar ZIP desabilitado. | ☐ |
| 4.8 | JSZip não carregado | Erro: "Biblioteca JSZip não carregada". | ☐ |
| 4.9 | Gerar ZIP sem preencher todos os campos | Botão permanece desabilitado. | ☐ |
| 4.10 | Clicar Download antes de gerar | Alerta: "Gere o ZIP antes de baixar." | ☐ |

---

## 5. Como Executar a Verificação (Passo a Passo)

1. Abra o Chrome/Edge em Modo do Desenvolvedor.
2. Carregue a extensão descompactada a partir da pasta raiz do projeto.
3. Navegue para qualquer página em `*://netwin.vtal.intra/*`.
4. Confirme que os botões "Edifício" e "Moradia" aparecem.
5. Clique em "Edifício", preencha nome, anexe roteiro.xml e survey.csv válidos.
6. Clique em "Gerar ZIP", aguarde progresso até 100% e baixe o ZIP.
7. Abra o ZIP e confirme: pastas `edificioN`, XMLs com declaração standalone, 3 imagens por pasta.
8. Repita para "Moradia" e confirme pastas `moradiaN` com tipo `M`.
9. Teste cada caso de borda da seção 4.
10. Marque PASS ou FAIL em cada item acima.

---

## 6. Critério de Liberação

- ✅ **LIBERADO:** Todos os itens das seções 2, 3 e 4 estão PASS.
- ❌ **BLOQUEADO:** Qualquer item FAIL. Corrigir antes de mesclar alterações.

---

> **Nota:** Esta versão (0.1.0) está funcionando perfeitamente. Qualquer alteração futura deve preservar todos os critérios acima para evitar regressões.
