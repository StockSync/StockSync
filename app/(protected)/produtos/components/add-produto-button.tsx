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

import { Plus, Upload } from "lucide-react";

// Tipagem para os dados do produto
interface ProdutoData {
  id: string;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

// Props que o componente recebe
interface AddProdutoButtonProps {
  onAddProduto: (produto: ProdutoData) => void;
}

interface FormErrors {
  nome?: string;
  quantidade?: string;
  estoque?: string;
  observacao?: string;
}

const AddProdutoButton = ({ onAddProduto }: AddProdutoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    quantidade: "",
    estoque: "",
    observacao: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome do produto é obrigatório";
      hasErrors = true;
    }

    // Validar quantidade
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = "Quantidade deve ser maior que 0";
      hasErrors = true;
    }

    // Validar estoque
    if (!formData.estoque.trim()) {
      newErrors.estoque = "Nome do estoque é obrigatório";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Preparar dados para enviar
    const produtoData: ProdutoData = {
      id: Date.now().toString(),
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade) || 0,
      estoque: formData.estoque,
      imagem: imagemPreview || undefined,
      observacao: formData.observacao || undefined,
    };

    // Chamar a função de callback para salvar
    onAddProduto(produtoData);

    // Resetar formulário e fechar modal
    setFormData({
      nome: "",
      quantidade: "",
      estoque: "",
      observacao: "",
    });
    setImagemPreview(null);
    setErrors({});
    setIsOpen(false);
  };

  const handleClose = () => {
    // Resetar formulário ao fechar
    setFormData({
      nome: "",
      quantidade: "",
      estoque: "",
      observacao: "",
    });
    setImagemPreview(null);
    setErrors({});
    setIsOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro quando usuário começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#421986] hover:bg-[#421986]/90 text-white px-4 py-2 rounded-md">
          <Plus />
          Adicionar produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Adicionar um produto</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {/* Nome do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto
              </label>
              <input
                type="text"
                placeholder="Ex: Notebook Dell"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                placeholder="Ex: 5"
                min="1"
                value={formData.quantidade}
                onChange={(e) =>
                  handleInputChange("quantidade", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                  errors.quantidade ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.quantidade && (
                <p className="text-red-500 text-xs mt-1">{errors.quantidade}</p>
              )}
            </div>

            {/* Estoque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque
              </label>
              <input
                type="text"
                placeholder="Ex: Estoque Alfa - Brasília"
                value={formData.estoque}
                onChange={(e) => handleInputChange("estoque", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                  errors.estoque ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.estoque && (
                <p className="text-red-500 text-xs mt-1">{errors.estoque}</p>
              )}
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={handleImageClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {imagemPreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagemPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-gray-500">Clique para alterar</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mb-2">
                      <Upload size={16} className="text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <textarea
                placeholder="Alguma observação sobre o produto (opcional)"
                value={formData.observacao}
                onChange={(e) =>
                  handleInputChange("observacao", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-transparent resize-none"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 text-white rounded-md hover:opacity-90 text-sm"
                style={{ backgroundColor: "#421986" }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProdutoButton;
