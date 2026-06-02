import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(import.meta.dirname, "..", "..", ".env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Product } from "./models/Product";
import { User } from "./models/User";

const MONGODB_URI = process.env.MONGODB_URI!;

function img(seed: string): string {
  return `https://picsum.photos/seed/${seed}/640/480`;
}

const products = [
  // === SMARTPHONES (10) ===
  { title: "iPhone 16 Pro Max", description: "Apple's flagship smartphone featuring the A18 Pro chip, 48MP triple camera system with 5x optical zoom, 6.9-inch Super Retina XDR OLED display, titanium design, and all-day battery life. Supports USB-C and Wi-Fi 7.", price: 1199, discountPercentage: 0, category: "mobile", brand: "apple", model: "iphone-16-pro-max", images: [img("iphone16pm-1"), img("iphone16pm-2"), img("iphone16pm-3")], stock: 25 },
  { title: "iPhone 16 Pro", description: "6.3-inch iPhone with A18 Pro chip, 48MP camera system, titanium design, and Action button. Perfect pro-level features in a more compact size.", price: 999, discountPercentage: 5, category: "mobile", brand: "apple", model: "iphone-16-pro", images: [img("iphone16p-1"), img("iphone16p-2")], stock: 30 },
  { title: "iPhone 16", description: "Apple's latest standard model with A18 chip, 48MP camera, Dynamic Island, and vibrant colors. Great balance of performance and value.", price: 799, discountPercentage: 0, category: "mobile", brand: "apple", model: "iphone-16", images: [img("iphone16-1"), img("iphone16-2")], stock: 40 },
  { title: "Samsung Galaxy S25 Ultra", description: "Samsung's ultimate flagship with Snapdragon 8 Gen 4, 200MP camera, S Pen support, 6.9-inch Dynamic AMOLED 2X display, and titanium frame.", price: 1299, discountPercentage: 10, category: "mobile", brand: "samsung", model: "galaxy-s25-ultra", images: [img("s25u-1"), img("s25u-2"), img("s25u-3")], stock: 20 },
  { title: "Samsung Galaxy S25+", description: "Premium flagship with 6.7-inch display, Snapdragon 8 Gen 4, 50MP triple camera, and long-lasting battery. Excellent all-rounder.", price: 999, discountPercentage: 8, category: "mobile", brand: "samsung", model: "galaxy-s25-plus", images: [img("s25p-1"), img("s25p-2")], stock: 28 },
  { title: "Google Pixel 10 Pro", description: "Google's AI-powered flagship with Tensor G5 chip, 50MP main camera with best-in-class computational photography, 6.7-inch LTPO OLED, and 7 years of OS updates.", price: 999, discountPercentage: 0, category: "mobile", brand: "google", model: "pixel-10-pro", images: [img("p10p-1"), img("p10p-2")], stock: 15 },
  { title: "OnePlus 13", description: "Flagship killer with Snapdragon 8 Gen 4, 50MP Hasselblad-tuned cameras, 6.82-inch AMOLED 120Hz display, and 100W fast charging.", price: 799, discountPercentage: 12, category: "mobile", brand: "oneplus", model: "oneplus-13", images: [img("op13-1"), img("op13-2"), img("op13-3")], stock: 22 },
  { title: "Xiaomi 15 Pro", description: "Premium flagship with Snapdragon 8 Gen 4, 50MP Leica optics, 6.73-inch AMOLED, 120W HyperCharge, and stunning design.", price: 749, discountPercentage: 15, category: "mobile", brand: "xiaomi", model: "xiaomi-15-pro", images: [img("xm15p-1"), img("xm15p-2")], stock: 18 },
  { title: "Samsung Galaxy Z Fold 7", description: "Foldable flagship with 7.6-inch inner display, Snapdragon 8 Gen 4, 50MP camera, and enhanced multitasking capabilities.", price: 1799, discountPercentage: 0, category: "mobile", brand: "samsung", model: "galaxy-z-fold-7", images: [img("fold7-1"), img("fold7-2")], stock: 10 },
  { title: "Nothing Phone (3)", description: "Unique transparent design with Glyph Interface LED system, Snapdragon 8 Gen 3, 50MP dual camera, and clean near-stock Android experience.", price: 599, discountPercentage: 10, category: "mobile", brand: "nothing", model: "phone-3", images: [img("np3-1"), img("np3-2")], stock: 35 },

  // === LAPTOPS (10) ===
  { title: "MacBook Pro 16 M4 Max", description: "Apple's most powerful laptop with M4 Max chip (16-core CPU, 40-core GPU), 16.2-inch Liquid Retina XDR display, 36GB unified memory, 1TB SSD, and 22-hour battery life.", price: 3499, discountPercentage: 0, category: "laptop", brand: "apple", model: "macbook-pro-16-m4-max", images: [img("mbp16-1"), img("mbp16-2"), img("mbp16-3")], stock: 12 },
  { title: "MacBook Pro 14 M4 Pro", description: "Professional laptop with M4 Pro chip, 14.2-inch Liquid Retina XDR display, 18GB unified memory, 512GB SSD, perfect for creative professionals.", price: 1999, discountPercentage: 5, category: "laptop", brand: "apple", model: "macbook-pro-14-m4-pro", images: [img("mbp14-1"), img("mbp14-2")], stock: 20 },
  { title: "MacBook Air M4", description: "Ultra-thin laptop with M4 chip, 13.6-inch Liquid Retina display, 16GB unified memory, 256GB SSD, MagSafe charging, and midnight color option.", price: 1099, discountPercentage: 0, category: "laptop", brand: "apple", model: "macbook-air-m4", images: [img("mba4-1"), img("mba4-2")], stock: 35 },
  { title: "Dell XPS 16", description: "Premium Windows laptop with Intel Core Ultra 9, 16-inch 4K OLED touchscreen, 32GB DDR5 RAM, 1TB SSD, and NVIDIA RTX 4070 graphics.", price: 2499, discountPercentage: 10, category: "laptop", brand: "dell", model: "xps-16", images: [img("xps16-1"), img("xps16-2")], stock: 15 },
  { title: "Dell XPS 14", description: "Compact powerhouse with Intel Core Ultra 7, 14.5-inch 3.2K OLED, 16GB RAM, 512GB SSD, and RTX 4060 graphics in a sleek chassis.", price: 1799, discountPercentage: 8, category: "laptop", brand: "dell", model: "xps-14", images: [img("xps14-1"), img("xps14-2")], stock: 18 },
  { title: "Lenovo ThinkPad X1 Carbon Gen 13", description: "Ultralight business laptop with Intel Core Ultra 7, 14-inch 2.8K OLED, 16GB RAM, 512GB SSD, MIL-STD-810H durability, and exceptional keyboard.", price: 2149, discountPercentage: 15, category: "laptop", brand: "lenovo", model: "thinkpad-x1-carbon-gen13", images: [img("tp13-1"), img("tp13-2")], stock: 14 },
  { title: "HP Spectre x360 16", description: "Versatile 2-in-1 with Intel Core Ultra 9, 16-inch 3K+ OLED touchscreen, 32GB RAM, 1TB SSD, and 360-degree hinge for laptop/tablet modes.", price: 1899, discountPercentage: 12, category: "laptop", brand: "hp", model: "spectre-x360-16", images: [img("hp360-1"), img("hp360-2")], stock: 16 },
  { title: "ASUS ROG Zephyrus G16", description: "Ultra-slim gaming laptop with Intel Core Ultra 9, 16-inch QHD+ 240Hz OLED, RTX 4080, 32GB DDR5, 1TB SSD, and per-key RGB keyboard.", price: 2699, discountPercentage: 0, category: "laptop", brand: "asus", model: "rog-zephyrus-g16", images: [img("g16-1"), img("g16-2"), img("g16-3")], stock: 10 },
  { title: "ASUS ZenBook 14 OLED", description: "Elegant ultrabook with Intel Core Ultra 7, 14-inch 2.8K OLED 120Hz display, 16GB RAM, 512GB SSD, and compact lightweight design.", price: 1299, discountPercentage: 10, category: "laptop", brand: "asus", model: "zenbook-14-oled", images: [img("zb14-1"), img("zb14-2")], stock: 25 },
  { title: "Lenovo Legion Pro 7i", description: "High-performance gaming laptop with Intel Core i9-14900HX, 16-inch QHD+ 240Hz IPS, RTX 4090, 32GB RAM, 2TB SSD, and advanced cooling.", price: 3199, discountPercentage: 0, category: "laptop", brand: "lenovo", model: "legion-pro-7i", images: [img("leg7-1"), img("leg7-2")], stock: 8 },

  // === MONITORS (6) ===
  { title: "Dell UltraSharp U4323QE", description: "Massive 42.5-inch 4K IPS monitor with USB-C hub (90W PD), KVM built-in, factory-calibrated Delta E < 2, perfect for productivity.", price: 1299, discountPercentage: 5, category: "monitor", brand: "dell", model: "ultrasharp-u4323qe", images: [img("delm1-1"), img("delm1-2")], stock: 12 },
  { title: "LG 27GP950-B UltraGear", description: "27-inch 4K UHD Nano IPS gaming monitor with 160Hz refresh rate, 1ms GTG, HDMI 2.1, VRR, and NVIDIA G-Sync Compatible.", price: 799, discountPercentage: 15, category: "monitor", brand: "lg", model: "ultragear-27gp950", images: [img("lgm1-1"), img("lgm1-2")], stock: 20 },
  { title: "Samsung Odyssey OLED G8", description: "34-inch ultra-wide QD-OLED curved monitor with 175Hz, 0.03ms response, 1800R curve, and AMD FreeSync Premium Pro.", price: 1299, discountPercentage: 10, category: "monitor", brand: "samsung", model: "odyssey-oled-g8", images: [img("sam1-1"), img("sam1-2")], stock: 10 },
  { title: "ASUS ProArt PA32DC", description: "31.5-inch 4K OLED professional monitor with 99% DCI-P3, Delta E < 1, hardware calibration, and built-in colorimeter.", price: 2499, discountPercentage: 0, category: "monitor", brand: "asus", model: "proart-pa32dc", images: [img("asum1-1"), img("asum1-2")], stock: 5 },
  { title: "Apple Studio Display", description: "27-inch 5K Retina display with 600 nits brightness, P3 wide color, True Tone, 12MP Ultra Wide camera with Center Stage, and six-speaker system.", price: 1599, discountPercentage: 0, category: "monitor", brand: "apple", model: "studio-display", images: [img("apm1-1"), img("apm1-2")], stock: 15 },
  { title: "LG 32UN880-B Ergo", description: "32-inch 4K UHD IPS display with innovative Ergo stand (clamp/grommet), USB-C 60W PD, DCI-P3 95%, and built-in speakers.", price: 699, discountPercentage: 8, category: "monitor", brand: "lg", model: "ergo-32un880", images: [img("lgm2-1"), img("lgm2-2")], stock: 22 },

  // === KEYBOARDS (5) ===
  { title: "Logitech MX Mechanical Mini", description: "Compact wireless mechanical keyboard with low-profile tactile switches, Smart Backlighting, multi-device pairing, and USB-C charging.", price: 149, discountPercentage: 10, category: "keyboard", brand: "logitech", model: "mx-mechanical-mini", images: [img("kb1-1"), img("kb1-2")], stock: 40 },
  { title: "Razer BlackWidow V4 Pro", description: "Premium mechanical gaming keyboard with Razer Green switches, customizable command dial, media keys, plush leatherette wrist rest, and Chroma RGB.", price: 229, discountPercentage: 5, category: "keyboard", brand: "razer", model: "blackwidow-v4-pro", images: [img("kb2-1"), img("kb2-2")], stock: 25 },
  { title: "Corsair K70 RGB Pro", description: "Performance mechanical gaming keyboard with Cherry MX Speed switches, aluminum frame, PBT double-shot keycaps, and tournament switch.", price: 179, discountPercentage: 12, category: "keyboard", brand: "corsair", model: "k70-rgb-pro", images: [img("kb3-1"), img("kb3-2")], stock: 30 },
  { title: "Keychron Q1 Pro", description: "Premium 75% wireless mechanical keyboard, CNC aluminum body, QMK/VIA programmable, hot-swappable Gateron Jupiter switches, and South-facing RGB.", price: 199, discountPercentage: 0, category: "keyboard", brand: "keychron", model: "q1-pro", images: [img("kb4-1"), img("kb4-2")], stock: 20 },
  { title: "Logitech G915 X Lightspeed", description: "Ultra-slim wireless mechanical gaming keyboard with low-profile GL switches, Lightspeed wireless, RGB, and aluminum alloy build.", price: 229, discountPercentage: 8, category: "keyboard", brand: "logitech", model: "g915-x-lightspeed", images: [img("kb5-1"), img("kb5-2")], stock: 18 },

  // === MICE (5) ===
  { title: "Logitech MX Master 3S", description: "Ergonomic wireless mouse with 8K DPI Darkfield sensor, MagSpeed scroll wheel, silent clicks, USB-C charging, and multi-device support.", price: 99, discountPercentage: 0, category: "mouse", brand: "logitech", model: "mx-master-3s", images: [img("ms1-1"), img("ms1-2")], stock: 50 },
  { title: "Razer DeathAdder V3 Pro", description: "Ultra-lightweight wireless esports mouse at 63g, Focus Pro 30K sensor, optical switches, 90-hour battery, and ergonomic shape.", price: 149, discountPercentage: 10, category: "mouse", brand: "razer", model: "deathadder-v3-pro", images: [img("ms2-1"), img("ms2-2")], stock: 30 },
  { title: "Logitech G Pro X Superlight 2", description: "Wireless gaming mouse at just 60g with Hero 2 sensor (44K DPI), Lightforce hybrid switches, and 95-hour battery life.", price: 159, discountPercentage: 0, category: "mouse", brand: "logitech", model: "g-pro-x-superlight-2", images: [img("ms3-1"), img("ms3-2")], stock: 35 },
  { title: "SteelSeries Aerox 9 Wireless", description: "Ultra-light 89g wireless MMO/MOBA mouse with 18 programmable buttons, AquaBarrier IP54 protection, and Quantum 2.0 Wireless.", price: 149, discountPercentage: 5, category: "mouse", brand: "steelseries", model: "aerox-9-wireless", images: [img("ms4-1"), img("ms4-2")], stock: 20 },
  { title: "Apple Magic Mouse", description: "Rechargeable wireless mouse with Multi-Touch surface, optimized for macOS with gestures, built-in battery, and seamless pairing.", price: 79, discountPercentage: 0, category: "mouse", brand: "apple", model: "magic-mouse", images: [img("ms5-1"), img("ms5-2")], stock: 45 },

  // === HEADPHONES (5) ===
  { title: "Sony WH-1000XM6", description: "Industry-leading wireless noise-canceling headphones with Dual Processor, 30-hour battery, Hi-Res Audio, adaptive sound control, and premium comfort.", price: 399, discountPercentage: 10, category: "headphone", brand: "sony", model: "wh-1000xm6", images: [img("hp1-1"), img("hp1-2")], stock: 30 },
  { title: "Bose QuietComfort Ultra", description: "Premium wireless headphones with world-class noise cancellation, Immersive Audio with head tracking, 24-hour battery, and luxurious comfort.", price: 429, discountPercentage: 0, category: "headphone", brand: "bose", model: "quietcomfort-ultra", images: [img("hp2-1"), img("hp2-2")], stock: 22 },
  { title: "Sennheiser Momentum 4", description: "Audiophile-grade wireless headphones with exceptional sound quality, adaptive noise cancellation, 60-hour battery, and elegant design.", price: 349, discountPercentage: 15, category: "headphone", brand: "sennheiser", model: "momentum-4", images: [img("hp3-1"), img("hp3-2")], stock: 18 },
  { title: "Audio-Technica ATH-M50xBT2", description: "Professional studio monitor headphones with Bluetooth 5.0, 40-hour battery, low-latency mode, and legendary M50x sound signature.", price: 199, discountPercentage: 0, category: "headphone", brand: "audio-technica", model: "ath-m50xbt2", images: [img("hp4-1"), img("hp4-2")], stock: 35 },
  { title: "Sony WF-1000XM6", description: "Truly wireless earbuds with industry-leading noise cancellation, Integrated Processor V2, Hi-Res Audio, 24-hour total battery, and IPX5 water resistance.", price: 299, discountPercentage: 8, category: "headphone", brand: "sony", model: "wf-1000xm6", images: [img("hp5-1"), img("hp5-2")], stock: 28 },

  // === PC COMPONENTS (10) ===
  { title: "Intel Core Ultra 9 285K", description: "Flagship desktop processor with 24 cores (8P+16E), up to 5.7 GHz, 36MB L3 cache, LGA1851 socket, and integrated Intel Graphics.", price: 589, discountPercentage: 0, category: "cpu", brand: "intel", model: "core-ultra-9-285k", images: [img("cpu1-1"), img("cpu1-2")], stock: 15 },
  { title: "AMD Ryzen 9 9950X", description: "16-core / 32-thread desktop processor with up to 5.7 GHz boost, 80MB cache, AM5 socket, and 170W TDP. Ideal for creators and gamers.", price: 649, discountPercentage: 5, category: "cpu", brand: "amd", model: "ryzen-9-9950x", images: [img("cpu2-1"), img("cpu2-2")], stock: 12 },
  { title: "AMD Ryzen 7 9800X3D", description: "8-core gaming champion with 3D V-Cache technology, up to 5.2 GHz, 104MB cache, AM5 socket. The ultimate gaming CPU.", price: 479, discountPercentage: 0, category: "cpu", brand: "amd", model: "ryzen-7-9800x3d", images: [img("cpu3-1"), img("cpu3-2")], stock: 20 },
  { title: "NVIDIA GeForce RTX 5090", description: "Ultimate graphics card with 24576 CUDA cores, 32GB GDDR7, 4th-gen RT Cores, DLSS 4, and 600W TGP. The pinnacle of GPU performance.", price: 1999, discountPercentage: 0, category: "gpu", brand: "nvidia", model: "geforce-rtx-5090", images: [img("gpu1-1"), img("gpu1-2")], stock: 5 },
  { title: "NVIDIA GeForce RTX 5080", description: "High-end graphics card with 16384 CUDA cores, 24GB GDDR7, 3rd-gen RT Cores, DLSS 4, delivering exceptional 4K gaming performance.", price: 1199, discountPercentage: 0, category: "gpu", brand: "nvidia", model: "geforce-rtx-5080", images: [img("gpu2-1"), img("gpu2-2")], stock: 8 },
  { title: "AMD Radeon RX 9070 XT", description: "Premium AMD graphics card with RDNA 4 architecture, 16GB GDDR7, advanced ray tracing, FSR 4 upscaling, and 330W TBP.", price: 899, discountPercentage: 10, category: "gpu", brand: "amd", model: "radeon-rx-9070-xt", images: [img("gpu3-1"), img("gpu3-2")], stock: 10 },
  { title: "Corsair Dominator Titanium 64GB", description: "Premium DDR5 RAM kit, 64GB (2x32GB), 6400MHz CL32, RGB lighting, aluminum heatsink, Intel XMP 3.0 & AMD EXPO support.", price: 279, discountPercentage: 8, category: "ram", brand: "corsair", model: "dominator-titanium-64gb", images: [img("ram1-1"), img("ram1-2")], stock: 30 },
  { title: "G.Skill Trident Z5 Neo RGB 32GB", description: "High-performance DDR5 RAM, 32GB (2x16GB), 6000MHz CL30, optimized for AMD Ryzen, RGB heatsink, and EXPO support.", price: 129, discountPercentage: 0, category: "ram", brand: "gskill", model: "trident-z5-neo-rgb-32gb", images: [img("ram2-1"), img("ram2-2")], stock: 45 },
  { title: "Samsung 990 Pro 2TB NVMe SSD", description: "Ultra-fast PCIe 4.0 NVMe M.2 SSD with sequential read speeds up to 7,450 MB/s, 2TB capacity, Samsung V-NAND and hardware encryption.", price: 229, discountPercentage: 5, category: "storage", brand: "samsung", model: "990-pro-2tb", images: [img("ssd1-1"), img("ssd1-2")], stock: 35 },
  { title: "WD Black SN850X 4TB", description: "High-capacity PCIe 4.0 NVMe SSD with 7,300 MB/s read speeds, 4TB capacity, Game Mode 2.0, and Western Digital Dashboard support.", price: 399, discountPercentage: 10, category: "storage", brand: "western-digital", model: "black-sn850x-4tb", images: [img("ssd2-1"), img("ssd2-2")], stock: 20 },

  // === TABLETS (3) ===
  { title: "iPad Pro M4 13-inch", description: "Apple's most advanced tablet with M4 chip, 13-inch Ultra Retina XDR display (Tandem OLED), Apple Pencil Pro support, and ultra-thin 5.1mm design.", price: 1299, discountPercentage: 0, category: "tablet", brand: "apple", model: "ipad-pro-m4-13", images: [img("tab1-1"), img("tab1-2"), img("tab1-3")], stock: 18 },
  { title: "iPad Pro M4 11-inch", description: "Powerful 11-inch tablet with M4 chip, Ultra Retina XDR display, Apple Pencil Pro, Face ID, and 5G connectivity in a portable form factor.", price: 999, discountPercentage: 5, category: "tablet", brand: "apple", model: "ipad-pro-m4-11", images: [img("tab2-1"), img("tab2-2")], stock: 22 },
  { title: "Samsung Galaxy Tab S10 Ultra", description: "Massive 14.6-inch Dynamic AMOLED 2X display, MediaTek Dimensity 9300+, S Pen included, 11200mAh battery, and DeX desktop experience.", price: 1199, discountPercentage: 12, category: "tablet", brand: "samsung", model: "galaxy-tab-s10-ultra", images: [img("tab3-1"), img("tab3-2")], stock: 14 },

  // === SMARTWATCHES (3) ===
  { title: "Apple Watch Ultra 3", description: "Rugged smartwatch for extreme sports with 49mm titanium case, precision dual-frequency GPS, 36-hour battery, Action button, and dive computer.", price: 799, discountPercentage: 0, category: "smartwatch", brand: "apple", model: "watch-ultra-3", images: [img("sw1-1"), img("sw1-2")], stock: 15 },
  { title: "Apple Watch Series 10", description: "Latest Apple Watch with larger always-on display, S10 SiP, sleep apnea detection, blood oxygen, ECG, and fast charging.", price: 399, discountPercentage: 8, category: "smartwatch", brand: "apple", model: "watch-series-10", images: [img("sw2-1"), img("sw2-2")], stock: 30 },
  { title: "Samsung Galaxy Watch 7 Ultra", description: "Premium Android smartwatch with titanium grade 4, 47mm case, Wear OS 5, BioActive sensor, 590mAh battery, and 10ATM water resistance.", price: 649, discountPercentage: 10, category: "smartwatch", brand: "samsung", model: "galaxy-watch-7-ultra", images: [img("sw3-1"), img("sw3-2")], stock: 20 },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");

  await Product.deleteMany({});
  console.log("Cleared existing products");

  const specsByCategory: Record<string, Record<string, string>> = {
    mobile: { display: "6.9-inch Super Retina XDR OLED", processor: "A18 Pro / Snapdragon 8 Gen 4", ram: "8GB", storage: "256GB", battery: "4685mAh", camera: "48MP + 12MP + 12MP", charger: "USB-C 30W", os: "iOS 19 / Android 15", weight: "227g", height: "160.9mm", connectivity: "5G, Wi-Fi 7, BT 5.4" },
    laptop: { processor: "M4 Max / Core Ultra 9", ram: "32GB", storage: "1TB SSD", display: "16.2-inch Liquid Retina XDR", gpu: "Integrated 40-core / RTX 4080", battery: "22 hours", os: "macOS / Windows 11", weight: "2.1kg" },
    monitor: { size: "27-inch", resolution: "3840x2160 (4K UHD)", refreshRate: "160Hz", panelType: "Nano IPS / QD-OLED", responseTime: "1ms GtG", connectivity: "HDMI 2.1, DP 1.4, USB-C" },
    keyboard: { switchType: "Mechanical (Tactile)", layout: "75% / Full-size", connectivity: "Bluetooth 5.1 / USB-C", backlight: "Per-key RGB", weight: "850g" },
    mouse: { sensor: "Optical / Darkfield", dpi: "8000 - 44000", buttons: "6 - 18", connectivity: "Bluetooth / 2.4GHz / USB-C", weight: "63g - 89g" },
    headphone: { driver: "40mm / 30mm", frequency: "4Hz - 40kHz", impedance: "32Ω - 48Ω", connectivity: "Bluetooth 5.3 / 3.5mm", battery: "30 - 60 hours", weight: "250g" },
    cpu: { cores: "8P+16E / 16", threads: "24 / 32", baseClock: "3.7GHz", boostClock: "5.7GHz", tdp: "125W - 170W" },
    gpu: { vram: "16GB - 32GB GDDR7", coreClock: "2.5GHz+", memoryType: "GDDR7", tdp: "330W - 600W" },
    ram: { capacity: "32GB - 64GB", type: "DDR5-6400", speed: "6000 - 6400 MT/s", rgb: "Yes, 16-zone RGB" },
    storage: { capacity: "2TB - 4TB", type: "NVMe PCIe 4.0", formFactor: "M.2 2280", readSpeed: "7450 MB/s" },
    tablet: { display: "13-inch Ultra Retina XDR / 14.6-inch AMOLED", processor: "M4 / Dimensity 9300+", ram: "8GB - 16GB", storage: "256GB - 1TB", battery: "11200mAh", camera: "12MP + 12MP", os: "iPadOS / Android 14", weight: "580g - 720g" },
    smartwatch: { display: "49mm titanium / 47mm titanium", battery: "36 - 48 hours", os: "watchOS / Wear OS 5", waterResistance: "10ATM / WR100", connectivity: "BT 5.3, GPS, LTE", weight: "61g - 71g" },
  };

  const withSpecs = products.map((p) => ({
    ...p,
    specifications: specsByCategory[p.category] || {},
  }));

  const inserted = await Product.insertMany(withSpecs);
  console.log(`Inserted ${inserted.length} products`);

  const adminEmail = "admin@techstore.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      gender: "male",
      avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=admin",
      role: "admin",
    });
    console.log("Created admin user:");
    console.log("  Email: admin@techstore.com");
    console.log("  Password: admin123");
  } else {
    console.log("Admin user already exists");
  }

  console.log("\nSeed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
