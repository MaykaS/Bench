"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {ApplicationForm} from "@/components/applications/ApplicationForm";
import {getApplicationRepository} from "@/repositories/factory";
import {useSession} from "@/lib/session/SessionContext";
import type {Application} from "@/domain/Application";
export default function EditApplicationPage(){const {id}=useParams<{id:string}>(),{userId}=useSession();const [app,setApp]=useState<Application|null>(null),[loaded,setLoaded]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);useEffect(()=>{let active=true;getApplicationRepository().get(id,userId).then(a=>{if(active){setApp(a);setLoaded(true);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[id,userId,attempt]);if(error)return <div className="panel"><p role="alert">Could not load application.</p><button className="btn" onClick={()=>{setError(false);setAttempt(n=>n+1);}}>Try again</button></div>;if(!loaded)return <p>Loading application…</p>;return app?<ApplicationForm initial={app}/>:<div className="panel"><p>Application not found.</p><Link className="btn" href="/applications">Back to applications</Link></div>;}
