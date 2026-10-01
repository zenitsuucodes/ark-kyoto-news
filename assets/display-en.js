;(function () {
  var ROOT = document.documentElement
  var STORAGE_KEY = 'ark-lang'

  function snapshotJapanese() {
    var nodes = document.querySelectorAll('[data-en]')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      if (!el.hasAttribute('data-ja')) {
        el.setAttribute('data-ja', el.textContent)
      }
    }

    var metas = document.querySelectorAll('[data-en-content]')
    for (var j = 0; j < metas.length; j++) {
      var meta = metas[j]
      if (!meta.hasAttribute('data-ja-content')) {
        var c = meta.getAttribute('content')
        if (c) meta.setAttribute('data-ja-content', c)
      }
    }

    var imgs = document.querySelectorAll('[data-en-alt]')
    for (var k = 0; k < imgs.length; k++) {
      var img = imgs[k]
      if (!img.hasAttribute('data-ja-alt')) {
        var a = img.getAttribute('alt')
        if (a) img.setAttribute('data-ja-alt', a)
      }
    }

    var titleEl = document.querySelector('title[data-en]')
    if (titleEl && !titleEl.hasAttribute('data-ja')) {
      titleEl.setAttribute('data-ja', titleEl.textContent)
    }
  }

  function applyLanguage(lang) {
    var useEn = lang === 'en'
    snapshotJapanese()

    var nodes = document.querySelectorAll('[data-en]')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      var text = useEn ? el.getAttribute('data-en') : el.getAttribute('data-ja')
      if (text) el.textContent = text
    }

    var metas = document.querySelectorAll('[data-en-content]')
    for (var j = 0; j < metas.length; j++) {
      var meta = metas[j]
      var content = useEn
        ? meta.getAttribute('data-en-content')
        : meta.getAttribute('data-ja-content')
      if (content) meta.setAttribute('content', content)
    }

    var imgs = document.querySelectorAll('[data-en-alt]')
    for (var k = 0; k < imgs.length; k++) {
      var img = imgs[k]
      var alt = useEn ? img.getAttribute('data-en-alt') : img.getAttribute('data-ja-alt')
      if (alt) img.setAttribute('alt', alt)
    }

    var titleEl = document.querySelector('title[data-en]')
    if (titleEl) {
      var t = useEn ? titleEl.getAttribute('data-en') : titleEl.getAttribute('data-ja')
      if (t) document.title = t
    }

    ROOT.lang = useEn ? 'en' : 'ja'
    ROOT.classList.remove('i18n-pending')
    if (document.body) document.body.classList.remove('i18n-pending')

    try {
      localStorage.setItem(STORAGE_KEY, useEn ? 'en' : 'ja')
    } catch (e) {}

    var buttons = document.querySelectorAll('.ark-lang-btn')
    for (var b = 0; b < buttons.length; b++) {
      var btn = buttons[b]
      if (useEn) {
        btn.textContent = btn.getAttribute('data-ja-label') || '日本語'
      } else {
        btn.textContent = btn.getAttribute('data-en') || 'English'
      }
    }
  }

  window.__arkSetLanguage = applyLanguage
  window.__arkToggleEn = function () {
    var current = 'ja'
    try {
      current = localStorage.getItem(STORAGE_KEY) || 'ja'
    } catch (e) {}
    applyLanguage(current === 'en' ? 'ja' : 'en')
  }

  function init() {
    var saved = 'ja'
    try {
      saved = localStorage.getItem(STORAGE_KEY) || 'ja'
    } catch (e) {}
    applyLanguage(saved)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
