(function () {
  const TAMANHOS = ["P", "M", "G", "GG"];
  const CORES_MAP = [
    "Preto",
    "Branco",
    "Bege",
    "Azul",
    "Verde",
    "Marrom",
    "Creme",
    "Oliva",
    "Navy",
    "Cinza",
    "Rosa",
    "Vermelho",
  ];
  const GASTO_KEY = "ecofashion-gasto-total";
  const COMPRAS_KEY = "ecofashion-compras";

  let produtoAtual = null;
  let painelComprasAberto = false;

  function lerStorage(chave) {
    return localStorage.getItem(chave) ?? sessionStorage.getItem(chave);
  }

  function salvarStorage(chave, valor) {
    localStorage.setItem(chave, valor);
    sessionStorage.setItem(chave, valor);
  }

  function escHtml(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPreco(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  }

  function getCompras() {
    try {
      const raw = lerStorage(COMPRAS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setCompras(lista) {
    salvarStorage(COMPRAS_KEY, JSON.stringify(lista));
    const total = lista.reduce((soma, item) => soma + item.preco, 0);
    salvarStorage(GASTO_KEY, String(total));
    atualizarGastoHeader();
    renderPainelCompras();
  }

  function getGastoTotal() {
    const compras = getCompras();
    if (compras.length) return compras.reduce((soma, item) => soma + item.preco, 0);
    return parseFloat(lerStorage(GASTO_KEY) || "0") || 0;
  }

  function setGastoTotal(valor) {
    salvarStorage(GASTO_KEY, String(valor));
    atualizarGastoHeader();
  }

  function opcaoAtiva(containerId) {
    const btn = document.querySelector(`#${containerId} .produto-opcao.ativo`);
    return btn ? btn.textContent.trim() : null;
  }

  function adicionarCompra(produto) {
    const compras = getCompras();
    compras.unshift({
      id: Date.now(),
      nome: produto.nome,
      img: produto.img,
      preco: produto.preco,
      tamanho: produto.tamanho || "M",
      cor: produto.cor || "—",
    });
    setCompras(compras);
  }

  function renderPainelCompras() {
    const lista = document.getElementById("gasto-lista");
    const vazio = document.getElementById("gasto-vazio");
    const painelTotal = document.getElementById("gasto-painel-total");
    if (!lista || !vazio) return;

    const compras = getCompras();
    if (painelTotal) painelTotal.textContent = formatPreco(getGastoTotal());

    if (!compras.length) {
      lista.innerHTML = "";
      vazio.hidden = false;
      return;
    }

    vazio.hidden = true;
    lista.innerHTML = compras
      .map(
        (item) => `
        <li class="gasto-item">
          <img class="gasto-item-img" src="${escHtml(item.img)}" alt="" loading="lazy" />
          <div class="gasto-item-info">
            <span class="gasto-item-nome">${escHtml(item.nome)}</span>
            <span class="gasto-item-detalhe">${escHtml(item.tamanho)} · ${escHtml(item.cor)}</span>
          </div>
          <span class="gasto-item-preco">${formatPreco(item.preco)}</span>
        </li>`
      )
      .join("");
  }

  function togglePainelCompras(forcar) {
    const painel = document.getElementById("gasto-painel");
    const btn = document.getElementById("gasto-total");
    if (!painel || !btn) return;

    const abrir = typeof forcar === "boolean" ? forcar : !painelComprasAberto;
    painelComprasAberto = abrir;

    if (painelComprasAberto) {
      painel.hidden = false;
      painel.classList.add("aberto");
      renderPainelCompras();
    } else {
      fecharPainelCompras();
      return;
    }

    btn.setAttribute("aria-expanded", String(painelComprasAberto));
  }

  function abrirPainelCompras() {
    renderPainelCompras();
    togglePainelCompras(true);
  }

  function fecharPainelCompras() {
    const painel = document.getElementById("gasto-painel");
    const btn = document.getElementById("gasto-total");
    painelComprasAberto = false;
    if (painel) {
      painel.hidden = true;
      painel.classList.remove("aberto");
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function bindGastoEventos() {
    const wrap = document.getElementById("gasto-wrap");
    if (!wrap || wrap.dataset.bound === "1") return;
    wrap.dataset.bound = "1";

    wrap.addEventListener("click", (e) => {
      if (e.target.closest("#gasto-fechar")) {
        e.preventDefault();
        e.stopPropagation();
        fecharPainelCompras();
        return;
      }
      if (e.target.closest("#gasto-total")) {
        e.preventDefault();
        e.stopPropagation();
        abrirPainelCompras();
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#gasto-fechar")) {
        fecharPainelCompras();
        return;
      }
      if (e.target.closest("#gasto-wrap")) return;
      fecharPainelCompras();
    });
  }

  function ensureFecharButton() {
    const topo = document.querySelector(".gasto-painel-topo");
    if (!topo || document.getElementById("gasto-fechar")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gasto-fechar";
    btn.id = "gasto-fechar";
    btn.setAttribute("aria-label", "Fechar minhas compras");
    btn.innerHTML = "&times;";
    topo.insertBefore(btn, topo.firstChild);
  }

  function atualizarGastoHeader() {
    const el = document.getElementById("gasto-valor");
    const contagem = document.getElementById("gasto-contagem");
    const compras = getCompras();
    if (el) el.textContent = formatPreco(getGastoTotal());
    if (contagem) {
      contagem.textContent = compras.length;
      contagem.hidden = compras.length === 0;
    }
  }

  function ensureGastoHeader() {
    if (document.getElementById("gasto-wrap")) {
      ensureFecharButton();
      bindGastoEventos();
      atualizarGastoHeader();
      renderPainelCompras();
      return;
    }

    const container = document.querySelector(".header .container");
    if (!container) return;

    const wrap = document.createElement("div");
    wrap.id = "gasto-wrap";
    wrap.className = "gasto-wrap";
    wrap.innerHTML = `
      <button type="button" class="gasto-total" id="gasto-total" aria-expanded="false" aria-controls="gasto-painel" title="Ver minhas compras">
        <span class="gasto-icon" aria-hidden="true">🪙</span>
        <span class="gasto-contagem" id="gasto-contagem" hidden>0</span>
        <span class="gasto-valor" id="gasto-valor">${formatPreco(getGastoTotal())}</span>
      </button>
      <div class="gasto-painel" id="gasto-painel" hidden>
        <div class="gasto-painel-topo">
          <button type="button" class="gasto-fechar" id="gasto-fechar" aria-label="Fechar minhas compras">&times;</button>
          <h3>Minhas compras</h3>
          <span class="gasto-painel-total" id="gasto-painel-total">${formatPreco(getGastoTotal())}</span>
        </div>
        <ul class="gasto-lista" id="gasto-lista"></ul>
        <p class="gasto-vazio" id="gasto-vazio">Nenhuma peça comprada ainda.</p>
      </div>`;

    const icons = container.querySelector(".header-icons");
    if (icons) {
      icons.prepend(wrap);
    } else {
      wrap.style.marginLeft = "auto";
      const voltar = container.querySelector(".voltar");
      if (voltar) container.insertBefore(wrap, voltar);
      else container.appendChild(wrap);
    }

    bindGastoEventos();
    renderPainelCompras();
  }

  function animarGasto() {
    const gasto = document.getElementById("gasto-total");
    if (!gasto) return;
    gasto.classList.add("pulse");
    setTimeout(() => gasto.classList.remove("pulse"), 350);
  }

  function comprarProduto() {
    if (!produtoAtual) return;

    adicionarCompra({
      ...produtoAtual,
      tamanho: opcaoAtiva("produto-tamanhos"),
      cor: opcaoAtiva("produto-cores"),
    });

    animarGasto();
    abrirPainelCompras();

    const btn = document.getElementById("produto-btn-comprar");
    if (btn) {
      const textoOriginal = "Comprar";
      btn.textContent = "Adicionado!";
      btn.classList.add("comprado");
      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.classList.remove("comprado");
      }, 1200);
    }
  }

  function coresDoProduto(nome) {
    const lower = String(nome).toLowerCase();
    const cores = CORES_MAP.filter((cor) => lower.includes(cor.toLowerCase()));
    return cores.length ? [...new Set(cores)].slice(0, 4) : ["Preto", "Branco", "Bege"];
  }

  function criarModal() {
    if (document.getElementById("produto-overlay")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="produto-overlay" id="produto-overlay" aria-hidden="true">
        <div class="produto-modal" role="dialog" aria-modal="true" aria-labelledby="produto-modal-titulo">
          <div class="produto-modal-topo">
            <h2 id="produto-modal-titulo"></h2>
            <button type="button" class="produto-fechar" aria-label="Fechar">&times;</button>
          </div>
          <div class="produto-modal-scroll">
            <div class="produto-foto-wrap">
              <img id="produto-modal-img" src="" alt="" />
            </div>
            <div class="produto-modal-corpo">
              <div class="produto-secao">
                <label>Tamanho</label>
                <div class="produto-opcoes" id="produto-tamanhos"></div>
              </div>
              <div class="produto-secao">
                <label>Cor</label>
                <div class="produto-opcoes" id="produto-cores"></div>
              </div>
              <div class="produto-precos">
                <div class="produto-precos-info">
                  <span class="produto-preco-atual" id="produto-preco-atual"></span>
                  <span class="produto-preco-velho" id="produto-preco-velho" hidden></span>
                </div>
                <button type="button" class="produto-btn-comprar" id="produto-btn-comprar">Comprar</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );

    const overlay = document.getElementById("produto-overlay");
    overlay.querySelector(".produto-fechar").addEventListener("click", fecharProduto);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharProduto();
    });
    document.getElementById("produto-btn-comprar").addEventListener("click", comprarProduto);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        fecharPainelCompras();
        fecharProduto();
      }
    });
  }

  function montarOpcoes(container, opcoes, grupo) {
    container.innerHTML = opcoes
      .map(
        (opcao, i) =>
          `<button type="button" class="produto-opcao${i === 0 ? " ativo" : ""}" data-grupo="${grupo}">${escHtml(opcao)}</button>`
      )
      .join("");

    container.querySelectorAll(".produto-opcao").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".produto-opcao").forEach((b) => b.classList.remove("ativo"));
        btn.classList.add("ativo");
      });
    });
  }

  function abrirProduto(produto) {
    criarModal();
    produtoAtual = produto;

    const overlay = document.getElementById("produto-overlay");
    document.getElementById("produto-modal-titulo").textContent = produto.nome;
    const img = document.getElementById("produto-modal-img");
    img.src = produto.img;
    img.alt = produto.nome;

    montarOpcoes(document.getElementById("produto-tamanhos"), TAMANHOS, "tamanho");
    montarOpcoes(document.getElementById("produto-cores"), coresDoProduto(produto.nome), "cor");

    document.getElementById("produto-preco-atual").textContent = formatPreco(produto.preco);
    const velho = document.getElementById("produto-preco-velho");
    if (produto.antigo && produto.antigo > produto.preco) {
      velho.textContent = formatPreco(produto.antigo);
      velho.hidden = false;
    } else {
      velho.hidden = true;
    }

    const btnComprar = document.getElementById("produto-btn-comprar");
    btnComprar.textContent = "Comprar";
    btnComprar.classList.remove("comprado");

    overlay.classList.add("aberto");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function fecharProduto() {
    const overlay = document.getElementById("produto-overlay");
    if (!overlay) return;
    overlay.classList.remove("aberto");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    produtoAtual = null;
  }

  function dadosDoCard(card) {
    return {
      nome: card.dataset.nome,
      img: card.dataset.img,
      preco: parseFloat(card.dataset.preco),
      antigo: card.dataset.antigo ? parseFloat(card.dataset.antigo) : null,
    };
  }

  function cardProdutoAttrs(p) {
    let attrs = `class="card card-produto" role="button" tabindex="0" data-nome="${escHtml(p.nome)}" data-img="${escHtml(p.img)}" data-preco="${p.preco}"`;
    if (p.antigo) attrs += ` data-antigo="${p.antigo}"`;
    return attrs;
  }

  window.ECOFASHION_DETALHE = {
    cardProdutoAttrs,
    abrirProduto,
    fecharProduto,
    comprarProduto,
    getGastoTotal,
    getCompras,
    formatPreco,

    cardHtml(p, innerExtra) {
      const desc = p.desc ? `<span class="tag-desc">-${p.desc}%</span>` : "";
      const velho = p.antigo
        ? `<span class="preco-velho">R$ ${p.antigo.toFixed(2).replace(".", ",")}</span>`
        : "";
      const estrelas =
        typeof p.estrelas === "number" && typeof window.estrelasHtml === "function"
          ? window.estrelasHtml(p.estrelas)
          : "";
      const vendidos =
        typeof p.vendidos === "number"
          ? `<div class="avaliacao"><span class="estrelas">${estrelas}</span><span>${p.vendidos.toLocaleString("pt-BR")} vendidos</span></div>`
          : innerExtra?.avaliacao || "";

      return `
        <article ${cardProdutoAttrs(p)}>
          <div class="card-img">${desc}<img src="${escHtml(p.img)}" alt="${escHtml(p.nome)}" loading="lazy" /></div>
          <div class="card-body">
            <div class="nome">${escHtml(p.nome)}</div>
            <div class="precos">
              <span class="preco-atual">${formatPreco(p.preco)}</span>
              ${velho}
            </div>
            ${vendidos}
          </div>
        </article>`;
    },

    cardHtmlSimples(p) {
      const estrelas =
        typeof p.estrelas === "number" && typeof window.estrelasHtml === "function"
          ? window.estrelasHtml(p.estrelas)
          : "";
      return `
        <article ${cardProdutoAttrs(p)}>
          <div class="card-img"><img src="${escHtml(p.img)}" alt="${escHtml(p.nome)}" loading="lazy" /></div>
          <div class="card-body">
            <div class="nome">${escHtml(p.nome)}</div>
            <span class="preco-atual">${formatPreco(p.preco)}</span>
            <div class="avaliacao">
              <span class="estrelas">${estrelas}</span>
              <span>${p.vendidos.toLocaleString("pt-BR")} vendidos</span>
            </div>
          </div>
        </article>`;
    },

    init() {
      ensureGastoHeader();
      criarModal();
      document.addEventListener("click", (e) => {
        const card = e.target.closest(".card-produto");
        if (!card) return;
        abrirProduto(dadosDoCard(card));
      });
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const card = e.target.closest(".card-produto");
        if (!card) return;
        e.preventDefault();
        abrirProduto(dadosDoCard(card));
      });
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.ECOFASHION_DETALHE.init());
  } else {
    window.ECOFASHION_DETALHE.init();
  }
})();
