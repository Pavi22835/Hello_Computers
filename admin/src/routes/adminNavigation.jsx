import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  GitBranch,
  Home,
  Image,
  LayoutDashboard,
  Layers,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  Percent,
  Settings,
  ShieldCheck,
  Tag,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import Analytics from "../pages/Dashboard/Analytics";
import Brands from "../pages/Master/Brands";
import SubCategories from "../pages/Master/SubCategories";
import Banners from "../pages/Master/Banners";
import WhatsAppMessages from "../pages/Marketing/WhatsAppMessages";
import OffersCoupons from "../pages/Marketing/OffersCoupons";
import Notifications from "../pages/Marketing/Notifications";
import SalesReports from "../pages/Reports/SalesReports";
import ProductReports from "../pages/Reports/ProductReports";
import CustomerReports from "../pages/Reports/CustomerReports";
import OrderReports from "../pages/Reports/OrderReports";
import AdminProfile from "../pages/Settings/AdminProfile";
import UsersRoles from "../pages/Settings/UsersRoles";
import ActivityLogs from "../pages/Settings/ActivityLogs";

export const sections = [
  { id: "dashboard", label: "Overview", icon: Home },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "brands", label: "Brands", icon: Tag },
  { id: "subcategories", label: "Subcategories", icon: GitBranch },
  { id: "banners", label: "Banners", icon: Image },
  { id: "offers", label: "Offers", icon: Percent },
  { id: "coupons", label: "Coupons", icon: Percent },
  { id: "whatsapp", label: "WhatsApp messages", icon: MessageCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "services", label: "Services", icon: Wrench },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "service-enquiries", label: "Service enquiries", icon: Wrench },
  { id: "enquiries", label: "Enquiries", icon: Mail },
  { id: "sales-reports", label: "Sales reports", icon: BarChart3 },
  { id: "product-reports", label: "Product reports", icon: FileText },
  { id: "customer-reports", label: "Customer reports", icon: UserRound },
  { id: "order-reports", label: "Order reports", icon: ClipboardList },
  { id: "settings", label: "General settings", icon: Settings },
  { id: "admin-profile", label: "Admin profile", icon: UserRound },
  { id: "users-roles", label: "Users & roles", icon: ShieldCheck },
  { id: "activity-logs", label: "Activity logs", icon: Activity },
];

export const navigationGroups = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, sectionIds: ["dashboard", "analytics"] },
  { id: "master", label: "Master", icon: Package, sectionIds: ["products", "categories", "brands", "subcategories", "banners"] },
  { id: "orders", label: "Orders", icon: ClipboardList, sectionIds: ["orders"] },
  { id: "customers", label: "Customers", icon: Users, sectionIds: ["customers"] },
  { id: "marketing", label: "Marketing", icon: Megaphone, sectionIds: ["offers", "coupons", "whatsapp", "notifications"] },
  { id: "services", label: "Services", icon: Wrench, sectionIds: ["services", "service-enquiries"] },
  { id: "enquiries", label: "Enquiries", icon: Mail, sectionIds: ["enquiries"] },
  { id: "reports", label: "Reports", icon: BarChart3, sectionIds: ["sales-reports", "product-reports", "customer-reports", "order-reports"] },
  { id: "settings", label: "Settings", icon: Settings, sectionIds: ["settings", "admin-profile", "users-roles", "activity-logs"] },
];

export const placeholderPages = {
  analytics: <Analytics />,
  brands: <Brands />,
  subcategories: <SubCategories />,
  banners: <Banners />,
  coupons: <OffersCoupons />,
  whatsapp: <WhatsAppMessages />,
  notifications: <Notifications />,
  "sales-reports": <SalesReports />,
  "product-reports": <ProductReports />,
  "customer-reports": <CustomerReports />,
  "order-reports": <OrderReports />,
  "admin-profile": <AdminProfile />,
  "users-roles": <UsersRoles />,
  "activity-logs": <ActivityLogs />,
};
