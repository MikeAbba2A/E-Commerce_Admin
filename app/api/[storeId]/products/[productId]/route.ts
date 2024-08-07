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

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('[PRODUCTS_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string; productId: string } }
){
    try {
        const { userId } = auth();

        console.log("User ID:", userId);
        console.log("Store ID:", params.storeId);
        console.log("Product ID:", params.productId);

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

        // Suppression du produit
        await prismadb.product.delete({
            where: {
                id: params.productId,
            },
        });

        console.log("Product deleted successfully");
        return new NextResponse("Produit supprimé", { status: 200 });
    } catch (error) {
        console.error('[PRODUCTS_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

