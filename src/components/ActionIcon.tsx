"use client";
import Link from 'next/link';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

const paths = {
  edit: <><path d="m15 4 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14Z"/></>,
  delete: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></>,
  phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2Z"/>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4"/></>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
  back: <path d="m10 5-7 7 7 7M3 12h18"/>,
  check: <path d="m4 12 5 5L20 6"/>,
} satisfies Record<string,ReactNode>;
export type ActionIconName = keyof typeof paths;
export function ActionIcon({name}:{name:ActionIconName}) {return <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;}
function Hint({label}:{label:string}) {return <span aria-hidden="true" className="action-tooltip">{label}</span>;}
export function IconButton({icon,label,danger=false,...props}:Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'|'aria-label'> & {icon:ActionIconName;label:string;danger?:boolean}) {
  return <span className="action-wrap"><button {...props} type={props.type??'button'} aria-label={label} title={label} className={`icon-action ${danger?'text-red-700':'text-accent'} ${props.className??''}`}><ActionIcon name={icon}/></button><Hint label={label}/></span>;
}
export function IconLink({icon,label,href,newTab=false}:{icon:ActionIconName;label:string;href:string;newTab?:boolean}) {
  return <span className="action-wrap"><Link href={href} aria-label={label} title={label} target={newTab?'_blank':undefined} rel={newTab?'noreferrer':undefined} className="icon-action text-accent"><ActionIcon name={icon}/></Link><Hint label={label}/></span>;
}
export function CopyButton({value,label}:{value:string;label:string}) {
  const [message,setMessage]=useState('');
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),2200);return()=>clearTimeout(timer);},[message]);
  return <span className="inline-flex"><IconButton icon={message==='Copied'?'check':'copy'} label={message||`Copy ${label}`} onClick={async()=>{try{await navigator.clipboard.writeText(value);setMessage('Copied');}catch{setMessage('Could not copy');}}}/><span role="status" className="sr-only">{message}</span></span>;
}
