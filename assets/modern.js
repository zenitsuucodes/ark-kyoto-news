(function () {
  function assetRoot() {
    var path = window.location.pathname.replace(/\\/g, '/')
    var segs = path.split('/').filter(Boolean)
    if (segs.length === 0 || (segs.length === 1 && segs[0] === 'index.html')) {
      return './'
    }
    return '../'.repeat(segs.length)
  }

  function injectHeader() {
    if (
      document.body.classList.contains('ark-home') ||
      document.body.classList.contains('ark-list')
    ) {
      return
    }
    if (document.getElementById('ark-injected-header')) return

    var root = assetRoot()
    var wrap = document.createElement('div')
    wrap.id = 'ark-injected-header'
    wrap.innerHTML =
      '<header class="ark-site-header">' +
      '<div class="ark-site-header__inner">' +
      '<a class="ark-site-header__logo" href="' +
      root +
      'index.html"><img src="' +
      root +
      'assets/logo.svg" width="200" height="40" alt="ARK KYOTO NEWS"></a>' +
      '<nav class="ark-site-header__nav" aria-label="Primary">' +
      '<a href="' +
      root +
      'list/news/" data-en="Latest">最新</a>' +
      '<a href="' +
      root +
      'list/news/japan/" data-en="Japan">日本</a>' +
      '<a href="' +
      root +
      'list/news/world/" data-en="World">国際</a>' +
      '<a href="' +
      root +
      'list/news/sports/" data-en="Sports">スポーツ</a>' +
      '<a href="' +
      root +
      'list/news/feature/" data-en="Feature">特集</a>' +
      '</nav>' +
      '<div class="ark-site-header__tools">' +
      '<button type="button" class="ark-lang-btn" data-en="English" data-ja-label="日本語">English</button>' +
      '</div></div></header>'

    document.body.insertBefore(wrap, document.body.firstChild)
  }

  function wireLangButtons() {
    var buttons = document.querySelectorAll('.ark-lang-btn')
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        ev.preventDefault()
        if (window.__arkToggleEn) window.__arkToggleEn()
      })
    }
  }

  document.documentElement.classList.add('ark-modern-root')

  function boot() {
    injectHeader()
    wireLangButtons()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
