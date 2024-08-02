import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const sliderImages = await prismadb.sliderImage.findMany({
      where: { storeId },
    });

    return NextResponse.json(sliderImages);
  } catch (error) {
    console.error('[SLIDER_IMAGES_GET]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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

    return NextResponse.json(createdImages);
  } catch (error) {
    console.error('[SLIDER_IMAGES_POST]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}