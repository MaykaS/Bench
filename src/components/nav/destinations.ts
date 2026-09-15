export interface Destination {
  label: string;
  href: string;
}

export const bottomBarItems: Destination[] = [
  { label: "Home", href: "/home" },
  { label: "Network", href: "/network" },
  { label: "Prep", href: "/prep" },
  { label: "Applications", href: "/applications" },
];

export const sidebarItems: Destination[] = [
  { label: "Home", href: "/home" },
  { label: "Network", href: "/network" },
  { label: "Coffee chats", href: "/network/coffee-chats" },
  { label: "PEI", href: "/prep/pei" },
  { label: "PARS", href: "/prep/pars" },
  { label: "Casing", href: "/prep/casing" },
  { label: "Mock interviews", href: "/prep/mock-interviews" },
  { label: "Applications", href: "/applications" },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Within a navigation group, only the most specific matching route is selected. */
export function activeDestination(pathname: string, items: Destination[]): string | undefined {
  return items.filter(item=>isActive(pathname,item.href)).sort((a,b)=>b.href.length-a.href.length)[0]?.href;
}

export const networkTabs: Destination[] = [
  { label: "Network", href: "/network" },
  { label: "Coffee chats", href: "/network/coffee-chats" },
];

export const prepTabs: Destination[] = [
  { label: "PEI", href: "/prep/pei" },
  { label: "PARS", href: "/prep/pars" },
  { label: "Casing", href: "/prep/casing" },
  { label: "Mock interviews", href: "/prep/mock-interviews" },
];

export const casingTabs: Destination[] = [
  { label: "Consulting", href: "/prep/casing/consulting" },
  { label: "Tech", href: "/prep/casing/tech" },
];
