import { useState } from "react";
import { Link } from "wouter";
import { useListOpenaiConversations, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { MessageSquare, ArrowRight, Loader2, CalendarCheck, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = "newest" | "most-messages" | "most-bookings";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest first",
  "most-messages": "Most messages",
  "most-bookings": "Most bookings",
};

export default function Conversations() {
  const [bookedOnly, setBookedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const { data: conversations, isLoading } = useListOpenaiConversations({ query: { queryKey: getListOpenaiConversationsQueryKey() } });

  const filtered = (conversations ?? []).filter((c) => !bookedOnly || c.bookingCount > 0);

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortKey === "most-messages") return b.messageCount - a.messageCount;
    return b.bookingCount - a.bookingCount;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Conversations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review transcripts from the AI voice receptionist.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={bookedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setBookedOnly((v) => !v)}
            data-testid="button-filter-booked-only"
            className="flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            With bookings only
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-sort-conversations" className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                {SORT_LABELS[sortKey]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <DropdownMenuRadioItem value="newest" data-testid="sort-option-newest">Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most-messages" data-testid="sort-option-most-messages">Most messages</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most-bookings" data-testid="sort-option-most-bookings">Most bookings</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid gap-3">
          {sorted.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`} className="block group">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-secondary text-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {conv.title || "Voice Session"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MessageSquare className="w-3 h-3" />
                      {conv.messageCount} {conv.messageCount === 1 ? "message" : "messages"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {conv.bookingCount > 0 && (
                    <Badge variant="secondary" className="text-xs py-0 h-5 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      {conv.bookingCount} {conv.bookingCount === 1 ? "booking" : "bookings"}
                    </Badge>
                  )}
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {bookedOnly ? "No conversations with bookings found" : "No conversations found"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {bookedOnly ? "Try removing the filter to see all sessions." : "Start a test session on the Voice Widget page."}
          </p>
        </Card>
      )}
    </div>
  );
}
