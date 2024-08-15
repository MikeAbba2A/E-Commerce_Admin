import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params;
    const body = await req.json();

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { images } = body;

    if (!images || !Array.isArray(images)) {
      return new NextResponse("Invalid images data", { status: 400 });
    }

    const createdImages = await Promise.all(
      images.map((image) => {
        return prismadb.sliderImage.create({
          data: {
            url: image.url,
            storeId,
          },
        });
      })
    );

    console.log('Images saved in Prisma:', createdImages);

    return NextResponse.json(createdImages);
  } catch (err) {
    console.error('[SLIDER_IMAGES_POST]', err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}