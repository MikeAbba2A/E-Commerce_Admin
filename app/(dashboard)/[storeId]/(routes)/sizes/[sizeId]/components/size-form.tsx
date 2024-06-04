"use client";

import { Size, Category } from "@prisma/client";
import { Trash } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Le nom doit comporter au moins 1 caractère.",
  }),
  value: z.string().min(1, {
    message: "La valeur doit comporter au moins 1 caractère.",
  }),
  categoryIds: z.array(z.string()).optional(),
});

type SizeFormValues = z.infer<typeof formSchema>;

interface SizeFormProps {
  initialData: (Size & { categories: Category[] }) | null;
}

export const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const title = initialData ? "Editer les tailles" : "Créer une taille";
  const description = initialData ? "Editer les tailles" : "Ajouter une taille";
  const toastMessage = initialData ? "Taille mise à jour" : "Taille créée";
  const action = initialData ? "Sauvegarder" : "Créer";

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(`/api/${params.storeId}/categories`);
      setCategories(response.data);
    };
    fetchCategories();
  }, [params.storeId]);

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          categoryIds: initialData.categories.map((category) => category.id),
        }
      : {
          name: "",
          value: "",
          categoryIds: [],
        },
  });

  const onSubmit = async (data: SizeFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/sizes`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast.success("Taille supprimée");
    } catch (error) {
      toast.error(
        "Assurez-vous d'abord d'avoir supprimé tous vos produits utilisant cette taille"
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nom de la taille"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valeur</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Valeur de la taille"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormLabel>Catégories</FormLabel>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FormField
                  key={category.id}
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem key={category.id}>
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(category.id) ?? false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value ?? []), category.id]);
                            } else {
                              field.onChange(
                                (field.value ?? []).filter((id) => id !== category.id)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>{category.name}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};