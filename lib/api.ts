// src/lib/api.ts - VERSÃO COMPLETA ATUALIZADA

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

// ✅ ATUALIZADO: ProductDTO agora pode receber stocks
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
    productStatus?: string;
  }>;
}

export interface ProductRequestDTO {
  name: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  status?: "ATIVO" | "INATIVO";
}

// ✅ ATUALIZADO: StockDTO agora pode receber products
export interface StockDTO {
  stockId: number;
  name: string;
  location?: string;
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

const DEFAULT_STOCK_NAME = "Estoque Principal";

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

  // ✅ ATUALIZADO: Agora pega quantidade e estoque do backend
  getProdutos: async (): Promise<ProdutoFrontend[]> => {
    try {
      console.log("📤 Buscando produtos...");
      const products = await request<ProductDTO[]>("/products");

      return products.map((product) => {
        // Pega o primeiro estoque vinculado (se existir)
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

  // ✅ ATUALIZADO: Garante que existe estoque padrão
  createProduto: async (produto: {
    nome: string;
    descricao?: string;
    quantidade: number;
    estoque: string;
    imagem?: string;
  }): Promise<ProdutoFrontend> => {
    console.log("➕ Criando produto:", produto);

    try {
      // PASSO 1: Criar produto no catálogo (SEM estoque)
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

      // PASSO 2: Se tem quantidade > 0, adicionar ao estoque
      if (produto.quantidade > 0) {
        try {
          console.log("📦 PASSO 2: Adicionando produto ao estoque...");

          // Busca o estoque selecionado
          const stocks = await request<StockDTO[]>("/stocks");
          let targetStock = stocks.find((s) => s.name === produto.estoque);

          // Se não existe, cria o estoque
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

          // Adiciona produto ao estoque (cria registro em estoque_produto)
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
          console.warn(
            "⚠️ Produto foi criado no catálogo, mas não foi adicionado ao estoque"
          );

          alert(
            `Produto "${produto.nome}" foi criado, mas não foi possível adicionar ao estoque "${produto.estoque}". Você pode adicionar manualmente depois.`
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
    console.log("🔢 Atualizando quantidade:", id, quantidade);

    const product = await request<ProductDTO>(`/products/${id}`);

    const updated = await request<ProductDTO>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...product,
        status: quantidade > 0 ? "ATIVO" : "INATIVO",
      }),
    });

    return {
      id: updated.id,
      nome: updated.name,
      descricao: updated.description,
      quantidade: quantidade,
      estoque: DEFAULT_STOCK_NAME,
      imagem: updated.imageUrl,
      status: updated.status,
    };
  },

  updateProduto: async (
    id: number,
    produto: Partial<ProdutoFrontend>
  ): Promise<ProdutoFrontend> => {
    console.log("✏️ Atualizando produto:", id);

    const updated = await request<ProductDTO>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: produto.nome,
        description: produto.descricao,
        imageUrl: produto.imagem,
        status: produto.status || "ATIVO",
      }),
    });

    return {
      id: updated.id,
      nome: updated.name,
      descricao: updated.description,
      quantidade: produto.quantidade || 0,
      estoque: DEFAULT_STOCK_NAME,
      imagem: updated.imageUrl,
      status: updated.status,
    };
  },

  deleteProduto: async (id: number): Promise<void> => {
    console.log("🗑️ Deletando produto:", id);
    await request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // ========== ESTOQUES ==========

  // ✅ ATUALIZADO: Agora pega produtos de cada estoque
  getEstoques: async (): Promise<EstoqueFrontend[]> => {
    try {
      const stocks = await request<StockDTO[]>("/stocks");

      return stocks.map((stock) => ({
        id: stock.stockId,
        name: stock.name,
        location: stock.location || "",
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
    products: Array<{ name: string; quantity: number }>;
  }): Promise<EstoqueFrontend> => {
    console.log("➕ Criando estoque:", estoque);

    const created = await request<StockDTO>("/stocks", {
      method: "POST",
      body: JSON.stringify({
        name: estoque.name,
        location: estoque.location,
        products: [],
      }),
    });

    console.log("✅ Estoque criado:", created);

    return {
      id: created.stockId,
      name: created.name,
      location: created.location || "",
      products: [],
    };
  },

  updateEstoque: async (
    id: number,
    estoque: Partial<EstoqueFrontend>
  ): Promise<EstoqueFrontend> => {
    console.log("✏️ Atualizando estoque:", id);

    const updated = await request<StockDTO>(`/stocks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: estoque.name,
        location: estoque.location,
        products: [],
      }),
    });

    return {
      id: updated.stockId,
      name: updated.name,
      location: updated.location || "",
      products: estoque.products || [],
    };
  },

  deleteEstoque: async (id: number): Promise<void> => {
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

  getProdutosDoEstoque: async (stockId: number): Promise<any[]> => {
    console.warn(
      "⚠️ Endpoint de listar produtos do estoque não implementado ainda"
    );
    return [];
  },
};

export default api;
