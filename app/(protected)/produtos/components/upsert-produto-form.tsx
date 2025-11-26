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

// ✅ CORREÇÃO: ID agora é number para alinhar com a Page e API
interface ProdutoData {
  id: number;
  nome: string;
  quantidade: number;
  estoque: string;
  imagem?: string;
  observacao?: string;
}

interface UpsertProdutoFormProps {
  onClose?: () => void;
  onSave?: (data: ProdutoData, stockId?: number) => void;
  onDelete?: (id: number) => void; // ✅ ID number aqui também
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
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const getImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) return imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    carregarEstoques();
  }, []);

  useEffect(() => {
    if (initialData) {
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
      setFormData({ nome: "", quantidade: "", estoque: "", observacao: "" });
      setImagemPreview(null);
      setImagemUrl(null);
      setErrors({});
    }
  }, [initialData]);

  const carregarEstoques = async () => {
    try {
      setLoadingEstoques(true);
      const data = await api.getEstoques();
      // Adaptação caso a API retorne estrutura diferente, mas garantindo o tipo
      const listaEstoques = data.map(e => ({ id: e.id, name: e.name }));
      setEstoques(listaEstoques);
    } catch (error) {
      console.error("❌ Erro ao carregar estoques:", error);
    } finally {
      setLoadingEstoques(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao fazer upload");
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({ ...prev, imagem: "Erro no upload." }));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      setErrors((prev) => ({ ...prev, imagem: undefined }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagemPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) setImagemUrl(uploadedUrl);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const targetStock = estoques.find((s) => s.name === formData.estoque);
    const stockId = targetStock?.id;

    if (!stockId) {
      alert("Erro: O estoque selecionado não foi encontrado.");
      return;
    }

    const produtoData: ProdutoData = {
      // ✅ CORREÇÃO: Usa número (Date.now()) se não houver ID
      id: initialData?.id || Date.now(),
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade) || 0,
      estoque: formData.estoque,
      imagem: imagemUrl || undefined,
      observacao: formData.observacao || undefined,
    };

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
    if (onClose) onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;
    if (!formData.nome.trim()) { newErrors.nome = "Obrigatório"; hasErrors = true; }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) { newErrors.quantidade = "Inválido"; hasErrors = true; }
    if (!formData.estoque.trim()) { newErrors.estoque = "Obrigatório"; hasErrors = true; }
    setErrors(newErrors);
    return !hasErrors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader className="px-4 pt-4">
        <DialogTitle>{initialData ? "Editar produto" : "Adicionar um produto"}</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
            {errors.nome && <p className="text-red-500 text-xs">{errors.nome}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
            <input type="number" min="1" value={formData.quantidade} onChange={(e) => handleInputChange("quantidade", e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
            {errors.quantidade && <p className="text-red-500 text-xs">{errors.quantidade}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
            <select value={formData.estoque} onChange={(e) => handleInputChange("estoque", e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="">Selecione um estoque</option>
                {estoques.map((estoque) => (<option key={estoque.id} value={estoque.name}>{estoque.name}</option>))}
            </select>
            {errors.estoque && <p className="text-red-500 text-xs">{errors.estoque}</p>}
          </div>
          {/* Upload Simplificado */}
          <div className="flex items-center gap-4">
             <label className="cursor-pointer px-3 py-2 bg-gray-100 rounded text-sm">
               <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadingImage} />
               {uploadingImage ? "Enviando..." : "Imagem (Opcional)"}
             </label>
             {imagemPreview && <img src={getImageUrl(imagemPreview)} alt="Preview" className="w-10 h-10 rounded object-cover" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <textarea value={formData.observacao} onChange={(e) => handleInputChange("observacao", e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-md text-sm resize-none" />
          </div>
          <div className="flex gap-2 pt-4">
            {initialData && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild><button type="button" className="text-red-600 text-sm flex items-center gap-1"><Trash2 size={14} /> Excluir</button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><DialogTitle>Confirmar</DialogTitle><AlertDialogDescription>Deseja excluir?</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={handleClose} className="px-3 py-1.5 border rounded text-sm">Cancelar</button>
              <button type="button" onClick={handleSubmit} disabled={uploadingImage} className="px-3 py-1.5 bg-[#421986] text-white rounded text-sm">{initialData ? "Atualizar" : "Salvar"}</button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default UpsertProdutoForm;