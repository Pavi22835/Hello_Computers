import {
  BarChart3,
  ClipboardList,
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
import SalesReports from "../pages/Reports/SalesReports";
import CustomerReports from "../pages/Reports/CustomerReports";
import AdminProfile from "../pages/Settings/AdminProfile";

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
  { id: "services", label: "Services", icon: Wrench },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "service-enquiries", label: "Service enquiries", icon: Wrench },
  { id: "enquiries", label: "Enquiries", icon: Mail },
  { id: "sales-reports", label: "Sales reports", icon: BarChart3 },
  { id: "customer-reports", label: "Customer reports", icon: UserRound },
  { id: "settings", label: "General settings", icon: Settings },
  { id: "admin-profile", label: "Admin profile", icon: UserRound },
];

export const navigationGroups = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, sectionIds: ["dashboard", "analytics"] },
  { id: "master", label: "Master", icon: Package, sectionIds: ["products", "categories", "brands", "subcategories", "banners"] },
  { id: "orders", label: "Orders", icon: ClipboardList, sectionIds: ["orders"] },
  { id: "customers", label: "Customers", icon: Users, sectionIds: ["customers"] },
  { id: "marketing", label: "Marketing", icon: Megaphone, sectionIds: ["offers", "coupons", "whatsapp"] },
  { id: "services", label: "Services", icon: Wrench, sectionIds: ["services", "service-enquiries"] },
  { id: "enquiries", label: "Enquiries", icon: Mail, sectionIds: ["enquiries"] },
  { id: "reports", label: "Reports", icon: BarChart3, sectionIds: ["sales-reports", "customer-reports"] },
  { id: "settings", label: "Settings", icon: Settings, sectionIds: ["settings", "admin-profile"] },
];

export const placeholderPages = {
  analytics: <Analytics />,
  brands: <Brands />,
  subcategories: <SubCategories />,
  banners: <Banners />,
  coupons: <OffersCoupons />,
  whatsapp: <WhatsAppMessages />,
  "sales-reports": <SalesReports />,
  "customer-reports": <CustomerReports />,
  "admin-profile": <AdminProfile />,
};
