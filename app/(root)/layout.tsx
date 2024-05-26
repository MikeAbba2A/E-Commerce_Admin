import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// import { NextResponse } from "next/server";

export default async function SetupLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { storeId: string }
}) {
    const { userId } = auth();

    if (!userId) {
        // Redirection vers la page de connexion avec une URL absolue
        // return NextResponse.redirect('/sign-in');
        redirect('/sign-in')
    }

    const store = await prismadb.store.findFirst({
        where: {
            userId
        }
    });

    if (store) {
        // Redirection vers la page d'accueil avec une URL absolue
        // return NextResponse.redirect(`/${store.id}`);
        redirect(`/${store.id}`)
    }

    return (
        <>
            <div>
                Ceci est une barre de navigation
                {children}
            </div>
        </>
    );
}