"use client";

import React, { useState, useEffect } from "react";
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
import { api, ProdutoData } from "@/lib/api";

export default function Dashboard() {
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inicializarDashboard();
  }, []);

  const inicializarDashboard = async () => {
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
      console.log("✅ Produtos carregados no Dashboard:", data);
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

  const carregarProdutos = inicializarDashboard;

  // Cálculos
  const totalProdutos = produtos.length;
  const produtosAtivos = produtos.filter((p) => p.quantidade > 0).length;
  const produtosInativos = produtos.filter((p) => p.quantidade === 0).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e acompanhe o resumo do seu estoque em tempo real.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : error ? (
          /* Erro */
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Package className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Erro ao carregar dados
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
        ) : (
          /* Conteúdo Normal */
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Total de Produtos */}
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
                        {totalProdutos}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
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

              {/* Produtos Ativos */}
              <Card className="border border-gray-200 bg-white rounded-lg shadow-md">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Produtos Ativos
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {produtosAtivos}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Produtos Inativos */}
              <Card className="border border-gray-200 bg-white rounded-lg shadow-md">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Produtos Inativos
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {produtosInativos}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Produtos */}
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

                {produtos.length === 0 ? (
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
                            Estoque
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
                        {produtos.slice(0, 8).map((produto) => (
                          <TableRow
                            key={produto.id}
                            className="border-b border-gray-100"
                          >
                            <TableCell className="font-normal text-sm text-gray-900">
                              {produto.nome}
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-900">
                              {produto.quantidade}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: "#E2D8F3",
                                  color: "#5B7189",
                                }}
                              >
                                {produto.estoque}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  produto.quantidade > 0
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    produto.quantidade > 0
                                      ? "bg-green-700"
                                      : "bg-red-700"
                                  }`}
                                />
                                {produto.quantidade > 0
                                  ? "Produto Ativo"
                                  : "Produto Inativo"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
