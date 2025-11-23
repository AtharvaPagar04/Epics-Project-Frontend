import { LocationResult } from "../types";

// Center point (VIT Bhopal)
const CENTER_LAT = 23.0774;
const CENTER_LON = 76.8513;

// Helper to generate random coordinates around a center
const getRandomOffset = (center: number, radius = 0.02) => {
    return (center + (Math.random() - 0.5) * radius).toFixed(5);
};

const CATEGORY_ITEMS: Record<string, string[]> = {
    vegetables: ["Tomatoes", "Potatoes", "Onions", "Spinach", "Cauliflower", "Lady Finger", "Brinjal", "Carrots", "Green Chilies", "Coriander"],
    fruits: ["Apples", "Bananas", "Mangoes", "Grapes", "Oranges", "Papaya", "Pomegranate", "Watermelon", "Guava", "Pineapple"],
    grains: ["Basmati Rice", "Wheat Flour", "Toor Dal", "Moong Dal", "Chana", "Soybean", "Mustard Seeds", "Barley"]
};

const CATEGORY_NAMES: Record<string, string[]> = {
    vegetables: ["Ramu Fresh Veggies", "Green Farm", "Daily Sabzi", "Kothri Vegetable Mart", "Highway Greens", "Fresh Pick", "Village Veggies", "Garden Direct", "Nature's Basket", "Farm Fresh"],
    fruits: ["Juicy Fruits", "Apple Orchard", "Mango Mania", "Banana Republic", "Citrus Corner", "Berry Blast", "Melon Market", "The Fruit Stall", "Tropical Treats", "Fresh Fruits Cart"],
    grains: ["Annapurna Grains", "Wheat House", "Rice Bowl", "Dal Mill Outlet", "Cereal World", "Golden Grains", "Pantry Essentials", "Pulse Point", "Flour Power", "Staple Store"]
};

// Generate Mock Data
const generateMockData = (): LocationResult[] => {
    const locations: LocationResult[] = [];
    let idCounter = 1000;

    // Add the University
    locations.push({
        place_id: 9999992,
        licence: "Private Data",
        osm_type: "relation",
        osm_id: 9999992,
        boundingbox: [],
        lat: CENTER_LAT.toString(),
        lon: CENTER_LON.toString(),
        display_name: "VIT Bhopal University, Bhopal-Indore Highway, Kothri Kalan, Sehore, Madhya Pradesh",
        class: "education",
        type: "university",
        importance: 0.9,
        items: [],
        address: { road: "Bhopal-Indore Highway", city: "Sehore", state: "Madhya Pradesh", country: "India" }
    });

    const categories = Object.keys(CATEGORY_ITEMS);

    categories.forEach((cat) => {
        // Generate 10 locations per category
        for (let i = 0; i < 10; i++) {
            const lat = getRandomOffset(CENTER_LAT);
            const lon = getRandomOffset(CENTER_LON);
            
            // Randomly select 3-6 items from the category list
            const allItems = CATEGORY_ITEMS[cat];
            const shuffled = [...allItems].sort(() => 0.5 - Math.random());
            const selectedItems = shuffled.slice(0, Math.floor(Math.random() * 4) + 3);

            locations.push({
                place_id: idCounter++,
                licence: "Mock Data",
                osm_type: "node",
                osm_id: idCounter,
                boundingbox: [],
                lat: lat,
                lon: lon,
                display_name: `${CATEGORY_NAMES[cat][i] || 'Local Vendor'}, Near Kothri Kalan, Sehore`,
                class: 'shop',
                type: cat, // We use 'type' to filter by category ID
                importance: 0.5,
                items: selectedItems,
                address: {
                    road: `Lane ${Math.floor(Math.random() * 10) + 1}`,
                    suburb: "Kothri Kalan",
                    city: "Sehore",
                    state: "Madhya Pradesh",
                    country: "India"
                }
            });
        }
    });

    return locations;
};

export const SAVED_LOCATIONS: LocationResult[] = generateMockData();