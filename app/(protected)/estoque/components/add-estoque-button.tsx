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
import { EstoqueFrontend } from "@/lib/api"; 

interface AddEstoqueButtonProps {
  // ✅ CORREÇÃO: Usamos o tipo correto em vez de 'any'
  onAddEstoque: (estoque: EstoqueFrontend) => void;
}

const AddEstoqueButton = ({ onAddEstoque }: AddEstoqueButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (novoEstoque: EstoqueFrontend) => {
    onAddEstoque(novoEstoque);
    setIsOpen(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#421986] hover:bg-[#421986]/90 text-white px-4 py-2 rounded-md">
          <Plus className="w-4 h-4 mr-2" />
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