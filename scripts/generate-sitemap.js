import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envConfig[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || envConfig['VITE_SUPABASE_URL'] || envConfig['SUPABASE_URL'];
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || envConfig['VITE_SUPABASE_ANON_KEY'] || envConfig['VITE_SUPABASE_PUBLISHABLE_KEY'] || envConfig['SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment or .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log("Generating dynamic sitemap...");
  const baseUrl = "https://ahmedalmasi.com";
  const sitemapPath = path.resolve('public/sitemap.xml');
  
  let urls = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/articles', priority: 0.8, changefreq: 'weekly' },
    { url: '/services', priority: 0.7, changefreq: 'monthly' }
  ];

  try {
    // Fetch active products
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('slug, id, updated_at')
      .eq('is_active', true);
      
    if (pError) throw pError;
    
    if (products) {
      products.forEach(p => {
        const identifier = p.slug || p.id;
        if (identifier) {
          urls.push({
            url: `/products/${identifier}`,
            priority: 0.8,
            changefreq: 'weekly',
            lastmod: p.updated_at
          });
        }
      });
    }

    // Fetch published articles
    const { data: articles, error: aError } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('is_published', true);
      
    if (aError) throw aError;
    
    if (articles) {
      articles.forEach(a => {
        if (a.slug) {
          urls.push({
            url: `/articles/${a.slug}`,
            priority: 0.7,
            changefreq: 'monthly',
            lastmod: a.updated_at
          });
        }
      });
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `
  <url>
    <loc>${baseUrl}${u.url}</loc>
    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;

    fs.writeFileSync(sitemapPath, xml.trim());
    console.log(`Sitemap generated successfully with ${urls.length} URLs at ${sitemapPath}`);
  } catch (err) {
    console.error("Error generating sitemap:", err);
  }
}

generateSitemap();
