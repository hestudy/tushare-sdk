const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('正在访问首页...');
  await page.goto('http://localhost:3000/');

  console.log('等待页面加载...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // 检查页面内容
  const html = await page.content();
  console.log('\n页面 HTML 长度:', html.length);

  // 检查各种可能的选择器
  const selectors = [
    'article',
    'article.rspress-doc-content',
    '.rspress-doc',
    '.doc-content',
    'main',
    '#root',
    'h1',
  ];

  console.log('\n选择器检查:');
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`  ${selector}: ${count} 个元素`);
    if (count > 0) {
      const visible = await page.locator(selector).first().isVisible().catch(() => false);
      console.log(`    第一个元素可见: ${visible}`);
    }
  }

  console.log('\n按 Enter 键关闭浏览器...');
  await new Promise(resolve => process.stdin.once('data', resolve));

  await browser.close();
})();
