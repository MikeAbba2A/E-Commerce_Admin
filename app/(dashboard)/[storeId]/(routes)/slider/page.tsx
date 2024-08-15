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
  images: z.object({ url: z.string(), file: z.instanceof(File).optional() }).array(),
});

type SliderFormValues = z.infer<typeof formSchema>;

interface SliderImage {
  id: string;
  url: string;
  file?: File;
}

const SliderAdmin = () => {
  const params = useParams();
  const router = useRouter();
  const [images, setImages] = useState<SliderImage[]>([]);
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
      axios.get(`/api/${params.storeId}/slider-images`).then(async (response) => {
        const validImages = [];
        for (const image of response.data) {
          try {
            await axios.get(image.url);
            validImages.push(image);
          } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status !== 404) {
              console.error('Error verifying image:', err);
            }
          }
        }
        setImages(validImages);
        form.setValue('images', validImages);
      }).catch(err => {
        console.error('Error fetching slider images:', err);
        toast.error("Erreur lors de la récupération des images");
      });
    }
  }, [params.storeId, form]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
      console.log('Image uploaded to Cloudinary:', response.data.secure_url);
      return response.data.secure_url;
    } catch (err) {
      console.error('Error uploading image to Cloudinary:', err);
      toast.error("Erreur lors de l'upload de l'image");
      throw err;
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

      console.log('Uploading images:', uploadedImages);

      await axios.post(`/api/${params.storeId}/slider-images`, { images: uploadedImages });
      router.refresh();
      toast.success("Images du slider mises à jour");
    } catch (err) {
      console.error('Error submitting slider images:', err);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/slider-images/${id}`);
      setImages(images.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Error deleting slider image:', err);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onDeleteAll = async () => {
    try {
      setLoading(true);
      console.log('Deleting all images for store:', params.storeId); // Ajout de log
      await axios.delete(`/api/${params.storeId}/slider-images/deleteAll`);
      setImages([]);
      toast.success("Toutes les images du slider ont été supprimées");
    } catch (err) {
      console.error('Error deleting all slider images:', err);
      toast.error("Une erreur est survenue lors de la suppression de toutes les images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDelete(String(params.id))}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <h1>Gérer les images du slider</h1>
        <Button onClick={onDeleteAll} disabled={loading}>Supprimer toutes les images</Button>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <ImageUpload 
          value={form.watch("images").map((image) => image.url)} 
          disabled={loading}
          onChange={(url) => {
            const newImage = { url, file: undefined };
            form.setValue("images", [...form.getValues("images"), newImage]);
          }}
          onRemove={(url) => form.setValue("images", form.getValues("images").filter((image) => image.url !== url))}
        />
        <Button disabled={loading} type="submit">Sauvegarder</Button>
      </form>
    </>
  );
};

export default SliderAdmin;