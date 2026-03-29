(function () {
  var mount = document.getElementById('shared-footer');
  if (!mount) return;

  var path = window.location.pathname || '';
  var isSubdir = /\/shopify-websites\//.test(path) || /\/projects\//.test(path);
  var prefix = isSubdir ? '../' : '';

  if (!document.querySelector('link[data-shared-footer="1"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = prefix + 'shared-footer.css';
    link.setAttribute('data-shared-footer', '1');
    document.head.appendChild(link);
  }

  mount.innerHTML = [
    '<footer class="site-footer">',
    '  <div class="sf-inner">',
    '    <div class="sf-grid">',
    '      <div>',
    '        <div class="sf-brand">2600 Design</div>',
    '        <p class="sf-desc">Bespoke web design for Canberra’s small businesses. Clean, modern, and built to perform.</p>',
    '      </div>',
    '      <div>',
    '        <div class="sf-col-title">Navigation</div>',
    '        <ul class="sf-links">',
    '          <li><a href="' + prefix + 'index.html">Home</a></li>',
    '          <li><a href="' + prefix + 'services.html">Services</a></li>',
    '          <li><a href="' + prefix + 'work.html">Work</a></li>',
    '          <li><a href="' + prefix + 'about.html">About</a></li>',
    '          <li><a href="' + prefix + 'contact.html">Contact</a></li>',
    '        </ul>',
    '      </div>',
    '      <div>',
    '        <div class="sf-col-title">Contact</div>',
    '        <ul class="sf-links">',
    '          <li><a href="mailto:2600design@gmail.com">2600design@gmail.com</a></li>',
    '          <li><a href="https://www.instagram.com/2600design.com.au/" target="_blank" rel="noopener">Instagram</a></li>',
    '          <li>Canberra, ACT</li>',
    '        </ul>',
    '      </div>',
    '    </div>',
    '    <div class="sf-bottom">',
    '      <p class="sf-copy">© 2026 2600 Design. All rights reserved.</p>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('');
})();
