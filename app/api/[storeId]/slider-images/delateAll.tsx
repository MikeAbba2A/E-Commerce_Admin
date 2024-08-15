import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import axios from 'axios';

export async function DELETE(req: Request, { params }: { params: { storeId: string } }) {
  console.log('DELETE all images for store:', params.storeId);
  try {
    const { storeId } = params;

    if (!storeId) {
      console.log('Store ID is required');
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Récupération des images depuis Prisma
    const images = await prismadb.sliderImage.findMany({
      where: { storeId },
    });

    console.log('Images found:', images);

    if (images.length === 0) {
      return new NextResponse("No images found for the store", { status: 404 });
    }

    // Supprimer les images de Cloudinary
    const deleteCloudinaryImage = async (url: string) => {
      const publicId = url.split('/').pop()?.split('.').shift(); // Extraire publicId de l'URL
      if (publicId) {
        try {
          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
            { public_id: publicId },
            { headers: { Authorization: `Basic ${Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64')}` } }
          );
          console.log(`Image ${publicId} deleted from Cloudinary:`, response.data);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error(`Error deleting image ${publicId} from Cloudinary:`, err.response?.data || err.message);
          } else {
            console.error(`Unexpected error deleting image ${publicId} from Cloudinary:`, err);
          }
        }
      } else {
        console.log(`Could not extract publicId from URL: ${url}`);
      }
    };

    await Promise.all(images.map(image => deleteCloudinaryImage(image.url)));

    // Supprimer les enregistrements de Prisma
    try {
      const result = await prismadb.sliderImage.deleteMany({
        where: { storeId },
      });
      console.log('Deleted images result:', result);
    } catch (err) {
      console.error('Error deleting records from Prisma:', err);
    }

    return new NextResponse("All slider images deleted successfully", { status: 200 });
  } catch (err) {
    console.error('[SLIDER_IMAGES_DELETE_ALL]', err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}