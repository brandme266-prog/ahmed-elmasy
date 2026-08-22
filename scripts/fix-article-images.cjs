const fs = require('fs');

const productsCode = fs.readFileSync('src/data/products.ts', 'utf8');
let articlesCode = fs.readFileSync('src/data/articles.ts', 'utf8');

// Extract all slug -> image_url from productsCode
const slugRegex = /"slug":\s*"([^"]+)"/g;
const imgRegex = /"image_url":\s*"([^"]+)"/g;

// A simple way is to match objects. We can just use eval since it's just an array of objects.
// Wait, products.ts has "export const staticProducts = [ ... ]". We can extract the array part.
const startIndex = productsCode.indexOf('export const staticProducts: Product[] = [') + 'export const staticProducts: Product[] = '.length;
const endIndex = productsCode.lastIndexOf('];') + 1;

let productsArray = eval(productsCode.substring(startIndex, endIndex));

// Now map over articlesCode
// the easiest way is to use replace on articlesCode to replace the image_urls
let updatedArticlesCode = articlesCode;

productsArray.forEach(p => {
    // We generated articles with slug: `${p.slug}-review`
    const reviewSlug = `${p.slug}-review`;
    // We want to replace image_url for that block
    // We can just find the block for the slug and replace its image_url
    
    // Instead of regex hacking, let's just find the article with the slug.
    // Wait, the articles are in a string format.
    // Let's replace `image_url: "https://ahmedalmasi.com/hero-main.jpg"`
    // We can do it by finding the slug, then finding the image_url BEFORE it? 
    // Actually in the generated code, image_url is BEFORE slug:
    // slug: "${p.slug}-review",
    // image_url: "https://ahmedalmasi.com/hero-main.jpg",
    // Let's replace the whole string for each product.
    const searchString = `slug: "${reviewSlug}",\n    image_url: "https://ahmedalmasi.com/hero-main.jpg"`;
    const replaceString = `slug: "${reviewSlug}",\n    image_url: "${p.image_url}"`;
    
    updatedArticlesCode = updatedArticlesCode.replace(searchString, replaceString);
});

fs.writeFileSync('src/data/articles.ts', updatedArticlesCode);
console.log("Updated article images to match product images.");
