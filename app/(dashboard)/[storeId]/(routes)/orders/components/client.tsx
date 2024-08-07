"use client";

import { useParams, useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, orderColumns } from "./columns"; // Correction ici
import { DataTable } from "@/components/ui/data-table";

interface OrderClientProps {
    data: OrderColumn[]
}

export const OrderClient: React.FC<OrderClientProps> = ({
    data
}) => {
    return(
        <>
            <Heading 
                title={`Commandes (${data.length})`}
                description="Gérer les commandes de votre store"
            /> 
            <Separator />
            <DataTable searchKey="products" columns={orderColumns} data={data} /> {/* Correction ici */}
        </>
    )
}