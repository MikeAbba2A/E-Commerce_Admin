import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import cloudinary from 'cloudinary';

export async function DELETE(req: Request, { params }: { params: { storeId: string } }) {
  console.log("DELETE request received for storeId:", params.storeId); // Ajouter ce log
  const { storeId } = params;

  if (!storeId) {
    return new NextResponse("Store ID is required", { status: 400 });
  }

  try {
    // Récupérer toutes les images associées au storeId
    const images = await prismadb.sliderImage.findMany({
      where: { storeId },
    });

    // Supprimer chaque image de Cloudinary
    const cloudinaryDeletionPromises = images.map(image => {
      const publicId = image.url.split('/').pop()?.split('.')[0];
      return cloudinary.v2.uploader.destroy(publicId!);
    });
    await Promise.all(cloudinaryDeletionPromises);

    // Supprimer les images de la base de données
    const deleteResult = await prismadb.sliderImage.deleteMany({
      where: { storeId },
    });

    console.log("Deleted images:", deleteResult.count); // Ajouter ce log
    return NextResponse.json({ success: true, deleted: deleteResult.count });
  } catch (error) {
    console.error('[SLIDER_IMAGES_DELETE_ALL]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
