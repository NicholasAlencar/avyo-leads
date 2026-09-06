export interface FunnelCounts {
  found: number; new: number; qualified: number; hot: number; contacted: number;
  replies: number; positive: number; meetings: number; proposals: number; clients: number;
  potential: number; revenue: number;
}
export function calculateRates(counts: Pick<FunnelCounts, "found" | "contacted" | "replies" | "meetings" | "clients">) {
  const percent = (value: number, total: number) => total > 0 ? Math.round(value / total * 1000) / 10 : 0;
  return { responseRate: percent(counts.replies, counts.contacted), meetingRate: percent(counts.meetings, counts.contacted), closingRate: percent(counts.clients, counts.meetings), conversionRate: percent(counts.clients, counts.found) };
}
