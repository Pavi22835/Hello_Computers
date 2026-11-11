import { Keyboard, Laptop, Monitor, Package, Printer } from "lucide-react";

export const categoryIcons = {
  laptops: Laptop,
  desktops: Monitor,
  accessories: Keyboard,
  printers: Printer,
  default: Package,
};

const unsplash = (photo) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=80`;

const categoryImages = {
  laptops: unsplash("photo-1496181133206-80ce9b88a853"),
  desktops: unsplash("photo-1593642632823-8f785ba67e45"),
  accessories: unsplash("photo-1587829741301-dc798b83add3"),
  printers: unsplash("photo-1612815154858-60aa4c59eaa6"),
};
const offerImages = [
  unsplash("photo-1496181133206-80ce9b88a853"),
  unsplash("photo-1593642632823-8f785ba67e45"),
  unsplash("photo-1587829741301-dc798b83add3"),
];
const serviceImages = [
  unsplash("photo-1581092921461-eab62e97a780"),
  unsplash("photo-1519389950473-47ba0277781c"),
  unsplash("photo-1581092160562-40aa08e78837"),
];

function categoryKey(category) {
  const value = typeof category === "string"
    ? category
    : `${category?.slug || ""} ${category?.name || ""}`;
  return value.toLowerCase();
}

export function getCategoryImageUrl(category) {
  const key = categoryKey(category);
  if (/laptop|notebook|chromebook/.test(key)) return categoryImages.laptops;
  if (/desktop|computer|monitor|gaming|pc/.test(key)) return categoryImages.desktops;
  if (/printer|scanner|ink|toner/.test(key)) return categoryImages.printers;
  if (/accessor|keyboard|mouse|headset|peripheral/.test(key)) return categoryImages.accessories;
  return categoryImages.desktops;
}

export function getProductImageUrl(name, category) {
  const key = typeof name === "string" ? name.toLowerCase() : "";
  if (/printer|scanner|ink|toner/.test(key)) return categoryImages.printers;
  if (/keyboard|mouse|headset|headphone|webcam|cable|hub|adapter|speaker/.test(key)) {
    return categoryImages.accessories;
  }
  if (/desktop|tower|monitor|gaming pc/.test(key)) return categoryImages.desktops;
  if (/laptop|notebook|chromebook|macbook/.test(key)) return categoryImages.laptops;
  return getCategoryImageUrl(category);
}

function imageForName(name, images) {
  const key = typeof name === "string" ? name.toLowerCase() : "";
  const index = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return images[index % images.length];
}

export function getOfferImageUrl(title) {
  return imageForName(title, offerImages);
}

export function getServiceImageUrl(title) {
  return imageForName(title, serviceImages);
}
