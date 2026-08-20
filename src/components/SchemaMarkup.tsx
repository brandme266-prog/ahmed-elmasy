const SchemaMarkup = () => {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "أحمد الماسي",
    url: window.location.origin,
    description: "أحمد الماسي تقدم لك أندر وأفخم العطور التي تعكس شخصيتك بأعلى جودة وأفضل الأسعار",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Arabic",
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "أحمد الماسي",
    url: window.location.origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${window.location.origin}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
};

export default SchemaMarkup;
