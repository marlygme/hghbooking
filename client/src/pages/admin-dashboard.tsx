import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Calendar,
  Users,
  Clock,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Grid3X3
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient, getSessionId, clearSessionId } from "@/lib/queryClient";
import type { BookingRequest } from "@shared/schema";

type StatusFilter = "all" | "pending" | "approved" | "declined";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "Bookings", icon: ClipboardList, path: "/admin/dashboard" },
];

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "decline" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!getSessionId()) {
      setLocation("/admin");
    }
  }, [setLocation]);

  const { data: bookings, isLoading, error } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings"],
  });

  useEffect(() => {
    if (error && error.message?.includes("401")) {
      clearSessionId();
      setLocation("/admin");
    }
  }, [error, setLocation]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/status`, { 
        status, 
        adminNotes: notes 
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: actionType === "approve" ? "Booking Approved" : "Booking Declined",
        description: `The booking has been ${actionType === "approve" ? "approved" : "declined"}. An email notification has been sent.`,
      });
      setSelectedBooking(null);
      setActionType(null);
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout", {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
      setLocation("/admin");
    },
  });

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) ?? [];

  const stats = {
    total: bookings?.length ?? 0,
    pending: bookings?.filter((b) => b.status === "pending").length ?? 0,
    approved: bookings?.filter((b) => b.status === "approved").length ?? 0,
    declined: bookings?.filter((b) => b.status === "declined").length ?? 0,
  };

  const handleAction = (booking: BookingRequest, action: "approve" | "decline") => {
    setSelectedBooking(booking);
    setActionType(action);
    setAdminNotes("");
  };

  const confirmAction = () => {
    if (selectedBooking && actionType) {
      updateStatusMutation.mutate({
        id: selectedBooking.id,
        status: actionType === "approve" ? "approved" : "declined",
        notes: adminNotes,
      });
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Grid3X3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Futsal Admin</h2>
                <p className="text-xs text-sidebar-foreground/70">110 Elizabeth St</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="data-[active=true]:bg-sidebar-accent">
                        <Link href={item.path}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold hidden md:block">Booking Requests</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title="Total Requests" 
                value={stats.total} 
                icon={<ClipboardList className="w-4 h-4" />}
              />
              <StatsCard 
                title="Pending" 
                value={stats.pending} 
                icon={<AlertCircle className="w-4 h-4" />}
                variant="warning"
              />
              <StatsCard 
                title="Approved" 
                value={stats.approved} 
                icon={<CheckCircle className="w-4 h-4" />}
                variant="success"
              />
              <StatsCard 
                title="Declined" 
                value={stats.declined} 
                icon={<XCircle className="w-4 h-4" />}
                variant="destructive"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Failed to Load Bookings</h3>
                  <p className="text-muted-foreground text-sm">
                    Please check your connection and try again.
                  </p>
                </CardContent>
              </Card>
            ) : filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Booking Requests</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "No bookings match your search criteria."
                      : "No booking requests have been submitted yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={() => handleAction(booking, "approve")}
                    onDecline={() => handleAction(booking, "decline")}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Action Confirmation Dialog */}
        <Dialog open={!!selectedBooking && !!actionType} onOpenChange={() => {
          setSelectedBooking(null);
          setActionType(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve Booking" : "Decline Booking"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "Confirm approval for this booking request. An email will be sent to the user."
                  : "Confirm declining this booking request. An email will be sent to the user."}
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div className="bg-muted rounded-md p-4">
                  <div className="grid gap-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedBooking.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {format(new Date(selectedBooking.bookingDate), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedBooking.timeSlots.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="adminNotes" className="text-sm font-medium">
                    Add a note (optional)
                  </Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add any notes for internal reference..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-2"
                    data-testid="textarea-admin-notes"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBooking(null);
                  setActionType(null);
                }}
                data-testid="button-cancel-action"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={confirmAction}
                disabled={updateStatusMutation.isPending}
                data-testid="button-confirm-action"
              >
                {updateStatusMutation.isPending
                  ? "Processing..."
                  : actionType === "approve"
                  ? "Approve"
                  : "Decline"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}

function StatsCard({
  title,
  value,
  icon,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const variantClasses = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={variantClasses[variant]}>{icon}</div>
        </div>
        <p className={`text-2xl font-bold mt-1 ${variantClasses[variant]}`} data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function BookingCard({
  booking,
  onApprove,
  onDecline,
}: {
  booking: BookingRequest;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    declined: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusIcons = {
    pending: AlertCircle,
    approved: CheckCircle,
    declined: XCircle,
  };

  const StatusIcon = statusIcons[booking.status];

  return (
    <Card className="hover-elevate" data-testid={`card-booking-${booking.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold" data-testid={`text-booking-name-${booking.id}`}>{booking.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusColors[booking.status]} capitalize text-xs`}
            data-testid={`badge-status-${booking.id}`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{booking.timeSlots.slice(0, 3).join(", ")}{booking.timeSlots.length > 3 && ` +${booking.timeSlots.length - 3} more`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{booking.estimatedAttendees} attendees</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Grid3X3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Badge variant="secondary" size="sm">
              {booking.pitchType === "single_court" ? "Single Court" : "Full Pitch"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 border-t pt-3">
          <Mail className="w-3 h-3" />
          <span className="truncate">{booking.email}</span>
        </div>

        {booking.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={onApprove}
              data-testid={`button-approve-${booking.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onDecline}
              data-testid={`button-decline-${booking.id}`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
