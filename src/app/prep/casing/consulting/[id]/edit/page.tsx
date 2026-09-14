import { CaseSessionEditor } from "../../_components/CaseSessionEditor";
export default async function EditCaseSessionPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 return <CaseSessionEditor key={id} id={id} />;
}
