"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import UpsertProdutoForm from "./upsert-produto-form";

// ✅ CORREÇÃO: ID agora é number
interface ProdutoData {
  id: number;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

interface AddProdutoButtonProps {
  onAddProduto: (produto: ProdutoData) => void;
}

const AddProdutoButton = ({ onAddProduto }: AddProdutoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (novoProduto: ProdutoData, stockId?: number) => {
    onAddProduto(novoProduto);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#421986] hover:bg-[#421986]/90 text-white px-4 py-2 rounded-md">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
        </DialogHeader>
        <UpsertProdutoForm
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddProdutoButton;