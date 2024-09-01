import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: Request, { params }: { params: { storeId: string, id: string } }) {
  try {
    const { storeId, id } = params;

    if (!storeId || !id) {
      return new NextResponse("Store ID and Image ID are required", { status: 400 });
    }

    // Récupérer l'image de la base de données pour obtenir l'URL
    const image = await prismadb.sliderImage.findUnique({
      where: { id: id },
    });

    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Extraire l'identifiant public de Cloudinary à partir de l'URL
    const publicId = image.url.split('/').pop()?.split('.')[0]; // Assumes format is something like /v1/path/to/image/publicId.extension

    // Supprimer l'image de Cloudinary
    if (publicId) {
      await cloudinary.v2.uploader.destroy(publicId);
    }

    // Supprimer l'image de la base de données
    await prismadb.sliderImage.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SLIDER_IMAGE_DELETE]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
