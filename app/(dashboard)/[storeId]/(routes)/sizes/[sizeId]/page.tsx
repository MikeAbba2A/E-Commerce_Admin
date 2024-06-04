import { SizeForm } from "./components/size-form";
import prismadb from "@/lib/prismadb";

interface SizePageProps {
  params: {
    sizeId: string;
  };
}

const SizePage: React.FC<SizePageProps> = async ({ params }) => {
  const size = await prismadb.size.findUnique({
    where: {
      id: params.sizeId,
    },
    include: {
      categories: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-x-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;