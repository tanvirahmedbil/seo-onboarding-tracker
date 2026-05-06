export type ClientType = "new_site" | "no_prior_seo" | "prior_seo";

export interface TaskTemplate {
  title: string;
  phase: string;
  dayTarget: number;
  order: number;
}

const universalTasks: TaskTemplate[] = [
  { title: "Kickoff meeting completed", phase: "Kickoff", dayTarget: 1, order: 1 },
  { title: "Accesses & materials requested from client (GA4, GTM, GSC, CMS, GBP, brand assets, questionnaire)", phase: "Access Collection", dayTarget: 2, order: 2 },
  { title: "All accesses & assets received (GA4, GTM, GSC, CMS, GBP, brand assets, questionnaire)", phase: "Access Collection", dayTarget: 4, order: 3 },
  { title: "3 Months Initial Plan & Roadmap drafted, reviewed & delivered", phase: "Roadmap", dayTarget: 14, order: 4 },
  { title: "Biweekly report #1 compiled & delivered", phase: "Reporting", dayTarget: 15, order: 5 },
];

const newSiteTasks: TaskTemplate[] = [
  { title: "Tracking verified (GA4, GTM, GSC)", phase: "Technical Setup", dayTarget: 4, order: 6 },
  { title: "Technical baseline recorded (crawl, CWV)", phase: "Technical Setup", dayTarget: 5, order: 7 },
  { title: "Keyword & competitor research completed", phase: "Research", dayTarget: 7, order: 8 },
  { title: "Content plan drafted", phase: "Research", dayTarget: 8, order: 9 },
];

const noPriorSeoTasks: TaskTemplate[] = [
  { title: "Site crawl & technical audit completed", phase: "Technical Audit", dayTarget: 5, order: 6 },
  { title: "GSC & GA4 baseline reviewed", phase: "Technical Audit", dayTarget: 5, order: 7 },
  { title: "Keyword & competitor research completed", phase: "Research", dayTarget: 7, order: 8 },
  { title: "Quick wins list built", phase: "Research", dayTarget: 8, order: 9 },
];

const priorSeoTasks: TaskTemplate[] = [
  { title: "Previous work reviewed (reports, GSC/GA4, 12 months)", phase: "Historical Analysis", dayTarget: 4, order: 6 },
  { title: "Full technical audit completed", phase: "Technical Audit", dayTarget: 6, order: 7 },
  { title: "Rankings, gaps & competitor analysis completed", phase: "Research", dayTarget: 7, order: 8 },
  { title: "Quick wins list built", phase: "Research", dayTarget: 8, order: 9 },
];

export function getTasksForClientType(clientType: ClientType): TaskTemplate[] {
  const specific =
    clientType === "new_site"
      ? newSiteTasks
      : clientType === "no_prior_seo"
      ? noPriorSeoTasks
      : priorSeoTasks;
  return [...universalTasks, ...specific];
}
