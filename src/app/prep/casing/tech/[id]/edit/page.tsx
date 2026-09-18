import { CaseSessionEditor } from "@/components/casing/CaseSessionEditor";
export default async function Page({ params }: { params: Promise<{id:string}> }) { const {id}=await params; return <CaseSessionEditor key={id} id={id} track="tech" />; }
