import type { CaseTrack } from "@/domain/CaseSession";

export const CASE_HEADERS = ["#", "Case", "Cased By", "Casee", "Observer", "Date", "Time", "Difficulty", "Case Book", "My Performance", "Industry/Niche", "Struc", "Math", "Coach", "Biz Ac.", "Concl", "Creativ.", "Case Type"];
export const CASE_EXTRA_HEADERS = ["Notes", "Role", "Track", "Record ID", "Created At"];
export const caseTrackLabel = (track: CaseTrack) => track === "tech" ? "Tech" : "Consulting";
