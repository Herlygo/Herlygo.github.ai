document.addEventListener('DOMContentLoaded', function(){
  
  document.querySelectorAll('.accordion-item').forEach(function(btn){
    btn.addEventListener('click', function(){
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      if(panel.style.maxHeight){ panel.style.maxHeight = null; }
      else{ panel.style.maxHeight = panel.scrollHeight + 'px'; }
    });
  });

  // calculadora punto de equilibrio + gráfica
  const price = document.getElementById('price');
  const varcost = document.getElementById('varcost');
  const fixed = document.getElementById('fixed');
  const calcBtn = document.getElementById('calcBtn');
  const resetCalc = document.getElementById('resetCalc');
  const calcResult = document.getElementById('calcResult');
  const chartContainer = document.getElementById('peChart');

  function calcPE(){
    const p = parseFloat(price.value) || 0;
    const v = parseFloat(varcost.value) || 0;
    const f = parseFloat(fixed.value) || 0;
    const cm = p - v;
    if(cm <= 0){ calcResult.innerHTML = '<span class="error">El margen de contribución debe ser positivo (precio &gt; costo variable).</span>'; drawChart(null); return; }
    const unidades = Math.ceil(f / cm);
    const ventas = (unidades * p).toFixed(2);
    calcResult.innerHTML = `<strong>Resultado:</strong><div class="mt-6">Punto de equilibrio: <strong>${unidades}</strong> unidades</div><div class="mt-6">Ventas mínimas para cubrir costos: Q ${ventas}</div>`;
    drawChart({p, v, f, unidades});
  }

  function drawChart(data){
    //  ejes, línea de costos totales y línea de ventas
    if(!chartContainer) return;
    const w = 560, h = 260, pad = 36;
    if(!data){ chartContainer.innerHTML = '<div class="mt-6">No hay datos para graficar.</div>'; return; }
    const {p, v, f, unidades} = data;
    
    const maxX = Math.max(unidades*2, unidades+20);
    const points = [];
    const step = Math.ceil(maxX/10);
    let maxY = 0;
    for(let x=0;x<=maxX;x+=step){
      const ventas = x * p;
      const costos = f + x * v;
      maxY = Math.max(maxY, ventas, costos);
      points.push({x, ventas, costos});
    }
    // escalas
    const xScale = d => pad + (d / maxX) * (w - pad*2);
    const yScale = d => h - pad - (d / maxY) * (h - pad*2);

    const ventasPath = points.map(pt => `${xScale(pt.x)},${yScale(pt.ventas)}`).join(' ');
    const costosPath = points.map(pt => `${xScale(pt.x)},${yScale(pt.costos)}`).join(' ');

    const svg = [];
    svg.push(`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`);
    // fondo
    svg.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="#d9f0ecff" rx="6"/>`);
    // ejes
    svg.push(`<line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#cbd5e1"/>`);
    svg.push(`<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" stroke="#cbd5e1"/>`);
    // líneas
    svg.push(`<polyline points="${ventasPath}" fill="none" stroke="#d70bd7ff" stroke-width="2"/>`);
    svg.push(`<polyline points="${costosPath}" fill="none" stroke="#ff7a59" stroke-width="2"/>`);
    // marca punto de equilibrio
    const px = xScale(unidades);
    const py = yScale(unidades * p);
    svg.push(`<circle cx="${px}" cy="${py}" r="4" fill="#198754"/>`);
    svg.push(`<text x="${px+8}" y="${py-8}" font-size="12" fill="#0f1724">PE: ${unidades} u</text>`);
   
    svg.push(`<rect x="${w-pad-150}" y="${pad}" width="140" height="60" fill="#f8fbff" stroke="#eef6ff" rx="6"/>`);
    svg.push(`<text x="${w-pad-140}" y="${pad+18}" font-size="12" fill="#0b5ed7">Ventas</text>`);
    svg.push(`<text x="${w-pad-140}" y="${pad+36}" font-size="12" fill="#ff7a59">Costos totales</text>`);

    svg.push(`</svg>`);
    chartContainer.innerHTML = svg.join('');
  }

  if(calcBtn){ calcBtn.addEventListener('click', function(e){ e.preventDefault(); calcPE(); }); }
  if(resetCalc){ resetCalc.addEventListener('click', function(e){ e.preventDefault(); price.value=''; varcost.value=''; fixed.value=''; calcResult.innerHTML='Ingrese valores y presione Calcular.'; drawChart(null); }); }

 
  const form = document.getElementById('caForm');
  const caMsg = document.getElementById('caMsg');
  const caExport = document.getElementById('caExport');

  function show(msg, type){ caMsg.textContent = msg; caMsg.className = type === 'error' ? 'error mt-12' : 'mt-12'; }

  if(form){
    form.addEventListener('submit', function(e){
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      title: form.title.value.trim(),
      pageLink: form.pageLink.value.trim(),
      evidenceLink: form.evidenceLink.value.trim(),
      recordingLink: form.recordingLink.value.trim(),
      timestamp: new Date().toISOString()
    };
    if(!data.name || !data.title){ show('Complete nombre y título.', 'error'); return; }
    try{ if(data.pageLink) new URL(data.pageLink); if(data.evidenceLink) new URL(data.evidenceLink); if(data.recordingLink) new URL(data.recordingLink); }catch(err){ show('Alguno de los enlaces no es una URL válida.', 'error'); return; }
    localStorage.setItem('caSubmission', JSON.stringify(data));
    show('Datos guardados localmente. Use Exportar JSON para obtener una copia.');
    });
  }

  if(caExport) {
    caExport.addEventListener('click', function(){
      const raw = localStorage.getItem('caSubmission');
      if(!raw){ show('No hay datos para exportar.', 'error'); return; }
      const blob = new Blob([raw], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'contabilidad_administrativa-entrega.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      show('JSON exportado.');
    });
  }

  
  document.querySelectorAll('.accordion-panel').forEach(function(p){ p.style.maxHeight = null; });


  document.querySelectorAll('.detail-panel').forEach(function(p){
    p.style.maxHeight = '0px';
    // ensure aria-hidden default if not set
    if(!p.hasAttribute('aria-hidden')) p.setAttribute('aria-hidden','true');
  });

  (function openFirstDetail(){
    const firstBtn = document.querySelector('.detail-btn');
    if(!firstBtn) return;
    const id0 = firstBtn.getAttribute('aria-controls');
    const panel0 = document.getElementById(id0);
    firstBtn.setAttribute('aria-expanded','true');
    if(panel0){
      panel0.setAttribute('aria-hidden','false');
      panel0.style.maxHeight = panel0.scrollHeight + 'px';
      console.log('[cont_admin] opened first detail panel by default:', id0);
    }
  })();

 
  try{ window.peChartContainer = document.getElementById('peChart'); }catch(e){ }

  // botones de desglose: 
  const detailBtns = document.querySelectorAll('.detail-btn');
  console.log('[cont_admin] detail buttons found:', detailBtns.length);
  detailBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      const id = btn.getAttribute('aria-controls');
      const panel = document.getElementById(id);
      console.log('[cont_admin] detail button clicked:', id, 'panel found?', !!panel);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if(!panel) return;
      // toggle aria-hidden on the panel so CSS can animate
      const hidden = panel.getAttribute('aria-hidden') === 'true';
      panel.setAttribute('aria-hidden', hidden ? 'false' : 'true');
      // set maxHeight to enable smooth transition
      if(hidden){
        // expand: set explicit maxHeight based on scrollHeight
        panel.style.maxHeight = panel.scrollHeight + 'px';
        console.log('[cont_admin] opening panel', id, 'scrollHeight=', panel.scrollHeight);
      } else {
        // collapse
        panel.style.maxHeight = '0px';
        console.log('[cont_admin] closing panel', id);
      }
    });
  });


  try{
    const existing = JSON.parse(localStorage.getItem('caSubmission'));
    if(existing){ form.name.value = existing.name||''; form.title.value = existing.title||''; form.pageLink.value = existing.pageLink||''; form.evidenceLink.value = existing.evidenceLink||''; form.recordingLink.value = existing.recordingLink||''; }
  }catch(e){}

});