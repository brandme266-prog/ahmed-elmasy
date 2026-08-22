const fs = require('fs');
let code = fs.readFileSync('src/data/products.ts', 'utf8');

function seoArticle(name, type) {
  return `<h2>تجربة عطرية لا تُنسى مع ${name}</h2>
<p>إذا كنت تبحث عن التميز والأصالة، فإن <strong>${name}</strong> هو الخيار المثالي لك. تم تصميم هذا العطر خصيصاً ليمنحك حضوراً قوياً وجاذبية لا تقاوم، مما يجعله من أفضل العطور ${type} المتوفرة في الأسواق حالياً.</p>

<h3>مكونات ونوتات العطر (الهرم العطري)</h3>
<p>يتميز هذا العطر بتركيبة متوازنة وغنية تبدأ بنفحات منعشة، ثم تتدرج لتكشف عن قلب عطري دافئ، وتستقر في النهاية على قاعدة خشبية وعنبرية تضمن ثباتاً يدوم طويلاً.</p>
<ul>
  <li><strong>المقدمة (الافتتاحية):</strong> نفحات حمضية وتوابل خفيفة تلفت الانتباه فوراً.</li>
  <li><strong>القلب العطري:</strong> مزيج من الزهور والأخشاب الدافئة التي تضفي لمسة من الفخامة.</li>
  <li><strong>القاعدة (النهاية):</strong> تركيز عالي من المسك، العنبر، والأخشاب لثبات يدوم طويلاً.</li>
</ul>

<h3>أداء العطر: الثبات والفوحان</h3>
<p>من أهم ما يبحث عنه عشاق العطور هو <strong>ثبات العطر وفوحانه</strong>. بفضل استخدامنا لأفضل الزيوت العطرية الفرنسية والعالمية، نضمن لك ثباتاً يدوم لأكثر من 24 ساعة على الملابس، مع فوحان يملأ المكان بمجرد دخولك.</p>

<h3>أفضل أوقات استخدام ${name}</h3>
<p>هذا العطر مصمم ليكون رفيقك في جميع الأوقات المهمة. يعتبر خياراً مثالياً للاستخدام في السهرات، المناسبات الرسمية، وحفلات الزفاف. كما يضفي لمسة من الدفء في الأجواء الباردة، مما يجعله <strong>أفضل عطر شتوي ومسائي</strong> بلا منازع.</p>

<h3>لماذا تشتري من أحمد الماسي للعطور؟</h3>
<ul>
  <li><strong>جودة مضمونة:</strong> نستخدم زجاجات فاخرة وزيوت عطرية أصلية بتركيز عالي جداً.</li>
  <li><strong>تطابق مذهل:</strong> روائح تتطابق بنسبة تصل إلى 98% مع العطور العالمية الأصلية.</li>
  <li><strong>أسعار تنافسية:</strong> نقدم لك فخامة العطور العالمية بأسعار في متناول الجميع.</li>
  <li><strong>شحن سريع:</strong> توصيل آمن وسريع إلى باب منزلك في جميع أنحاء الجمهورية.</li>
</ul>`;
}

// Replace descriptions using a simple regex that matches the description string
code = code.replace(/"description":\s*"[^"]*",/g, function(match, offset, str) {
  // Find the product name in the current block
  let nameMatch = str.slice(offset).match(/"name":\s*"([^"]+)"/);
  let name = nameMatch ? nameMatch[1] : 'عطر فاخر';
  let type = name.includes('نسائ') || name.includes('DG') || name.includes('فري سيكسي') || name.includes('بربري') ? 'النسائية' : 'الرجالية';
  
  let article = seoArticle(name, type);
  // Stringify the article to safely put it in double quotes with \n escaped
  return '"description": ' + JSON.stringify(article) + ',';
});

fs.writeFileSync('src/data/products.ts', code);
console.log('Descriptions updated!');
