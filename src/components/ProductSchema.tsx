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
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
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
