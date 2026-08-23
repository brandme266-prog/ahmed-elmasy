export const sendOrderEmail = async (orderDetails: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  notes?: string;
  items: { name: string; quantity: number; price?: number }[];
  totalPrice?: number;
}) => {
  const accessKeys = [
    "84c64417-950b-4be4-98a6-b0694dfd977e", // This is the only valid key that worked
  ];

  // Format the items into a readable list
  const itemsList = orderDetails.items
    .map((item) => `- ${item.name} (الكمية: ${item.quantity})${item.price ? ` - السعر: ${item.price} ج.م` : ''}`)
    .join("\n");

  const emailMessage = `
🎉 طلب جديد من موقع أحمد الماسي!

تفاصيل العميل:
----------------
الاسم: ${orderDetails.customerName}
رقم الهاتف: ${orderDetails.customerPhone}
${orderDetails.customerAddress ? `العنوان: ${orderDetails.customerAddress}` : ''}
${orderDetails.customerEmail ? `البريد الإلكتروني: ${orderDetails.customerEmail}` : ''}
${orderDetails.notes ? `ملاحظات: ${orderDetails.notes}` : ''}

المنتجات المطلوبة:
----------------
${itemsList}

${orderDetails.totalPrice ? `الإجمالي: ${orderDetails.totalPrice} ج.م` : ''}
  `;

  try {
    const promises = accessKeys.map(key => 
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: key,
          subject: `طلب جديد من ${orderDetails.customerName}`,
          from_name: "متجر أحمد الماسي",
          name: orderDetails.customerName || "عميل",
          email: orderDetails.customerEmail || "no-reply@ahmedalmasi.com",
          message: emailMessage,
        }),
      })
    );

    const responses = await Promise.all(promises);
    const allSuccess = responses.every(res => res.ok);
    
    return allSuccess;
  } catch (error) {
    console.error("Error sending order emails:", error);
    return false;
  }
};
