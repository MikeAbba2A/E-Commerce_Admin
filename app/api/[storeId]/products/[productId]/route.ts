import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET (
    req: Request,
    { params }: { params: { productId: string } }
){
    try{
        if(!params.productId){
            return new NextResponse("productId obligatoire", { status: 400 });
        }

        const product = await prismadb.product.findUnique({
            where:{
                id: params.productId,
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true
            }  
        });
        return NextResponse.json(product);

    }catch(error){
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; productId: string } }
){
    try {
        const { userId } = auth();
        const body = await req.json(); 

        console.log("Received body:", body);

        const { 
            name,
            description,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived
        } = body;

        if (!userId) {
            return new NextResponse("Non authentifié", { status: 401 });
        }

        if (!params.productId) {
            return new NextResponse("Product ID est requis", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Non autorisé", { status: 403 });
        }

        const updatedProduct = await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                name,
                description,
                price,
                categoryId,
                colorId,
                sizeId,
                isFeatured,
                isArchived,
                images: {
                    deleteMany: {},
                    createMany: {
                        data: images.map((image: { url: string }) => image)
                    }
                }
            }
        });

        console.log("Product updated successfully:", updatedProduct);

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('[PRODUCTS_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}


export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
){
    try{
        const { userId } = auth();

        if(!userId){
            return new NextResponse("Non authentifié", { status: 401 });
        }

        if(!params.productId){
            return new NextResponse("productId obligatoire", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if(!storeByUserId){
            return new NextResponse("Non autorisé", { status: 403 });
        }

        const product = await prismadb.product.deleteMany({
            where:{
                id: params.productId,
            }  
        });
        return NextResponse.json(product);

    }catch(error){
        console.log('[PRODUCTS_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

