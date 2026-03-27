import { getBuilding } from '@/actions/buildings';
import { BuildingForm } from '@/components/buildings/building-form';
import { notFound } from 'next/navigation';

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const building = await getBuilding(id);
    return <BuildingForm mode="edit" building={building} />;
  } catch {
    notFound();
  }
}
