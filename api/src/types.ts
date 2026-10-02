// Mirrors the frontend's lib/types.ts page shapes (the two projects don't
// share a package, so this is a manual mirror — keep both in sync).

export type Tone = "accent" | "cyan" | "warning" | "danger" | "neutral";
export type Direction = "up" | "down" | "flat";
export type Region = "MENA" | "Europe" | "ASEAN" | "Americas";
export type RiskTier = "high" | "moderate" | "low";
// "Why and how" behind a judgement: a short reason naming the evidence, and
// the articles it rests on. Optional — sample data has none.
export interface SourceRef {
  title: string;
  url: string;
}

export interface Explained {
  basis?: string;
  sources?: SourceRef[];
}

export interface TickerItem {
  label: string;
  value: string;
  change?: string;
  direction: Direction;
}

export interface KpiStat extends Explained {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  icon: string;
  tone: Tone;
}

// ---- Main Dashboard ----

export interface GeoPulseItem {
  tag: "WARNING" | "MONITOR";
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
  time: string;
}

export interface IndustryHighlight {
  tag: string;
  tone: Tone;
  title: string;
  desc: string;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
  region: Region;
  image?: string;
}

export interface LeadershipAppointment {
  company: string;
  initials: string;
  role: string;
  region: Region;
  desc: string;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
}

export interface MarketSeries {
  label: string;
  value: string;
  change: string;
  direction: Direction;
  bars: number[];
}

export interface ProjectHighlight {
  title: string;
  location: string;
  progress: number;
  tone: Tone;
}

export interface OpportunityEntry extends Explained {
  code: string;
  country: string;
  sector: string;
  tier: "High" | "Moderate";
  potential: string;
}

export interface DashboardData {
  kpis: KpiStat[];
  geoPulse: GeoPulseItem[];
  industryWeekly: IndustryHighlight[];
  leadershipMoves: LeadershipAppointment[];
  projectHighlights: ProjectHighlight[];
  opportunityRadar: OpportunityEntry[];
  // marketSeries is populated separately by marketRefresh (see MarketsData)
}

// ---- Geopolitical ----

export interface HotZone {
  name: string;
  coords: string;
  lat: number;
  lng: number;
  detail: string;
}

export interface RiskRegion {
  name: string;
  pct: number;
  tone: Tone;
}

export interface CriticalIncident {
  title: string;
  desc: string;
  time: string;
  lat: number;
  lng: number;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
}

export interface CountryRiskPoint {
  country: string;
  lat: number;
  lng: number;
  tier: RiskTier;
}

export interface IntelArticle {
  tag: "WARNING" | "MONITOR";
  region: string;
  time: string;
  title: string;
  desc: string;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
}

export interface GeopoliticalData {
  hotZone: HotZone;
  riskRegions: RiskRegion[];
  criticalIncident: CriticalIncident;
  countryRisk: CountryRiskPoint[];
  articles: IntelArticle[];
}

// ---- Industry Summary ----

export interface CompetitorCell extends Explained {
  value: string;
  tone: Tone;
}

export interface CompetitorRow {
  country: string;
  linde: CompetitorCell;
  airProducts: CompetitorCell;
  airLiquide: CompetitorCell;
  messer: CompetitorCell;
  gcOpportunity: CompetitorCell;
}

export interface GrowthOpportunity extends Explained {
  code: string;
  country: string;
  sector: string;
  score: number;
  summary: string;
  actionUrgency: string;
  action: string;
  potential: string;
  progress: number;
}

export interface WhiteSpaceSector extends Explained {
  icon: string;
  tier: "HIGH" | "MEDIUM" | "EMERGING";
  tone: Tone;
  title: string;
  desc: string;
  angle: string;
}

export interface IndustrySummaryData {
  competitors: CompetitorRow[];
  opportunities: GrowthOpportunity[];
  whiteSpace: WhiteSpaceSector[];
}

// ---- Project Tracker ----

export interface TrackerKpi extends Explained {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  icon: string;
  tone: Tone;
}

export type ProjectCategory = "construction" | "renewable" | "sustainability";

export interface ProjectCard {
  title: string;
  location: string;
  status: string;
  statusTone: Tone;
  gasDemand: string;
  innovation: string;
  quote: string;
  atcConnection: boolean;
  icon: string;
  image?: string;
  category: ProjectCategory;
}

export interface TerritoryRow {
  country: string;
  projects: number;
  innovationPct: number;
  sector: string;
  opportunity: "HIGH" | "MEDIUM" | "EMERGING";
  trend: Direction;
}

export interface ProjectTrackerData {
  kpis: TrackerKpi[];
  projects: ProjectCard[];
  territories: TerritoryRow[];
}

// ---- Tech Innovation ----

export interface TechArticle {
  tag: string;
  tone: Tone;
  time: string;
  title: string;
  desc: string;
  source: string;
  sourceUrl: string;
  publishedAt?: string; // YYYY-MM-DD, from the live refresh
  size: "featured" | "wide" | "standard" | "half";
  icon?: string;
  image?: string;
  region: Region;
}

// ---- Weekly bundle (industry summary + project tracker + tech articles) ----

export interface WeeklyData {
  industrySummary: IndustrySummaryData;
  projectTracker: ProjectTrackerData;
  // Older weekly blobs carried tech articles; they now come from techRefresh.
  techArticles?: TechArticle[];
}

// ---- Tech bundle (tech & innovation articles, its own weekly run) ----

export interface TechData {
  generated_at: string;
  techArticles: TechArticle[];
}

// ---- Markets (refreshed every 30 min during GCC trading hours) ----

export interface MarketsData {
  generated_at: string;
  marketSeries: MarketSeries[];
  ticker: TickerItem[];
}

// ---- Daily bundle (dashboard minus marketSeries + geopolitical) ----

export interface DailyData {
  generated_at: string;
  dashboard: DashboardData;
  geopolitical: GeopoliticalData;
}
