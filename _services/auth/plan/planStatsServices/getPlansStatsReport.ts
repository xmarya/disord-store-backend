import { getAnnualStatsReport, getPlansTotalsReport } from "@repositories/plan/planRepo";

async function getPlansStatsReport(sortBy: "year" | "profits" | "subscribers" = "year", sortOrder: "desc" | "asc" = "desc", specificYear?: string) {
  /*✅*/
  const annualReport = await getAnnualStatsReport(sortBy, sortOrder, specificYear);
  const totalsReport = await getPlansTotalsReport();
  return { annualReport, totalsReport };
}

export default getPlansStatsReport;