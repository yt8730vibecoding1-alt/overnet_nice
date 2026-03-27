import { getBuilding } from '@/actions/buildings';
import { BuildingDetail } from '@/components/buildings/building-detail';
import { notFound } from 'next/navigation';

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const building = await getBuilding(id);
    return <BuildingDetail building={building} />;
  } catch {
    notFound();
  }
}
