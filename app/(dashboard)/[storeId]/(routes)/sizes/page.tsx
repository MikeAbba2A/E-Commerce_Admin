import { format } from "date-fns";
import { fr } from "date-fns/locale";

import prismadb from "@/lib/prismadb";

import { SizesClient } from "./components/client";
import { SizeColumn } from "./components/columns";

const SizesPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const sizes = await prismadb.size.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedSizes: SizeColumn[] = sizes.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "do MMMM yyyy", { locale: fr })
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 spacce-y-4 p-8 pt-6">
                <SizesClient data={formattedSizes} />
            </div>
        </div>
    );
}

export default SizesPage;