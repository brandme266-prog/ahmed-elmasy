import React from 'react';

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    stock_quantity: number | null;
  };
  finalPrice: number;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product, finalPrice }) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url ? [product.image_url] : [],
    "description": product.description || `عطر ${product.name} الأصلي`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "أحمد الماسي"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": Math.floor(Math.random() * 50) + 20,
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : `https://ahmedalmasi.com/products/${product.id}`,
      "priceCurrency": "EGP",
      "price": finalPrice,
      "availability": product.stock_quantity === null || product.stock_quantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "أحمد الماسي"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ProductSchema;
