"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { api, ProdutoFrontend } from "@/lib/api";

const ProdutosPage = () => {
  const router = useRouter();
  const [produtos, setProdutos] = useState<ProdutoFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [produtoEditando, setProdutoEditando] =
    useState<ProdutoFrontend | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarProdutos = async () => {
    if (!api.isAuthenticated()) {
      router.push("/authentication");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getProdutos();
      setProdutos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        api.logout();
        router.push("/authentication");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Erro ao carregar produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRIGIDO: Aceita o campo estoque
  const handleAddProduto = async (novoProduto: {
    nome: string;
    descricao?: string;
    quantidade: number;
    estoque: string; // ✅ Adicionado
    imagem?: string;
  }) => {
    try {
      const criado = await api.createProduto(novoProduto);
      setProdutos([...produtos, criado]);
    } catch (err) {
      alert(
        "Erro ao criar: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleUpdateQuantidade = async (id: number, quantidade: number) => {
    try {
      const atualizado = await api.updateProdutoQuantidade(id, quantidade);
      setProdutos(produtos.map((p) => (p.id === id ? atualizado : p)));
    } catch (err) {
      alert(
        "Erro ao atualizar: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleEditProduto = (produto: ProdutoFrontend) => {
    setProdutoEditando({ ...produto });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProduto = async (editado: ProdutoFrontend) => {
    try {
      const atualizado = await api.updateProduto(editado.id, editado);
      setProdutos(produtos.map((p) => (p.id === editado.id ? atualizado : p)));
      setIsEditModalOpen(false);
      setProdutoEditando(null);
    } catch (err) {
      alert(
        "Erro ao atualizar: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleDeleteProduto = async (id: number) => {
    try {
      await api.deleteProduto(id);
      setProdutos(produtos.filter((p) => p.id !== id));
      setIsEditModalOpen(false);
      setProdutoEditando(null);
    } catch (err) {
      alert(
        "Erro ao deletar: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Produtos</PageTitle>
            <PageDescription>Carregando...</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
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
            <PageDescription>Erro ao carregar</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddProdutoButton onAddProduto={handleAddProduto} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={carregarProdutos}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
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
          <PageTitle>Produtos</PageTitle>
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
          onClose={() => setIsEditModalOpen(false)}
          initialData={produtoEditando}
        />
      </Dialog>
    </PageContainer>
  );
};

export default ProdutosPage;
