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
// Definição de tipo ProdutoData para ser consistente com o formulário
import { api, ProdutoFrontend } from "@/lib/api";

// 🔑 Interface de dados do formulário (compatível com UpsertProdutoForm)
interface ProdutoData {
  id: number;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

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

  // Funções de manipulação (Add/Edit/Delete)

  // Funções de Criação (handleSave, mas sem stockId, pois é criação)
  const handleAddProduto = async (novoProduto: ProdutoData) => {
    try {
      // 📝 Para criação, não precisamos do stockId aqui, pois a API lida com o estoque pelo nome
      const criado = await api.createProduto(novoProduto);

      // Recarrega a lista para obter o ID real do produto e do estoque
      await carregarProdutos();

      alert(`Produto ${novoProduto.nome} criado com sucesso!`);
    } catch (err) {
      alert(
        "Erro ao criar: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleUpdateQuantidade = async (id: number, quantidade: number) => {
    try {
      // ⚠️ Atenção: Esta função api.updateProdutoQuantidade deve ser revisada
      // Ela não usa o ID do estoque, o que pode causar problemas se a API exigir.
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

  // 🛑 CORREÇÃO CRÍTICA AQUI: Recebe o stockId e valida antes de chamar a API
  const handleSaveEditProduto = async (
    editado: ProdutoData,
    stockId?: number
  ) => {
    try {
      // 1. Validação de ID do Produto e Estoque
      if (editado.id <= 0) {
        throw new Error("ID do Produto inválido para atualização.");
      }

      if (!stockId || stockId <= 0) {
        // Se o stockId não veio (o que não deveria acontecer, pois o form valida), alertamos.
        throw new Error(
          "ID de Estoque inválido para atualização. Tente selecionar o estoque novamente."
        );
      }

      // 2. Chamada da API com todos os dados
      // Chamada para atualizar produto: idProduto, data, idEstoque, novaQuantidade
      // O campo 'quantidade' vem dentro de 'editado'
      const atualizado = await api.updateProduto(
        editado.id,
        editado,
        stockId,
        editado.quantidade
      );

      // 3. Atualiza o estado local
      setProdutos(produtos.map((p) => (p.id === editado.id ? atualizado : p)));
      setIsEditModalOpen(false);
      setProdutoEditando(null);

      alert(`Produto ${editado.nome} atualizado com sucesso!`);
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      // Exibe a mensagem de erro que você estava vendo no pop-up do navegador
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
      alert("Produto excluído com sucesso!");
    } catch (err) {
      alert(
        "Erro ao deletar: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  // Renderização de Estados (Loading, Error, Default)

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
            {/* Note: O AddProdutoButton está chamando handleAddProduto que espera ProdutoData, não um evento */}
            <AddProdutoButton
              onAddProduto={(data) => handleAddProduto(data as ProdutoData)}
            />
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
          <AddProdutoButton
            onAddProduto={(data) => handleAddProduto(data as ProdutoData)}
          />
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
            <AddProdutoButton
              onAddProduto={(data) => handleAddProduto(data as ProdutoData)}
            />
          </div>
        )}
      </PageContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <UpsertProdutoForm
          // 🛑 AQUI ESTÁ A CHAVE: onSave precisa de dois argumentos
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
