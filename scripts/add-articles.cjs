const fs = require('fs');

const products = [
  { id: '1', slug: 'sauvage-dior', name: 'سوفاج ديور' },
  { id: '2', slug: 'bleu-de-chanel', name: 'بلو دي شانيل' },
  { id: '3', slug: 'creed-aventus', name: 'كريد افينتوس' },
  { id: '4', slug: 'baccarat-rouge-540', name: 'باكارات روج 540' },
  { id: '5', slug: 'tom-ford-black-orchid', name: 'توم فورد بلاك اوركيد' },
  { id: '6', slug: 'yves-saint-laurent-libre', name: 'إيف سان لوران ليبر نسائي' },
  { id: '7', slug: 'dg-light-blue', name: 'DG لايت بلو نسائي' },
  { id: '8', slug: 'victoria-secret-very-sexy', name: 'فري سيكسي' },
  { id: '9', slug: 'burberry-her', name: 'بربري هير نسائي' }
];

const newArticles = products.map((p, index) => {
  const type = p.name.includes('نسائ') || p.name.includes('DG') || p.name.includes('فري سيكسي') || p.name.includes('بربري') ? 'النسائية' : 'الرجالية';
  const category = type === 'النسائية' ? 'عطر نسائي' : 'عطر رجالي';
  
  return `  {
    id: "prod-art-${p.id}",
    title: "المراجعة الشاملة لعطر ${p.name} - سر الجاذبية والفخامة",
    slug: "${p.slug}-review",
    image_url: "https://ahmedalmasi.com/logo-main.jpg", // fallback
    excerpt: "اكتشف لماذا يعتبر عطر ${p.name} من أفضل العطور ${type}، تعرف على مكوناته الفريدة وسر ثباته الذي يدوم طويلاً.",
    content: \`
      <h2>لماذا يجب أن تقتني عطر ${p.name}؟</h2>
      <p>عالم العطور مليء بالخيارات، ولكن عندما نتحدث عن <strong>${p.name}</strong>، فنحن نتحدث عن تحفة فنية تخطف الأنفاس. يعتبر هذا العطر من أيقونات الجمال والجاذبية في عالم العطور ${type}، وقد صُمم خصيصاً ليترك انطباعاً لا يُنسى.</p>

      <h2>الهرم العطري والمكونات الأساسية</h2>
      <p>يتميز عطر ${p.name} بتوليفة عطرية متدرجة تأخذك في رحلة حسية رائعة:</p>
      <ul>
        <li><strong>الافتتاحية:</strong> نفحات منعشة وقوية تجذب الانتباه منذ اللحظة الأولى.</li>
        <li><strong>القلب العطري:</strong> مزيج دافئ من الزهور والأخشاب يمنح العطر شخصيته الفريدة.</li>
        <li><strong>القاعدة العطرية:</strong> ارتكاز قوي على المسك والعنبر يضمن ثباتاً يدوم لساعات طويلة على الجلد والملابس.</li>
      </ul>

      <h2>الأداء: الثبات والفوحان</h2>
      <p>من أهم العوامل التي تجعل ${p.name} الخيار الأول للكثيرين هو <strong>قوة الأداء</strong>. بفضل تركيزه العالي واستخدامنا لأفضل الزيوت العطرية، نضمن لك ثباتاً يتجاوز 24 ساعة، مع فوحان يملأ المكان بمجرد دخولك.</p>

      <h2>أفضل أوقات الاستخدام</h2>
      <p>هذا العطر متعدد الاستخدامات بامتياز! يمكنك وضعه في أوقات العمل الرسمية ليمنحك ثقة إضافية، أو في السهرات والمناسبات الخاصة ليجعلك محط أنظار الجميع.</p>

      <h2>احصل عليه الآن من أحمد الماسي</h2>
      <p>نحن في <strong>أحمد الماسي للعطور</strong> نقدم لك عطر ${p.name} بأعلى جودة وتطابق مذهل مع العطر العالمي الأصلي، وبأسعار تنافسية لا تقبل المقارنة. لا تتردد في تجربته اليوم والارتقاء بأسلوبك العطري.</p>
      <p><a href="/products/${p.slug}"><strong>اضغط هنا لطلب عطر ${p.name} الآن!</strong></a></p>
    \`,
    author: "أحمد الماسي",
    published_at: "2024-08-22T10:00:00Z",
    created_at: "2024-08-22T10:00:00Z"
  }`;
});

let code = fs.readFileSync('src/data/articles.ts', 'utf8');

// Insert the new articles into the staticArticles array
// We find the end of the array by looking for the last `];` or just inserting before the end of the file.
// Or we can just do a regex replace to insert before `];`
code = code.replace(/\];/, ",\n" + newArticles.join(",\n") + "\n];");

fs.writeFileSync('src/data/articles.ts', code);
console.log("Added 9 product articles to articles.ts");
