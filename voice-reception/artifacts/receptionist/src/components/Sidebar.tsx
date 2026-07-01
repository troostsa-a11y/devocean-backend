import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, Calendar, Phone } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/bookings", label: "Bookings", icon: Calendar },
    { href: "/widget", label: "Voice Receptionist", icon: Phone },
  ];

  return (
    <div className="w-64 border-r border-border bg-card min-h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-serif font-semibold text-primary">DEVOCEAN</h1>
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest mt-1">Lodge Admin</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid={`link-sidebar-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        DEVOCEAN Lodge, Ponta do Ouro
      </div>
    </div>
  );
}
