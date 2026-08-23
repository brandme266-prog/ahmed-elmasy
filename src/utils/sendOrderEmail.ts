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
    "3f68b1b7-d402-4de3-97cc-6be0feedc2d0", 
    "96d8783a-0286-4627-8c1a-8553aee83a19"
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
