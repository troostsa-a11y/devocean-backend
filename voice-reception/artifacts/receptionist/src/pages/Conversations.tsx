import { Link } from "wouter";
import { useListOpenaiConversations, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Conversations() {
  const { data: conversations, isLoading } = useListOpenaiConversations({ query: { queryKey: getListOpenaiConversationsQueryKey() } });

  const sortedConversations = conversations?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Conversations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review transcripts from the AI voice receptionist.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sortedConversations.length > 0 ? (
        <div className="grid gap-3">
          {sortedConversations.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`} className="block group">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {conv.title || "Voice Session"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No conversations found</h3>
          <p className="text-muted-foreground text-sm">Start a test session on the Voice Widget page.</p>
        </Card>
      )}
    </div>
  );
}
