import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prismadb';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.sliderImage.delete({
    where: { id },
  });
  return NextResponse.json({ message: 'Image supprimée' });
}