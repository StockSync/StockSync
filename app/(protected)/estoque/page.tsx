"use client";

import { useState, useEffect } from "react";
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
import { api, EstoqueData } from "@/lib/api"; // 👈 IMPORTAÇÃO NOVA

const EstoquePage = () => {
  // Estados
  const [estoques, setEstoques] = useState<EstoqueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CARREGAR ESTOQUES DA API
  useEffect(() => {
    carregarEstoques();
  }, []);

  const carregarEstoques = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEstoques();
      setEstoques(data);
      console.log("✅ Estoques carregados:", data);
    } catch (err) {
      console.error("❌ Erro ao carregar estoques:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar estoques"
      );
    } finally {
      setLoading(false);
    }
  };

  //ADICIONAR ESTOQUE
  const handleAddEstoque = async (novoEstoque: Omit<EstoqueData, "id">) => {
    try {
      const estoqueCriado = await api.createEstoque(novoEstoque);
      setEstoques((prev) => [...prev, estoqueCriado]);
      console.log("✅ Estoque criado:", estoqueCriado);
    } catch (err) {
      console.error("❌ Erro ao criar estoque:", err);
      alert(
        "Erro ao criar estoque: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    }
  };

  //EDITAR ESTOQUE
  const handleEditEstoque = async (estoqueEditado: EstoqueData) => {
    try {
      const estoqueAtualizado = await api.updateEstoque(
        estoqueEditado.id,
        estoqueEditado
      );
      setEstoques((prev) =>
        prev.map((estoque) =>
          estoque.id === estoqueEditado.id ? estoqueAtualizado : estoque
        )
      );
      console.log("✅ Estoque atualizado:", estoqueAtualizado);
    } catch (err) {
      console.error("❌ Erro ao atualizar estoque:", err);
      alert("Erro ao atualizar estoque");
    }
  };

  //DELETAR ESTOQUE
  const handleDeleteEstoque = async (id: string) => {
    try {
      await api.deleteEstoque(id);
      setEstoques((prev) => prev.filter((estoque) => estoque.id !== id));
      console.log("✅ Estoque deletado");
    } catch (err) {
      console.error("❌ Erro ao deletar estoque:", err);
      alert("Erro ao deletar estoque");
    }
  };

  // LOADING
  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Estoque</PageTitle>
            <PageDescription>Carregando estoques...</PageDescription>
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

  //ERRO
  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Estoque</PageTitle>
            <PageDescription>Erro ao carregar estoques</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddEstoqueButton onAddEstoque={handleAddEstoque} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Package className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Erro ao carregar estoques
              </h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={carregarEstoques}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  //RENDERIZAÇÃO
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
          <AddEstoqueButton onAddEstoque={handleAddEstoque} />
        </PageActions>
      </PageHeader>

      <PageContent>
        {estoques.length > 0 ? (
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
