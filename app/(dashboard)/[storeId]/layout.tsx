import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { storeId: string }
}) {
    const { userId } = auth();

    if(!userId){
        // return NextResponse.redirect('/sign-in');
        redirect('/sign-in')
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId
        }
    });

    if(!store) {
        // return NextResponse.redirect('/');
        redirect('/')
    }

    return(
        <>
            <div>
                <Navbar />
                {children}
            </div>
        </>
    );

};