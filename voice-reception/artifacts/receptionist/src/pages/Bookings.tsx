import { useState } from "react";
import { 
  useListBookings, getListBookingsQueryKey, 
  useDeleteBooking, useCreateBooking, useGetBooking, getGetBookingQueryKey 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, Trash2, Loader2, User, Phone, Mail, FileText, ExternalLink, Plus, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function BookingDetailModal({ id, open, onOpenChange }: { id: number | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: booking, isLoading } = useGetBooking(id || 0, {
    query: { enabled: !!id && open, queryKey: getGetBookingQueryKey(id || 0) }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Booking Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : booking ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Guest Name</div>
              <div className="font-medium">{booking.guestName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contact</div>
              <div>{booking.guestEmail || "No email"} / {booking.guestPhone || "No phone"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Dates</div>
              <div>{booking.checkIn} to {booking.checkOut}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Notes</div>
              <div className="bg-secondary p-3 rounded-md mt-1 text-sm">{booking.notes || "No notes"}</div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Bookings() {
  const { data: bookings, isLoading } = useListBookings({ query: { queryKey: getListBookingsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const deleteBooking = useDeleteBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        toast({ title: "Booking enquiry deleted" });
      }
    }
  });

  const createBooking = useCreateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        toast({ title: "Test booking added" });
      }
    }
  });

  const sortedBookings = bookings?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Booking Enquiries</h1>
          <p className="text-muted-foreground mt-1 text-sm">Leads collected by the AI receptionist.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            createBooking.mutate({
              data: {
                guestName: "Test Guest",
                guestEmail: "test@example.com",
                guests: 2,
                notes: "Manual test entry",
              }
            });
          }}
          disabled={createBooking.isPending}
        >
          {createBooking.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Test
        </Button>
      </div>

      <BookingDetailModal 
        id={selectedBookingId} 
        open={selectedBookingId !== null} 
        onOpenChange={(o) => !o && setSelectedBookingId(null)} 
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sortedBookings.length > 0 ? (
        <div className="grid gap-4">
          {sortedBookings.map((booking) => (
            <Card key={booking.id} className="p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-foreground">{booking.guestName}</h3>
                      <div className="text-sm text-muted-foreground">Received {format(new Date(booking.createdAt), "MMM d, yyyy")}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Dates:</span> 
                        {booking.checkIn ? format(new Date(booking.checkIn), "MMM d") : "?"} - {booking.checkOut ? format(new Date(booking.checkOut), "MMM d") : "?"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Guests:</span> {booking.guests || "?"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {booking.guestPhone || <span className="text-muted-foreground italic">No phone provided</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {booking.guestEmail || <span className="text-muted-foreground italic">No email provided</span>}
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="bg-secondary/50 p-3 rounded-md mt-2 flex gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t border-border pt-4 md:border-t-0 md:pt-0">
                  <Button variant="outline" size="sm" className="w-full justify-start text-primary" onClick={() => setSelectedBookingId(booking.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                  {booking.conversationId && (
                    <Link href={`/conversations/${booking.conversationId}`}>
                      <Button variant="outline" size="sm" className="w-full justify-start text-primary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Delete this booking enquiry?")) {
                        deleteBooking.mutate({ id: booking.id });
                      }
                    }}
                    disabled={deleteBooking.isPending}
                    data-testid={`button-delete-booking-${booking.id}`}
                  >
                    {deleteBooking.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No bookings found</h3>
          <p className="text-muted-foreground text-sm">When the AI collects booking details, they will appear here.</p>
        </Card>
      )}
    </div>
  );
}
