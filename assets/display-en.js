;(function () {
  var ROOT = document.documentElement

  function applyEnglish() {
    var nodes = document.querySelectorAll('[data-en]')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      var en = el.getAttribute('data-en')
      if (!en) continue
      el.textContent = en
    }

    var metas = document.querySelectorAll('[data-en-content]')
    for (var j = 0; j < metas.length; j++) {
      var meta = metas[j]
      var content = meta.getAttribute('data-en-content')
      if (content) meta.setAttribute('content', content)
    }

    var imgs = document.querySelectorAll('[data-en-alt]')
    for (var k = 0; k < imgs.length; k++) {
      var img = imgs[k]
      var alt = img.getAttribute('data-en-alt')
      if (alt) img.setAttribute('alt', alt)
    }

    if (document.title && document.querySelector('title[data-en]')) {
      document.title = document.querySelector('title[data-en]').getAttribute('data-en')
    }

    ROOT.lang = 'en'
    ROOT.classList.remove('i18n-pending')
    if (document.body) document.body.classList.remove('i18n-pending')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEnglish)
  } else {
    applyEnglish()
  }
})()
