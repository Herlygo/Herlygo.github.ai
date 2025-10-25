
(function(){
  const INTERVAL = 2000; 
  let lastHash = null;
  let enabled = true;

  function hashString(s){
    let h = 5381;
    for(let i=0;i<s.length;i++) h = ((h<<5) + h) + s.charCodeAt(i);
    return h >>> 0;
  }

  async function check(){
    if(!enabled) return;
    try{
      const res = await fetch(window.location.href, {cache: 'no-store'});
      if(!res.ok) return;
      const text = await res.text();
      const h = hashString(text);
      if(lastHash === null) { lastHash = h; return; }
      if(h !== lastHash){
        console.log('[livereload] cambio detectado, recargando...');
        lastHash = h;
        window.location.reload();
      }

    }catch(e){
      console.log('[livereload] error al comprobar cambios:', e.message);
    }
  }

  // interfaz pequeña en la página
  function mountUI(){
    const el = document.createElement('div');
    el.id = 'livereload-ui';
    el.style.position = 'fixed';
    el.style.right = '12px';
    el.style.bottom = '19px';
    el.style.background = 'rgba(15,23,36,0.85)';
    el.style.color = '#fff';
    el.style.padding = '8px 10px';
    el.style.borderRadius = '8px';
    el.style.fontSize = '12px';
    el.style.zIndex = 9999;
    el.style.cursor = 'pointer';
    el.textContent = 'LiveReload: ON';
    el.title = 'Click para activar/desactivar recarga automática';
    el.addEventListener('click', function(){ enabled = !enabled; el.textContent = 'LiveReload: ' + (enabled? 'ON':'OFF'); });
    document.body.appendChild(el);
  }

  if(typeof window !== 'undefined'){
    window.addEventListener('load', function(){
      mountUI();
      setInterval(check, INTERVAL);
    });
  }
})();