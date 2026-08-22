import fs from 'fs';
import path from 'path';

// Helper to extract JSON from TS exports
function extractDataFromTS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // extract staticProducts array
  const productsMatch = content.match(/export const staticProducts: Product\[\] = (\[[\s\S]*?\]);/);
  // extract staticArticles array
  const articlesMatch = content.match(/export const staticArticles: Article\[\] = (\[[\s\S]*?\]);/);
  
  let products = [];
  let articles = [];
  
  try {
    if (productsMatch) products = JSON.parse(productsMatch[1]);
  } catch(e) { console.error("Error parsing products", e); }

  try {
    if (articlesMatch) {
      const artText = articlesMatch[1];
      const slugs = [...artText.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
      const titles = [...artText.matchAll(/title:\s*["']([^"']+)["']/g)].map(m => m[1]);
      const excerpts = [...artText.matchAll(/excerpt:\s*["']([^"']+)["']/g)].map(m => m[1]);
      const images = [...artText.matchAll(/image_url:\s*["']([^"']+)["']/g)].map(m => m[1]);
      
      for(let i=0; i<slugs.length; i++) {
        articles.push({ slug: slugs[i], title: titles[i], excerpt: excerpts[i], image_url: images[i] });
      }
    }
  } catch(e) { console.error("Error parsing articles", e); }

  return { products, articles };
}

function generatePages() {
  const distDir = path.resolve('dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error("dist/index.html not found! Run build first.");
    process.exit(1);
  }
  
  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  let { products, articles } = extractDataFromTS(path.resolve('src/data/products.ts'));
  
  // also fetch articles from articles.ts if it exists
  if (fs.existsSync(path.resolve('src/data/articles.ts'))) {
      const artData = extractDataFromTS(path.resolve('src/data/articles.ts'));
      if (artData.articles.length > 0) articles = artData.articles;
  }

  console.log(`Generating SEO pages for ${products.length} products and ${articles.length} articles...`);

  // --- Generate Product Pages ---
  const productsDir = path.join(distDir, 'products');
  if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

  products.forEach(product => {
    if (!product.slug) return;
    
    // Create folder for slug to serve clean URL: /products/slug/index.html -> /products/slug
    const productDir = path.join(productsDir, product.slug);
    if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
    
    // Inject SEO tags
    let html = baseHtml;
    const title = `${product.name} - أحمد الماسي للعطور`;
    const description = product.description ? product.description.substring(0, 160) : `تسوق ${product.name} بأفضل سعر من أحمد الماسي.`;
    const image = product.image_url || 'https://ahmedalmasi.com/hero-main.jpg';
    
    // Product Schema
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [image],
      "description": description,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": `https://ahmedalmasi.com/products/${product.slug}`,
        "priceCurrency": "EGP",
        "price": product.price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };

    const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="https://ahmedalmasi.com/products/${product.slug}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    `;
    
    // Replace default tags
    html = html.replace(/<title>.*?<\/title>/s, '');
    html = html.replace(/<meta name="description".*?>/s, '');
    html = html.replace(/<meta property="og:.*?".*?>/sg, '');
    html = html.replace(/<meta name="twitter:.*?".*?>/sg, '');
    html = html.replace('</head>', `${seoTags}</head>`);
    
    fs.writeFileSync(path.join(productDir, 'index.html'), html);
  });

  // --- Generate Article Pages ---
  const articlesDir = path.join(distDir, 'articles');
  if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir, { recursive: true });

  articles.forEach(article => {
    if (!article.slug) return;
    
    const articleDir = path.join(articlesDir, article.slug);
    if (!fs.existsSync(articleDir)) fs.mkdirSync(articleDir, { recursive: true });
    
    let html = baseHtml;
    const title = `${article.title} - مدونة أحمد الماسي`;
    const description = article.excerpt ? article.excerpt.substring(0, 160) : `اقرأ مقال ${article.title} حصرياً على أحمد الماسي.`;
    const image = article.image_url || 'https://ahmedalmasi.com/hero-main.jpg';
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "image": [image],
      "datePublished": article.published_at || new Date().toISOString(),
      "author": [{
          "@type": "Organization",
          "name": "أحمد الماسي",
          "url": "https://ahmedalmasi.com"
        }]
    };

    const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="https://ahmedalmasi.com/articles/${article.slug}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    `;
    
    html = html.replace(/<title>.*?<\/title>/s, '');
    html = html.replace(/<meta name="description".*?>/s, '');
    html = html.replace(/<meta property="og:.*?".*?>/sg, '');
    html = html.replace(/<meta name="twitter:.*?".*?>/sg, '');
    html = html.replace('</head>', `${seoTags}</head>`);
    
    fs.writeFileSync(path.join(articleDir, 'index.html'), html);
  });

  console.log("SEO pages generated successfully!");
}

generatePages();
