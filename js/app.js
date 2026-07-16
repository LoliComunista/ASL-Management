// ASL Management — Hash router SPA
(function(){
  const { STATUS_OPTIONS, uid, loadClients, saveClients, upsertClient, deleteClient, getClient,
          formatDate, formatDateTime, toCSV } = window.ASL;

  // ---- Auth guard ----
  if(!localStorage.getItem('asl_auth')){ window.location.href='index.html'; return; }

  // ---- Menu ----
  const menuBtn = document.getElementById('menu-btn');
  const menuPanel = document.getElementById('menu-panel');
  const overlay = document.getElementById('menu-overlay');
  const openMenu = ()=>{ menuPanel.classList.remove('hidden'); overlay.classList.remove('hidden'); };
  const closeMenu= ()=>{ menuPanel.classList.add('hidden'); overlay.classList.add('hidden'); };
  menuBtn.addEventListener('click', openMenu);
  overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.menu-link').forEach(a=>a.addEventListener('click',closeMenu));
  document.getElementById('logout-btn').addEventListener('click',()=>{
    localStorage.removeItem('asl_auth'); window.location.href='index.html';
  });

  // ---- Utils ----
  const $ = sel => document.querySelector(sel);
  const app = $('#app');
  const escapeHtml = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusClass = s => ({
    'Prospecto':'badge-prospecto','Em andamento':'badge-andamento','Aguardando resposta':'badge-aguardando',
    'Concluído':'badge-concluido','Cancelado':'badge-cancelado'
  })[s] || 'badge-prospecto';
  const badge = s => `<span class="badge ${statusClass(s)}">${escapeHtml(s)}</span>`;

  function highlightMenu(){
    const path = location.hash.replace(/^#/,'') || '/dashboard';
    document.querySelectorAll('.menu-link').forEach(a=>{
      const target = a.getAttribute('href').replace(/^#/,'');
      const active = path === target || (target==='/clientes' && path.startsWith('/clientes'));
      a.classList.toggle('active', active);
    });
  }

  // ---- Routes ----
  function route(){
    highlightMenu();
    const hash = location.hash.replace(/^#/,'') || '/dashboard';
    if(hash==='/dashboard') return renderDashboard();
    if(hash==='/clientes') return renderList();
    if(hash==='/agenda') return renderAgenda();
    const m = hash.match(/^\/clientes\/(.+)$/);
    if(m) return renderDetail(decodeURIComponent(m[1]));
    location.hash = '#/dashboard';
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('asl-clients-changed', route);

  // ---- Dashboard ----
  function renderDashboard(){
    const clients = loadClients();
    const total = clients.length;
    const andamento = clients.filter(c=>c.status==='Em andamento').length;
    const concluidos = clients.filter(c=>c.status==='Concluído').length;
    const prospectos = clients.filter(c=>c.status==='Prospecto').length;
    const cancelados = clients.filter(c=>c.status==='Cancelado').length;
    const today = new Date().toISOString().slice(0,10);
    const pendentes = clients.filter(c=>c.followUpDate && c.followUpDate<=today).length;
    const recent = [...clients].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5);

    document.title = 'Painel — ASL Management';
    app.innerHTML = `
      <div class="container">
        <div class="row">
          <div>
            <h1 class="page-title">Painel Inicial</h1>
            <p class="subtitle">Visão geral dos atendimentos.</p>
          </div>
        </div>
        <section class="stats">
          <div class="stat primary"><div class="lbl">Total de clientes</div><div class="val">${total}</div></div>
          <div class="stat warning"><div class="lbl">Em andamento</div><div class="val">${andamento}</div></div>
          <div class="stat success"><div class="lbl">Concluídos</div><div class="val">${concluidos}</div></div>
          <div class="stat destructive"><div class="lbl">Cancelados</div><div class="val">${cancelados}</div></div>
          <div class="stat info"><div class="lbl">Prospectos</div><div class="val">${prospectos}</div></div>
          <div class="stat accent"><div class="lbl">Retornos pendentes</div><div class="val">${pendentes}</div></div>
        </section>
        <section class="card">
          <div class="row" style="margin-bottom:12px">
            <h2 style="margin:0">Últimos clientes atualizados</h2>
            <a href="#/clientes" class="btn-link">Ver todos →</a>
          </div>
          ${recent.length===0 ? '<p class="muted">Nenhum cliente cadastrado.</p>' :
            `<ul class="list-ul">${recent.map(c=>`
              <li>
                <div>
                  <a href="#/clientes/${c.id}" style="font-weight:500">${escapeHtml(c.name)}</a>
                  <div class="small">${escapeHtml(c.city)} · ${escapeHtml(c.phone)}</div>
                </div>
                ${badge(c.status)}
              </li>`).join('')}</ul>`}
        </section>
      </div>`;
  }

  // ---- List ----
  const state = { q:'', statusFilter:'Todos', sort:'updatedAt' };
  function renderList(){
    document.title = 'Clientes — ASL Management';
    const clients = loadClients();
    const term = state.q.trim().toLowerCase();
    let filtered = clients.filter(c=>{
      if(state.statusFilter!=='Todos' && c.status!==state.statusFilter) return false;
      if(!term) return true;
      return c.name.toLowerCase().includes(term)||c.phone.toLowerCase().includes(term)
          ||c.city.toLowerCase().includes(term)||c.status.toLowerCase().includes(term);
    });
    filtered.sort((a,b)=>{
      if(state.sort==='name') return a.name.localeCompare(b.name);
      if(state.sort==='status') return a.status.localeCompare(b.status);
      if(state.sort==='createdAt') return b.createdAt.localeCompare(a.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    app.innerHTML = `
      <div class="container">
        <div class="row">
          <div>
            <h1 class="page-title">Clientes</h1>
            <p class="subtitle">${filtered.length} de ${clients.length} clientes</p>
          </div>
          <div class="flex">
            <button id="csv-btn" class="btn btn-outline">Exportar CSV</button>
            <a href="#/clientes/novo" class="btn btn-primary">+ Novo Cliente</a>
          </div>
        </div>
        <div class="filters">
          <input id="q" class="input" placeholder="Buscar por nome, telefone, cidade ou status..." value="${escapeHtml(state.q)}" />
          <select id="statusFilter" class="input">
            <option>Todos</option>
            ${STATUS_OPTIONS.map(s=>`<option ${state.statusFilter===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <select id="sort" class="input">
            <option value="updatedAt" ${state.sort==='updatedAt'?'selected':''}>Ordenar: Última atualização</option>
            <option value="createdAt" ${state.sort==='createdAt'?'selected':''}>Ordenar: Data de cadastro</option>
            <option value="name" ${state.sort==='name'?'selected':''}>Ordenar: Nome</option>
            <option value="status" ${state.sort==='status'?'selected':''}>Ordenar: Status</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Nome</th><th>Telefone</th><th>Cidade</th><th>Status</th><th>Última atualização</th>
            </tr></thead>
            <tbody>
              ${filtered.length===0 ? '<tr><td class="empty-row" colspan="5">Nenhum cliente encontrado.</td></tr>' :
                filtered.map(c=>`<tr>
                  <td><a href="#/clientes/${c.id}" style="color:var(--primary);font-weight:500">${escapeHtml(c.name)}</a></td>
                  <td>${escapeHtml(c.phone)}</td>
                  <td>${escapeHtml(c.city)}</td>
                  <td>${badge(c.status)}</td>
                  <td class="muted">${formatDate(c.updatedAt)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#q').addEventListener('input', e=>{ state.q=e.target.value; renderList(); $('#q').focus(); });
    $('#statusFilter').addEventListener('change', e=>{ state.statusFilter=e.target.value; renderList(); });
    $('#sort').addEventListener('change', e=>{ state.sort=e.target.value; renderList(); });
    $('#csv-btn').addEventListener('click', ()=>{
      const csv = toCSV(filtered);
      const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `clientes_asl_${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  // ---- Detail ----
  function emptyClient(){
    const now = new Date().toISOString();
    return { id:uid(), name:'', phone:'', email:'', city:'', status:'Prospecto',
      createdAt:now, updatedAt:now, observations:'', followUpDate:'', history:[] };
  }

  function renderDetail(id){
    document.title = 'Cliente — ASL Management';
    const isNew = id==='novo';
    let client = isNew ? emptyClient() : getClient(id);
    if(!client){
      app.innerHTML = `<div class="container"><p class="muted">Cliente não encontrado.</p>
        <button class="btn-link" onclick="location.hash='#/clientes'">Voltar</button></div>`;
      return;
    }
    // local editable copy
    const draft = JSON.parse(JSON.stringify(client));

    function view(){
      app.innerHTML = `
      <div class="container-sm">
        <div class="row">
          <div>
            <a href="#/clientes" class="small" style="text-decoration:none">← Clientes</a>
            <h1 class="page-title" style="margin-top:4px">${isNew?'Novo Cliente':escapeHtml(draft.name||'Sem nome')}</h1>
          </div>
          <div class="flex">
            ${!isNew?'<button id="del-btn" class="btn btn-danger">Excluir</button>':''}
            <button id="save-btn" class="btn btn-primary">Salvar</button>
          </div>
        </div>

        <section class="card">
          <div class="grid-2">
            ${field('name','Nome completo *',`<input class="input" id="f-name" value="${escapeHtml(draft.name)}">`)}
            ${field('phone','Telefone *',`<input class="input" id="f-phone" value="${escapeHtml(draft.phone)}">`)}
            ${field('email','E-mail (opcional)',`<input type="email" class="input" id="f-email" value="${escapeHtml(draft.email||'')}">`)}
            ${field('city','Cidade *',`<input class="input" id="f-city" value="${escapeHtml(draft.city)}">`)}
            ${field('status','Status',`<select class="input" id="f-status">${STATUS_OPTIONS.map(s=>`<option ${s===draft.status?'selected':''}>${s}</option>`).join('')}</select>`)}
            ${field('followUpDate','Agenda de retorno',`<input type="date" class="input" id="f-followUpDate" value="${escapeHtml(draft.followUpDate||'')}">`)}
            ${field('createdAt','Data do cadastro',`<input class="input" disabled value="${formatDateTime(draft.createdAt)}" style="opacity:.7">`)}
            ${field('updatedAt','Última atualização',`<input class="input" disabled value="${formatDateTime(draft.updatedAt)}" style="opacity:.7">`)}
          </div>
        </section>

        <section class="card section">
          <h2>Observações Gerais</h2>
          <p class="small mb-2">Endereço, preferências, forma de pagamento, informações importantes.</p>
          <textarea class="input" id="f-obs" rows="4">${escapeHtml(draft.observations||'')}</textarea>
        </section>

        <section class="card section">
          <h2>Histórico de Atendimento</h2>
          <div class="flex" style="margin-bottom:16px">
            <input class="input" id="new-note" placeholder="Nova anotação..." />
            <button id="add-note" class="btn btn-primary" style="white-space:nowrap">Adicionar</button>
          </div>
          ${draft.history.length===0 ? '<p class="muted small">Nenhuma anotação registrada.</p>' :
            `<ul class="history-list">${draft.history.map(h=>`
              <li class="history-item" data-nid="${h.id}">
                <div style="min-width:0">
                  <div class="date">${formatDateTime(h.date)}</div>
                  <div class="text">${escapeHtml(h.text)}</div>
                </div>
                <button class="remove" data-remove="${h.id}">remover</button>
              </li>`).join('')}</ul>`}
        </section>
      </div>`;

      // bind
      const bind = (id,key)=>{ const el=$('#'+id); if(el) el.addEventListener('input',e=>{draft[key]=e.target.value;}); };
      bind('f-name','name'); bind('f-phone','phone'); bind('f-email','email'); bind('f-city','city');
      bind('f-followUpDate','followUpDate'); bind('f-obs','observations');
      $('#f-status').addEventListener('change',e=>{draft.status=e.target.value;});

      $('#save-btn').addEventListener('click',()=>{
        if(!draft.name.trim()||!draft.phone.trim()||!draft.city.trim()){
          alert('Nome, telefone e cidade são obrigatórios.'); return;
        }
        draft.updatedAt = new Date().toISOString();
        upsertClient(draft);
        location.hash = isNew ? '#/dashboard' : '#/clientes/'+draft.id;
      });

      const delBtn = $('#del-btn');
      if(delBtn) delBtn.addEventListener('click',()=>{
        if(confirm(`Excluir o cliente "${draft.name}"? Esta ação não pode ser desfeita.`)){
          deleteClient(draft.id); location.hash='#/clientes';
        }
      });

      $('#add-note').addEventListener('click',()=>{
        const inp = $('#new-note'); const text = inp.value.trim();
        if(!text) return;
        const entry = { id:uid(), date:new Date().toISOString(), text };
        draft.history = [entry, ...draft.history];
        draft.updatedAt = new Date().toISOString();
        if(!isNew) upsertClient(draft);
        view();
      });
      $('#new-note').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); $('#add-note').click(); }});

      document.querySelectorAll('[data-remove]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          if(!confirm('Excluir esta anotação?')) return;
          const nid = btn.getAttribute('data-remove');
          draft.history = draft.history.filter(h=>h.id!==nid);
          if(!isNew) upsertClient(draft);
          view();
        });
      });
    }

    function field(id,label,inner){
      return `<label class="field"><span class="lbl">${label}</span>${inner}</label>`;
    }

    view();
  }

  // ---- Agenda ----
  function renderAgenda(){
    document.title = 'Agenda — ASL Management';
    const clients = loadClients();
    const today = new Date().toISOString().slice(0,10);
    const withFU = clients.filter(c=>c.followUpDate).sort((a,b)=>(a.followUpDate||'').localeCompare(b.followUpDate||''));
    const overdue = withFU.filter(c=>(c.followUpDate||'')<today);
    const todayList = withFU.filter(c=>c.followUpDate===today);
    const upcoming = withFU.filter(c=>(c.followUpDate||'')>today);

    const group = (title, items, cls) => `
      <section class="agenda-group">
        <h2>${title} <span class="small">(${items.length})</span></h2>
        ${items.length===0 ? '<div class="agenda-empty">Nada por aqui.</div>' :
          '<ul style="list-style:none;padding:0;margin:0">'+items.map(c=>`
            <li class="agenda-item ${cls}">
              <div style="min-width:0">
                <a href="#/clientes/${c.id}" style="font-weight:500">${escapeHtml(c.name)}</a>
                <div class="small">${escapeHtml(c.city)} · ${escapeHtml(c.phone)}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:600">${formatDate(c.followUpDate)}</div>
                ${badge(c.status)}
              </div>
            </li>`).join('')+'</ul>'}
      </section>`;

    app.innerHTML = `
      <div class="container-sm">
        <div class="row"><div>
          <h1 class="page-title">Agenda de Retorno</h1>
          <p class="subtitle">Retornos agendados para os clientes.</p>
        </div></div>
        ${group('⚠ Atrasados', overdue,'overdue')}
        ${group('📅 Hoje', todayList,'today')}
        ${group('Próximos', upcoming,'')}
      </div>`;
  }

  // ---- Start ----
  route();
})();
