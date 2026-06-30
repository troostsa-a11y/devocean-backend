import { useParams, Link, useLocation } from "wouter";
import { useGetOpenaiConversation, getGetOpenaiConversationQueryKey, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey, useListOpenaiMessages, getListOpenaiMessagesQueryKey, useListConversationBookings, getListConversationBookingsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Loader2, User, Bot, Calendar, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoiceWidget } from "@/components/VoiceWidget";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ConversationDetail() {
  const { id } = useParams();
  const convId = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversation, isLoading: convLoading } = useGetOpenaiConversation(convId, { 
    query: { enabled: !!convId, queryKey: getGetOpenaiConversationQueryKey(convId) } 
  });
  
  const { data: messages, isLoading: msgsLoading } = useListOpenaiMessages(convId, {
    query: { enabled: !!convId, queryKey: getListOpenaiMessagesQueryKey(convId) }
  });

  const { data: linkedBookings, isLoading: bookingsLoading } = useListConversationBookings(convId, {
    query: { enabled: !!convId, queryKey: getListConversationBookingsQueryKey(convId) }
  });

  const deleteConv = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        toast({ title: "Conversation deleted" });
        setLocation("/conversations");
      }
    }
  });

  if (convLoading || msgsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Conversation not found</h2>
        <Link href="/conversations" className="text-primary mt-4 inline-block hover:underline">
          Return to list
        </Link>
      </div>
    );
  }
  
  const displayMessages = messages || conversation.messages || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/conversations">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">{conversation.title || "Voice Session"}</h1>
            <p className="text-muted-foreground text-sm">
              {format(new Date(conversation.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => {
            if (confirm("Are you sure you want to delete this conversation?")) {
              deleteConv.mutate({ id: convId });
            }
          }}
          disabled={deleteConv.isPending}
          data-testid={`button-delete-conv-${convId}`}
        >
          {deleteConv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete
        </Button>
      </div>

      {/* Booking enquiries linked to this conversation */}
      {!bookingsLoading && linkedBookings && linkedBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Booking Enquiries from this Session</h2>
          <div className="grid gap-3">
            {linkedBookings.map((booking) => (
              <Card key={booking.id} className="p-4" data-testid={`card-booking-${booking.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{booking.guestName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(booking.checkIn || booking.checkOut) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {booking.checkIn ? format(new Date(booking.checkIn), "MMM d") : "?"}
                            {" – "}
                            {booking.checkOut ? format(new Date(booking.checkOut), "MMM d") : "?"}
                            {booking.guests ? ` · ${booking.guests} guest${booking.guests > 1 ? "s" : ""}` : ""}
                          </span>
                        </div>
                      )}
                      {booking.guestEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{booking.guestEmail}</span>
                        </div>
                      )}
                      {booking.guestPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{booking.guestPhone}</span>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="flex items-start gap-2 text-sm sm:col-span-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-foreground">Transcript</h2>
        {displayMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-secondary/50 rounded-lg border border-border">
            No messages recorded yet. Use the widget below to start.
          </div>
        ) : (
          <div className="space-y-4">
            {displayMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 p-4 rounded-lg ${msg.role === "user" ? "bg-card border border-border" : "bg-primary/5 border border-primary/10"}`}
                data-testid={`msg-${msg.role}-${msg.id}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm capitalize">{msg.role === "user" ? "Guest" : "Mia"}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "h:mm:ss a")}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 border-t border-border pt-12">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-serif font-bold text-foreground">Test Receptionist</h2>
          <p className="text-sm text-muted-foreground mt-1">Continue this conversation live to test the AI's context.</p>
        </div>
        <VoiceWidget conversationId={convId} />
      </div>
    </div>
  );
}
