import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Upload } from "lucide-react";
import { EstoqueFrontend } from "@/lib/api"; // ✅ Importamos o tipo oficial (ID = number)

interface UpsertEstoqueFormProps {
  onClose?: () => void;
  onSave?: (data: EstoqueFrontend) => void; // ✅ Agora aceita o tipo correto
  initialData?: EstoqueFrontend | null;     // ✅ Agora aceita o tipo correto
}

interface FormErrors {
  name?: string;
  location?: string;
  image?: string;
}

const UpsertEstoqueForm = ({
  onClose,
  onSave,
  initialData = null,
}: UpsertEstoqueFormProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(
    initialData?.image || null
  );
  const [imagemUrl, setImagemUrl] = useState<string | null>(
    initialData?.image || null
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(`${API_BASE_URL}/uploads/image`, {
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
        image: "Erro ao fazer upload da imagem. Tente novamente.",
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
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Arquivo deve ser uma imagem",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Imagem muito grande. Máximo 5MB",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, image: undefined }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

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
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Imagem muito grande. Máximo 5MB",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, image: undefined }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

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

    if (!formData.name.trim()) {
      newErrors.name = "Nome da unidade é obrigatório";
      hasErrors = true;
    }

    if (!formData.location.trim()) {
      newErrors.location = "Local é obrigatório";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const estoqueData: EstoqueFrontend = {
      // ✅ Agora geramos um NÚMERO para o ID (se for novo)
      id: initialData?.id || Date.now(),
      name: formData.name,
      location: formData.location,
      image: imagemUrl || undefined,
      products: initialData?.products || [],
    };

    onSave?.(estoqueData);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escEvent);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

          {/* Imagem com Upload */}
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
              disabled={uploadingImage}
            />
            <div
              className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
                uploadingImage
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400 cursor-pointer"
              } ${errors.image ? "border-red-500" : ""}`}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(imagemPreview)}
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
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              disabled={uploadingImage}
            >
              Cancelar
            </button>
            <button
              type="submit"
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
        </form>
      </div>
    </DialogContent>
  );
};

export default UpsertEstoqueForm;