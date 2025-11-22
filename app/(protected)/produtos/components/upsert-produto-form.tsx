import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface ProdutoData {
  id: string;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

interface UpsertProdutoFormProps {
  onClose?: () => void;
  onSave?: (data: ProdutoData, stockId?: number) => void;
  onDelete?: (id: string) => void;
  initialData?: ProdutoData | null;
}

interface FormErrors {
  nome?: string;
  quantidade?: string;
  estoque?: string;
  observacao?: string;
  imagem?: string;
}

const UpsertProdutoForm = ({
  onClose,
  onSave,
  onDelete,
  initialData = null,
}: UpsertProdutoFormProps) => {
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null); // ✅ URL final da imagem
  const [uploadingImage, setUploadingImage] = useState(false); // ✅ Loading do upload
  const [formData, setFormData] = useState({
    nome: "",
    quantidade: "",
    estoque: "",
    observacao: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [estoques, setEstoques] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [loadingEstoques, setLoadingEstoques] = useState(false);

  // ✅ FUNÇÃO HELPER PARA URLs
  const getImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) return undefined;

    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    carregarEstoques();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log("Carregando dados para edição:", initialData);
      setFormData({
        nome: initialData.nome || "",
        quantidade: initialData.quantidade?.toString() || "",
        estoque: initialData.estoque || "",
        observacao: initialData.observacao || "",
      });
      setImagemPreview(initialData.imagem || null);
      setImagemUrl(initialData.imagem || null);
      setErrors({});
    } else {
      console.log("Novo produto - formulário vazio");
      setFormData({
        nome: "",
        quantidade: "",
        estoque: "",
        observacao: "",
      });
      setImagemPreview(null);
      setImagemUrl(null);
      setErrors({});
    }
  }, [initialData]);

  const carregarEstoques = async () => {
    try {
      setLoadingEstoques(true);
      const data = await api.getEstoques();
      setEstoques(data);
      console.log("✅ Estoques carregados:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar estoques:", error);
    } finally {
      setLoadingEstoques(false);
    }
  };

  // ✅ FUNÇÃO DE UPLOAD
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/uploads/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      console.log("✅ Upload bem-sucedido:", data);
      return data.imageUrl;
    } catch (error) {
      console.error("❌ Erro ao fazer upload:", error);
      setErrors((prev) => ({
        ...prev,
        imagem: "Erro ao fazer upload da imagem. Tente novamente.",
      }));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          imagem: "Arquivo deve ser uma imagem",
        }));
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imagem: "Imagem muito grande. Máximo 5MB",
        }));
        return;
      }

      setImagem(file);
      setErrors((prev) => ({ ...prev, imagem: undefined }));

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // ✅ FAZER UPLOAD IMEDIATAMENTE
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setImagemUrl(uploadedUrl);
        console.log("✅ URL da imagem salva:", uploadedUrl);
      }
    }
  };

  const handleImageClick = () => {
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Validar tamanho
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imagem: "Imagem muito grande. Máximo 5MB",
        }));
        return;
      }

      setImagem(file);
      setErrors((prev) => ({ ...prev, imagem: undefined }));

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // ✅ FAZER UPLOAD
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setImagemUrl(uploadedUrl);
      }
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

    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = "Quantidade deve ser maior que 0";
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

    const targetStock = estoques.find((s) => s.name === formData.estoque);
    const stockId = targetStock?.id;

    if (!stockId || stockId <= 0) {
      alert(
        "Erro: O estoque selecionado não foi encontrado. Tente selecionar novamente."
      );
      return;
    }

    const produtoData: ProdutoData = {
      id: initialData?.id || Date.now().toString(),
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade) || 0,
      estoque: formData.estoque,
      imagem: imagemUrl || undefined, // ✅ USA A URL DO UPLOAD
      observacao: formData.observacao || undefined,
    };

    console.log("📤 Enviando para salvar:", {
      produtoData,
      stockId,
      estoqueNome: formData.estoque,
    });

    onSave?.(produtoData, stockId);
    handleClose();
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      onDelete(initialData.id);
      handleClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader className="px-4 pt-4">
        <DialogTitle>
          {initialData ? "Editar produto" : "Adicionar um produto"}
        </DialogTitle>
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
              onChange={(e) => handleInputChange("quantidade", e.target.value)}
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
                  onChange={(e) => handleInputChange("estoque", e.target.value)}
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
              Imagem
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadingImage}
            />
            <div
              className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
                uploadingImage
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400 cursor-pointer"
              } ${errors.imagem ? "border-red-500" : ""}`}
              onClick={!uploadingImage ? handleImageClick : undefined}
              onDrop={!uploadingImage ? handleDrop : undefined}
              onDragOver={handleDragOver}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                  <p className="text-xs text-gray-500">Fazendo upload...</p>
                </div>
              ) : imagemPreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={getImageUrl(imagemPreview)} // ✅ USA A FUNÇÃO HELPER
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded mb-2"
                  />
                  <p className="text-xs text-gray-500">Clique para alterar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Upload size={16} className="text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                </div>
              )}
            </div>
            {errors.imagem && (
              <p className="text-red-500 text-xs mt-1">{errors.imagem}</p>
            )}
          </div>

          {/* Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <textarea
              placeholder="Alguma observação sobre o produto (opcional)"
              value={formData.observacao}
              onChange={(e) => handleInputChange("observacao", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-transparent resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            {initialData && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm flex items-center gap-1"
                    title="Excluir produto"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o produto &quot;
                      {formData.nome}&quot;? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="hover:opacity-90"
                      onClick={handleDelete}
                      style={{ backgroundColor: "#421986" }}
                    >
                      Excluir produto
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                disabled={uploadingImage}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 text-white rounded-md hover:opacity-90 text-sm disabled:opacity-50"
                style={{ backgroundColor: "#421986" }}
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Enviando..."
                  : initialData
                  ? "Atualizar"
                  : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default UpsertProdutoForm;
