import fs from 'fs';

const SUPABASE_URL = "https://nvqhxljakfqurutkxdmp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cWh4bGpha2ZxdXJ1dGt4ZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNDIzMDAsImV4cCI6MjEwMjYxODMwMH0.j-02T4lqUHIPr5I4qn8scY6MZWUEIQonKimjo2sGtu4";

async function fetchAll() {
  console.log("Fetching categories...");
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });
  const categories = await catRes.json();

  console.log("Fetching products...");
  const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*,categories(name,slug)&is_active=eq.true`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });
  const products = await prodRes.json();

  let tsContent = `export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_percentage?: number | null;
  category_id: string;
  image_url: string;
  image_urls?: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  unit: string;
  stock_quantity: number | null;
  categories: {
    name: string;
    slug: string;
  };
}

export const staticCategories = ${JSON.stringify(categories, null, 2)};

export const staticProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync('src/data/products.ts', tsContent);
  console.log(`Saved ${products.length} products and ${categories.length} categories to src/data/products.ts`);
}

fetchAll().catch(console.error);
