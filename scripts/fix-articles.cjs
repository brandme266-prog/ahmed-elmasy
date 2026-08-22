const fs = require('fs');

const actualProducts = [
  { id: '1', slug: 'سترونجر-إنتنسلي-Stronger-Intensely-–-عطر-رجالي-دافئ-وجذاب', name: 'سترونجر إنتنسلي', type: 'الرجالية' },
  { id: '2', slug: 'باكدج-فري-سيكسي-50-مل-–-بربري-هير-ومسك-ومان-ميكس', name: 'باكدج بربري هير ومسك ومان ميكس', type: 'النسائية' },
  { id: '3', slug: 'باكدج-عطر-DG-–-فري-سيكسي-ميكس-50-مل', name: 'عطر DG – فري سيكسي ميكس', type: 'النسائية' },
  { id: '4', slug: 'باكدج-DG-–-عطر-DG-50-مل-+-10-مل-+-زيت-عطري-فاخر', name: 'باكدج عطر DG الفاخر', type: 'النسائية' },
  { id: '5', slug: 'الترا-ميل-Ultra-Male-–-عطر-رجالي-جذاب-بحضور-قوي', name: 'الترا ميل Ultra Male', type: 'الرجالية' },
  { id: '6', slug: 'هوس-الإكسير-–-عطر-رجالي-فاخر-وجذاب', name: 'هوس الإكسير (Hawas Elixir)', type: 'الرجالية' },
  { id: '7', slug: 'هوس-إكس-hoss-x-عطر-رجالي-أنيق-وجذاب', name: 'هوس إكس – Hoss X', type: 'الرجالية' },
  { id: '8', slug: 'باكدج-برفان-مسك-رمان-–-50-مل', name: 'باكدج مسك رمان', type: 'النسائية' },
  { id: '9', slug: 'very-sexy-perfume-50ml', name: 'عطر فيري سيكسي - Very Sexy', type: 'النسائية' }
];

const generateArticle = (p) => {
  const genderType = p.type === 'النسائية' ? 'عطر نسائي' : 'عطر رجالي';
  
  return `  {
    id: "prod-art-${p.id}",
    title: "كل ما تود معرفته عن ${p.name} - مراجعة شاملة وتقييم الأداء",
    slug: "${p.slug}-review",
    image_url: "https://ahmedalmasi.com/hero-main.jpg", 
    excerpt: "مراجعة تفصيلية لعطر ${p.name}. تعرف على الهرم العطري، قوة الثبات، والفوحان، ولماذا يعتبر من أفضل العطور ${p.type} في السوق.",
    content: \`
      <h2>المقدمة: لماذا يثير عطر ${p.name} كل هذا الاهتمام؟</h2>
      <p>في عالم العطور المليء بالخيارات المتعددة، يبرز <strong>${p.name}</strong> كواحد من أقوى وأفضل الخيارات لمن يبحث عن التميز والجاذبية. هذا الـ ${genderType} ليس مجرد رائحة عابرة، بل هو بصمة عطرية تترك أثراً في ذاكرة كل من يشمها.</p>

      <h2>الهرم العطري: رحلة الحواس الثلاثة</h2>
      <p>يتكون ${p.name} من توليفة عطرية معقدة ومصممة بعناية فائقة لضمان انتقال سلس بين النوتات المختلفة:</p>
      <ul>
        <li><strong>الافتتاحية (Top Notes):</strong> تبدأ الرحلة بانفجار منعش من الحمضيات والتوابل الخفيفة التي تعطي إحساساً بالنظافة والحيوية في أول 15 دقيقة.</li>
        <li><strong>قلب العطر (Heart Notes):</strong> بعد أن تهدأ الافتتاحية، تظهر روائح الأزهار الرقيقة والأخشاب الدافئة لتشكل الشخصية الحقيقية والعميقة للعطر.</li>
        <li><strong>القاعدة (Base Notes):</strong> الأساس الذي يعتمد عليه ثبات العطر، حيث يتميز بتركيز مكثف من المسك والعنبر الذي يدوم لساعات طويلة جداً.</li>
      </ul>

      <h2>الأداء: تقييم الثبات والفوحان (Sillage & Longevity)</h2>
      <p>أكثر ما يميز عطورنا في متجر <strong>أحمد الماسي</strong> هو التركيز الاستثنائي. عند استخدامك لـ ${p.name}، يمكنك توقع التالي:</p>
      <ul>
        <li><strong>الثبات على الملابس:</strong> يدوم لأكثر من 24 إلى 48 ساعة بفضل جودة الزيوت العطرية المستخدمة.</li>
        <li><strong>الثبات على الجلد:</strong> يدوم من 8 إلى 12 ساعة بناءً على طبيعة وكيمياء الجسم.</li>
        <li><strong>الفوحان (Sillage):</strong> يترك أثراً عطرياً قوياً في المكان، خاصة في الساعات الأربع الأولى من الاستخدام.</li>
      </ul>

      <h2>أفضل الأوقات والفصول للاستخدام</h2>
      <p>يتميز هذا العطر بتعدد استخداماته. إنه خيار مثالي للمناسبات المسائية والسهرات حيث يبرز سحره الكامل. ومع ذلك، يمكن استخدامه نهاراً في فصلي الخريف والشتاء بفضل نوتاته الدافئة التي تمنح إحساساً بالراحة.</p>

      <h2>نصائح احترافية لزيادة ثبات العطر</h2>
      <p>للحصول على أفضل أداء من ${p.name}، ننصح برش العطر على نقاط النبض (الرسغين، خلف الأذنين، والرقبة)، ويُفضل استخدامه بعد الاستحمام مباشرة وقبل ارتداء الملابس للحصول على ثبات يدوم طويلاً.</p>

      <h2>الخلاصة: هل يستحق الشراء؟</h2>
      <p>إذا كنت تبحث عن عطر يجمع بين الجودة العالية، السعر المناسب، والأداء الخرافي، فإن ${p.name} هو استثمار مضمون في أناقتك.</p>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="/products/${p.slug}" style="display: inline-block; background-color: #d4af37; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">اضغط هنا لشراء عطر ${p.name} الآن بأفضل سعر</a>
      </div>
    \`,
    author: "أحمد الماسي",
    published_at: "2024-08-22T12:00:00Z",
    created_at: "2024-08-22T12:00:00Z"
  }`;
};

let code = fs.readFileSync('src/data/articles.ts', 'utf8');

// The file has 3 original articles, and then 9 fake articles I added.
// I will slice the array to only keep the first 3 original articles.
// The easiest way is to find the index of `{ id: "prod-art-1"` and truncate from there.
const prodArtIndex = code.indexOf('{', code.indexOf('id: "prod-art-1"'));
if (prodArtIndex !== -1) {
    // Find the opening brace before "id: 'prod-art-1'"
    const lastValidComma = code.lastIndexOf(',', code.indexOf('id: "prod-art-1"'));
    if (lastValidComma !== -1) {
        code = code.substring(0, lastValidComma);
    }
} else {
    // Just find the end array bracket if not found
    code = code.replace(/\];/, "");
}

// Generate the 9 new real articles
const newArticles = actualProducts.map(generateArticle);

// Append them
code = code + ",\n" + newArticles.join(",\n") + "\n];\n";

fs.writeFileSync('src/data/articles.ts', code);
console.log("Replaced with 9 REAL articles.");
