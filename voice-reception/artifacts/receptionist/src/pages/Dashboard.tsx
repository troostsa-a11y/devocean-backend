import { useGetDashboardStats, getGetDashboardStatsQueryKey, useListOpenaiConversations, getListOpenaiConversationsQueryKey, useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MessageSquare, Calendar, TrendingUp, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: conversations, isLoading: convLoading } = useListOpenaiConversations({ query: { queryKey: getListOpenaiConversationsQueryKey() } });
  const { data: bookings, isLoading: bookingsLoading } = useListBookings({ query: { queryKey: getListBookingsQueryKey() } });

  const recentConversations = conversations?.slice(0, 5) || [];
  const recentBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's what's happening at DEVOCEAN Lodge today.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
              <MessageSquare className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif" data-testid="text-total-conversations">{stats.totalConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif" data-testid="text-total-bookings">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversations This Week</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{stats.conversationsThisWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bookings This Week</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{stats.bookingsThisWeek}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">Recent Conversations</CardTitle>
            <Link href="/conversations" className="text-sm text-primary flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {convLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-secondary animate-pulse rounded-md" />)}
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="space-y-4">
                {recentConversations.map(conv => (
                  <Link key={conv.id} href={`/conversations/${conv.id}`} className="block group">
                    <div className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-border">
                      <div>
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{conv.title || "Voice Session"}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(conv.createdAt), "MMM d, h:mm a")}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No conversations yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">Recent Bookings</CardTitle>
            <Link href="/bookings" className="text-sm text-primary flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-secondary animate-pulse rounded-md" />)}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium text-sm">{booking.guestName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.checkIn && format(new Date(booking.checkIn), "MMM d")} - {booking.checkOut && format(new Date(booking.checkOut), "MMM d")}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
