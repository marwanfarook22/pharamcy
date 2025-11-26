// Predefined medicine image URLs
export const MEDICINE_IMAGES = [
  {
    url: 'https://static3.depositphotos.com/1003570/171/i/450/depositphotos_1711346-stock-photo-prescription-medication.jpg',
    label: 'Prescription Medication'
  },
  {
    url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVkaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    label: 'Medicine Collection'
  },
  {
    url: 'https://png.pngtree.com/png-clipart/20240912/original/pngtree-different-medical-pills-and-bottles-pharmacy-store-png-image_15997441.png',
    label: 'Pills & Bottles'
  },
  {
    url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVkaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    label: 'Medicine Bottles'
  },
  {
    url: 'https://png.pngtree.com/png-clipart/20250304/original/pngtree-assorted-medicine-bottles-and-pills-collection-png-image_20563799.png',
    label: 'Assorted Medicine Collection'
  },
  {
    url: 'https://unblast.com/wp-content/uploads/2020/08/Mini-Pills-Bottle-Mockup-2.jpg',
    label: 'Pills Bottle Mockup'
  },
  {
    url: 'https://images.openai.com/static-rsc-1/1iTwcw9ii2tWT7nVhxA7x29UL8kYBOPgBN9iLbT1uIBeWTPT5VncOV5eAv9eVBlT_uHSzzTNWaBD8t0lHywYIQ8kwuizrawhoPctwbBHi18Il9WpxybKDcOFiHv5qirz7QGhvft8uho3Mfcg_GgTpw',
    label: 'Medicine Display'
  },
  {
    url: 'https://png.pngtree.com/png-vector/20250307/ourlarge/pngtree-prescription-drug-bottle-3d-icon-for-hospitals-png-image_15728350.png',
    label: 'Prescription Drug Bottle 3D'
  },
  {
    url: 'https://png.pngtree.com/png-clipart/20240901/original/pngtree-colorful-pills-and-syringe-medical-bottles-png-image_15905050.png',
    label: 'Colorful Pills & Syringe'
  },
  {
    url: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAyL3Jhd3BpeGVsb2ZmaWNlMl9hX2Nsb3NlX3VwX3Bob3RvZ3JhcGhfb2ZfX2FfYm90dGxlX2NvbnRhaW5pbmdfcF8xZGZmMmY4OC0xMzIyLTQ5NTMtOTAxZC1iYTFlYzM3NTM4ODctcm0xNjU4LTAxYS5wbmc.png',
    label: 'Medicine Bottle Close-up'
  },
  {
    url: 'https://images.openai.com/static-rsc-1/H8zXeVBmLUFEeEPqdZr5IQ5lXDKfKnlXMamHy30nMuTmoLGOeb97NkvAbPSHd3BplwK9rz9ex5rLZuZbxXFIxT7m9n4u8UXwE_vGwRVN5V_-63maO0mabOWsPrC0Wel-oV76XFRMJaNfk8otcjuxaA',
    label: 'Medicine Collection Display'
  },
  {
    url: 'https://png.pngtree.com/png-clipart/20240912/original/pngtree-different-medical-pills-and-bottles-pharmacy-store-png-image_15997440.png',
    label: 'Medical Pills & Bottles'
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1668365725809-71d571a981ca?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGlsbCUyMGJvdHRsZXxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    label: 'Pill Bottle Premium'
  },
  {
    url: 'https://images.openai.com/static-rsc-1/rxqM2-uDIKUgScuzVoIKyx-pl1HktsD6eqgp7CODBjDQnVRYdudvaUAHuAGH8YFonjm74svctOzsoh3hVcF3UryzDFTw8tDXpzfqExvHpS8GHfghGglt-xzzpNBtc389QrXn3sQ-LxgdC7EgLEjs5Q',
    label: 'Medicine Collection Premium'
  },
  {
    url: 'https://c.pxhere.com/photos/30/22/pills_tablets_medicine_medication_health_medical_drug_care-593614.jpg!d',
    label: 'Pills Tablets Medicine'
  }
];

// Get a random medicine image URL
export const getRandomMedicineImage = () => {
  const randomIndex = Math.floor(Math.random() * MEDICINE_IMAGES.length);
  return MEDICINE_IMAGES[randomIndex].url;
};

