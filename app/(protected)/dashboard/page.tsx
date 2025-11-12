"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, DashboardDTO } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    if (!api.isAuthenticated()) {
      router.push("/authentication");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("❌ Erro:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        api.logout();
        router.push("/authentication");
        return;
      }
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Carregando...</p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-medium mb-2 text-red-600">
              Erro ao carregar
            </h3>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={carregarDados}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e acompanhe o resumo do seu estoque em tempo real.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="border border-gray-200 bg-white rounded-lg shadow-md">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Total de Produtos
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "#411A85" }}
                  >
                    {dashboard.totalProducts}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E2D8F3" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#411A85" }}
                  >
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white rounded-lg shadow-md">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboard.activeProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white rounded-lg shadow-md">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Produtos Inativos
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {dashboard.inactiveProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="border border-gray-200 shadow-md bg-white rounded-lg py-1">
          <CardContent className="p-6 pt-3 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: "#411A85" }} />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "#411A85" }}
                >
                  Produtos
                </h2>
              </div>
              <a
                href="/produtos"
                className="text-sm font-medium hover:underline cursor-pointer"
                style={{ color: "#411A85" }}
              >
                Ver todos
              </a>
            </div>

            {dashboard.products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "#E2D8F3" }}>
                      <TableHead
                        className="font-medium text-sm"
                        style={{ color: "#411A85" }}
                      >
                        Produto
                      </TableHead>
                      <TableHead
                        className="font-medium text-sm text-center"
                        style={{ color: "#411A85" }}
                      >
                        Quantidade
                      </TableHead>
                      <TableHead
                        className="font-medium text-sm text-center"
                        style={{ color: "#411A85" }}
                      >
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.products.slice(0, 8).map((produto) => {
                      // ✅ CORREÇÃO: Pega a quantidade do primeiro estoque
                      const quantidade = produto.stocks?.[0]?.quantity || 0;
                      // ✅ CORREÇÃO: Status correto (ATIVO/INATIVO em português)
                      const isAtivo = produto.status === "ATIVO";

                      return (
                        <TableRow
                          key={produto.id}
                          className="border-b border-gray-100"
                        >
                          <TableCell className="font-normal text-sm text-gray-900">
                            {produto.name}
                          </TableCell>
                          {/* ✅ CORREÇÃO: Mostra quantidade em vez de SKU */}
                          <TableCell className="text-center text-sm text-gray-900">
                            <span className="font-medium">{quantidade}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                isAtivo
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  isAtivo ? "bg-green-700" : "bg-red-700"
                                }`}
                              />
                              {isAtivo ? "Produto Ativo" : "Produto Inativo"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
