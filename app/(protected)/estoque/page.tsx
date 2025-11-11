"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { api, EstoqueFrontend } from "@/lib/api";

const EstoquePage = () => {
  const router = useRouter();
  const [estoques, setEstoques] = useState<EstoqueFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarEstoques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarEstoques = async () => {
    if (!api.isAuthenticated()) {
      router.push("/authentication");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getEstoques();
      setEstoques(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        api.logout();
        router.push("/authentication");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Erro ao carregar estoques"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddEstoque = async (novo: {
    name: string;
    location: string;
    products: Array<{ name: string; quantity: number }>;
  }) => {
    try {
      const criado = await api.createEstoque(novo);
      setEstoques([...estoques, criado]);
    } catch (err) {
      alert(
        "Erro ao criar: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleEditEstoque = async (editado: EstoqueFrontend) => {
    try {
      const atualizado = await api.updateEstoque(editado.id, editado);
      setEstoques(estoques.map((e) => (e.id === editado.id ? atualizado : e)));
    } catch (err) {
      alert(
        "Erro ao atualizar: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleDeleteEstoque = async (id: number) => {
    try {
      await api.deleteEstoque(id);
      setEstoques(estoques.filter((e) => e.id !== id));
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
            <PageTitle>Estoque</PageTitle>
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
            <PageTitle>Estoque</PageTitle>
            <PageDescription>Erro ao carregar</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddEstoqueButton onAddEstoque={handleAddEstoque} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={carregarEstoques}
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
          <PageTitle>Estoque</PageTitle>
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
