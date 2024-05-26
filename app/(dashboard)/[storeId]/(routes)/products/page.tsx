import { format } from "date-fns";
import { fr } from "date-fns/locale";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId
        },
        include: {
            category: true,  // Utilisez 'category' tel que défini dans votre schéma Prisma
            size: true,      // Utilisez 'size' tel que défini dans votre schéma Prisma
            color: true      // Utilisez 'color' tel que défini dans votre schéma Prisma
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedProducts: ProductColumn[] = products.map((item) => ({
        id: item.id,
        name: item.name,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        price: formatter.format(item.price.toNumber()),
        category: item.category.name,  // Assurez-vous que c'est bien 'category'
        size: item.size.name,          // Assurez-vous que c'est bien 'size'
        color: item.color.value,        // Assurez-vous que c'est bien 'color'
        createdAt: format(item.createdAt, "do MMMM yyyy", { locale: fr })
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductClient data={formattedProducts} />
            </div>
        </div>
    );
}

export default ProductsPage;