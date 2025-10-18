import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Minus, Edit } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface ProdutoData {
  id: string;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

interface ProdutosTableProps {
  produtos: ProdutoData[];
  onUpdateQuantidade: (id: string, novaQuantidade: number) => void;
  onEditProduto: (produto: ProdutoData) => void;
  itemsPorPagina?: number;
}

const ProdutosTable = ({
  produtos,
  onUpdateQuantidade,
  onEditProduto,
  itemsPorPagina = 9,
}: ProdutosTableProps) => {
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Calcular dados da paginação
  const totalPaginas = Math.ceil(produtos.length / itemsPorPagina);

  // Corrigir página atual se estiver fora do intervalo válido
  useEffect(() => {
    if (totalPaginas > 0 && paginaAtual > totalPaginas) {
      setPaginaAtual(Math.max(1, totalPaginas));
    }
  }, [produtos.length, totalPaginas, paginaAtual]);

  const indiceInicio = (paginaAtual - 1) * itemsPorPagina;
  const indiceFim = indiceInicio + itemsPorPagina;
  const produtosPaginados = produtos.slice(indiceInicio, indiceFim);

  const aumentarQuantidade = (produto: ProdutoData) => {
    onUpdateQuantidade(produto.id, produto.quantidade + 1);
  };

  const diminuirQuantidade = (produto: ProdutoData) => {
    if (produto.quantidade > 0) {
      onUpdateQuantidade(produto.id, produto.quantidade - 1);
    }
  };

  const getStatusInfo = (quantidade: number) => {
    if (quantidade > 0) {
      return {
        label: "Produto Ativo",
        className:
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
      };
    } else {
      return {
        label: "Produto Inativo",
        className:
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800",
      };
    }
  };

  // Gerar números das páginas para mostrar
  const gerarNumerosPaginas = useMemo(() => {
    const paginas = [];
    const maxPaginasVisiveis = 5;

    if (totalPaginas <= maxPaginasVisiveis) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaAtual <= 3) {
        paginas.push(1, 2, 3, 4);
        if (totalPaginas > 5) paginas.push("ellipsis");
        paginas.push(totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        paginas.push(1);
        if (totalPaginas > 5) paginas.push("ellipsis");
        paginas.push(
          totalPaginas - 3,
          totalPaginas - 2,
          totalPaginas - 1,
          totalPaginas
        );
      } else {
        paginas.push(1);
        paginas.push("ellipsis");
        paginas.push(paginaAtual - 1, paginaAtual, paginaAtual + 1);
        paginas.push("ellipsis");
        paginas.push(totalPaginas);
      }
    }

    return paginas;
  }, [paginaAtual, totalPaginas]);

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };

  if (produtos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum produto cadastrado ainda.</p>
        <p className="text-sm">
          Clique em &quot;Adicionar produto&quot; para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div
        className="rounded-md border"
        style={{ backgroundColor: "#FFFFFF", minHeight: "500px" }}
      >
        <Table style={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <TableHeader>
            <TableRow style={{ backgroundColor: "#E2D8F3" }}>
              <TableHead className="font-medium" style={{ color: "#411A85" }}>
                Produto
              </TableHead>
              <TableHead
                className="font-medium text-center"
                style={{ color: "#411A85" }}
              >
                Quantidade
              </TableHead>
              <TableHead
                className="font-medium text-center"
                style={{ color: "#411A85" }}
              >
                Estoque
              </TableHead>
              <TableHead
                className="font-medium text-center"
                style={{ color: "#411A85" }}
              >
                Status
              </TableHead>
              <TableHead
                className="font-medium text-center"
                style={{ color: "#411A85" }}
              >
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody style={{ minHeight: "500px" }}>
            {produtosPaginados.map((produto) => {
              const status = getStatusInfo(produto.quantidade);

              return (
                <TableRow key={produto.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{produto.nome}</TableCell>

                  <TableCell className="text-center">
                    <span className="font-medium">{produto.quantidade}</span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#E2D8F3", color: "#5B7189" }}
                    >
                      {produto.estoque}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className={status.className}>
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          produto.quantidade > 0 ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => aumentarQuantidade(produto)}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#411A85]"
                        title="Adicionar"
                      >
                        <Plus size={14} />
                      </button>

                      <button
                        onClick={() => diminuirQuantidade(produto)}
                        disabled={produto.quantidade <= 0}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#411A85] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover"
                      >
                        <Minus size={14} />
                      </button>

                      <button
                        onClick={() => onEditProduto(produto)}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#411A85]"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="justify-center">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "#411A85" }}>
              Mostrando {indiceInicio + 1} a{" "}
              {Math.min(indiceFim, produtos.length)} de {produtos.length}{" "}
              produtos
            </p>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      irParaPagina(paginaAtual - 1);
                    }}
                    className={`${
                      paginaAtual === 1
                        ? "pointer-events-none opacity-50"
                        : "hover:text-white"
                    }`}
                    style={{ color: "#411A85" }}
                  >
                    Anterior
                  </PaginationPrevious>
                </PaginationItem>

                {gerarNumerosPaginas.map((pagina, index) => (
                  <PaginationItem key={index}>
                    {pagina === "ellipsis" ? (
                      <PaginationEllipsis style={{ color: "#411A85" }} />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          irParaPagina(pagina as number);
                        }}
                        isActive={pagina === paginaAtual}
                        className={
                          pagina === paginaAtual
                            ? "text-white"
                            : "hover:text-white"
                        }
                        style={{
                          backgroundColor:
                            pagina === paginaAtual ? "#421986" : "transparent",
                          color: pagina === paginaAtual ? "white" : "#411A85",
                          borderColor:
                            pagina === paginaAtual ? "#421986" : "transparent",
                        }}
                      >
                        {pagina}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      irParaPagina(paginaAtual + 1);
                    }}
                    className={`${
                      paginaAtual === totalPaginas
                        ? "pointer-events-none opacity-50"
                        : "hover:text-white"
                    }`}
                    style={{ color: "#411A85" }}
                  >
                    Próximo
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutosTable;
