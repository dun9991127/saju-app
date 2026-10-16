(function () {
  'use strict';
  var S = SAJU;
  var CITIES = [
    ['서울', 126.98], ['부산', 129.08], ['대구', 128.60], ['인천', 126.71], ['광주', 126.85], ['대전', 127.38], ['울산', 129.31], ['세종', 127.29],
    ['수원', 127.03], ['성남', 127.13], ['고양', 126.83], ['용인', 127.18], ['부천', 126.78], ['안산', 126.83], ['안양', 126.95], ['의정부', 127.05], ['평택', 127.11], ['파주', 126.78], ['이천', 127.44], ['여주', 127.64],
    ['춘천', 127.73], ['원주', 127.92], ['강릉', 128.88], ['속초', 128.59], ['동해', 129.11], ['삼척', 129.17], ['태백', 128.99], ['홍천', 127.89],
    ['청주', 127.49], ['충주', 127.93], ['제천', 128.19], ['단양', 128.37], ['옥천', 127.57], ['영동', 127.78],
    ['천안', 127.15], ['아산', 127.00], ['공주', 127.12], ['부여', 126.91], ['논산', 127.10], ['보령', 126.61], ['서산', 126.45], ['당진', 126.63], ['홍성', 126.66], ['예산', 126.85], ['서천', 126.69], ['금산', 127.49],
    ['전주', 127.15], ['군산', 126.74], ['익산', 126.96], ['정읍', 126.86], ['남원', 127.39], ['김제', 126.88], ['고창', 126.70], ['부안', 126.73],
    ['목포', 126.39], ['여수', 127.66], ['순천', 127.49], ['나주', 126.71], ['광양', 127.70], ['해남', 126.60], ['강진', 126.77], ['완도', 126.75], ['영광', 126.51],
    ['포항', 129.37], ['경주', 129.22], ['안동', 128.73], ['구미', 128.34], ['김천', 128.11], ['영주', 128.62], ['상주', 128.16], ['문경', 128.19], ['영천', 128.94], ['경산', 128.74], ['울진', 129.40], ['의성', 128.70],
    ['창원', 128.68], ['마산', 128.57], ['진해', 128.69], ['진주', 128.11], ['김해', 128.89], ['통영', 128.43], ['거제', 128.62], ['양산', 129.04], ['밀양', 128.75], ['사천', 128.06], ['거창', 127.91], ['남해', 127.89],
    ['제주', 126.53], ['서귀포', 126.56], ['울릉', 130.91],
    ['평양', 125.75], ['개성', 126.55], ['함흥', 127.54], ['신의주', 124.40], ['원산', 127.44],
    ['도쿄(일본)', 139.69, 540], ['오사카(일본)', 135.50, 540], ['베이징(중국)', 116.40, 480], ['상하이(중국)', 121.47, 480], ['타이베이(대만)', 121.56, 480],
    ['홍콩', 114.17, 480], ['하노이(베트남)', 105.85, 420], ['방콕(태국)', 100.50, 420], ['마닐라(필리핀)', 120.98, 480], ['싱가포르', 103.82, 480]
  ];
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  // ---------- 공통 그리기 ----------
  function gzStem(s, cls) { return '<span class="gz e' + S.STEM_EL[s] + ' ' + (cls || '') + '"><b>' + S.STEM_K[s] + '</b><i>' + S.STEM_H[s] + '</i></span>'; }
  function gzBr(b, cls) { return '<span class="gz e' + S.BR_EL[b] + ' ' + (cls || '') + '"><b>' + S.BR_K[b] + '</b><i>' + S.BR_H[b] + '</i></span>'; }
  function gzName(idx) { return S.STEM_K[idx % 10] + S.BR_K[idx % 12]; }
  function gzHan(idx) { return S.STEM_H[idx % 10] + S.BR_H[idx % 12]; }
  function elName(e) { return S.EL_K[e] + '(' + S.EL_H[e] + ')'; }
  function dots(lv) { var h = '<span class="dots" aria-hidden="true">'; for (var i = 1; i <= 5; i++) h += '<b class="' + (i <= lv ? 'f' : '') + '"></b>'; return h + '</span>'; }
  function koreaToday() { var t = new Date(Date.now() + 9 * 3600000); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // ---------- 입력 화면 ----------
  var dl = $('cities');
  dl.innerHTML = CITIES.map(function (c) { return '<option value="' + c[0] + '"></option>'; }).join('');
  function findCity(name) {
    name = (name || '').trim();
    for (var i = 0; i < CITIES.length; i++) if (CITIES[i][0] === name) return CITIES[i];
    for (i = 0; i < CITIES.length; i++) if (name && CITIES[i][0].indexOf(name.replace(/(특별시|광역시|특별자치시|특별자치도|시|군|구)$/, '')) === 0) return CITIES[i];
    return null;
  }
  function setForm(v) {
    $('f-name').value = v.name || '';
    $(v.gender === 'F' ? 'g-f' : 'g-m').checked = true;
    $(v.cal === 'lunar' ? 'c-l' : 'c-s').checked = true;
    $('f-y').value = v.y || ''; $('f-m').value = v.m || ''; $('f-d').value = v.d || '';
    $('f-leap').checked = !!v.leap;
    $('f-hh').value = v.unknownTime ? '' : (v.hh != null ? v.hh : ''); $('f-mm').value = v.unknownTime ? '' : (v.mm != null ? v.mm : '');
    $('f-unknown').checked = !!v.unknownTime; $('f-yaja').checked = !!v.yaja;
    $('f-city').value = v.city || '';
    syncForm();
  }
  function syncForm() {
    $('leap-wrap').hidden = !$('c-l').checked;
    var u = $('f-unknown').checked;
    $('f-hh').disabled = u; $('f-mm').disabled = u; $('f-yaja').disabled = u;
  }
  ['c-s', 'c-l', 'f-unknown'].forEach(function (id) { $(id).addEventListener('change', syncForm); });

  function readForm() {
    var n = function (id) { var v = $(id).value.trim(); return v === '' ? NaN : Number(v); };
    var v = {
      name: $('f-name').value.trim() || '이름 없음', gender: $('g-f').checked ? 'F' : 'M', cal: $('c-l').checked ? 'lunar' : 'solar',
      leap: $('f-leap').checked, y: n('f-y'), m: n('f-m'), d: n('f-d'), hh: n('f-hh'), mm: n('f-mm'),
      unknownTime: $('f-unknown').checked, yaja: $('f-yaja').checked, city: $('f-city').value.trim()
    };
    if (!(v.y >= 1901 && v.y <= 2049)) throw new Error('태어난 해는 1901년부터 2049년 사이로 넣어 주세요.');
    if (!(v.m >= 1 && v.m <= 12)) throw new Error('월은 1부터 12 사이 숫자로 넣어 주세요.');
    if (!(v.d >= 1 && v.d <= 31)) throw new Error('일은 1부터 31 사이 숫자로 넣어 주세요.');
    if (v.cal === 'solar') { var t = new Date(Date.UTC(v.y, v.m - 1, v.d)); if (t.getUTCDate() !== v.d) throw new Error(v.m + '월에는 ' + v.d + '일이 없습니다. 날짜를 확인해 주세요.'); }
    if (v.cal === 'lunar' && v.leap && !S.hasLeap(v.y, v.m)) throw new Error('음력 ' + v.y + '년에는 윤' + v.m + '월이 없습니다. 윤달 체크를 해제해 주세요.');
    if (!v.unknownTime) {
      if (!(v.hh >= 0 && v.hh <= 23)) throw new Error('시는 0부터 23 사이로 넣어 주세요. 모르면 "시간 모름"을 체크하세요.');
      if (isNaN(v.mm)) v.mm = 0;
      if (!(v.mm >= 0 && v.mm <= 59)) throw new Error('분은 0부터 59 사이로 넣어 주세요.');
    }
    var c = findCity(v.city);
    if (!c) { if (v.city) throw new Error('"' + v.city + '"은(는) 목록에 없는 도시입니다. 가까운 도시를 골라 주세요.'); c = CITIES[0]; }
    v.city = c[0]; v.lon = c[1]; v.tz = c[2] || 'KR';
    return v;
  }

  $('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('err');
    try {
      var v = readForm();
      var r = S.calc(v);
      err.hidden = true;
      showResult(r, v);
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  });
  $('back').addEventListener('click', function () { $('screen-result').hidden = true; $('screen-input').hidden = false; savedOpen = false; renderSaved(); window.scrollTo(0, 0); });

  function renderSaved() {
    var list = store('saju.saved') || [];
    var box = $('saved');
    if (!list.length) { box.innerHTML = ''; savedOpen = false; return; }
    var head = '<button class="btn ghost" type="button" data-toggle="1" aria-expanded="' + savedOpen + '">' + (savedOpen ? '저장된 사주 숨기기' : '저장된 사주 불러오기 (' + list.length + '명)') + '</button>';
    if (!savedOpen) { box.innerHTML = head; return; }
    box.innerHTML = head + list.map(function (v, i) {
      return '<div class="saved-item"><button class="go" type="button" data-i="' + i + '"><b>' + esc(v.name) + '</b><span class="muted small">' +
        (v.cal === 'lunar' ? '음 ' : '양 ') + v.y + '.' + pad(v.m) + '.' + pad(v.d) + (v.unknownTime ? ' 시간 모름' : ' ' + pad(v.hh) + ':' + pad(v.mm)) + ' · ' + (v.gender === 'M' ? '남' : '여') + ' · ' + esc(v.city) +
        '</span></button><button class="x" type="button" data-del="' + i + '" aria-label="' + esc(v.name) + ' 삭제">✕</button></div>';
    }).join('') + '<button class="btn ghost" type="button" data-clear="1">저장된 사주 모두 지우기</button>';
  }
  var savedOpen = false;
  $('saved').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.toggle) { savedOpen = !savedOpen; renderSaved(); return; }
    if (b.dataset.clear) { store('saju.saved', []); renderSaved(); return; }
    var list = store('saju.saved') || [];
    if (b.dataset.del != null) { list.splice(+b.dataset.del, 1); store('saju.saved', list); renderSaved(); return; }
    var v = list[+b.dataset.i]; if (!v) return;
    setForm(v);
    try { showResult(S.calc(v), v); } catch (ex) { $('err').textContent = ex.message; $('err').hidden = false; }
  });
  var current = null;
  $('save').addEventListener('click', function () {
    if (!current) return;
    var list = store('saju.saved') || [];
    var v = current.v;
    list = list.filter(function (x) { return !(x.name === v.name && x.y === v.y && x.m === v.m && x.d === v.d); });
    list.unshift(v); store('saju.saved', list.slice(0, 20));
    $('save').textContent = '저장했습니다';
    setTimeout(function () { $('save').textContent = '이 사주 저장하기'; }, 1600);
  });

  // 탭 하이라이트
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#tabs a'));
  window.addEventListener('scroll', function () {
    var on = tabs[0];
    tabs.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < 140) on = a; });
    tabs.forEach(function (a) { a.classList.toggle('on', a === on); });
  }, { passive: true });

  // ---------- 결과 ----------
  function showResult(r, v) {
    current = { r: r, v: v };
    $('screen-input').hidden = true; $('screen-result').hidden = false;
    renderProfile(r, v);
    renderWonguk(r, v);
    renderChongron(r, v);
    renderFortune(r, v);
    var t = koreaToday(); calState = { y: t.y, m: t.m, sel: null };
    renderCalendar(r);
    window.scrollTo(0, 0);
  }

  function renderProfile(r, v) {
    var D = r.cols[1];
    var nick = S.COLOR_WORD[D.s] + ' ' + S.ANIMAL[D.b];
    var L = r.lunar;
    var lines = [];
    lines.push('양력 ' + r.solar.y + '.' + pad(r.solar.m) + '.' + pad(r.solar.d) + (r.unknown ? ' (시간 모름)' : ' ' + pad(r.hh) + ':' + pad(r.mm)) + ' · ' + (v.gender === 'M' ? '남자' : '여자') + ' · ' + esc(v.city));
    if (L) lines.push('음력 ' + L.y + '.' + pad(L.m) + '.' + pad(L.d) + (L.leap ? ' (윤달)' : ' (평달)'));
    if (!r.unknown) {
      var c = r.corrMin;
      lines.push('보정 시각 ' + pad(r.local.h) + ':' + pad(r.local.mi) + ' (지역 경도 보정 ' + (c >= 0 ? '+' : '') + c + '분' + (r.offInfo.dst ? ', 서머타임 1시간 반영' : '') + (r.offInfo.off === 510 ? ', 당시 표준시 UTC+8:30 반영' : '') + ')');
    }
    $('profile').innerHTML = '<div class="nm"><h1>' + esc(v.name) + '</h1><span class="il">' + gzName(D.idx) + '일주 · ' + nick + '</span></div>' +
      lines.map(function (l) { return '<p class="muted small">' + l + '</p>'; }).join('');
  }

  // ---------- 원국 ----------
  function renderWonguk(r, v) {
    var C = r.cols, ds = r.ds, yb = C[3].b;
    var heads = ['생시', '생일', '생월', '생년'];
    var h = '<h2>사주 원국표</h2>';
    h += '<div class="scroll-x"><div class="wonguk">';
    h += '<div class="rh"></div>' + heads.map(function (x, i) { return '<div class="ch">' + x + '<small>' + TXT.pillarRole[i] + '</small></div>'; }).join('');
    function row(label, f, last) {
      h += '<div class="rh' + (last ? ' last' : '') + '">' + label + '</div>';
      C.forEach(function (c, i) { h += '<div class="' + (last ? 'last' : '') + '">' + (c ? f(c, i) : (label === '천간' || label === '지지' ? '<span class="q">?</span>' : '<span class="muted">-</span>')) + '</div>'; });
    }
    row('천간', function (c, i) { return gzStem(c.s, 'big' + (i === 1 ? ' me' : '')) + '<span class="pm">' + (c.s % 2 ? '−' : '+') + S.EL_K[S.STEM_EL[c.s]] + '</span>'; });
    row('십성', function (c, i) { return i === 1 ? '<b>일간(나)</b>' : S.TEN[S.tenGod(ds, c.s)]; });
    row('지지', function (c) { return gzBr(c.b, 'big') + '<span class="pm">' + (S.BR_MAIN[c.b] % 2 ? '−' : '+') + S.EL_K[S.BR_EL[c.b]] + '</span>'; });
    row('십성', function (c) { return S.TEN[S.tenGod(ds, S.BR_MAIN[c.b])]; });
    row('지장간', function (c) { return S.HIDDEN[c.b].map(function (s) { return '<span class="t' + S.STEM_EL[s] + '">' + S.STEM_K[s] + '</span>'; }).join(''); });
    row('12운성', function (c) { return S.STAGE[S.stage(ds, c.b)]; });
    row('12신살', function (c) { return S.SINSAL12[S.sinsal12(yb, c.b)]; });
    row('신살', function (c, i) {
      var arr = r.sinsal[i].s.map(function (x) { return x + '(간)'; }).concat(r.sinsal[i].b);
      return arr.length ? '<span class="ss">' + arr.join('<br>') + '</span>' : '<span class="muted">-</span>';
    }, true);
    h += '</div></div>';
    h += '<p class="hint">일간(테두리 표시)이 바로 나 자신입니다. 십성은 다른 글자가 나에게 어떤 의미인지, 12운성은 그 자리에서 내 기운의 세기를 뜻합니다. 12신살은 태어난 해의 지지(띠) 기준입니다. 공망: ' + r.gong.map(function (b) { return S.BR_K[b]; }).join('·') + '</p>';

    // 합충
    var rels = r.rels;
    h += '<div class="sub"><h3>글자끼리의 관계 (합·충·형)</h3>';
    if (!rels.length) h += '<p class="muted">원국 안에 눈에 띄는 합·충이 없어 기운의 흐름이 비교적 단순합니다.</p>';
    else h += '<div class="card"><dl class="defs">' + rels.map(function (x) {
      var cls = /충|형|원진/.test(x.kind) ? 'bad' : 'good';
      return '<div><dt><span class="chip ' + cls + '">' + x.kind.replace('지지', '지지 ').replace('천간', '천간 ') + '</span></dt><dd>' + x.text + '<br><span class="muted small">' + (TXT.rel[x.kind] || '') + '</span></dd></div>';
    }).join('') + '</dl></div>';
    h += '</div>';

    // 오행·십성
    var total = r.elCount.reduce(function (a, b) { return a + b; }, 0);
    function stat(n) { return n === 0 ? '부족' : n === 1 ? '적정' : n === 2 ? '발달' : '과다'; }
    h += '<div class="sub"><h3>오행과 십성 분석</h3><div class="two">';
    h += '<div class="card"><div class="bars">' + [0, 1, 2, 3, 4].map(function (e) {
      var p = r.elCount[e] / total * 100;
      return '<div class="bar"><span class="t' + e + '" style="font-weight:700">' + elName(e) + '</span><span class="track"><span class="fill e' + e + '" style="display:block;width:' + p + '%"></span></span><span class="v">' + p.toFixed(1) + '% ' + stat(r.elCount[e]) + '</span></div>';
    }).join('') + '</div></div>';
    h += '<div class="card"><div class="bars">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (t) {
      var p = r.tenCount[t] / total * 100;
      return '<div class="bar"><span>' + S.TEN[t] + '</span><span class="track"><span class="fill" style="display:block;background:var(--accent);width:' + p + '%"></span></span><span class="v">' + (p ? p.toFixed(1) + '%' : '-') + '</span></div>';
    }).join('') + '</div></div></div>';
    h += '<div class="card">' + pentagon(r, total) + '<div class="legend"><span class="lg">생(生) 도와줌</span><span class="lc">극(剋) 눌러줌</span></div></div>';
    h += '</div>';

    // 신강신약
    var st = r.strength, LV = ['극약', '태약', '신약', '중화<br>신약', '중화<br>신강', '신강', '태강', '극왕'];
    var dk = function (lbl, ok) { return ok == null ? '<span class="chip">' + lbl + ' ?</span>' : '<span class="chip ' + (ok ? 'good' : 'bad') + '">' + lbl + (ok ? ' ○' : ' ✕') + '</span>'; };
    h += '<div class="sub"><h3>신강·신약 (내 기운의 세기)</h3><div class="card" style="display:grid;gap:12px">';
    h += '<div class="deuk">' + dk('득령', st.deuk.ryeong) + dk('득지', st.deuk.ji) + dk('득시', st.deuk.si) + dk('득세', st.deuk.se) + '</div>';
    h += '<p>' + esc(v.name) + '님은 <b>' + st.name + '</b>한 사주입니다. 나를 돕는 기운이 전체의 약 <b>' + Math.round(st.pct) + '%</b>입니다.</p>';
    h += '<div class="scale">' + LV.map(function (x, i) { return '<div class="' + (i === st.level ? 'on' : '') + '">' + x + '</div>'; }).join('') + '</div>';
    h += '<p class="hint">득령: 태어난 달이 나를 도움 · 득지: 앉은 자리(일지)가 나를 도움 · 득시: 태어난 시가 나를 도움 · 득세: 다른 글자들이 나를 많이 도움</p>';
    h += '</div></div>';

    // 용신
    h += '<div class="sub"><h3>용신 (나에게 필요한 기운)</h3><div class="card"><dl class="defs">' +
      '<div><dt>용신</dt><dd><span class="gz e' + r.yong + '">' + S.EL_K[r.yong] + '<i>' + S.EL_H[r.yong] + '</i></span> <span class="muted small">억부용신 · ' + S.TEN_GROUP[(r.yong - S.STEM_EL[r.ds] + 5) % 5] + '</span></dd></div>' +
      '<div><dt>희신(돕는 기운)</dt><dd>' + elName(r.hee) + '</dd></div>' +
      '<div><dt>기신(피할 기운)</dt><dd>' + elName(r.gi) + '</dd></div>' +
      '</dl></div></div>';

    // 대운
    var age = koreaToday().y - r.solar.y + 1;
    h += '<div class="sub"><h3>대운수 ' + r.daeun.su + ' (' + (r.daeun.forward ? '순행' : '역행') + ')</h3><p class="hint">10년마다 바뀌는 큰 운의 흐름입니다. 오른쪽이 어린 시절, 왼쪽으로 갈수록 나이가 듭니다. 지금 대운은 굵은 테두리로 표시했어요. (나이는 세는 나이 기준)</p>';
    h += '<div class="strip rev">' + r.daeun.list.map(function (d) {
      var now = age >= d.age && age < d.age + 10;
      var ev = S.evalPillar(r, d.idx);
      return '<div class="du lv' + ev.level + (now ? ' now' : '') + '" title="' + gzName(d.idx) + ' 대운"><span class="age">' + d.age + '세</span><span class="tn">' + S.TEN[S.tenGod(ds, d.idx % 10)] + '</span>' +
        gzStem(d.idx % 10) + gzBr(d.idx % 12) + '<span class="tn">' + S.TEN[S.tenGod(ds, S.BR_MAIN[d.idx % 12])] + '<br>' + S.STAGE[S.stage(ds, d.idx % 12)] + '</span>' + dots(ev.level) + '</div>';
    }).join('') + '</div></div>';
    $('sec-wonguk').innerHTML = h;
  }

  function pentagon(r, total) {
    var de = S.STEM_EL[r.ds];
    var cx = 190, cy = 178, R = 122, rc = 50;
    var pts = [];
    for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * 2 * Math.PI / 5; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    var s = '<svg class="pent" viewBox="0 0 380 370" role="img" aria-label="오행 상생 상극 관계도">';
    s += '<defs><marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--gen)"/></marker>' +
      '<marker id="ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--ctrl)"/></marker></defs>';
    function arrow(p, q, mk, col) {
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, g = rc + 6;
      return '<line x1="' + (p[0] + ux * g) + '" y1="' + (p[1] + uy * g) + '" x2="' + (q[0] - ux * g) + '" y2="' + (q[1] - uy * g) + '" stroke="' + col + '" stroke-width="2.5" marker-end="url(#' + mk + ')"/>';
    }
    for (k = 0; k < 5; k++) s += arrow(pts[k], pts[(k + 2) % 5], 'ac', 'var(--ctrl)');
    for (k = 0; k < 5; k++) s += arrow(pts[k], pts[(k + 1) % 5], 'ag', 'var(--gen)');
    for (k = 0; k < 5; k++) {
      var e = (de + k) % 5, p = pts[k], pct = r.elCount[e] / total * 100, fh = Math.min(1, pct / 50) * rc * 2;
      s += '<clipPath id="cp' + k + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + rc + '"/></clipPath>';
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + rc + '" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>';
      s += '<rect clip-path="url(#cp' + k + ')" x="' + (p[0] - rc) + '" y="' + (p[1] + rc - fh) + '" width="' + rc * 2 + '" height="' + fh + '" fill="var(--' + ['wood', 'fire', 'earth', 'metal', 'water'][e] + ')" opacity="0.55"/>';
      s += '<text class="lbl" x="' + p[0] + '" y="' + (p[1] - 6) + '" text-anchor="middle">' + S.EL_K[e] + '(' + S.TEN_GROUP[k] + ')</text>';
      s += '<text class="pc" x="' + p[0] + '" y="' + (p[1] + 18) + '" text-anchor="middle">' + pct.toFixed(1) + '%</text>';
    }
    return s + '</svg>';
  }

  // ---------- 총론 ----------
  function renderChongron(r, v) {
    var ds = r.ds, de = S.STEM_EL[ds], C = r.cols;
    var il = TXT.ilgan[ds];
    var season = ['겨울', '겨울', '봄', '봄', '봄', '여름', '여름', '여름', '가을', '가을', '가을', '겨울'][C[2].b];
    var monthHelps = r.strength.deuk.ryeong;
    var lv = r.strength.level;
    var strTxt = lv <= 2 ? TXT.strength.weak : lv >= 5 ? TXT.strength.strong : TXT.strength.mid;
    var gc = r.groupCount, top = 0;
    for (var g = 1; g < 5; g++) if (gc[g] > gc[top]) top = g;
    var missing = [0, 1, 2, 3, 4].filter(function (g) { return gc[g] === 0; });
    var spouseTen = S.tenGod(ds, S.BR_MAIN[C[1].b]);
    var SPOUSE = ['친구처럼 대등하게 지내는 관계가 잘 맞습니다.', '서로 경쟁하기보다 역할을 나누면 편안합니다.', '편안하고 다정한 가정을 꾸리는 힘이 있습니다.', '말 한마디가 관계를 좌우하니 부드럽게 표현하세요.',
      '활동적인 배우자와 인연이 있고, 함께 밖에서 보내는 시간이 활력이 됩니다.', '알뜰하고 성실한 가정을 꾸리는 복이 있습니다.', '배우자 자리에 강한 기운이 있어 서로 존중하는 것이 열쇠입니다.', '반듯하고 원칙 있는 관계로 서로 믿음을 줍니다.',
      '각자의 시간과 생각을 존중해 주면 관계가 깊어집니다.', '배우자에게 도움과 보살핌을 받는 편입니다.'];
    var JOB = ['독립적인 일, 팀을 이끄는 일, 사람과 함께 땀 흘리는 일', '교육·강의·영업·기획·요리·예술처럼 재능을 보여 주는 일', '사업·장사·금융·유통처럼 돈이 오가는 일', '공직·대기업·관리직처럼 체계 안에서 책임지는 일', '연구·교육·상담·문서·자격증 기반 전문직'];

    var good = il.good.slice();
    good.push(TXT.group[top].name + '(' + TXT.group[top].what + ') 기운이 가장 강해 ' + TXT.group[top].more.split('. ')[0] + '.');
    var nice = ['천을귀인', '문창귀인', '태극귀인', '암록', '문곡귀인', '관귀학관'];
    var present = {};
    r.sinsal.forEach(function (x) { x.s.concat(x.b).forEach(function (n) { present[n] = true; }); });
    nice.forEach(function (n) { if (present[n]) good.push(n + ': ' + TXT.sinsal[n]); });

    var bad = il.bad.slice();
    var more = TXT.group[top].more.split('. ').slice(1).join('. ');
    if (more) bad.push(more.replace(/^다만\s*/, '').replace(/\.?$/, '.'));
    var health = [];
    [0, 1, 2, 3, 4].forEach(function (e) {
      if (r.elCount[e] >= 3) health.push('<b>' + elName(e) + ' 과다</b>: ' + TXT.elMore[e]);
      if (r.elCount[e] === 0 && !r.unknown) health.push('<b>' + elName(e) + ' 없음</b>: ' + TXT.elLess[e]);
      else if (r.elCount[e] === 0) health.push('<b>' + elName(e) + ' 없음(시간 제외)</b>: ' + TXT.elLess[e]);
    });

    var money = gc[2] === 0 ? '사주에 재성(돈의 별)이 드러나 있지 않아 돈이 저절로 모이기보다 관리하는 습관에서 재물이 생깁니다. 자동 저축, 정해진 지출 한도를 만들어 두세요.' :
      (lv <= 2 && gc[2] >= 2) ? '돈 기운은 있지만 내 힘이 약해 큰 돈을 한 번에 쥐면 감당이 어려울 수 있습니다. 지킬 수 있는 만큼, 꾸준히 쌓는 방식이 맞습니다.' :
      lv >= 5 ? '내 힘이 강해 스스로 돈을 벌어들이는 힘이 있습니다. 적극적으로 기회를 잡되 지출 관리만 챙기세요.' :
      '꾸준히 일한 만큼 재물이 따라오는 구조입니다. 무리한 투자보다 안정적인 흐름을 유지하세요.';
    var Ly = TXT.lucky[r.yong];

    var h = '<h2>사주 총론</h2>';
    h += '<div class="callout"><p class="lead"><b>' + esc(v.name) + '님은 ' + season + '에 태어난 ' + S.STEM_K[ds] + S.EL_K[de] + '(' + S.STEM_H[ds] + S.EL_H[de] + '), 즉 "' + il.img + '"의 기운을 타고났습니다.</b></p>' +
      '<p style="margin-top:6px">' + il.nature + ' ' + (monthHelps ? '태어난 계절이 나를 도와 기본 체력과 자신감이 든든한 편입니다.' : '태어난 계절이 나를 직접 돕지는 않아, 주변의 도움과 환경을 잘 활용할수록 크게 성장합니다.') + '</p>' +
      '<div class="chips" style="margin-top:10px"><span class="chip acc">' + gzName(C[1].idx) + '일주</span><span class="chip acc">' + r.strength.name + '</span><span class="chip acc">용신 ' + elName(r.yong) + '</span><span class="chip acc">강한 기운 ' + TXT.group[top].name + '</span></div></div>';

    h += '<div class="card"><h3>타고난 기운의 크기</h3><p style="margin-top:6px">' + strTxt + '</p></div>';
    h += '<div class="two"><div class="card"><h3 style="color:var(--good)">장점·살릴 점</h3><ul class="list" style="margin-top:8px">' + good.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="card"><h3 style="color:var(--bad)">주의할 점</h3><ul class="list" style="margin-top:8px">' + bad.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';

    h += '<div class="card"><h3>생활 속 풀이</h3><dl class="defs" style="margin-top:10px">' +
      '<div><dt>일·직업</dt><dd>' + JOB[top] + '에서 실력이 잘 드러납니다.' + (missing.indexOf(3) >= 0 ? ' 관성(규칙·조직)이 없어 자유롭게 일하는 환경이 더 맞습니다.' : '') + '</dd></div>' +
      '<div><dt>재물</dt><dd>' + money + '</dd></div>' +
      '<div><dt>배우자·가정</dt><dd>배우자 자리(일지)에 ' + S.TEN[spouseTen] + '이(가) 있습니다. ' + SPOUSE[spouseTen] + '</dd></div>' +
      '<div><dt>사람 관계</dt><dd>' + (gc[0] >= 3 ? '주변에 사람이 많고 의리가 있지만, 돈 거래는 분명하게 하세요.' : gc[0] <= 1 ? '넓은 관계보다 믿을 만한 몇 사람과 깊게 지내는 편이 좋습니다. 좋은 동료를 곁에 두는 것이 큰 힘이 됩니다.' : '사람 관계의 균형이 좋습니다. 먼저 손 내미는 쪽이 복을 받습니다.') + '</dd></div>' +
      (missing.length ? '<div><dt>채우면 좋은 것</dt><dd>' + missing.map(function (g) { return '<b>' + TXT.group[g].name + '</b>: ' + TXT.group[g].less; }).join('<br>') + '</dd></div>' : '') +
      '</dl></div>';

    if (health.length) h += '<div class="card"><h3>건강 포인트</h3><ul class="list" style="margin-top:8px">' + health.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';

    h += '<div class="card"><h3>운을 부르는 생활 습관 (용신 ' + elName(r.yong) + ')</h3><dl class="defs" style="margin-top:10px">' +
      '<div><dt>좋은 색</dt><dd>' + Ly.color + '</dd></div><div><dt>좋은 방향</dt><dd>' + Ly.dir + '</dd></div><div><dt>좋은 숫자</dt><dd>' + Ly.num + '</dd></div>' +
      '<div><dt>힘이 나는 때</dt><dd>' + Ly.season + '</dd></div><div><dt>좋은 활동</dt><dd>' + Ly.act + '</dd></div><div><dt>좋은 음식</dt><dd>' + Ly.food + '</dd></div></dl></div>';

    var names = Object.keys(present);
    if (names.length) h += '<div class="card"><h3>신살과 길성</h3><dl class="defs" style="margin-top:10px">' + names.map(function (n) { return '<div><dt>' + n + '</dt><dd>' + (TXT.sinsal[n] || '') + '</dd></div>'; }).join('') + '</dl></div>';
    $('sec-chongron').innerHTML = h;
  }

  // ---------- 운세 ----------
  function fortuneCard(r, ev, label, scope) {
    var t = TXT.ten[ev.ten], tb = TXT.ten[ev.tenB];
    var good = [t.good], bad = [t.bad];
    var se = S.STEM_EL[ev.s], be = S.BR_EL[ev.b];
    if (se === r.yong || be === r.yong) good.push('나에게 필요한 ' + elName(r.yong) + ' 기운이 들어와 힘이 납니다.');
    if (se === r.gi || be === r.gi) bad.push('부담이 되는 ' + elName(r.gi) + ' 기운이 강해지니 무리하지 마세요.');
    if (scope !== 'day' && ev.tenB !== ev.ten) {
      var half = scope === 'year' ? ['상반기', '하반기'] : scope === 'daeun' ? ['앞 5년', '뒤 5년'] : ['초순', '하순'];
      good.push(half[1] + '에는 ' + tb.kw + '의 흐름: ' + tb.good);
    }
    var seen = {};
    ev.notes.forEach(function (n) { if (seen[n.text]) return; seen[n.text] = 1; (n.t === 'good' ? good : bad).push(n.text + '.'); });
    if (ev.level <= 2) bad.push(scope === 'day' ? '오늘은 중요한 약속·계약을 서두르지 마세요.' : '큰 결정은 서두르지 말고 건강과 안전을 먼저 챙기세요.');
    var kw = t.kw + (scope !== 'day' && ev.tenB !== ev.ten ? ' → ' + tb.kw : '');
    return '<div class="card fc lv' + ev.level + '">' +
      '<div class="fc-head"><div class="fc-title"><b>' + label + '</b>' + gzStem(ev.s) + gzBr(ev.b) + '</div><span class="badge">' + dots(ev.level) + TXT.levelName[ev.level] + '</span></div>' +
      '<p class="kw">' + kw + '</p>' +
      '<p class="muted small">' + S.TEN[ev.ten] + '·' + S.TEN[ev.tenB] + ' · 12운성 ' + S.STAGE[ev.stage] + '(' + TXT.stage[ev.stage] + ' 시기)</p>' +
      '<div class="gb"><div class="g"><h4>좋은 점</h4><ul>' + good.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="b"><h4>주의할 점</h4><ul>' + bad.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div></div>';
  }
  function mini(ev, top, bottom, sel, key) {
    return '<button type="button" class="mini lv' + ev.level + (sel ? ' sel' : '') + '" data-k="' + key + '"><span>' + top + '</span><span class="gz e' + S.STEM_EL[ev.s] + '">' + gzName(ev.idx) + '</span>' + dots(ev.level) + '<span class="muted">' + bottom + '</span></button>';
  }
  function lvOf(score) { return score >= 2.5 ? 5 : score >= 1 ? 4 : score >= -1.2 ? 3 : score >= -3 ? 2 : 1; }
  function weekCard(r, wk) {
    var lv = lvOf(wk.avg);
    var sorted = wk.days.slice().sort(function (a, b) { return b.ev.score - a.ev.score; });
    var best = sorted.filter(function (x) { return x.ev.level >= 4; }).slice(0, 2);
    var worst = sorted.slice().reverse().filter(function (x) { return x.ev.level <= 2; }).slice(0, 2);
    var nGood = wk.days.filter(function (x) { return x.ev.level >= 4; }).length, nBad = wk.days.filter(function (x) { return x.ev.level <= 2; }).length;
    var dl = function (x) { return x.d.m + '/' + x.d.d + '(' + WD[x.d.w] + ') ' + gzName(x.ev.idx) + '일'; };
    var good = best.map(function (x) { return '<b>' + dl(x) + '</b>: ' + TXT.ten[x.ev.ten].kw + ' · ' + TXT.ten[x.ev.ten].good; });
    if (!good.length) good.push('크게 튀는 날 없이 고른 한 주입니다. 하던 일을 꾸준히 이어 가기 좋습니다.');
    var bad = worst.map(function (x) {
      var n = x.ev.notes.filter(function (k) { return k.t === 'bad'; })[0];
      return '<b>' + dl(x) + '</b>: ' + (n ? n.text + '.' : TXT.ten[x.ev.ten].bad);
    });
    if (!bad.length) bad.push('특별히 조심할 날은 없습니다. 무리한 일정만 피하세요.');
    var tip = best.length ? '중요한 약속·계약·결정은 ' + best.map(function (x) { return x.d.m + '/' + x.d.d + '(' + WD[x.d.w] + ')'; }).join(', ') + '에 잡으세요.' : '중요한 일은 미리 준비해 두고 차분히 진행하세요.';
    if (worst.length) tip += ' ' + worst.map(function (x) { return x.d.m + '/' + x.d.d + '(' + WD[x.d.w] + ')'; }).join(', ') + '에는 휴식과 정리를 하세요.';
    var mt = TXT.ten[S.tenGod(r.ds, wk.monthIdx % 10)];
    return '<div class="card fc lv' + lv + '">' +
      '<div class="fc-head"><div class="fc-title"><b>' + wk.label + '</b></div><span class="badge">' + dots(lv) + TXT.levelName[lv] + '</span></div>' +
      '<p class="kw">좋은 날 ' + nGood + '일 · 조심할 날 ' + nBad + '일</p>' +
      '<div class="week7">' + wk.days.map(function (x) {
        return '<div class="lv' + x.ev.level + (x.today ? ' today' : '') + '"><span>' + WD[x.d.w] + '</span><b>' + x.d.d + '</b><span class="gz e' + S.STEM_EL[x.ev.s] + '">' + gzName(x.ev.idx) + '</span>' + dots(x.ev.level) + '</div>';
      }).join('') + '</div>' +
      '<p class="muted small">이번 주 바탕 흐름: ' + gzName(wk.monthIdx) + '월의 ' + mt.kw + '</p>' +
      '<div class="gb"><div class="g"><h4>좋은 날</h4><ul>' + good.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="b"><h4>조심할 날</h4><ul>' + bad.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="callout small"><b>이번 주 활용법</b> ' + tip + '</div></div>';
  }
  function renderFortune(r, v) {
    var T = koreaToday();
    var e0 = S.epochDay(T.y, T.m, T.d);
    var days = [], weeks = [], months = [], years = [];
    for (var i = 0; i < 7; i++) {
      var d = S.fromEpochDay(e0 + i);
      days.push({ d: d, ev: S.evalPillar(r, S.dayIdx(d.y, d.m, d.d)), label: d.m + '월 ' + d.d + '일 (' + WD[d.w] + ')' + (i === 0 ? ' 오늘' : i === 1 ? ' 내일' : '') });
    }
    var w0 = S.fromEpochDay(e0).w, mon = e0 - ((w0 + 6) % 7);
    for (i = 0; i < 8; i++) {
      var ds = [], sum = 0;
      for (var k = 0; k < 7; k++) {
        var dd = S.fromEpochDay(mon + i * 7 + k), ev = S.evalPillar(r, S.dayIdx(dd.y, dd.m, dd.d));
        ds.push({ d: dd, ev: ev, today: mon + i * 7 + k === e0 }); sum += ev.score;
      }
      var a = ds[0].d, z = ds[6].d, mid = ds[3].d;
      weeks.push({ days: ds, avg: sum / 7, monthIdx: S.monthIdxForDate(mid.y, mid.m, mid.d),
        label: (i === 0 ? '이번 주 ' : i === 1 ? '다음 주 ' : '') + a.m + '월 ' + a.d + '일(월) ~ ' + (z.m !== a.m ? z.m + '월 ' : '') + z.d + '일(일)', short: a.m + '/' + a.d + '~' });
    }
    for (i = 0; i < 12; i++) {
      var mm = (T.m - 1 + i) % 12 + 1, yy = T.y + Math.floor((T.m - 1 + i) / 12);
      var idx = S.monthIdxForDate(yy, mm, 15);
      var tm = S.termsOf(yy), jeol = tm ? new Date(tm[(mm - 1) * 2] + 9 * 3600000) : null;
      months.push({ y: yy, m: mm, ev: S.evalPillar(r, idx), label: yy + '년 ' + mm + '월', sub: jeol ? S.TERM_NAMES[(mm - 1) * 2] + ' ' + (jeol.getUTCMonth() + 1) + '/' + jeol.getUTCDate() + '부터' : '' });
    }
    for (i = 0; i < 10; i++) { var Y = T.y + i; years.push({ y: Y, ev: S.evalPillar(r, S.yearIdxForYear(Y)), label: Y + '년 ' + gzName(S.yearIdxForYear(Y)) + '년' }); }
    var age = T.y - r.solar.y + 1, cur = null;
    r.daeun.list.forEach(function (d) { if (age >= d.age && age < d.age + 10) cur = d; });

    var h = '<h2>앞으로의 기운</h2><p class="muted">일간 → 주간 → 월간 → 연간 → 대운 순서입니다. 점 5개가 많이 채워질수록 나에게 좋은 기운이고, 작은 칸을 누르면 그 기간의 풀이로 바뀝니다.</p>';
    h += '<div class="chips jump"><a class="chip acc" href="#f-day">일간</a><a class="chip acc" href="#f-week">주간</a><a class="chip acc" href="#f-month">월간</a><a class="chip acc" href="#f-year">연간</a>' + (cur ? '<a class="chip acc" href="#f-daeun">대운</a>' : '') + '</div>';
    h += '<div class="sub" id="f-day"><h3>① 일간 운세 · 오늘과 앞으로 7일</h3><div id="fc-day"></div><div class="strip" id="st-day">' +
      days.map(function (x, i) { return mini(x.ev, x.d.m + '/' + x.d.d + ' ' + WD[x.d.w], i === 0 ? '오늘' : i === 1 ? '내일' : TXT.levelName[x.ev.level], i === 0, 'day' + i); }).join('') + '</div></div>';
    h += '<div class="sub" id="f-week"><h3>② 주간 운세 · 이번 주와 앞으로 8주</h3><div id="fc-week"></div><div class="strip" id="st-week">' +
      weeks.map(function (x, i) { var lv = lvOf(x.avg); return '<button type="button" class="mini lv' + lv + (i === 0 ? ' sel' : '') + '" data-k="week' + i + '"><span>' + (i === 0 ? '이번 주' : i === 1 ? '다음 주' : x.short) + '</span>' + dots(lv) + '<span class="muted">' + TXT.levelName[lv] + '</span></button>'; }).join('') + '</div></div>';
    h += '<div class="sub" id="f-month"><h3>③ 월간 운세 · 이번 달과 앞으로 12개월</h3><div id="fc-month"></div><div class="strip" id="st-month">' +
      months.map(function (x, i) { return mini(x.ev, x.m + '월', x.sub ? x.sub.split(' ')[0] : '', i === 0, 'month' + i); }).join('') + '</div></div>';
    h += '<div class="sub" id="f-year"><h3>④ 연간 운세 · 올해와 앞으로 10년</h3><div id="fc-year"></div><div class="strip" id="st-year">' +
      years.map(function (x, i) { return mini(x.ev, x.y + '년', TXT.levelName[x.ev.level], i === 0, 'year' + i); }).join('') + '</div></div>';
    if (cur) h += '<div class="sub" id="f-daeun"><h3>⑤ 대운 · 지금의 10년</h3>' + fortuneCard(r, S.evalPillar(r, cur.idx), cur.age + '~' + (cur.age + 9) + '세', 'daeun') + '</div>';
    $('sec-fortune').innerHTML = h;
    var data = { day: days, week: weeks, month: months, year: years };
    function show(kind, i) {
      var x = data[kind][i];
      if (kind === 'week') $('fc-week').innerHTML = weekCard(r, x);
      else $('fc-' + kind).innerHTML = fortuneCard(r, x.ev, kind === 'month' ? x.label + (x.sub ? ' <span class="muted small">(' + x.sub + ')</span>' : '') : x.label, kind);
      Array.prototype.forEach.call($('st-' + kind).children, function (b, j) { b.classList.toggle('sel', j === i); });
    }
    ['day', 'week', 'month', 'year'].forEach(function (k) {
      show(k, 0);
      $('st-' + k).addEventListener('click', function (e) { var b = e.target.closest('.mini'); if (!b) return; show(k, +b.dataset.k.replace(k, '')); });
    });
  }

  // ---------- 달력 ----------
  var calState = null;
  function renderCalendar(r) {
    var y = calState.y, m = calState.m, T = koreaToday();
    var first = S.epochDay(y, m, 1), w0 = S.fromEpochDay(first).w;
    var ndays = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var yi = S.yearIdxForYear(y), m1 = S.monthIdxForDate(y, m, 1), m2 = S.monthIdxForDate(y, m, ndays);
    var h = '<h2>일진 달력</h2>';
    h += '<div class="calnav"><button type="button" id="cal-prev" aria-label="이전 달">‹</button><div style="text-align:center"><h3>' + y + '년 ' + m + '월</h3><p class="muted small">' + gzName(yi) + '년 ' + gzName(m1) + (m1 !== m2 ? '~' + gzName(m2) : '') + '월</p></div><button type="button" id="cal-next" aria-label="다음 달">›</button></div>';
    h += '<div class="cal-legend"><span><i style="background:var(--good)"></i>좋은 날</span><span><i style="background:var(--line)"></i>무난한 날</span><span><i style="background:var(--bad)"></i>조심할 날</span></div>';
    h += '<div class="cal">' + WD.map(function (x, i) { return '<div class="wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '') + '">' + x + '</div>'; }).join('');
    for (var i = 0; i < w0; i++) h += '<div></div>';
    for (var d = 1; d <= ndays; d++) {
      var di = S.dayIdx(y, m, d), ev = S.evalPillar(r, di), lu = S.solarToLunar(y, m, d), tm = S.termOnDate(y, m, d);
      var wd = (w0 + d - 1) % 7;
      var isToday = y === T.y && m === T.m && d === T.d;
      h += '<button type="button" class="cell lv' + ev.level + (wd === 0 ? ' sun' : wd === 6 ? ' sat' : '') + (isToday ? ' today' : '') + (calState.sel === d ? ' sel' : '') + '" data-d="' + d + '">' +
        '<span class="dn">' + d + '<span class="dot"></span></span><span class="ij">' + gzName(di) + '</span>' +
        (lu ? '<span class="lu">음 ' + (lu.leap ? '윤' : '') + lu.m + '.' + lu.d + '</span>' : '') + (tm ? '<span class="tm">' + tm.name + '</span>' : '') + '</button>';
    }
    h += '</div><div id="cal-detail"></div>';
    $('sec-cal').innerHTML = h;
    $('cal-prev').onclick = function () { calState.m--; if (calState.m < 1) { calState.m = 12; calState.y--; } calState.sel = null; renderCalendar(r); };
    $('cal-next').onclick = function () { calState.m++; if (calState.m > 12) { calState.m = 1; calState.y++; } calState.sel = null; renderCalendar(r); };
    $('sec-cal').querySelector('.cal').addEventListener('click', function (e) {
      var b = e.target.closest('.cell'); if (!b) return;
      calState.sel = +b.dataset.d;
      Array.prototype.forEach.call(this.querySelectorAll('.cell'), function (c) { c.classList.toggle('sel', c === b); });
      showDay(r, y, m, calState.sel);
    });
    if (calState.sel) showDay(r, y, m, calState.sel);
  }
  function showDay(r, y, m, d) {
    var w = S.fromEpochDay(S.epochDay(y, m, d)).w, tm = S.termOnDate(y, m, d), lu = S.solarToLunar(y, m, d);
    var label = y + '년 ' + m + '월 ' + d + '일 (' + WD[w] + ')' + (lu ? ' <span class="muted small">음력 ' + (lu.leap ? '윤' : '') + lu.m + '월 ' + lu.d + '일' + (tm ? ' · ' + tm.name + ' ' + pad(tm.hh) + ':' + pad(tm.mm) : '') + '</span>' : '');
    $('cal-detail').innerHTML = '<div style="margin-top:12px">' + fortuneCard(r, S.evalPillar(r, S.dayIdx(y, m, d)), label, 'day') + '</div>';
  }

  // ---------- 시작 ----------
  // 앱을 열 때마다 빈 입력창으로 시작 (예전 버전이 남긴 마지막 입력값도 지움)
  try { localStorage.removeItem('saju.last'); } catch (e) { }
  setForm({ gender: 'M', cal: 'solar', city: '' });
  $('f-clear').addEventListener('click', function () { setForm({ gender: 'M', cal: 'solar', city: '' }); $('err').hidden = true; $('f-name').focus(); });
  $('f-sample').addEventListener('click', function () { setForm({ name: '예시', gender: 'F', cal: 'solar', y: 1985, m: 5, d: 15, hh: 10, mm: 30, city: '서울' }); $('form').requestSubmit(); });
  renderSaved();
  if (window.SAJU_AUTORUN) $('form').requestSubmit();
})();
