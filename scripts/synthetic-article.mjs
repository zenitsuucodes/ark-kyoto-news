import { CDN, rebrandText } from './process-page.mjs'

function heroFromThumb(url) {
  if (!url) return ''
  return url.replace(/\/\d+m\//, '/635m/').replace(/\/255m\//, '/635m/')
}

function heroSrcset(url) {
  const hero = heroFromThumb(url)
  const wide = hero.replace(/\/635m\//, '/1270m/')
  return `${hero} 1x, ${wide} 2x`
}

function bodyParagraphs(title, category) {
  const place = category.includes('World') ? 'abroad' : 'Japan'
  return [
    `TOKYO — ${title.replace(/\.$/, '')}, according to officials and people familiar with the matter.`,
    `The development in ${place} follows months of planning and coordination among government agencies, industry groups, and local communities. Analysts said the story reflects wider economic and social trends shaping the region.`,
    `Stakeholders emphasized transparency and steady communication as work moves forward. Further details are expected in the coming days as authorities review next steps.`,
    `Ark Kyoto News will continue to follow this story and provide updates as they become available.`,
  ]
}

export function buildSyntheticArticleHtml(meta) {
  const title = meta.title.trim()
  const hero = heroFromThumb(meta.image)
  const srcset = heroSrcset(meta.image)
  const dt = meta.datetime || '2026-09-27T12:00'
  const displayTime = meta.timeLabel || 'Sep 27, 2026'
  const category = meta.category || 'News'
  const paras = bodyParagraphs(title, category)
    .map((p) => `<p>${p}</p>`)
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${CDN}/resources/kyodonews/css/pc/leafs.css?rd=202609031611" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap" />
</head>
<body>
<div class="l-wrap">
<header class="g-header js-header">
  <div class="g-header__inner">
    <div class="g-header-top">
      <div class="g-header-top__inner">
        <h1 class="g-header-logo">
          <a class="g-header-logo__link" href="../../../index.html">
            <img class="g-header-logo__img" src="__LOGO__" width="180" height="60" alt="ARK KYOTO NEWS">
          </a>
        </h1>
      </div>
    </div>
    <div class="g-header-bottom js-header-bottom">
      <nav class="g-header-nav">
        <ul class="g-header-nav__list">
          <li class="g-header-nav__item"><a class="g-header-nav__link" href="../../../list/news/">Latest</a></li>
          <li class="g-header-nav__item"><a class="g-header-nav__link" href="../../../list/news/japan/">Japan</a></li>
          <li class="g-header-nav__item"><a class="g-header-nav__link" href="../../../list/news/world/">World</a></li>
        </ul>
      </nav>
    </div>
  </div>
</header>
<main class="l-article">
<div class="article-header">
  <h1 class="article-ttl">${title}</h1>
  <div class="article-header-wrap">
    <div class="article-header-info">
      <div class="article-header-info__inner">
        <a class="article-header-info__link" href="#">ARK KYOTO NEWS</a>
      </div>
      <div class="article-header-info__meta">
        <time class="article-header-info__time" datetime="${dt}">${displayTime}</time>
        <a class="article-header-cate__link" href="#">${category}</a>
      </div>
    </div>
  </div>
  <figure class="article-header-img-main --leafs">
    <img src="${hero}" srcset="${srcset}" width="635" height="370" class="article-header-img-main__img" alt="${title.replace(/"/g, '&quot;')}">
    <figcaption class="article-header-img-main__caption">${title} (Ark Kyoto News)</figcaption>
  </figure>
</div>
<div class="article-body">
  <div class="article-body__inner">
    ${paras}
  </div>
</div>
</main>
<footer class="g-footer"><div class="g-footer__inner"><small class="g-footer-copy">&copy; Ark Kyoto News.</small></div></footer>
</div>
</body>
</html>`

  return rebrandText(html)
}
