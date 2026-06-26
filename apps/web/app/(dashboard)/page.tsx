import { PageHeader } from "@/components/features/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/features/shared/activity-feed";
import { apiClient } from "@/lib/api-client";
import type { ActivityEvent, DashboardStats } from "@sealed/types";

export default async function DashboardPage() {
  let events: ActivityEvent[] = [];
  let stats: DashboardStats = {
    openProposals: 0,
    pendingAgreements: 0,
    outstandingInvoices: 0,
    activeProposals: 0,
  };

  try {
    const [eventsRes, statsRes] = await Promise.all([
      apiClient<{ data: ActivityEvent[] }>("/activity"),
      apiClient<{ data: DashboardStats }>("/stats"),
    ]);
    events = eventsRes.data;
    stats = statsRes.data;
  } catch {
    // Dashboard is non-critical — render with zeros rather than error boundary
  }

  const statCards = [
    { title: "Open Proposals", value: stats.openProposals },
    { title: "Pending Agreements", value: stats.pendingAgreements },
    { title: "Outstanding Invoices", value: stats.outstandingInvoices },
    { title: "Active Proposals", value: stats.activeProposals },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your proposals, agreements, and invoices"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ActivityFeed events={events} />
        </CardContent>
      </Card>
    </div>
  );
}