import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Nome da unidade é obrigatório.",
  }),
  responsible: z.string().trim().min(1, {
    message: "Responsável é obrigatório.",
  }),
  location: z.string().trim().min(1, {
    message: "Local é obrigatório.",
  }),
  image: z.string().optional().or(z.instanceof(File).optional()),
  products: z
    .array(
      z.object({
        name: z.string().trim().min(1, {
          message: "Nome do produto é obrigatório.",
        }),
        quantity: z.number().min(1, {
          message: "Quantidade deve ser maior que 0.",
        }),
      })
    )
    .min(1, {
      message: "Adicione pelo menos um produto.",
    }),
});

export { formSchema };

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

interface UpsertEstoqueFormProps {
  onClose?: () => void;
  onSave?: (data: EstoqueData) => void;
  initialData?: EstoqueData | null;
}

interface FormErrors {
  name?: string;
  location?: string;
  products?: string;
  productErrors?: { [key: number]: { name?: string; quantity?: string } };
}

const UpsertEstoqueForm = ({
  onClose,
  onSave,
  initialData = null,
}: UpsertEstoqueFormProps) => {
  // Inicializar produtos baseado nos dados existentes ou novo produto vazio
  const [produtos, setProdutos] = useState(
    initialData?.products.map((p, index) => ({
      id: index + 1,
      name: p.name,
      quantity: p.quantity.toString(),
    })) || [{ id: 1, name: "", quantity: "" }]
  );

  const [, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(
    initialData?.image || null
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
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

  const adicionarProduto = () => {
    const novoProduto = {
      id: Date.now(),
      name: "",
      quantity: "",
    };
    setProdutos([...produtos, novoProduto]);
  };

  const removerProduto = (id: number) => {
    if (produtos.length > 1) {
      setProdutos(produtos.filter((produto) => produto.id !== id));

      // Limpar erros do produto removido
      setErrors((prev) => ({
        ...prev,
        productErrors: prev.productErrors
          ? Object.fromEntries(
              Object.entries(prev.productErrors).filter(
                ([key]) => parseInt(key) !== id
              )
            )
          : {},
      }));
    }
  };

  const atualizarProduto = (id: number, campo: string, valor: string) => {
    setProdutos(
      produtos.map((produto) =>
        produto.id === id ? { ...produto, [campo]: valor } : produto
      )
    );

    // Limpar erro do campo quando usuário começar a digitar
    if (
      errors.productErrors?.[id]?.[
        campo as keyof (typeof errors.productErrors)[0]
      ]
    ) {
      setErrors((prev) => ({
        ...prev,
        productErrors: {
          ...prev.productErrors,
          [id]: {
            ...prev.productErrors?.[id],
            [campo]: undefined,
          },
        },
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome da unidade é obrigatório";
      hasErrors = true;
    }

    // Validar local
    if (!formData.location.trim()) {
      newErrors.location = "Local é obrigatório";
      hasErrors = true;
    }

    // Validar produtos
    const produtosValidos = produtos.filter((p) => p.name.trim() && p.quantity);
    if (produtosValidos.length === 0) {
      newErrors.products = "Adicione pelo menos um produto válido";
      hasErrors = true;
    }

    // Validar cada produto individualmente
    const productErrors: {
      [key: number]: { name?: string; quantity?: string };
    } = {};
    produtos.forEach((produto) => {
      const produtoErros: { name?: string; quantity?: string } = {};

      if (!produto.name.trim()) {
        produtoErros.name = "Nome do produto é obrigatório";
        hasErrors = true;
      }

      if (!produto.quantity || parseInt(produto.quantity) <= 0) {
        produtoErros.quantity = "Quantidade deve ser maior que 0";
        hasErrors = true;
      }

      if (produtoErros.name || produtoErros.quantity) {
        productErrors[produto.id] = produtoErros;
      }
    });

    if (Object.keys(productErrors).length > 0) {
      newErrors.productErrors = productErrors;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar dados para enviar
    const produtosValidos = produtos.filter((p) => p.name.trim() && p.quantity);
    const estoqueData: EstoqueData = {
      id: initialData?.id || Date.now().toString(),
      name: formData.name,
      location: formData.location,
      image: imagemPreview || undefined,
      products: produtosValidos.map((p) => ({
        name: p.name,
        quantity: parseInt(p.quantity) || 0,
      })),
    };

    // Chamar a função de callback para salvar
    onSave?.(estoqueData);
  };

  const handleClose = () => {
    // Se onClose não foi fornecido, tenta fechar o dialog de outras formas
    if (onClose) {
      onClose();
    } else {
      // Fallback: tenta fechar via evento do teclado ESC
      const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escEvent);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader className="px-4 pt-4">
        <DialogTitle>
          {initialData ? "Editar estoque" : "Adicionar um estoque"}
        </DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nome da Unidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Unidade
            </label>
            <input
              type="text"
              placeholder="Ex: Alfa"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local
            </label>
            <input
              type="text"
              placeholder="Ex: Brasília"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Produtos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Produtos
              </label>
              <span
                className="text-sm font-medium text-gray-700"
                style={{ marginRight: produtos.length > 1 ? "48px" : "25px" }}
              >
                Quantidade
              </span>
            </div>

            <div className="max-h-30 overflow-y-auto">
              {produtos.map((produto, index) => (
                <div key={produto.id} className="mb-3">
                  <div className="flex gap-2">
                    <div className="flex-[2]">
                      <input
                        type="text"
                        placeholder="Digite para buscar"
                        value={produto.name}
                        onChange={(e) =>
                          atualizarProduto(produto.id, "name", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                          errors.productErrors?.[produto.id]?.name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.productErrors?.[produto.id]?.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.productErrors[produto.id].name}
                        </p>
                      )}
                    </div>
                    <div className="w-25">
                      <input
                        type="number"
                        placeholder="Ex: 5"
                        min="1"
                        value={produto.quantity}
                        onChange={(e) =>
                          atualizarProduto(
                            produto.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:border-transparent ${
                          errors.productErrors?.[produto.id]?.quantity
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.productErrors?.[produto.id]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.productErrors[produto.id].quantity}
                        </p>
                      )}
                    </div>
                    {produtos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerProduto(produto.id)}
                        className="px-2 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {index < produtos.length - 1 && (
                    <div className="border-b border-gray-100 my-2"></div>
                  )}
                </div>
              ))}
            </div>

            {errors.products && (
              <p className="text-red-500 text-xs mt-1">{errors.products}</p>
            )}

            {/* Botão Adicionar Produto */}
            <button
              type="button"
              onClick={adicionarProduto}
              className="flex items-center gap-2 px-3 py-1.5 text-white rounded-md text-sm hover:opacity-90 transition-opacity mt-2"
              style={{ backgroundColor: "#421986" }}
            >
              <Plus size={14} />
              Adicionar Produto
            </button>
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
              type="submit"
              className="px-3 py-1.5 text-white rounded-md hover:opacity-90 text-sm"
              style={{ backgroundColor: "#421986" }}
            >
              {initialData ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </DialogContent>
  );
};

export default UpsertEstoqueForm;
