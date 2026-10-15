// Static display content for the UI (same sample catalogue the Products page already used).
import { productImages, categoryImages, offerImages, serviceImages } from "../assets/images";
import { Keyboard, Laptop, Monitor, Printer, Wrench, Cpu, HardDrive, Wifi, ShieldCheck, Database, Headphones, Truck } from "lucide-react";

export const categoryIcons = { Laptops: Laptop, Desktops: Monitor, Accessories: Keyboard, Printers: Printer };

export const products = [
  { id: 1, name: "HP Business Laptop", category: "Laptops", brand: "HP", price: 45999, oldPrice: 52999, rating: 4.8, image: productImages.laptop, badge: "Best Seller", specs: "Core i5 · 16GB · 512GB SSD" },
  { id: 2, name: "Dell Professional Laptop", category: "Laptops", brand: "Dell", price: 52999, oldPrice: 58999, rating: 4.7, image: productImages.laptop, badge: "Popular", specs: "Core i7 · 16GB · 512GB SSD" },
  { id: 3, name: "Lenovo Business Laptop", category: "Laptops", brand: "Lenovo", price: 48999, oldPrice: 54999, rating: 4.6, image: productImages.laptop, badge: "New", specs: "Ryzen 5 · 16GB · 512GB SSD" },
  { id: 4, name: "Dell Desktop System", category: "Desktops", brand: "Dell", price: 38499, oldPrice: 44999, rating: 4.7, image: productImages.desktop, badge: "Popular", specs: "Core i5 · 8GB · 1TB HDD" },
  { id: 5, name: "HP Desktop Computer", category: "Desktops", brand: "HP", price: 41999, oldPrice: 47999, rating: 4.6, image: productImages.desktop, badge: "Featured", specs: "Core i5 · 16GB · 512GB SSD" },
  { id: 6, name: "Wireless Keyboard & Mouse", category: "Accessories", brand: "Logitech", price: 1499, oldPrice: 1899, rating: 4.6, image: productImages.keyboard, badge: "Trending", specs: "2.4GHz · Silent keys" },
  { id: 7, name: "USB Mechanical Keyboard", category: "Accessories", brand: "Zebronics", price: 2199, oldPrice: 2699, rating: 4.5, image: productImages.keyboard, badge: "New", specs: "Blue switches · Backlit" },
  { id: 8, name: "All-in-One Printer", category: "Printers", brand: "HP", price: 8999, oldPrice: 9999, rating: 4.7, image: productImages.printer, badge: "Featured", specs: "Print · Scan · Copy · Wi-Fi" },
];

export const categories = [
  { title: "Laptops", image: categoryImages.Laptops, copy: "Business, student and creator laptops from top brands.", count: "120+ models", icon: Laptop },
  { title: "Desktops", image: categoryImages.Desktops, copy: "Reliable towers and all-in-ones for office and home.", count: "80+ models", icon: Monitor },
  { title: "Accessories", image: categoryImages.Accessories, copy: "Keyboards, mice, headsets, storage and cables.", count: "150+ items", icon: Keyboard },
  { title: "Printers", image: categoryImages.Printers, copy: "Inkjet, laser and ink-tank printers for every workload.", count: "40+ models", icon: Printer },
];

export const offers = [
  { id: "student", image: offerImages.student, tag: "Up to 15% off", title: "Student Laptop Bundle", copy: "Laptop, bag and wireless mouse together at a special bundle price.", code: "STUDENT", icon: Laptop, ends: "Limited stock" },
  { id: "office", image: offerImages.office, tag: "Save ₹6,000", title: "Office Desktop Combo", copy: "Desktop, monitor, keyboard and mouse, installed and ready to use.", code: "OFFICE", icon: Monitor, ends: "This month" },
  { id: "exchange", image: offerImages.exchange, tag: "Up to ₹8,000", title: "Old Laptop Exchange", copy: "Trade in your old laptop and upgrade for less. Free evaluation in-store.", code: "EXCHANGE", icon: Cpu, ends: "All year" },
  { id: "printer", image: offerImages.printer, tag: "Free setup", title: "Printer + Free Installation", copy: "Buy any printer and get on-site setup with a free ink starter kit.", code: "PRINT", icon: Printer, ends: "While stocks last" },
];

export const services = [
  { title: "Laptop & Desktop Repair", image: serviceImages.repair, copy: "Chip-level and component repair with transparent pricing and a written diagnosis.", icon: Wrench },
  { title: "Upgrades", image: serviceImages.upgrades, copy: "RAM, SSD and graphics upgrades that give older machines a second life.", icon: HardDrive },
  { title: "Data Recovery & Backup", image: serviceImages.dataRecovery, copy: "Recover files from failed drives and set up reliable automatic backups.", icon: Database },
  { title: "Network & Wi-Fi Setup", image: serviceImages.networking, copy: "Routers, CCTV-ready networking and cabling for homes and offices.", icon: Wifi },
  { title: "Virus Removal & Security", image: serviceImages.security, copy: "Malware cleanup, antivirus setup and safe-browsing guidance.", icon: ShieldCheck },
  { title: "AMC for Businesses", image: serviceImages.amc, copy: "Annual maintenance contracts with priority on-site support.", icon: Headphones },
];

export const trustPoints = [
  { title: "Genuine products", copy: "Authorised brands with full manufacturer warranty.", icon: ShieldCheck },
  { title: "Expert service", copy: "In-house technicians for repair, upgrade and setup.", icon: Wrench },
  { title: "Fast delivery", copy: "Quick local delivery with careful installation.", icon: Truck },
  { title: "Friendly support", copy: "Real people on WhatsApp and phone, six days a week.", icon: Headphones },
];

export const formatINR = (value) => `₹${value.toLocaleString("en-IN")}`;
