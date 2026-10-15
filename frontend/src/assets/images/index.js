// Central registry of UI images. Swap a file on disk, or change an import here, to replace an image.
import laptop from "./products/laptop.jpg";
import desktop from "./products/desktop.jpg";
import keyboard from "./products/keyboard.jpg";
import printer from "./products/printer.jpg";

import laptops from "./categories/laptops.jpg";
import desktops from "./categories/desktops.jpg";
import accessories from "./categories/accessories.jpg";
import printers from "./categories/printers.jpg";

import studentBundle from "./offers/student-bundle.jpg";
import officeCombo from "./offers/office-combo.jpg";
import exchange from "./offers/exchange.jpg";
import printerSetup from "./offers/printer-setup.jpg";

import repair from "./services/repair.jpg";
import upgrades from "./services/upgrades.jpg";
import dataRecovery from "./services/data-recovery.jpg";
import networking from "./services/networking.jpg";
import security from "./services/security.jpg";
import amc from "./services/amc.jpg";

import store from "./about/store.jpg";
import team from "./about/team.jpg";
import cta from "./banners/cta.jpg";
import hero from "./banners/hero.jpg";

export const productImages = { laptop, desktop, keyboard, printer };
export const categoryImages = { Laptops: laptops, Desktops: desktops, Accessories: accessories, Printers: printers };
export const offerImages = { student: studentBundle, office: officeCombo, exchange, printer: printerSetup };
export const serviceImages = { repair, upgrades, dataRecovery, networking, security, amc };
export const aboutImages = { store, team };
export const bannerImages = { cta, hero };
