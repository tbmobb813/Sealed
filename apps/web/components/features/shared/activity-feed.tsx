import Link from "next/link";
import type { ActivityEvent } from "@sealed/types";

function formatEventType(eventType: string): string {
  return eventType
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getEventLink(event: ActivityEvent): string | null {
  if (event.objectType === "contact") {
    return `/contacts/${event.objectId}`;
  }

  if (event.objectType === "proposal") {
    return `/proposals/${event.objectId}`;
  }

  return null;
}

function getEventSummary(event: ActivityEvent): string {
  const title =
    typeof event.metadata.title === "string" ? event.metadata.title : null;

  if (title) {
    return title;
  }

  return `${event.objectType} ${event.objectId.slice(0, 8)}`;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No activity yet. Create a contact or proposal to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {events.map((event) => {
        const href = getEventLink(event);
        const summary = getEventSummary(event);

        return (
          <li key={event.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {formatEventType(event.eventType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {href ? (
                    <Link href={href} className="hover:underline">
                      {summary}
                    </Link>
                  ) : (
                    summary
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.actor?.name ?? "System"}
                </p>
              </div>
              <time
                dateTime={event.createdAt}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {new Date(event.createdAt).toLocaleString()}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
