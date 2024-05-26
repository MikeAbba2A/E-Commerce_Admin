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

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string,  productId: string } }
){
    try{
        const { userId } = auth();
        const body = await req.json();

        const { 
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived
        } = body;

        if(!userId){
            return new NextResponse("Non authentifié", { status: 401 });
        }

        if(!name){
            return new NextResponse("Un nom est requis", { status: 400 });
        }

        if(!price){
            return new NextResponse("Un prix est requise", { status: 400 });
        }

        if(!categoryId){
            return new NextResponse("Un prix est requise", { status: 400 });
        }

        if(!colorId){
            return new NextResponse("Id de coueur requis", { status: 400 });
        }

        if(!sizeId){
            return new NextResponse("SizeId est requis", { status: 400 });
        }

        if(!images || !images.length){
            return new NextResponse("Une image est requise", { status: 400 });
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

        await prismadb.product.update({
            where:{
                id: params.productId,
            },
            data: {
                name,
                price,
                categoryId,
                sizeId,
                colorId,
                images: {
                    deleteMany: {

                    }
                },
                isFeatured,
                isArchived,
            }    
        });

        const product = await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image),
                        ]
                    }
                }
            }
        })

        return NextResponse.json(product);

    }catch(error){
        console.log('[PRODUCTS_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};


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

