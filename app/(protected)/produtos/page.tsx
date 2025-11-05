"use client";

import { useState, useEffect } from "react";
import { Package2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import AddProdutoButton from "./components/add-produto-button";
import ProdutosTable from "./components/produtos-table";
import UpsertProdutoForm from "./components/upsert-produto-form";
import { api, ProdutoData } from "@/lib/api";

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoData | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se já está logado
      if (!api.isAuthenticated()) {
        console.log("⚠️ Não autenticado, redirecionando para login...");
        window.location.href = "/authentication";
        return;
      }

      const data = await api.getProdutos();
      setProdutos(data);
      console.log("✅ Produtos carregados:", data);
    } catch (err) {
      console.error("❌ Erro ao carregar produtos:", err);

      // Se for erro 401 ou 403, redireciona para login
      if (
        err instanceof Error &&
        (err.message.includes("401") || err.message.includes("403"))
      ) {
        console.log("🔒 Token inválido, redirecionando para login...");
        api.logout();
        window.location.href = "/authentication";
        return;
      }

      setError(
        err instanceof Error ? err.message : "Erro ao carregar produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduto = async (novoProduto: Omit<ProdutoData, "id">) => {
    try {
      const produtoCriado = await api.createProduto(novoProduto);
      setProdutos((prev) => [...prev, produtoCriado]);
      console.log("✅ Produto criado:", produtoCriado);
    } catch (err) {
      console.error("❌ Erro ao criar produto:", err);
      alert(
        "Erro ao criar produto: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    }
  };

  const handleUpdateQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      const produtoAtualizado = await api.updateProdutoQuantidade(
        id,
        novaQuantidade
      );
      setProdutos((prev) =>
        prev.map((produto) => (produto.id === id ? produtoAtualizado : produto))
      );
      console.log("✅ Quantidade atualizada:", produtoAtualizado);
    } catch (err) {
      console.error("❌ Erro ao atualizar quantidade:", err);
      alert("Erro ao atualizar quantidade");
    }
  };

  const handleEditProduto = (produto: ProdutoData) => {
    console.log("Produto selecionado para edição:", produto);
    setProdutoEditando({ ...produto });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProduto = async (produtoEditado: ProdutoData) => {
    try {
      const produtoAtualizado = await api.updateProduto(
        produtoEditado.id,
        produtoEditado
      );
      setProdutos((prev) =>
        prev.map((produto) =>
          produto.id === produtoEditado.id ? produtoAtualizado : produto
        )
      );
      setIsEditModalOpen(false);
      setProdutoEditando(null);
      console.log("✅ Produto atualizado:", produtoAtualizado);
    } catch (err) {
      console.error("❌ Erro ao atualizar produto:", err);
      alert("Erro ao atualizar produto");
    }
  };

  const handleDeleteProduto = async (id: string) => {
    try {
      await api.deleteProduto(id);
      setProdutos((prev) => prev.filter((produto) => produto.id !== id));
      setIsEditModalOpen(false);
      setProdutoEditando(null);
      console.log("✅ Produto deletado");
    } catch (err) {
      console.error("❌ Erro ao deletar produto:", err);
      alert("Erro ao deletar produto");
    }
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setProdutoEditando(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Produtos</PageTitle>
            <PageDescription>Carregando produtos...</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Produtos</PageTitle>
            <PageDescription>Erro ao carregar produtos</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddProdutoButton onAddProduto={handleAddProduto} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Package2 className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Erro ao carregar produtos
              </h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={carregarProdutos}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="produtos-page-title">
            <PageTitle>Produtos</PageTitle>
          </div>
          <PageDescription>
            Gerencie todos os seus produtos de forma simples e organizada.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddProdutoButton onAddProduto={handleAddProduto} />
        </PageActions>
      </PageHeader>

      <PageContent>
        {produtos.length > 0 ? (
          <ProdutosTable
            produtos={produtos}
            onUpdateQuantidade={handleUpdateQuantidade}
            onEditProduto={handleEditProduto}
          />
        ) : (
          <div className="text-center py-12">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando seu primeiro produto
            </p>
            <AddProdutoButton onAddProduto={handleAddProduto} />
          </div>
        )}
      </PageContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <UpsertProdutoForm
          onSave={handleSaveEditProduto}
          onDelete={handleDeleteProduto}
          onClose={handleCloseEdit}
          initialData={produtoEditando}
        />
      </Dialog>
    </PageContainer>
  );
};

export default ProdutosPage;
