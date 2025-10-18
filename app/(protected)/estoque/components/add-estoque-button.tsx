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
import UpsertEstoqueForm from "./upsert-estoque-form";

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

// Props que o componente recebe
interface AddEstoqueButtonProps {
  onAddEstoque: (estoque: EstoqueData) => void;
}

const AddEstoqueButton = ({ onAddEstoque }: AddEstoqueButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (novoEstoque: EstoqueData) => {
    onAddEstoque(novoEstoque);
    setIsOpen(false); // Fecha o modal após salvar
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#421986] hover:bg-[#421986]/90 text-white px-4 py-2 rounded-md">
          <Plus />
          Adicionar estoque
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
        </DialogHeader>
        <UpsertEstoqueForm
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEstoqueButton;
