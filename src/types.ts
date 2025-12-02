export interface StatCardProps {
  label: string;
  value: string | number;
}

export interface ChartData {
  name: string;
  hires: number;
}

export interface ActivityItem {
  id: number;
  type: 'add_person' | 'status_update' | 'pto_request' | 'contract_expiry';
  content: string;
  time: string;
  theme: 'emerald' | 'sky' | 'amber' | 'rose';
}
