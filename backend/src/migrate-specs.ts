import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(import.meta.dirname, "..", "..", ".env") });

import mongoose from "mongoose";
import { Product } from "./models/Product";

const MONGODB_URI = process.env.MONGODB_URI!;

const specsByCategory: Record<string, Record<string, string>> = {
  mobile: {
    display: "6.9-inch Super Retina XDR OLED",
    processor: "A18 Pro / Snapdragon 8 Gen 4",
    ram: "8GB",
    storage: "256GB",
    battery: "4685mAh",
    camera: "48MP + 12MP + 12MP",
    charger: "USB-C 30W",
    os: "iOS 19 / Android 15",
    weight: "227g",
    height: "160.9mm",
    connectivity: "5G, Wi-Fi 7, Bluetooth 5.4",
  },
  laptop: {
    processor: "M4 Max / Intel Core Ultra 9",
    ram: "32GB",
    storage: "1TB SSD",
    display: "16.2-inch Liquid Retina XDR",
    gpu: "Integrated 40-core / RTX 4080",
    battery: "22 hours",
    os: "macOS / Windows 11",
    weight: "2.1kg",
  },
  monitor: {
    size: "27-inch",
    resolution: "3840x2160 (4K UHD)",
    refreshRate: "160Hz",
    panelType: "Nano IPS / QD-OLED",
    responseTime: "1ms GtG",
    connectivity: "HDMI 2.1, DP 1.4, USB-C",
  },
  keyboard: {
    switchType: "Mechanical (Tactile)",
    layout: "75% / Full-size",
    connectivity: "Bluetooth 5.1 / USB-C",
    backlight: "Per-key RGB",
    weight: "850g",
  },
  mouse: {
    sensor: "Optical / Darkfield",
    dpi: "8000 - 44000",
    buttons: "6 - 18 programmable",
    connectivity: "Bluetooth / 2.4GHz / USB-C",
    weight: "63g - 89g",
  },
  headphone: {
    driver: "40mm / 30mm",
    frequency: "4Hz - 40kHz",
    impedance: "32Ω - 48Ω",
    connectivity: "Bluetooth 5.3 / 3.5mm",
    battery: "30 - 60 hours",
    weight: "250g",
  },
  cpu: {
    cores: "8P+16E / 16",
    threads: "24 / 32",
    baseClock: "3.7GHz",
    boostClock: "5.7GHz",
    tdp: "125W - 170W",
  },
  gpu: {
    vram: "16GB - 32GB GDDR7",
    coreClock: "2.5GHz+",
    memoryType: "GDDR7",
    tdp: "330W - 600W",
  },
  ram: {
    capacity: "32GB - 64GB",
    type: "DDR5-6400",
    speed: "6000 - 6400 MT/s",
    rgb: "Yes, 16-zone RGB",
  },
  storage: {
    capacity: "2TB - 4TB",
    type: "NVMe PCIe 4.0",
    formFactor: "M.2 2280",
    readSpeed: "7450 MB/s",
  },
  tablet: {
    display: "13-inch Ultra Retina XDR / 14.6-inch AMOLED",
    processor: "M4 / Dimensity 9300+",
    ram: "8GB - 16GB",
    storage: "256GB - 1TB",
    battery: "11200mAh",
    camera: "12MP + 12MP",
    os: "iPadOS / Android 14",
    weight: "580g - 720g",
  },
  smartwatch: {
    display: "49mm titanium / 47mm titanium",
    battery: "36 - 48 hours",
    os: "watchOS / Wear OS 5",
    waterResistance: "10ATM / WR100",
    connectivity: "Bluetooth 5.3, GPS, LTE",
    weight: "61g - 71g",
  },
};

async function migrate() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");

  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  let updated = 0;
  for (const product of products) {
    const cat = product.category;
    const specs = specsByCategory[cat];
    if (!specs) continue;

    const merged: Record<string, string> = { ...specs };
    if (product.specifications && typeof product.specifications === "object") {
      Object.assign(merged, product.specifications);
    }

    await Product.updateOne({ _id: product._id }, { $set: { specifications: merged } });
    updated++;
  }

  console.log(`Updated ${updated} products with specifications`);
  await mongoose.disconnect();
  console.log("Done!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
