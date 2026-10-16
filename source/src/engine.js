/* 사주 만세력 계산 엔진 (브라우저/Node 공용)
   - 절기: astronomy-engine으로 미리 계산한 1900~2100년 24절기 시각(UTC, 분 단위)
   - 음력: 한국천문연구원(KASI) 기준 음력 표 1900~2050년
*/
var SAJU = (function () {
  'use strict';
  var TERMS_RAW = '__TERMS__';
  var LUNAR = __LUNAR__;
  var TERM_BASE = Date.UTC(1900, 0, 1);

  var STEM_K = '갑을병정무기경신임계'.split('');
  var STEM_H = '甲乙丙丁戊己庚辛壬癸'.split('');
  var BR_K = '자축인묘진사오미신유술해'.split('');
  var BR_H = '子丑寅卯辰巳午未申酉戌亥'.split('');
  var ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  var EL_K = ['목', '화', '토', '금', '수'];
  var EL_H = ['木', '火', '土', '金', '水'];
  var STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  var BR_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  // 지지 본기(정기) 천간 — 십성 계산용
  var BR_MAIN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
  // 지장간 (여기, 중기, 정기)
  var HIDDEN = [[8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2], [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]];
  var TERM_NAMES = ['소한', '대한', '입춘', '우수', '경칩', '춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로', '추분', '한로', '상강', '입동', '소설', '대설', '동지'];
  var TEN = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  var TEN_H = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '正印'];
  var TEN_GROUP = ['비겁', '식상', '재성', '관성', '인성'];
  var STAGE = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
  var STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
  var SINSAL12 = ['겁살', '재살', '천살', '지살', '연살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살'];
  var COLOR_WORD = ['푸른', '푸른', '붉은', '붉은', '황금', '황금', '하얀', '하얀', '검은', '검은'];

  // ---------- 날짜 기본 ----------
  function epochDay(y, m, d) { return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
  function fromEpochDay(n) { var t = new Date(n * 86400000); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), w: t.getUTCDay() }; }
  function dayIdx(y, m, d) { return ((epochDay(y, m, d) + 2440588 + 49) % 60 + 60) % 60; }
  function ganzhi(i) { return { s: i % 10, b: i % 12, idx: i }; }
  function idxOf(s, b) { for (var i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i; return -1; }

  // ---------- 절기 ----------
  var termCache = null;
  function termsOf(year) {
    if (!termCache) termCache = TERMS_RAW.split(';');
    var row = termCache[year - 1900];
    if (!row) return null;
    return row.split(',').map(function (v) { return TERM_BASE + parseInt(v, 36) * 60000; });
  }
  // 주어진 순간(UTC ms) 직전/직후 '절'(월이 바뀌는 절기) 찾기
  function jeolAround(ms) {
    var y = new Date(ms).getUTCFullYear();
    var list = [];
    for (var yy = y - 1; yy <= y + 1; yy++) {
      var t = termsOf(yy); if (!t) continue;
      for (var i = 0; i < 24; i += 2) list.push({ t: t[i], i: i, y: yy });
    }
    list.sort(function (a, b) { return a.t - b.t; });
    var prev = null, next = null;
    for (var k = 0; k < list.length; k++) {
      if (list[k].t <= ms) prev = list[k]; else { next = list[k]; break; }
    }
    return { prev: prev, next: next };
  }
  function yearPillarAt(ms) {
    var y = new Date(ms + 9 * 3600000).getUTCFullYear();
    var t = termsOf(y);
    if (t && ms < t[2]) y -= 1;
    var i = ((y - 4) % 60 + 60) % 60;
    return { year: y, idx: i };
  }
  function monthPillarAt(ms) {
    var yp = yearPillarAt(ms);
    var j = jeolAround(ms).prev;
    var br = (1 + j.i / 2) % 12; // 소한→축, 입춘→인 …
    var inStem = ((yp.idx % 10) % 5 * 2 + 2) % 10;
    var st = (inStem + (br - 2 + 12) % 12) % 10;
    // 소한(축월)은 전년도 간지 기준 → yp가 이미 입춘 전이면 전년도 처리됨
    return idxOf(st, br);
  }
  // 특정 날짜(한국시간 정오)의 월주/연주
  function monthIdxForDate(y, m, d) { return monthPillarAt(Date.UTC(y, m - 1, d, 3)); }
  function yearIdxForYear(y) { return ((y - 4) % 60 + 60) % 60; }
  // 날짜에 들어있는 절기 이름 (한국시간 기준)
  function termOnDate(y, m, d) {
    var t = termsOf(y); if (!t) return null;
    for (var i = 0; i < 24; i++) {
      var k = new Date(t[i] + 9 * 3600000);
      if (k.getUTCMonth() + 1 === m && k.getUTCDate() === d) {
        return { name: TERM_NAMES[i], hh: k.getUTCHours(), mm: k.getUTCMinutes(), jeol: i % 2 === 0 };
      }
    }
    return null;
  }

  // ---------- 음력 ----------
  var lunarMonths = null;
  function buildLunar() {
    lunarMonths = [];
    var day = LUNAR.start;
    var ys = LUNAR.data.split(',');
    for (var k = 0; k < ys.length; k++) {
      var y = LUNAR.y0 + k;
      var s = ys[k];
      var leap = parseInt(s[0], 16);
      var parts = s.slice(1).split('.');
      var n = parseInt(parts[1], 10);
      var bits = parseInt(parts[0], 36).toString(2);
      while (bits.length < n) bits = '0' + bits;
      var m = 1, isLeap = false;
      for (var j = 0; j < n; j++) {
        var len = bits[j] === '1' ? 30 : 29;
        lunarMonths.push({ y: y, m: m, leap: isLeap, start: day, len: len });
        day += len;
        if (leap && m === leap && !isLeap) { isLeap = true; } else { isLeap = false; m++; }
      }
    }
  }
  function solarToLunar(y, m, d) {
    if (!lunarMonths) buildLunar();
    var e = epochDay(y, m, d);
    var lo = 0, hi = lunarMonths.length - 1;
    if (e < lunarMonths[0].start || e >= lunarMonths[hi].start + lunarMonths[hi].len) return null;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (lunarMonths[mid].start <= e) lo = mid; else hi = mid - 1; }
    var L = lunarMonths[lo];
    return { y: L.y, m: L.m, d: e - L.start + 1, leap: L.leap };
  }
  function lunarToSolar(y, m, d, leap) {
    if (!lunarMonths) buildLunar();
    for (var i = 0; i < lunarMonths.length; i++) {
      var L = lunarMonths[i];
      if (L.y === y && L.m === m && L.leap === !!leap) {
        if (d < 1 || d > L.len) return null;
        return fromEpochDay(L.start + d - 1);
      }
    }
    return null;
  }
  function hasLeap(y, m) {
    if (!lunarMonths) buildLunar();
    for (var i = 0; i < lunarMonths.length; i++) if (lunarMonths[i].y === y && lunarMonths[i].m === m && lunarMonths[i].leap) return true;
    return false;
  }

  // ---------- 한국 표준시·서머타임 이력 ----------
  var DST = [[1948, 6, 1, 1948, 9, 13], [1949, 4, 3, 1949, 9, 11], [1950, 4, 1, 1950, 9, 10], [1951, 5, 6, 1951, 9, 9],
    [1955, 5, 5, 1955, 9, 9], [1956, 5, 20, 1956, 9, 30], [1957, 5, 5, 1957, 9, 22], [1958, 5, 4, 1958, 9, 21],
    [1959, 5, 3, 1959, 9, 20], [1960, 5, 1, 1960, 9, 18], [1987, 5, 10, 1987, 10, 11], [1988, 5, 8, 1988, 10, 9]];
  function koreaOffset(y, m, d) {
    var e = epochDay(y, m, d), off = 540, dst = false;
    if ((e >= epochDay(1908, 4, 1) && e < epochDay(1912, 1, 1)) || (e >= epochDay(1954, 3, 21) && e < epochDay(1961, 8, 10))) off = 510;
    for (var i = 0; i < DST.length; i++) {
      var r = DST[i];
      if (e >= epochDay(r[0], r[1], r[2]) && e < epochDay(r[3], r[4], r[5])) { off += 60; dst = true; }
    }
    return { off: off, dst: dst };
  }

  // ---------- 관계 ----------
  function tenGod(dayStem, stem) {
    var ed = STEM_EL[dayStem], et = STEM_EL[stem], same = (dayStem % 2) === (stem % 2);
    var g;
    if (et === ed) g = 0; else if ((ed + 1) % 5 === et) g = 1; else if ((ed + 2) % 5 === et) g = 2; else if ((et + 2) % 5 === ed) g = 3; else g = 4;
    return g * 2 + (same ? 0 : 1);
  }
  function stage(stem, br) {
    var st = STAGE_START[stem];
    return stem % 2 === 0 ? (br - st + 12) % 12 : (st - br + 12) % 12;
  }
  function sinsal12(baseBr, br) {
    var ji = [8, 5, 2, 11][baseBr % 4]; // 신자진→신, 사유축→사, 인오술→인, 해묘미→해
    var geob = (ji - 3 + 12) % 12;
    return (br - geob + 12) % 12;
  }
  var YUKHAP = { '0-1': '토', '2-11': '목', '3-10': '화', '4-9': '금', '5-8': '수', '6-7': '화' };
  function pairKey(a, b) { return Math.min(a, b) + '-' + Math.max(a, b); }
  var WONJIN = ['0-7', '1-6', '2-9', '3-8', '4-11', '5-10'];
  var HYUNG = ['2-5', '5-8', '2-8', '1-10', '7-10', '1-7', '0-3'];
  function branchRel(a, b) {
    var out = [];
    var k = pairKey(a, b);
    if (a === b) { if ([4, 6, 9, 11].indexOf(a) >= 0) out.push('자형'); return out; }
    if (YUKHAP[k]) out.push('육합');
    if ((a - b + 12) % 12 === 6) out.push('충');
    if (HYUNG.indexOf(k) >= 0) out.push('형');
    if (WONJIN.indexOf(k) >= 0) out.push('원진');
    if ((a - b + 12) % 12 === 4 || (b - a + 12) % 12 === 4) out.push('반합');
    return out;
  }
  function stemRel(a, b) {
    if (Math.abs(a - b) === 5) return '합';
    if (Math.abs(a - b) === 6 && STEM_EL[a] !== 2 && STEM_EL[b] !== 2) return '충';
    return null;
  }

  // ---------- 신살 ----------
  var CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]];
  var MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
  var TAEGEUK = [[0, 6], [0, 6], [3, 9], [3, 9], [4, 10, 1, 7], [4, 10, 1, 7], [2, 11], [2, 11], [5, 8], [5, 8]];
  var AMROK = [11, 10, 8, 7, 8, 7, 5, 4, 2, 1];
  var MUNGOK = [11, 0, 2, 3, 2, 3, 5, 6, 8, 9];
  var GWANGWI = [5, 5, 8, 8, 11, 11, 2, 2, 8, 8];
  var YANGIN = [3, 4, 6, 7, 6, 7, 9, 10, 0, 1];
  var HONGYEOM = [6, 6, 2, 7, 4, 4, 10, 9, 0, 8];
  var GOSIN = { 11: [2, 10], 0: [2, 10], 1: [2, 10], 2: [5, 1], 3: [5, 1], 4: [5, 1], 5: [8, 4], 6: [8, 4], 7: [8, 4], 8: [11, 7], 9: [11, 7], 10: [11, 7] };
  var BAEKHO = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];
  var GOEGANG = ['경진', '경술', '임진', '임술', '무술'];

  function sinsalFor(p, cols) {
    // p: 원국 {cols:[시,일,월,년]}, 각 기둥별 천간/지지 신살 목록
    var ds = cols[1].s, yb = cols[3].b, db = cols[1].b;
    var res = cols.map(function () { return { s: [], b: [] }; });
    function samhap(base, br, off) { var ji = [8, 5, 2, 11][base % 4]; return (ji + off) % 12 === br; }
    cols.forEach(function (c, i) {
      if (!c) return;
      var b = c.b, s = c.s;
      if (b != null) {
        if (CHEONEUL[ds].indexOf(b) >= 0) res[i].b.push('천을귀인');
        if (MUNCHANG[ds] === b) res[i].b.push('문창귀인');
        if (TAEGEUK[ds].indexOf(b) >= 0) res[i].b.push('태극귀인');
        if (AMROK[ds] === b) res[i].b.push('암록');
        if (MUNGOK[ds] === b) res[i].b.push('문곡귀인');
        if (GWANGWI[ds] === b) res[i].b.push('관귀학관');
        if (YANGIN[ds] === b) res[i].b.push('양인살');
        if (HONGYEOM[ds] === b) res[i].b.push('홍염살');
        if ((i !== 3 && samhap(yb, b, 6)) || (i !== 1 && samhap(db, b, 6))) res[i].b.push('역마살');
        if ((i !== 3 && samhap(yb, b, 1)) || (i !== 1 && samhap(db, b, 1))) res[i].b.push('도화살');
        if ((i !== 3 && samhap(yb, b, 8)) || (i !== 1 && samhap(db, b, 8))) res[i].b.push('화개살');
        if (i !== 3 && GOSIN[yb][0] === b) res[i].b.push('고신살');
        if (i !== 3 && GOSIN[yb][1] === b) res[i].b.push('과숙살');
        if ([3, 6, 8, 7].indexOf(b) >= 0) res[i].b.push('현침살');
      }
      if (s != null && [0, 7].indexOf(s) >= 0) res[i].s.push('현침살');
      if (s != null && b != null) {
        var nm = STEM_K[s] + BR_K[b];
        if (BAEKHO.indexOf(nm) >= 0) res[i].b.push('백호살');
        if (GOEGANG.indexOf(nm) >= 0) res[i].b.push('괴강살');
      }
    });
    return res;
  }

  // ---------- 원국 계산 ----------
  // input: {name, gender:'M'|'F', cal:'solar'|'lunar', leap, y,m,d, hh,mm, unknownTime, yaja, lon, tz:'KR'|분, noCorrection}
  function calc(inp) {
    var y = inp.y, m = inp.m, d = inp.d, lunarIn = null;
    if (inp.cal === 'lunar') {
      var sd = lunarToSolar(y, m, d, inp.leap);
      if (!sd) throw new Error('음력 날짜가 올바르지 않습니다.');
      lunarIn = { y: y, m: m, d: d, leap: !!inp.leap };
      y = sd.y; m = sd.m; d = sd.d;
    }
    var unknown = !!inp.unknownTime;
    var hh = unknown ? 12 : inp.hh, mm = unknown ? 0 : inp.mm;
    var offInfo = inp.tz === 'KR' ? koreaOffset(y, m, d) : { off: inp.tz, dst: false };
    var utcMs = Date.UTC(y, m - 1, d, hh, mm) - offInfo.off * 60000;
    var corrMin = inp.noCorrection ? 0 : Math.round(inp.lon * 4 - offInfo.off);
    var localMs = utcMs + (offInfo.off + corrMin) * 60000; // 진태양시(지방평균시)
    var L = new Date(localMs);
    var ly = L.getUTCFullYear(), lm = L.getUTCMonth() + 1, ld = L.getUTCDate(), lh = L.getUTCHours(), lmi = L.getUTCMinutes();

    var yp = yearPillarAt(utcMs);
    var mIdx = monthPillarAt(utcMs);
    var dIdxSame = dayIdx(ly, lm, ld);
    var nextE = fromEpochDay(epochDay(ly, lm, ld) + 1);
    var dIdxNext = dayIdx(nextE.y, nextE.m, nextE.d);
    var late = !unknown && lh >= 23;
    var dIdx = late && !inp.yaja ? dIdxNext : dIdxSame;
    var hIdx = null;
    if (!unknown) {
      var hb = Math.floor(((lh * 60 + lmi) + 60) / 120) % 12;
      var stemBase = late ? dIdxNext % 10 : dIdx % 10;
      var hs = ((stemBase % 5) * 2 + hb) % 10;
      hIdx = idxOf(hs, hb);
    }
    var Y = ganzhi(yp.idx), M = ganzhi(mIdx), D = ganzhi(dIdx), H = hIdx == null ? null : ganzhi(hIdx);
    var cols = [H, D, M, Y];
    var ds = D.s;

    // 대운
    var yang = Y.s % 2 === 0, male = inp.gender === 'M';
    var forward = (yang && male) || (!yang && !male);
    var ja = jeolAround(utcMs);
    var diffDays = forward ? (ja.next.t - utcMs) / 86400000 : (utcMs - ja.prev.t) / 86400000;
    var dsu = Math.max(1, Math.round(diffDays / 3));
    var daeun = [];
    for (var k = 1; k <= 10; k++) {
      var di = ((mIdx + (forward ? k : -k)) % 60 + 60) % 60;
      daeun.push({ idx: di, age: dsu + (k - 1) * 10, startYear: y + dsu + (k - 1) * 10 - 1 });
    }

    // 오행·십성 분포 (8글자, 일간 포함)
    var chars = [];
    cols.forEach(function (c, i) {
      if (!c) return;
      chars.push({ pos: i, kind: 's', el: STEM_EL[c.s], ten: i === 1 ? 0 : tenGod(ds, c.s) });
      chars.push({ pos: i, kind: 'b', el: BR_EL[c.b], ten: tenGod(ds, BR_MAIN[c.b]) });
    });
    var elCount = [0, 0, 0, 0, 0], tenCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    chars.forEach(function (c) { elCount[c.el]++; tenCount[c.ten]++; });
    var groupCount = [0, 1, 2, 3, 4].map(function (g) { return tenCount[g * 2] + tenCount[g * 2 + 1]; });

    // 신강·신약
    var dayEl = STEM_EL[ds];
    function supports(el) { return el === dayEl || (el + 1) % 5 === dayEl; }
    var W = { s3: 1, s2: 1, s0: 1, b2: 3, b1: 2, b0: 1.5, b3: 1 };
    var total = 0, sup = 0;
    cols.forEach(function (c, i) {
      if (!c) return;
      if (i !== 1) { total += W['s' + i]; if (supports(STEM_EL[c.s])) sup += W['s' + i]; }
      total += W['b' + i]; if (supports(BR_EL[c.b])) sup += W['b' + i];
    });
    var pct = sup / total * 100;
    var LEVELS = ['극약', '태약', '신약', '중화신약', '중화신강', '신강', '태강', '극왕'];
    var cut = [10, 22, 36, 50, 62, 75, 88];
    var lv = 0; while (lv < 7 && pct >= cut[lv]) lv++;
    var deuk = {
      ryeong: supports(BR_EL[M.b]),
      ji: supports(BR_EL[D.b]),
      si: H ? supports(BR_EL[H.b]) : null,
      se: (function () {
        var n = 0; [Y.s, M.s].concat(H ? [H.s] : []).forEach(function (s) { if (supports(STEM_EL[s])) n++; });
        if (supports(BR_EL[Y.b])) n++;
        return n >= 2;
      })()
    };

    // 용신 (억부)
    var elOf = function (g) { return (dayEl + [0, 1, 2, 3, 4][g] * 1 + (g === 3 ? 0 : 0)) % 5; };
    // 그룹별 오행: 비겁=일간, 식상=일간+1, 재성=+2, 관성=+3, 인성=+4
    var gEl = [0, 1, 2, 3, 4].map(function (g) { return (dayEl + g) % 5; });
    var yong;
    if (lv <= 3) {
      if (groupCount[2] >= 3 && groupCount[2] > groupCount[3]) yong = gEl[0];
      else yong = gEl[4];
    } else {
      if (groupCount[4] >= groupCount[0]) yong = gEl[2];
      else if (lv >= 6) yong = gEl[1];
      else yong = gEl[3];
    }
    var hee = (yong + 4) % 5, gi = (yong + 3) % 5, gu = (yong + 2) % 5, han = (yong + 1) % 5;

    // 합·충 (원국 내부)
    var rels = [];
    var names = ['시', '일', '월', '년'];
    for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) {
      if (!cols[a] || !cols[b]) continue;
      var sr = stemRel(cols[a].s, cols[b].s);
      if (sr) rels.push({ kind: '천간' + sr, text: names[a] + '간 ' + STEM_K[cols[a].s] + ' · ' + names[b] + '간 ' + STEM_K[cols[b].s], a: a, b: b });
      branchRel(cols[a].b, cols[b].b).forEach(function (r) {
        rels.push({ kind: '지지' + r, text: names[a] + '지 ' + BR_K[cols[a].b] + ' · ' + names[b] + '지 ' + BR_K[cols[b].b], a: a, b: b });
      });
    }
    // 삼합
    var brs = cols.filter(Boolean).map(function (c) { return c.b; });
    [[8, 0, 4, '수'], [5, 9, 1, '금'], [2, 6, 10, '화'], [11, 3, 7, '목']].forEach(function (t) {
      if (brs.indexOf(t[0]) >= 0 && brs.indexOf(t[1]) >= 0 && brs.indexOf(t[2]) >= 0)
        rels.push({ kind: '지지삼합', text: BR_K[t[0]] + BR_K[t[1]] + BR_K[t[2]] + ' → ' + t[3] + '(' + EL_H[EL_K.indexOf(t[3])] + ')국' });
    });
    // 공망
    var xunStart = D.idx - D.idx % 10;
    var gong = [(xunStart % 12 + 10) % 12, (xunStart % 12 + 11) % 12];

    var lunarOfBirth = lunarIn || solarToLunar(y, m, d);
    return {
      input: inp, solar: { y: y, m: m, d: d }, lunar: lunarOfBirth, hh: hh, mm: mm, unknown: unknown,
      offInfo: offInfo, corrMin: corrMin, local: { y: ly, m: lm, d: ld, h: lh, mi: lmi },
      cols: cols, ds: ds, elCount: elCount, tenCount: tenCount, groupCount: groupCount,
      strength: { pct: pct, level: lv, name: LEVELS[lv], deuk: deuk },
      yong: yong, hee: hee, gi: gi, gu: gu, han: han, gEl: gEl,
      daeun: { su: dsu, forward: forward, list: daeun },
      sinsal: sinsalFor(null, cols), rels: rels, gong: gong, utcMs: utcMs
    };
  }

  // 특정 간지가 이 사주에 주는 기운 평가
  function evalPillar(r, idx) {
    var s = idx % 10, b = idx % 12;
    var sc = function (el) {
      if (el === r.yong) return 2; if (el === r.hee) return 1; if (el === r.gi) return -2; if (el === r.gu) return -1; return 0;
    };
    var score = sc(STEM_EL[s]) + 1.2 * sc(BR_EL[b]);
    var notes = [];
    var posName = ['자녀·아랫사람·계획', '나 자신·배우자·집안', '직장·사회생활', '부모·윗사람'];
    r.cols.forEach(function (c, i) {
      if (!c) return;
      var rel = branchRel(c.b, b);
      if (rel.indexOf('충') >= 0) { score -= i === 1 ? 1.5 : i === 2 ? 1 : 0.6; notes.push({ t: 'bad', k: '충', pos: i, text: posName[i] + ' 쪽에 변동·부딪힘이 생기기 쉬워요' }); }
      if (rel.indexOf('형') >= 0 || rel.indexOf('자형') >= 0) { score -= 0.5; notes.push({ t: 'bad', k: '형', pos: i, text: posName[i] + ' 관련 다툼·서류·건강 문제를 조심하세요' }); }
      if (rel.indexOf('원진') >= 0 && i === 1) { score -= 0.4; notes.push({ t: 'bad', k: '원진', pos: i, text: '가까운 사람과 괜한 오해·서운함이 생기기 쉬워요' }); }
      if (rel.indexOf('육합') >= 0) { score += i === 1 ? 0.6 : 0.3; notes.push({ t: 'good', k: '합', pos: i, text: posName[i] + ' 쪽에 좋은 인연·협력이 생겨요' }); }
    });
    if (stemRel(r.ds, s) === '합') { score += 0.3; notes.push({ t: 'good', k: '합', text: '나와 손잡을 사람·기회가 들어옵니다' }); }
    if (stemRel(r.ds, s) === '충') { score -= 0.6; notes.push({ t: 'bad', k: '충', text: '내 뜻과 부딪히는 일이 생길 수 있어요. 한 박자 쉬어 가세요' }); }
    if (r.gong.indexOf(b) >= 0) { score -= 0.3; notes.push({ t: 'bad', k: '공망', text: '기대한 만큼 결과가 따라오지 않을 수 있어요(공망)' }); }
    var level = score >= 2.5 ? 5 : score >= 1 ? 4 : score >= -1.2 ? 3 : score >= -3 ? 2 : 1;
    return { s: s, b: b, idx: idx, ten: tenGod(r.ds, s), tenB: tenGod(r.ds, BR_MAIN[b]), stage: stage(r.ds, b), score: score, level: level, notes: notes };
  }

  return {
    STEM_K: STEM_K, STEM_H: STEM_H, BR_K: BR_K, BR_H: BR_H, EL_K: EL_K, EL_H: EL_H, STEM_EL: STEM_EL, BR_EL: BR_EL, BR_MAIN: BR_MAIN,
    HIDDEN: HIDDEN, TEN: TEN, TEN_H: TEN_H, TEN_GROUP: TEN_GROUP, STAGE: STAGE, SINSAL12: SINSAL12, ANIMAL: ANIMAL, COLOR_WORD: COLOR_WORD, TERM_NAMES: TERM_NAMES,
    epochDay: epochDay, fromEpochDay: fromEpochDay, dayIdx: dayIdx, idxOf: idxOf, termsOf: termsOf, termOnDate: termOnDate,
    monthIdxForDate: monthIdxForDate, yearIdxForYear: yearIdxForYear, solarToLunar: solarToLunar, lunarToSolar: lunarToSolar, hasLeap: hasLeap,
    koreaOffset: koreaOffset, tenGod: tenGod, stage: stage, sinsal12: sinsal12, branchRel: branchRel, stemRel: stemRel,
    calc: calc, evalPillar: evalPillar
  };
})();
if (typeof module !== 'undefined') module.exports = SAJU;
