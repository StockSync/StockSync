"use client";
import { useState } from "react";
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

// Tipagem para os dados do produto
interface ProdutoData {
  id: string;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

const ProdutosPage = () => {
  // Estado para armazenar todos os produtos
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);

  // Estados para controlar a edição
  const [produtoEditando, setProdutoEditando] = useState<ProdutoData | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Função para adicionar novo produto
  const handleAddProduto = (novoProduto: ProdutoData) => {
    setProdutos((prev) => [...prev, novoProduto]);
  };

  // Função para atualizar quantidade do produto
  const handleUpdateQuantidade = (id: string, novaQuantidade: number) => {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === id ? { ...produto, quantidade: novaQuantidade } : produto
      )
    );
  };

  // Função para editar produto existente
  const handleEditProduto = (produto: ProdutoData) => {
    console.log("Produto selecionado para edição:", produto);
    setProdutoEditando({ ...produto });
    setIsEditModalOpen(true);
  };

  // Função para salvar as edições
  const handleSaveEditProduto = (produtoEditado: ProdutoData) => {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === produtoEditado.id ? produtoEditado : produto
      )
    );
    setIsEditModalOpen(false);
    setProdutoEditando(null);
  };

  // Função para deletar produto
  const handleDeleteProduto = (id: string) => {
    setProdutos((prev) => prev.filter((produto) => produto.id !== id));
    setIsEditModalOpen(false);
    setProdutoEditando(null);
  };

  // Função para fechar o modal de edição
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setProdutoEditando(null);
  };

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

      {/* Modal de Edição */}
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
