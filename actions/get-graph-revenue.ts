import prismadb from "@/lib/prismadb";

interface GraphData {
    name: string;
    total: number;
}

export const getGraphRevenue = async (storeId: string) => {
    const paidOrders = await prismadb.order.findMany({
        where: {
            storeId,
            isPaid: true,
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    });

    const monthlyRevenue: { [key: number]: number } = {};

    for (const order of paidOrders) {
        const month = order.createdAt.getMonth();
        let revenueForOrder = 0;

        for (const item of order.orderItems) {
            revenueForOrder += item.product.price.toNumber();
        }

        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    };

    const graphData: GraphData[] = [
        {name: 'Janvier', total: 0},
        {name: 'Fevrier', total: 0},
        {name: 'Mars', total: 0},
        {name: 'Avril', total: 0},
        {name: 'Mai', total: 0},
        {name: 'Juin', total: 0},
        {name: 'Juillet', total: 0},
        {name: 'Août', total: 0},
        {name: 'Septembre', total: 0},
        {name: 'Octobre', total: 0},
        {name: 'Novembre', total: 0},
        {name: 'Décembre', total: 0},
    ];

    for (const month in monthlyRevenue) {
        graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
    }

    return graphData;
}