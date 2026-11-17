import { aboutImages, bannerImages } from "../assets/images";

export const homePageDefaults = {
  hero: {
    eyebrow: "Computer sales & service",
    title: "Premium laptops, desktops &",
    accent: "expert service.",
    copy: "Genuine products from leading brands, honest advice and reliable repair, all under one roof.",
    imageUrl: "asset:hero",
    primaryLabel: "Explore Products",
    primaryUrl: "/products",
    secondaryLabel: "Get Service",
    secondaryUrl: "/services",
    imageAlt: "Laptop and monitor on a clean workspace",
    highlights: ["Genuine brands", "Expert repair", "Friendly support"],
    badgeTitle: "Manufacturer warranty",
    badgeCopy: "On every product",
  },
  categories: {
    eyebrow: "Shop by category",
    title: "Everything you need,",
    accent: "in one place.",
    copy: "Browse the current categories managed by our store.",
    linkLabel: "All categories",
    linkUrl: "/categories",
  },
  products: {
    eyebrow: "Featured",
    title: "Popular picks",
    accent: "from our store.",
    copy: "The latest products and availability from Hello Computers.",
    linkLabel: "View all products",
    linkUrl: "/products",
  },
  offers: {
    eyebrow: "Current offers",
    title: "Smart deals,",
    accent: "updated by our team.",
    linkLabel: "See all offers",
    linkUrl: "/offers",
  },
  benefits: {
    eyebrow: "Why Hello Computers",
    title: "Technology that",
    accent: "feels simple.",
    copy: "We make it easy to choose, set up and keep your technology running.",
    items: [
      { title: "Genuine products", copy: "Authorised brands with manufacturer warranty.", icon: "shield" },
      { title: "Expert service", copy: "Support for repair, upgrades and setup.", icon: "wrench" },
      { title: "Fast delivery", copy: "Local delivery arranged with our team.", icon: "truck" },
      { title: "Friendly support", copy: "Reach our team on WhatsApp or phone.", icon: "headphones" },
    ],
  },
  cta: {
    title: "Not sure what to pick?",
    copy: "Tell us your budget and use case. We will recommend the right system within minutes.",
    imageUrl: "asset:cta",
    message: "",
    whatsappLabel: "Chat on WhatsApp",
    enquiryLabel: "Send an Enquiry",
  },
};

export const aboutPageDefaults = {
  hero: {
    eyebrow: "About us",
    title: "A computer store that",
    accent: "puts you first.",
    copy: "Hello Computers helps individuals, students and businesses choose, buy and maintain the right technology, without the jargon or the pressure.",
    message: "Hi, I would like to know more about Hello Computers.",
    whatsappLabel: "Chat on WhatsApp",
    enquiryLabel: "Contact us",
  },
  story: {
    eyebrow: "Our story",
    title: "More than a",
    accent: "computer shop.",
    paragraphs: [
      "Choosing technology should feel straightforward. From a first student laptop to a complete office setup, every recommendation starts with understanding how you actually work.",
      "We pair a carefully selected range of products with practical, patient service, so your experience stays smooth long after the purchase.",
    ],
    imageUrl: "asset:store",
    imageAlt: "Inside the Hello Computers store",
    promiseLabel: "Our promise",
    promiseCopy: "Right product. Fair price. Support that does not disappear after billing.",
  },
  principles: {
    eyebrow: "What we stand for",
    title: "Built on",
    accent: "trust.",
    items: [
      { title: "Honest advice", copy: "We listen first and recommend only what fits your needs and budget.", icon: "badge" },
      { title: "Genuine products", copy: "Authorised brands, proper billing and full manufacturer warranty.", icon: "shield" },
      { title: "Service you can reach", copy: "An in-house team for repairs, upgrades and setup, close by when you need it.", icon: "wrench" },
      { title: "Support after the sale", copy: "Questions after purchase are welcome on WhatsApp, phone or in-store.", icon: "headphones" },
    ],
  },
  cta: {
    title: "Visit us or message us today.",
    copy: "We are happy to help you compare options, with no obligation.",
    imageUrl: "asset:cta",
    message: "",
    whatsappLabel: "Chat on WhatsApp",
    enquiryLabel: "Contact us",
  },
};

const localImages = {
  hero: bannerImages.hero,
  cta: bannerImages.cta,
  store: aboutImages.store,
  team: aboutImages.team,
};

export function resolvePageImage(imageUrl, fallback = bannerImages.hero) {
  if (typeof imageUrl === "string" && imageUrl.startsWith("asset:")) {
    return localImages[imageUrl.slice(6)] || fallback;
  }
  return imageUrl || fallback;
}

export function mergePageContent(defaults, content) {
  return Object.fromEntries(
    Object.entries(defaults).map(([section, defaultValue]) => {
      const current = content?.[section];
      return [
        section,
        defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue)
          ? { ...defaultValue, ...(current && typeof current === "object" ? current : {}) }
          : current ?? defaultValue,
      ];
    })
  );
}
