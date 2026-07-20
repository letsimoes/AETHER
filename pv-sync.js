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
    },

    buscarEventosAtivos: function () {
      return prontoPromise.then(function (client) {
        if (!client) return [];
        return client.from('pv_eventos_jornada').select('*').eq('excluido', false).then(function (resp) {
          return resp.data || [];
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao buscar eventos do Supabase', err);
        return [];
      });
    },

    criarEvento: function (dados, quem) {
      return prontoPromise.then(function (client) {
        if (!client) return false;
        return client.from('pv_eventos_jornada').insert({
          evento_id: dados.evento_id,
          cluster: dados.cluster,
          concessao: dados.concessao,
          equipamento: dados.equipamento,
          inicio_ocorrencia: dados.inicio_ocorrencia,
          fim_ocorrencia: dados.fim_ocorrencia,
          minutos: dados.minutos,
          descritivo: dados.descritivo,
          pv_calculada: dados.pv_calculada,
          pv_apurada: dados.pv_apurada,
          coluna: dados.coluna,
          contabilizacoes: dados.contabilizacoes,
          liquidacoes: dados.liquidacoes,
          historico: dados.historico,
          criado_por: quem,
          atualizado_por: quem
        }).then(function (resp) {
          if (resp.error) throw resp.error;
          return true;
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao criar evento no Supabase', err);
        return false;
      });
    },

    atualizarEvento: function (eventoId, dados, quem) {
      return prontoPromise.then(function (client) {
        if (!client) return false;
        return client.from('pv_eventos_jornada').update({
          cluster: dados.cluster,
          concessao: dados.concessao,
          equipamento: dados.equipamento,
          inicio_ocorrencia: dados.inicio_ocorrencia,
          fim_ocorrencia: dados.fim_ocorrencia,
          minutos: dados.minutos,
          descritivo: dados.descritivo,
          pv_calculada: dados.pv_calculada,
          pv_apurada: dados.pv_apurada,
          coluna: dados.coluna,
          contabilizacoes: dados.contabilizacoes,
          liquidacoes: dados.liquidacoes,
          historico: dados.historico,
          atualizado_por: quem,
          atualizado_em: new Date().toISOString()
        }).eq('evento_id', eventoId).then(function (resp) {
          if (resp.error) throw resp.error;
          return true;
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao atualizar evento no Supabase', err);
        return false;
      });
    },

    excluirEvento: function (eventoId, quem) {
      return prontoPromise.then(function (client) {
        if (!client) return false;
        return client.from('pv_eventos_jornada').update({
          excluido: true,
          excluido_por: quem,
          excluido_em: new Date().toISOString()
        }).eq('evento_id', eventoId).then(function (resp) {
          if (resp.error) throw resp.error;
          return true;
        });
      }).catch(function (err) {
        console.warn('AetherPV: falha ao excluir evento no Supabase', err);
        return false;
      });
    }
  };
})();
