"use client";

import { useState } from "react";
import { MapPin, Package, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import UpsertEstoqueForm from "./upsert-estoque-form";
import { EstoqueFrontend } from "@/lib/api";

interface EstoqueCardProps {
  estoque: EstoqueFrontend;
  onEdit: (estoque: EstoqueFrontend) => void;
  onDelete: (id: number) => void;
}

const EstoqueCard = ({ estoque, onEdit, onDelete }: EstoqueCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditSave = (updatedEstoque: EstoqueFrontend) => {
    onEdit(updatedEstoque);
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete(estoque.id);
  };

  // Criar iniciais do nome da unidade
  const estoqueInitials = estoque.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Calcular total de produtos
  const totalProdutos = estoque.products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const getImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) return undefined;

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {estoque.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getImageUrl(estoque.image)}
              alt={estoque.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{estoqueInitials}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <h3 className="text-sm font-medium">{estoque.name}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {estoque.location}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline" className=" bg-[#E2D8F3] text-[#411A85]">
          <Package className="mr-1 h-3 w-3" />
          {estoque.products.length} tipo
          {estoque.products.length !== 1 ? "s" : ""} de produto
        </Badge>

        <Badge variant="outline" className="bg-[#E2D8F3] text-[#411A85]">
          <Package className="mr-1 h-3 w-3" />
          {totalProdutos} itens no total
        </Badge>

        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">Principais produtos:</p>
          <div className="space-y-1">
            {estoque.products.slice(0, 3).map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-gray-700">{product.name}</span>
                <span className="text-gray-500">{product.quantity}x</span>
              </div>
            ))}
            {estoque.products.length > 3 && (
              <p className="text-xs text-gray-500">
                +{estoque.products.length - 3} outros produtos...
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#411A85] hover:bg-[#5A2B9E] text-white">
              <Edit className="h-4 w-4" />
              Ver detalhes / Editar
            </Button>
          </DialogTrigger>
          
          <UpsertEstoqueForm
            initialData={estoque}
            onSave={handleEditSave}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              Deletar estoque
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja deletar esse estoque?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser revertida. Isso irá deletar o estoque e
                todos os produtos cadastrados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClick}
                className="bg-[#411A85] hover:bg-[#5A2B9E] text-white"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default EstoqueCard;