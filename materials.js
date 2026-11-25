// cookie notice for public materials page (same key as the main site)
(function () {
  var ck = document.getElementById('cookie');
  if (!ck) return;
  var seen = false;
  try { seen = localStorage.getItem('cookie_ok') === '1'; } catch (e) {}
  if (!seen) ck.hidden = false;
  var ok = document.getElementById('cookieOk');
  if (ok) ok.addEventListener('click', function () {
    ck.hidden = true;
    try { localStorage.setItem('cookie_ok', '1'); } catch (e) {}
  });
})();
