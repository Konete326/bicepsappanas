import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  UserCheck,
  Scale,
  Dumbbell,
  Bell,
  TrendingUp,
  Info,
  LogOut,
  X,
  Package,
  ShoppingCart,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Members", href: "/members", icon: Users, permission: "members" },
  { title: "Payments", href: "/payments", icon: Receipt, permission: "payments" },
  { title: "Trainers", href: "/trainers", icon: UserCheck, adminOnly: true },
  { title: "Measurements", href: "/measurements", icon: Scale, permission: "measurements" },
  { title: "Routines", href: "/routines", icon: Dumbbell, permission: "routines" },
  { title: "Reports", href: "/reports", icon: TrendingUp, permission: "reports" },
  { title: "Inventory", href: "/inventory", icon: Package, permission: "inventory" },
  { title: "Shop", href: "/pos", icon: ShoppingCart, permission: "pos" },
  { title: "Shop Sales", href: "/sales", icon: Receipt, permission: "pos" },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "System Access", href: "/admins", icon: Shield, adminOnly: true }
];

export function Sidebar({ onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in");
  };

  return (
    <aside className="w-60 bg-white lg:bg-transparent flex flex-col relative z-10 h-full border-r border-stone-200 lg:border-0">
      <div className="p-6 pb-0 relative z-10 flex items-center justify-between font-outfit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 transition-transform hover:scale-105 duration-300 flex items-center justify-center">
            <img src="/logo.png" alt="BicepsApp Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-stone-900 uppercase truncate max-w-[140px]">
            BicepsApp
          </h1>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10 flex flex-col justify-between">
        <div className="space-y-0.5">
          {navItems.filter(item => {
            if (user?.role === "admin") return true;
            if (item.adminOnly) return false;
            if (item.permission) return user?.permissions?.includes(item.permission);
            return true;
          }).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <NavLink key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center text-sm font-normal rounded-lg cursor-pointer px-3 py-1.5 transition-all duration-200",
                    isActive
                      ? "shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50"
                      : "text-stone-700 hover:bg-stone-100 border border-transparent"
                  )}
                >
                  <Icon className="mr-3 w-4 h-4" />
                  {item.title}
                </div>
              </NavLink>
            );
          })}
        </div>

        <div className="pt-4 border-t border-stone-200">
          <div
            onClick={handleLogout}
            className="flex items-center text-sm font-normal rounded-lg cursor-pointer px-3 py-2 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="mr-3 w-4 h-4" />
            Logout
          </div>
        </div>
      </nav>
    </aside>
  );
}

