// ASL Management — localStorage store
(function(global){
  const KEY = 'asl_clients_v1';
  const STATUS_OPTIONS = ['Prospecto','Em andamento','Aguardando resposta','Concluído','Cancelado'];

  function uid(){
    if(global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'id-'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  }
  function isoDaysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
  function dateInDays(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

  function seed(){
    return [
      {id:uid(),name:'João da Silva',phone:'(11) 98765-4321',email:'joao@email.com',city:'São Paulo',status:'Em andamento',
       createdAt:isoDaysAgo(5),updatedAt:isoDaysAgo(1),observations:'Prefere contato via WhatsApp. Pagamento no PIX.',followUpDate:dateInDays(2),
       history:[
         {id:uid(),date:isoDaysAgo(5),text:'Cliente solicitou orçamento para instalação elétrica.'},
         {id:uid(),date:isoDaysAgo(1),text:'Enviado orçamento por e-mail. Aguardando retorno.'}
       ]},
      {id:uid(),name:'Maria Oliveira',phone:'(21) 99876-1234',email:'maria.o@email.com',city:'Rio de Janeiro',status:'Prospecto',
       createdAt:isoDaysAgo(2),updatedAt:isoDaysAgo(2),observations:'',
       history:[{id:uid(),date:isoDaysAgo(2),text:'Primeiro contato via indicação.'}]},
      {id:uid(),name:'Carlos Pereira',phone:'(31) 98111-2233',email:'',city:'Belo Horizonte',status:'Concluído',
       createdAt:isoDaysAgo(30),updatedAt:isoDaysAgo(10),observations:'Serviço finalizado com sucesso.',
       history:[
         {id:uid(),date:isoDaysAgo(30),text:'Contrato fechado.'},
         {id:uid(),date:isoDaysAgo(10),text:'Serviço concluído e cliente satisfeito.'}
       ]},
      {id:uid(),name:'Ana Souza',phone:'(41) 99555-8877',email:'ana.souza@email.com',city:'Curitiba',status:'Aguardando resposta',
       createdAt:isoDaysAgo(7),updatedAt:isoDaysAgo(3),followUpDate:dateInDays(-1),observations:'',
       history:[
         {id:uid(),date:isoDaysAgo(7),text:'Cliente pediu proposta detalhada.'},
         {id:uid(),date:isoDaysAgo(3),text:'Proposta enviada. Aguardando resposta.'}
       ]}
    ];
  }

  function loadClients(){
    const raw = localStorage.getItem(KEY);
    if(!raw){ const s=seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    try{ return JSON.parse(raw); }catch{ return []; }
  }
  function saveClients(list){
    localStorage.setItem(KEY, JSON.stringify(list));
    global.dispatchEvent(new Event('asl-clients-changed'));
  }
  function upsertClient(c){
    const all = loadClients();
    const i = all.findIndex(x=>x.id===c.id);
    if(i>=0) all[i]=c; else all.unshift(c);
    saveClients(all);
  }
  function deleteClient(id){ saveClients(loadClients().filter(c=>c.id!==id)); }
  function getClient(id){ return loadClients().find(c=>c.id===id); }

  function formatDateTime(iso){ return new Date(iso).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}); }
  function formatDate(iso){ return new Date(iso).toLocaleDateString('pt-BR'); }

  function toCSV(clients){
    const header=['Nome','Telefone','Email','Cidade','Status','Cadastro','Atualização','Retorno','Observações'];
    const rows=clients.map(c=>[c.name,c.phone,c.email||'',c.city,c.status,formatDate(c.createdAt),formatDate(c.updatedAt),
      c.followUpDate?formatDate(c.followUpDate):'',(c.observations||'').replace(/\n/g,' ')]);
    const esc=v=>'"'+String(v).replace(/"/g,'""')+'"';
    return [header,...rows].map(r=>r.map(esc).join(';')).join('\n');
  }

  global.ASL = { STATUS_OPTIONS, uid, loadClients, saveClients, upsertClient, deleteClient, getClient, formatDate, formatDateTime, toCSV };
})(window);
