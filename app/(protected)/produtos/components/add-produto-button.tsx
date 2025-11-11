"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";
import { api } from "@/lib/api";

interface AddProdutoData {
  nome: string;
  descricao?: string;
  quantidade: number;
  estoque: string; // Nome do estoque
  imagem?: string;
}

interface AddProdutoButtonProps {
  onAddProduto: (produto: AddProdutoData) => void;
}

interface FormErrors {
  nome?: string;
  quantidade?: string;
  estoque?: string;
}

const AddProdutoButton = ({ onAddProduto }: AddProdutoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    quantidade: "",
    estoque: "",
    descricao: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [estoques, setEstoques] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [loadingEstoques, setLoadingEstoques] = useState(false);

  // Buscar estoques quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      carregarEstoques();
    }
  }, [isOpen]);

  const carregarEstoques = async () => {
    try {
      setLoadingEstoques(true);
      const data = await api.getEstoques();
      setEstoques(data);

      // Se tiver estoques, seleciona o primeiro automaticamente
      if (data.length > 0 && !formData.estoque) {
        setFormData((prev) => ({ ...prev, estoque: data[0].name }));
      }
    } catch (error) {
      console.error("Erro ao carregar estoques:", error);
    } finally {
      setLoadingEstoques(false);
    }
  };

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

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome do produto é obrigatório";
      hasErrors = true;
    }

    if (!formData.quantidade || parseInt(formData.quantidade) < 0) {
      newErrors.quantidade = "Quantidade deve ser maior ou igual a 0";
      hasErrors = true;
    }

    if (!formData.estoque.trim()) {
      newErrors.estoque = "Selecione um estoque";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const produtoData: AddProdutoData = {
      nome: formData.nome,
      descricao: formData.descricao || undefined,
      quantidade: parseInt(formData.quantidade) || 0,
      estoque: formData.estoque,
      imagem: imagemPreview || undefined,
    };

    console.log("📤 Enviando produto:", produtoData);
    onAddProduto(produtoData);

    // Resetar formulário e fechar modal
    setFormData({
      nome: "",
      quantidade: "",
      estoque: estoques.length > 0 ? estoques[0].name : "",
      descricao: "",
    });
    setImagemPreview(null);
    setErrors({});
    setIsOpen(false);
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      quantidade: "",
      estoque: "",
      descricao: "",
    });
    setImagemPreview(null);
    setErrors({});
    setIsOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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
                min="0"
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

            {/* Estoque - SELECT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque
              </label>
              {loadingEstoques ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500">
                  Carregando estoques...
                </div>
              ) : estoques.length > 0 ? (
                <select
                  value={formData.estoque}
                  onChange={(e) => handleInputChange("estoque", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                    errors.estoque ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione um estoque</option>
                  {estoques.map((estoque) => (
                    <option key={estoque.id} value={estoque.name}>
                      {estoque.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ex: Estoque Principal"
                    value={formData.estoque}
                    onChange={(e) =>
                      handleInputChange("estoque", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                      errors.estoque ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <p className="text-xs text-gray-500">
                    Nenhum estoque encontrado. Digite o nome de um novo estoque.
                  </p>
                </div>
              )}
              {errors.estoque && (
                <p className="text-red-500 text-xs mt-1">{errors.estoque}</p>
              )}
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem (opcional)
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

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                placeholder="Alguma observação sobre o produto"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
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
