export interface KpiItem {
  label: string;
  value: string;
  color: "error" | "primary" | "tertiary";
  footer_text: string;
  progress: number; // 0-100
}

export interface AlertItem {
  tag: string;
  tag_color: string;
  time: string;
  title: string;
  desc: string;
  source_url: string;
}

export interface MarketRow {
  exchange: string;
  latest: string;
  move: string;
  direction: "up" | "down";
}

export interface ContentCard {
  icon?: string;
  title: string;
  desc: string;
  source_url: string;
}

export interface MilestoneItem {
  icon: string;
  icon_color: string;
  title: string;
  desc: string;
}

export interface ProjectItem {
  country_tags: string[];
  title: string;
  status: string;
  desc: string;
  atc_relevance: string;
  source_url: string;
}

export interface SourceItem {
  title: string;
  url: string;
}

export interface DispatchData {
  date: string;
  generated_at: string;
  kpi: {
    geopolitical: KpiItem;
    industry: KpiItem;
    projects: KpiItem;
  };
  alerts: AlertItem[];
  markets: MarketRow[];
  energy: ContentCard[];
  business: AlertItem[];
  gulfcryo: MilestoneItem[];
  weekly?: {
    industry: AlertItem[];
    projects: ProjectItem[];
  };
  strategic_alert: string;
  sources: SourceItem[];
}
