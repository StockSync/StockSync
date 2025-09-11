"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import AddEstoqueButton from "./components/add-estoque-button";
import EstoqueCard from "./components/estoque-card";

// Tipagem para os dados do estoque
interface EstoqueData {
  id: string;
  name: string;
  location: string;
  image?: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
}

const EstoquePage = () => {
  // Estado para armazenar todos os estoques
  const [estoques, setEstoques] = useState<EstoqueData[]>([]);

  // Função para adicionar novo estoque
  const handleAddEstoque = (novoEstoque: EstoqueData) => {
    setEstoques((prev) => [...prev, novoEstoque]);
  };

  // Função para editar estoque existente
  const handleEditEstoque = (estoqueEditado: EstoqueData) => {
    setEstoques((prev) =>
      prev.map((estoque) =>
        estoque.id === estoqueEditado.id ? estoqueEditado : estoque
      )
    );
  };

  // Função para deletar estoque
  const handleDeleteEstoque = (id: string) => {
    setEstoques((prev) => prev.filter((estoque) => estoque.id !== id));
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="estoque-page-title">
            <PageTitle>Estoque</PageTitle>
          </div>
          <PageDescription>
            Gerencie todos os seus estoques de forma simples e organizada.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {/* Passa a função handleAddEstoque para o botão */}
          <AddEstoqueButton onAddEstoque={handleAddEstoque} />
        </PageActions>
      </PageHeader>

      <PageContent>
        {estoques.length > 0 ? (
          // Mostra os cards em grid quando há estoques
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estoques.map((estoque) => (
              <EstoqueCard
                key={estoque.id}
                estoque={estoque}
                onEdit={handleEditEstoque}
                onDelete={handleDeleteEstoque}
              />
            ))}
          </div>
        ) : (
          // Estado vazio - quando não há estoques cadastrados
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum estoque cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando seu primeiro estoque
            </p>
            <AddEstoqueButton onAddEstoque={handleAddEstoque} />
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default EstoquePage;
