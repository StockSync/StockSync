// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ==================== INTERFACES ====================

// Produto
export interface ProdutoData {
  id: string;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

// Estoque
export interface EstoqueData {
  id: string;
  name: string;
  location: string;
  image?: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
}

// Usuário/Auth
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para pegar o token do localStorage (caso esteja usando JWT)
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Função para salvar o token
function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

// Função para remover o token (logout)
function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

// Função auxiliar para fazer requisições HTTP
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Adiciona token de autenticação se existir
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    // Se for 204 (No Content), retorna null
    if (response.status === 204) {
      return null as T;
    }

    // Se não for OK, lança erro
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Erro HTTP: ${response.status}`,
      }));
      throw new Error(error.message || `Erro: ${response.status}`);
    }

    // Retorna os dados em JSON
    return await response.json();
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    throw error;
  }
}

// ==================== API OBJECT ====================

export const api = {
  // ========== AUTENTICAÇÃO ==========

  /**
   * Fazer login
   * POST /api/auth/login ou /api/login
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Salva o token após login bem-sucedido
    if (response.token) {
      saveToken(response.token);
    }

    return response;
  },

  /**
   * Fazer registro
   * POST /api/auth/register ou /api/register
   */
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> => {
    const response = await request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    // Salva o token após registro bem-sucedido
    if (response.token) {
      saveToken(response.token);
    }

    return response;
  },

  /**
   * Fazer logout
   */
  logout: (): void => {
    removeToken();
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  /**
   * Pegar usuário atual
   * GET /api/auth/me ou /api/user
   */
  getCurrentUser: (): Promise<User> => {
    return request<User>("/api/auth/me");
  },

  // ========== PRODUTOS ==========

  /**
   * Listar todos os produtos
   * GET /api/produtos
   */
  getProdutos: (): Promise<ProdutoData[]> => {
    return request<ProdutoData[]>("/api/produtos");
  },

  /**
   * Buscar um produto específico
   * GET /api/produtos/{id}
   */
  getProduto: (id: string): Promise<ProdutoData> => {
    return request<ProdutoData>(`/api/produtos/${id}`);
  },

  /**
   * Criar novo produto
   * POST /api/produtos
   */
  createProduto: (produto: Omit<ProdutoData, "id">): Promise<ProdutoData> => {
    return request<ProdutoData>("/api/produtos", {
      method: "POST",
      body: JSON.stringify(produto),
    });
  },

  /**
   * Atualizar produto existente
   * PUT /api/produtos/{id}
   */
  updateProduto: (
    id: string,
    produto: Partial<ProdutoData>
  ): Promise<ProdutoData> => {
    return request<ProdutoData>(`/api/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(produto),
    });
  },

  /**
   * Atualizar apenas a quantidade do produto
   * PATCH /api/produtos/{id}/quantidade
   */
  updateProdutoQuantidade: (
    id: string,
    quantidade: number
  ): Promise<ProdutoData> => {
    return request<ProdutoData>(`/api/produtos/${id}/quantidade`, {
      method: "PATCH",
      body: JSON.stringify({ quantidade }),
    });
  },

  /**
   * Deletar produto
   * DELETE /api/produtos/{id}
   */
  deleteProduto: (id: string): Promise<void> => {
    return request<void>(`/api/produtos/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Buscar produtos por nome
   * GET /api/produtos/buscar?nome=termo
   */
  searchProdutos: (nome: string): Promise<ProdutoData[]> => {
    return request<ProdutoData[]>(
      `/api/produtos/buscar?nome=${encodeURIComponent(nome)}`
    );
  },

  // ========== ESTOQUES ==========

  /**
   * Listar todos os estoques
   * GET /api/estoques
   */
  getEstoques: (): Promise<EstoqueData[]> => {
    return request<EstoqueData[]>("/api/estoques");
  },

  /**
   * Buscar um estoque específico
   * GET /api/estoques/{id}
   */
  getEstoque: (id: string): Promise<EstoqueData> => {
    return request<EstoqueData>(`/api/estoques/${id}`);
  },

  /**
   * Criar novo estoque
   * POST /api/estoques
   */
  createEstoque: (estoque: Omit<EstoqueData, "id">): Promise<EstoqueData> => {
    return request<EstoqueData>("/api/estoques", {
      method: "POST",
      body: JSON.stringify(estoque),
    });
  },

  /**
   * Atualizar estoque existente
   * PUT /api/estoques/{id}
   */
  updateEstoque: (
    id: string,
    estoque: Partial<EstoqueData>
  ): Promise<EstoqueData> => {
    return request<EstoqueData>(`/api/estoques/${id}`, {
      method: "PUT",
      body: JSON.stringify(estoque),
    });
  },

  /**
   * Deletar estoque
   * DELETE /api/estoques/{id}
   */
  deleteEstoque: (id: string): Promise<void> => {
    return request<void>(`/api/estoques/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Buscar estoques por localização
   * GET /api/estoques/buscar?location=termo
   */
  searchEstoques: (location: string): Promise<EstoqueData[]> => {
    return request<EstoqueData[]>(
      `/api/estoques/buscar?location=${encodeURIComponent(location)}`
    );
  },
};

export default api;
