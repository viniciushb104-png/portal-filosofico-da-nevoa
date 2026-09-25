document.querySelectorAll('[data-media]').forEach(function(el){var k=el.getAttribute('data-media');if(window.MEDIA&&window.MEDIA[k]) el.src=window.MEDIA[k];});
document.documentElement.style.setProperty('--mansion-image','url("'+window.MEDIA.mansion+'")');
