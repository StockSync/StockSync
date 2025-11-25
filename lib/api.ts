// src/lib/api.ts - VERSÃO FINAL ATUALIZADA

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DEFAULT_STOCK_NAME = "Estoque Principal";

// ==================== INTERFACES ====================

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface ResponseDTO {
  name: string;
  token: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  status: "ATIVO" | "INATIVO";
  stocks?: Array<{
    stockId: number;
    stockName: string;
    quantity: number;
    minimumQuantity: number;
    productStatus?: "LOW_STOCK" | "IN_STOCK" | "MISSING";
  }>;
}

export interface ProductRequestDTO {
  name: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  status?: "ATIVO" | "INATIVO";
}

export interface StockDTO {
  stockId: number;
  name: string;
  location?: string;
  imageUrl?: string;
  userId: number;
  products?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    minimumQuantity: number;
  }>;
}

export interface StockProductDTO {
  productId: number;
  quantity: number;
  minimumQuantity: number;
}

export interface StockRequestDTO {
  name: string;
  location?: string;
  products: StockProductDTO[];
}

export interface DashboardDTO {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  products: ProductDTO[];
}

export interface ProdutoFrontend {
  id: number;
  nome: string;
  descricao?: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  status: "ATIVO" | "INATIVO";
}

export interface EstoqueFrontend {
  id: number;
  name: string;
  location: string;
  image?: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
}

// ==================== FUNÇÕES AUXILIARES ====================

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    console.log("🔑 Token salvo");
  }
}

function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    console.log("🗑️ Token removido");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  console.log(`📤 ${options.method || "GET"} ${endpoint}`);

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    console.log(`📥 ${response.status} ${endpoint}`);

    if (response.status === 204) {
      return null as T;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Erro HTTP: ${response.status}`,
      }));

      console.error(`❌ Erro ${response.status}:`, error);

      if (response.status === 401 || response.status === 403) {
        console.error("🚫 Sem permissão ou token inválido");
      }

      throw new Error(error.message || `Erro: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    throw error;
  }
}

// ==================== API ====================

export const api = {
  // ========== AUTENTICAÇÃO ==========
  login: async (email: string, password: string): Promise<ResponseDTO> => {
    const response = await request<ResponseDTO>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      saveToken(response.token);
      console.log("✅ Login bem-sucedido!");
    }
    return response;
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<ResponseDTO> => {
    removeToken();
    const response = await request<ResponseDTO>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (response.token) {
      saveToken(response.token);
      console.log("✅ Registro bem-sucedido!");
    }
    return response;
  },

  logout: (): void => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  // ========== DASHBOARD ==========
  getDashboard: async (): Promise<DashboardDTO> => {
    return request<DashboardDTO>("/dashboard");
  },

  // ========== PRODUTOS ==========

  getProdutos: async (): Promise<ProdutoFrontend[]> => {
    try {
      console.log("📤 Buscando produtos...");
      const products = await request<ProductDTO[]>("/products");

      return products.map((product) => {
        const firstStock = product.stocks?.[0];

        return {
          id: product.id,
          nome: product.name,
          descricao: product.description,
          quantidade: firstStock?.quantity || 0,
          estoque: firstStock?.stockName || DEFAULT_STOCK_NAME,
          imagem: product.imageUrl,
          status: product.status,
        };
      });
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      throw error;
    }
  },

  createProduto: async (produto: {
    nome: string;
    descricao?: string;
    quantidade: number;
    estoque: string;
    imagem?: string;
  }): Promise<ProdutoFrontend> => {
    console.log("➕ Criando produto:", produto);

    try {
      console.log("📝 PASSO 1: Criando produto no catálogo...");
      const productCreated = await request<ProductDTO>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: produto.nome,
          description: produto.descricao,
          imageUrl: produto.imagem,
          status: produto.quantidade > 0 ? "ATIVO" : "INATIVO",
        }),
      });

      console.log("✅ Produto criado no catálogo:", productCreated);

      if (produto.quantidade > 0) {
        try {
          console.log("📦 PASSO 2: Adicionando produto ao estoque...");

          const stocks = await request<StockDTO[]>("/stocks");
          let targetStock = stocks.find((s) => s.name === produto.estoque);

          if (!targetStock) {
            console.log(`📦 Criando novo estoque: ${produto.estoque}`);
            targetStock = await request<StockDTO>("/stocks", {
              method: "POST",
              body: JSON.stringify({
                name: produto.estoque,
                location: "Principal",
                products: [],
              }),
            });
          }

          console.log(`✅ Usando estoque ID: ${targetStock.stockId}`);
          console.log(`📤 POST /stocks/${targetStock.stockId}/products`);

          await request(`/stocks/${targetStock.stockId}/products`, {
            method: "POST",
            body: JSON.stringify({
              productId: productCreated.id,
              quantity: produto.quantidade,
              minimumQuantity: 1,
            }),
          });

          console.log("✅ Produto adicionado ao estoque com sucesso!");
        } catch (stockError) {
          console.error("⚠️ Erro ao adicionar ao estoque:", stockError);
          alert(
            `Produto "${produto.nome}" foi criado, mas não foi possível adicionar ao estoque "${produto.estoque}".`
          );
        }
      }

      return {
        id: productCreated.id,
        nome: productCreated.name,
        descricao: productCreated.description,
        quantidade: produto.quantidade,
        estoque: produto.estoque,
        imagem: productCreated.imageUrl,
        status: productCreated.status,
      };
    } catch (error) {
      console.error("❌ Erro ao criar produto:", error);

      if (error instanceof Error && error.message.includes("403")) {
        throw new Error(
          "Você não tem permissão para criar produtos. Entre em contato com o administrador."
        );
      }

      throw error;
    }
  },

  updateProdutoQuantidade: async (
    id: number,
    quantidade: number
  ): Promise<ProdutoFrontend> => {
    console.log("🔢 Atualizando quantidade via +/-:", id, quantidade);

    const productDTO = await request<ProductDTO>(`/products/${id}`);
    const stockItem = productDTO.stocks?.[0];

    if (!stockItem) {
      throw new Error(
        "Produto não está vinculado a um estoque. Atualização de quantidade falhou."
      );
    }

    const { stockId, minimumQuantity, stockName } = stockItem;
    const stockStatus = quantidade > 0 ? "IN_STOCK" : "MISSING";
    const newCatalogStatus = quantidade > 0 ? "ATIVO" : "INATIVO";

    console.log(`📤 PUT /stocks/${stockId}/products (Atualizando QTD)`);
    await request(`/stocks/${stockId}/products`, {
      method: "PUT",
      body: JSON.stringify({
        productId: id,
        quantity: quantidade,
        minimumQuantity: minimumQuantity || 1,
        productStatus: stockStatus,
      }),
    });

    if (newCatalogStatus !== productDTO.status) {
      console.log(`📝 Atualizando status do produto para: ${newCatalogStatus}`);
      await request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: productDTO.name,
          description: productDTO.description,
          sku: productDTO.sku,
          imageUrl: productDTO.imageUrl,
          status: newCatalogStatus,
        }),
      });
    }

    return {
      id: id,
      nome: productDTO.name,
      descricao: productDTO.description,
      quantidade: quantidade,
      estoque: stockName || DEFAULT_STOCK_NAME,
      imagem: productDTO.imageUrl,
      status: newCatalogStatus,
    };
  },

  // ✅ CORRIGIDO: Agora suporta troca de estoque com DELETE
  updateProduto: async (
    id: number,
    produto: Partial<ProdutoFrontend>,
    novoStockId: number,
    novaQuantidade: number
  ): Promise<ProdutoFrontend> => {
    console.log("🔍 DEBUG updateProduto:", {
      produtoId: id,
      produtoNome: produto.nome,
      estoqueNome: produto.estoque,
      novoStockId: novoStockId,
      quantidade: novaQuantidade,
    });

    if (isNaN(id) || id <= 0 || isNaN(novoStockId) || novoStockId <= 0) {
      throw new Error("ID de Produto ou Estoque inválido(s) para atualização.");
    }

    const newCatalogStatus = novaQuantidade > 0 ? "ATIVO" : "INATIVO";
    const stockStatus = novaQuantidade > 0 ? "IN_STOCK" : "MISSING";

    // PASSO 1: Buscar produto atual para verificar TODOS os estoques vinculados
    console.log("📝 PASSO 1: Buscando dados atuais do produto...");
    const productDTO = await request<ProductDTO>(`/products/${id}`);

    // ✅ BUSCA TODOS OS ESTOQUES VINCULADOS (não só o primeiro)
    const estoquesVinculados = productDTO.stocks || [];

    console.log(
      `📦 Produto encontrado com ${estoquesVinculados.length} estoque(s) vinculado(s):`
    );
    estoquesVinculados.forEach((s) => {
      console.log(`   - ${s.stockName} (ID: ${s.stockId}, QTD: ${s.quantity})`);
    });

    // PASSO 2: Atualizar metadados do produto (nome, descrição, imagem, status)
    console.log("📝 PASSO 2: Atualizando metadados do produto...");
    const updatedProductDTO = await request<ProductDTO>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: produto.nome,
        description: produto.descricao,
        imageUrl: produto.imagem,
        status: newCatalogStatus,
      }),
    });

    // PASSO 3: Verificar se houve mudança de estoque
    const estoqueAntigo = estoquesVinculados.find(
      (s) => s.stockId !== novoStockId
    );
    const trocouEstoque = estoqueAntigo !== undefined;

    if (trocouEstoque && estoqueAntigo) {
      console.log(`🔄 MUDANÇA DE ESTOQUE DETECTADA!`);
      console.log(
        `   Estoque antigo: ${estoqueAntigo.stockName} (ID: ${estoqueAntigo.stockId})`
      );
      console.log(`   Estoque novo: ${produto.estoque} (ID: ${novoStockId})`);

      // PASSO 3.1: Remover COMPLETAMENTE do estoque antigo usando DELETE
      try {
        console.log(
          `🗑️ DELETE /stocks/${estoqueAntigo.stockId}/products/${id}`
        );

        await request(`/stocks/${estoqueAntigo.stockId}/products/${id}`, {
          method: "DELETE",
        });

        console.log("✅ Produto removido completamente do estoque antigo");
      } catch (error) {
        console.error("⚠️ Erro ao remover do estoque antigo:", error);
        console.log("⚠️ Tentando método alternativo (PUT com quantity: 0)...");

        // Fallback: Se DELETE não funcionar, tenta zerar
        try {
          await request(`/stocks/${estoqueAntigo.stockId}/products`, {
            method: "PUT",
            body: JSON.stringify({
              productId: id,
              quantity: 0,
              minimumQuantity: estoqueAntigo.minimumQuantity || 1,
              productStatus: "MISSING",
            }),
          });
          console.log("✅ Quantidade zerada no estoque antigo (fallback)");
        } catch (fallbackError) {
          console.error("❌ Ambos os métodos falharam:", fallbackError);
        }
      }

      // PASSO 3.2: Adicionar ao novo estoque
      console.log(
        `📤 POST /stocks/${novoStockId}/products (Adicionando ao novo estoque)`
      );
      await request(`/stocks/${novoStockId}/products`, {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          quantity: novaQuantidade,
          minimumQuantity: 1,
        }),
      });
      console.log("✅ Produto adicionado ao novo estoque");
    } else {
      // PASSO 4: Se NÃO trocou de estoque, apenas atualiza a quantidade
      console.log(`📝 PASSO 3: Atualizando quantidade no mesmo estoque...`);
      console.log(`📤 PUT /stocks/${novoStockId}/products (Atualizando QTD)`);

      await request(`/stocks/${novoStockId}/products`, {
        method: "PUT",
        body: JSON.stringify({
          productId: id,
          quantity: novaQuantidade,
          minimumQuantity: 1,
          productStatus: stockStatus,
        }),
      });
    }

    console.log("✅ Produto e Estoque atualizados com sucesso.");

    return {
      id: id,
      nome: updatedProductDTO.name,
      descricao: updatedProductDTO.description,
      quantidade: novaQuantidade,
      estoque: produto.estoque || DEFAULT_STOCK_NAME,
      imagem: updatedProductDTO.imageUrl,
      status: updatedProductDTO.status,
    };
  },

  deleteProduto: async (id: number): Promise<void> => {
    console.log("🗑️ Deletando produto:", id);
    if (isNaN(id) || id <= 0) {
      throw new Error("ID de Produto inválido para exclusão.");
    }
    await request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // ========== ESTOQUES ==========

  getEstoques: async (): Promise<EstoqueFrontend[]> => {
    try {
      const stocks = await request<StockDTO[]>("/stocks");

      return stocks.map((stock) => ({
        id: stock.stockId,
        name: stock.name,
        location: stock.location || "",
        image: stock.imageUrl,
        products:
          stock.products?.map((p) => ({
            name: p.productName,
            quantity: p.quantity,
          })) || [],
      }));
    } catch (error) {
      console.error("Erro ao buscar estoques:", error);
      throw error;
    }
  },

  createEstoque: async (estoque: {
    name: string;
    location: string;
    image?: string;
    products: Array<{ name: string; quantity: number }>;
  }): Promise<EstoqueFrontend> => {
    console.log("➕ Criando estoque:", estoque);

    const created = await request<StockDTO>("/stocks", {
      method: "POST",
      body: JSON.stringify({
        name: estoque.name,
        location: estoque.location,
        imageUrl: estoque.image,
        products: [],
      }),
    });

    console.log("✅ Estoque criado:", created);

    return {
      id: created.stockId,
      name: created.name,
      location: created.location || "",
      image: created.imageUrl,
      products: [],
    };
  },

  updateEstoque: async (
    id: number,
    estoque: Partial<EstoqueFrontend>
  ): Promise<EstoqueFrontend> => {
    if (
      id === undefined ||
      id === null ||
      isNaN(Number(id)) ||
      Number(id) <= 0
    ) {
      console.error("❌ Erro de ID: ID do estoque é inválido ou indefinido.");
      throw new Error("Não é possível atualizar: ID do estoque inválido.");
    }

    const stockId = Number(id);
    console.log(`✏️ Atualizando estoque ID: ${stockId}`);

    const updated = await request<StockDTO>(`/stocks/${stockId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: estoque.name,
        location: estoque.location,
        imageUrl: estoque.image,
        products: [],
      }),
    });

    return {
      id: updated.stockId,
      name: updated.name,
      location: updated.location || "",
      image: updated.imageUrl,
      products: estoque.products || [],
    };
  },

  deleteEstoque: async (id: number): Promise<void> => {
    if (
      id === undefined ||
      id === null ||
      isNaN(Number(id)) ||
      Number(id) <= 0
    ) {
      console.error(
        "❌ Erro de ID: ID do estoque para exclusão é inválido ou indefinido."
      );
      throw new Error("Não é possível deletar: ID do estoque inválido.");
    }

    console.log("🗑️ Deletando estoque:", id);
    await request<void>(`/stocks/${id}`, {
      method: "DELETE",
    });
  },

  // ========== FUNÇÕES AVANÇADAS ==========

  addProdutoAoEstoque: async (
    stockId: number,
    productId: number,
    quantity: number
  ): Promise<void> => {
    console.log(`➕ Adicionando produto ${productId} ao estoque ${stockId}`);

    await request(`/stocks/${stockId}/products`, {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
        minimumQuantity: 1,
      }),
    });
  },

  getProdutosDoEstoque: async (stockId: number): Promise<unknown[]> => {
    console.warn(
      "⚠️ Endpoint de listar produtos do estoque não implementado ainda " +
        stockId
    );
    return [];
  },
};

export default api;
