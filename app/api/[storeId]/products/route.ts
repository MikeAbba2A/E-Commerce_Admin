import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
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

        console.log("Received data:", body);

        if(!userId){
            return new NextResponse("Non authentifié", { status: 401 });
        }

        if(!name){
            return new NextResponse("Un nom est requis", { status: 400 });
        }

        if(!description){
            return new NextResponse("Une description est requise", { status: 400 });
        }

        if(!price){
            return new NextResponse("Un prix est requis", { status: 400 });
        }

        if(!categoryId){
            return new NextResponse("Une catégorie est requise", { status: 400 });
        }

        if(!colorId){
            return new NextResponse("Id de couleur requis", { status: 400 });
        }

        if(!sizeId){
            return new NextResponse("SizeId est requis", { status: 400 });
        }

        if(!images || !images.length){
            return new NextResponse("Une image est requise", { status: 400 });
        }

        if(!params.storeId){
            return new NextResponse("Store ID est requis", { status: 400 });
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

        const product = await prismadb.product.create({
            data: {
                name,
                description,
                price,
                isFeatured,
                isArchived,
                categoryId,
                colorId,
                sizeId,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image : { url: string }) => image )
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);

    } catch(error) {
        console.error('[PRODUCTS_POST]', error); // Ajoutez ce log pour capturer l'erreur
        return new NextResponse("Internal error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
){
    try {
        const { searchParams } = new URL(req.url);
        const  categoryId  = searchParams.get("categoryId") || undefined;
        const  colorId  = searchParams.get("colorId") || undefined;
        const  sizeId  = searchParams.get("sizeId") || undefined;
        const  isFeatured  = searchParams.get("isFeatured") || undefined;


        if(!params.storeId){
            return new NextResponse("StoreID est requis", { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products);

    }catch(error){
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
    
