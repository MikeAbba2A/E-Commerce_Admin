"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import { useRouter, useParams } from 'next/navigation';
import { AlertModal } from "@/components/modals/alert-modal";
import toast from "react-hot-toast";

const formSchema = z.object({
  images: z.object({ id: z.string().optional(), url: z.string(), file: z.instanceof(File).optional() }).array(),
});

type SliderFormValues = z.infer<typeof formSchema>;

interface SliderImage {
  id?: string;
  url: string;
  file?: File;
}

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const SliderAdmin = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<SliderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
    }
  });

  useEffect(() => {
    if (params.storeId) {
      axios.get(`/api/${params.storeId}/slider-images`).then((response) => {
        form.setValue('images', response.data);
      }).catch(error => {
        console.error('Error fetching slider images:', error);
        toast.error("Erreur lors de la récupération des images");
      });
    }
  }, [params.storeId, form]);

  const handleRemoveImage = async (url: string) => {
    try {
      setLoading(true);
  
      // Trouver l'image par URL
      const image = form.getValues("images").find((image) => image.url === url);
  
      if (image?.id) {
        // Supprimer l'image via l'API
        await axios.delete(`/api/${params.storeId}/slider-images/${image.id}`, {
          timeout: 10000, // 10 seconds
        });
        toast.success("Image supprimée");
        
        // Mettre à jour l'état local et le formulaire
        form.setValue("images", form.getValues("images").filter((img) => img.url !== url));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Une erreur est survenue lors de la suppression de l'image");
    } finally {
      setLoading(false);
    }
  };
  

  const onSubmit = async (data: SliderFormValues) => {
    try {
      setLoading(true);
  
      const uploadedImages = await Promise.all(
        data.images.map(async (image) => {
          if (image.file) {
            const url = await uploadImage(image.file);
            return { url };
          }
          return { url: image.url };
        })
      );
  
      await axios.post(`/api/${params.storeId}/slider-images`, { images: uploadedImages });
      router.refresh();
      toast.success("Images du slider mises à jour");
    } catch (error) {
      console.error('Error submitting slider images:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAll = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/slider-images/delete-all`);
      form.setValue("images", []);
      toast.success("Toutes les images du slider ont été supprimées");
    } catch (error) {
      console.error('Error deleting all slider images:', error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDeleteAll()}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <h1>Gérer les images du slider</h1>
        {/* <Button onClick={() => setOpen(true)} disabled={loading}>Supprimer toutes les images</Button> */}
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <ImageUpload 
          value={form.watch("images").map((image) => image.url)} 
          disabled={loading}
          onChange={async (file: File) => {
            const url = await uploadImage(file);
            const newImage = { url };
            form.setValue("images", [...form.getValues("images"), newImage]);
          }}
          onRemove={handleRemoveImage}
        />
        <Button disabled={loading} type="submit">Sauvegarder</Button>
      </form>
    </>
  );
};

export default SliderAdmin;
