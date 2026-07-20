/* AETHER · Sincronização de classificações PV com Supabase
   Arquivo estático — NÃO é gerado nem sobrescrito pelo gerar_gestaopv.py.
   Não trava a página: se o Supabase falhar, tudo continua funcionando com
   localStorage/planilha, exatamente como funcionava antes desta integração.
*/
(function () {
  var SUPABASE_URL = 'https://xlsjxbjoqyzzdrlwlvxc.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Q4s73RBDEUmBpxyO1h8qGw_ayQOyw4M';

  var prontoPromise = new Promise(function (resolve) {
    if (window.supabase) { resolve(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = resolve;
    s.onerror = resolve;
    document.head.appendChild(s);
  }).then(function () {
    if (!window.supabase) return null;
    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return client.auth.getSession().then(function (resp) {
      var session = resp.data && resp.data.session;
      window.AetherPV.usuarioEmail = session ? session.user.email : null;
      return client;
    });
  }).catch(function () {
    return null;
  });

  window.AetherPV = {
    usuarioEmail: null,

    usuarioAtual: function () {
      return prontoPromise.then(function () {
        return window.AetherPV.usuarioEmail;
      });
    },

    buscarAtual: function () {
      return prontoPromise.then(function (client) {
        if (!client) return {};
        return client.from('pv_classificacoes_atual').select('*').then(function (resp) {
          var out = {};
          (resp.data || []).forEach(function (row) {
            out[row.evento_id] = {
              equip: row.equip,
              tipoDesligamento: row.tipo_desligamento,
              origem: row.origem,
              causa: row.causa,
              falta: row.falta,
              tipoRestabelecimento: row.tipo_restabelecimento,
              tipoProtecao: row.tipo_protecao,
              tipoAtuacao: row.tipo_atuacao,
              religDesempenho: row.relig_desempenho,
              religEficacia: row.relig_eficacia,
              validado: row.validado,
              por: row.por,
              em: row.validado_em
            };
          });
          return out;
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao buscar classificações do Supabase', err);
        return {};
      });
    },

    salvar: function (eventoId, dados, email, nome) {
      return prontoPromise.then(function (client) {
        if (!client) return false;
        return client.from('pv_classificacoes_log').insert({
          evento_id: eventoId,
          equip: dados.equip,
          tipo_desligamento: dados.tipoDesligamento,
          origem_falta: dados.origem,
          causa_primaria: dados.causa,
          tipo_falta: dados.falta,
          tipo_restabelecimento: dados.tipoRestabelecimento,
          tipo_protecao: dados.tipoProtecao,
          tipo_atuacao: dados.tipoAtuacao,
          relig_desempenho: dados.religDesempenho,
          relig_eficacia: dados.religEficacia,
          validado: true,
          validado_por_email: email,
          validado_por_nome: nome,
          validado_em: new Date().toISOString()
        }).then(function (resp) {
          if (resp.error) throw resp.error;
          return true;
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao salvar classificação no Supabase', err);
        return false;
      });
    }
  };
})();
