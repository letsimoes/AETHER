/* AETHER · Acesso Microsoft 365 via Supabase Auth
   Arquivo estático — NÃO é gerado nem sobrescrito pelos scripts gerar_*.py.
   Para travar qualquer página nova com este mesmo login, basta adicionar,
   o mais cedo possível dentro do <head>:
     <script src="auth.js"></script>
*/
(function () {
  document.documentElement.style.visibility = 'hidden';

  var SUPABASE_URL = 'https://xlsjxbjoqyzzdrlwlvxc.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Q4s73RBDEUmBpxyO1h8qGw_ayQOyw4M';

  function carregarSdk(callback) {
    if (window.supabase) { callback(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = callback;
    s.onerror = function () {
      document.documentElement.style.visibility = 'visible';
      document.body.innerHTML = telaBase(
        '<div style="font-size:13px;color:#94a3b8;letter-spacing:2px;margin-bottom:24px;">AETHER · HRZ ENERGIA</div>' +
        '<div style="font-size:15px;color:#fca5a5;max-width:400px;">Não foi possível carregar o serviço de login. Verifique sua conexão e recarregue a página.</div>'
      );
    };
    document.head.appendChild(s);
  }

  function telaBase(conteudoHtml) {
    return '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#1a2744 50%,#1e293b 100%);' +
      'color:#fff;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;' +
      'text-align:center;padding:24px;">' + conteudoHtml + '</div>';
  }

  function mostrarTelaLogin(supabaseClient, erro) {
    document.body.innerHTML = telaBase(
      '<div style="font-size:13px;color:#94a3b8;letter-spacing:2px;margin-bottom:24px;">AETHER · HRZ ENERGIA</div>' +
      '<div style="font-size:28px;font-weight:800;margin-bottom:12px;">Acesso restrito</div>' +
      '<div style="font-size:14px;color:#94a3b8;margin-bottom:36px;">Entre com sua conta corporativa Microsoft para continuar.</div>' +
      '<button id="btnEntrarMs" style="display:flex;align-items:center;gap:10px;padding:14px 28px;' +
      'background:#fff;color:#1e293b;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">' +
      'Entrar com Microsoft</button>' +
      '<div id="loginErro" style="margin-top:20px;font-size:13px;color:#fca5a5;max-width:360px;"></div>'
    );
    document.documentElement.style.visibility = 'visible';

    if (erro) {
      document.getElementById('loginErro').textContent = 'Não foi possível entrar: ' + erro;
    }

    document.getElementById('btnEntrarMs').addEventListener('click', function () {
      supabaseClient.auth.signInWithOAuth({
        provider: 'azure',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
    });
  }

  function liberarConteudo(session) {
    window.__aetherUser = session.user;
    document.documentElement.style.visibility = 'visible';
  }

  carregarSdk(function () {
    var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.__aetherSupabase = supabaseClient;

    var params = new URLSearchParams(window.location.hash.replace('#', '?'));
    var erroUrl = params.get('error_description');

    supabaseClient.auth.getSession().then(function (resp) {
      var session = resp.data && resp.data.session;
      if (session) {
        liberarConteudo(session);
      } else {
        mostrarTelaLogin(supabaseClient, erroUrl);
      }
    });

    supabaseClient.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' && session) {
        liberarConteudo(session);
      }
      if (event === 'SIGNED_OUT') {
        mostrarTelaLogin(supabaseClient);
      }
    });
  });
})();
