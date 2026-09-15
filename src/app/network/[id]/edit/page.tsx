"use client";
import { useParams } from "next/navigation";
import { ContactEditor } from "@/components/network/ContactEditor";
export default function EditContactPage() { const {id} = useParams<{id:string}>(); return <ContactEditor id={id} />; }
