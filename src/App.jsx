import React, { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
//  1. 核心映射表：48张区域牌 (编号固定对应效果)
// ══════════════════════════════════════════════════════════════

const LETTERS = ['A','B','C','D'];
const NUMS = [1,2,3,4];

const FIXED_ZONE_EFFECTS = {
  "A1": {
    pos: {name:'营地篝火', desc:'你与相邻存活角色回复1HP', type:'adjHealHP', val:1},
    negS: {name:'坠落', desc:'你失去2HP，随机失去一张牌', type:'selfDamageDiscardHP', val:2},
    negA: {name:'毒气喷涌', desc:'你与相邻存活角色失去1HP', type:'adjDamageHP', val:1}
  },
  "A2": {
    pos: {name:'古代秘药', desc:'你回复2HP', type:'selfHealHP', val:2},
    negS: {name:'遭遇塌方', desc:'你失去2HP并翻面（切换休息状态）', type:'selfDamageRestHP', val:2},
    negA: {name:'地刺陷阱', desc:'你与相邻存活角色失去2HP', type:'adjDamageHP', val:2}
  },
  "A3": {
    pos: {name:'吃下荧光苔藓', desc:'HP回满，手牌全局公开，盲抽变挑选', type:'selfRevealHandHP', val:10},
    negS: {name:'理智动摇', desc:'你失去2SAN', type:'selfDamageSAN', val:2},
    negA: {name:'邪恶低语', desc:'你与相邻存活角色失去1SAN', type:'adjDamageSAN', val:1}
  },
  "A4": {
    pos: {name:'绮丽诗篇', desc:'直到下回合，所有人技能变为“掉包”', type:'globalOnlySwap', val:0},
    negS: {name:'惊惧幻象', desc:'你失去3SAN', type:'selfDamageSAN', val:3},
    negA: {name:'灵魂尖啸', desc:'全体存活角色失去1SAN', type:'allDamageSAN', val:1}
  },
  "B1": {
    pos: {name:'理智护符', desc:'你回复3SAN', type:'selfHealSAN', val:3},
    negS: {name:'忏悔独白', desc:'若信仰邪神则弃信受罚，否则失去1SAN', type:'selfRenounceGod', val:1},
    negA: {name:'绝望回声', desc:'你与相邻存活角色失去2SAN', type:'adjDamageSAN', val:2}
  },
  "B2": {
    pos: {name:'强心剂', desc:'你回复3HP', type:'selfHealHP', val:3},
    negS: {name:'极度虚弱', desc:'你失去2SAN并翻面（切换休息状态）', type:'selfDamageRestSAN', val:2},
    negA: {name:'地动山摇', desc:'全体存活角色失去1HP', type:'allDamageHP', val:1}
  },
  "B3": {
    pos: {name:'群体安抚', desc:'全体存活角色回复1SAN', type:'allHealSAN', val:1},
    negS: {name:'黑暗侵蚀', desc:'你失去1HP与1SAN', type:'selfDamageBoth', val:1},
    negA: {name:'沉睡魔咒', desc:'你与相邻角色翻面（切换休息状态）', type:'adjRest', val:0}
  },
  "B4": {
    pos: {name:'宁神香薰', desc:'你回复2SAN', type:'selfHealSAN', val:2},
    negS: {name:'落石砸击', desc:'你失去3HP', type:'selfDamageHP', val:3},
    negA: {name:'群体狂乱', desc:'全体存活角色失去2SAN', type:'allDamageSAN', val:2}
  },
  "C1": {
    pos: {name:'军用口粮', desc:'你回复2HP与1SAN', type:'selfHealBoth21', val:0},
    negS: {name:'行囊破裂', desc:'你失去1HP，随机弃2张牌', type:'selfDamageDiscardHP2', val:1},
    negA: {name:'毁灭风暴', desc:'全体存活角色失去2HP', type:'allDamageHP', val:2}
  },
  "C2": {
    pos: {name:'舒缓之歌', desc:'你与相邻存活角色回复1SAN', type:'adjHealSAN', val:1},
    negS: {name:'毒液飞溅', desc:'你失去2HP与1SAN', type:'selfDamageBoth21', val:0},
    negA: {name:'混乱气流', desc:'你与相邻角色各随机弃1张手牌', type:'adjDiscard', val:1}
  },
  "C3": {
    pos: {name:'均衡灵药', desc:'你回复1HP与1SAN', type:'selfHealBoth', val:1},
    negS: {name:'惊慌失措', desc:'你失去2SAN，随机弃1张牌', type:'selfDamageDiscardSAN', val:2},
    negA: {name:'瘟疫蔓延', desc:'你与相邻存活角色失去1HP和1SAN', type:'adjDamageBoth', val:1}
  },
  "C4": {
    pos: {name:'启示光辉', desc:'你失去1HP，全体回复2SAN', type:'sacHealSAN', val:2},
    negS: {name:'恶毒诅咒', desc:'你失去1HP与2SAN', type:'selfDamageBoth12', val:0},
    negA: {name:'末日预兆', desc:'全体存活角色失去1HP和1SAN', type:'allDamageBoth', val:1}
  },
  "D1": {
    pos: {name:'饮下清醒之泉', desc:'SAN回满，手牌全局公开，盲抽变挑选', type:'selfRevealHandSAN', val:10},
    negS: {name:'致命尖刺', desc:'你失去4HP', type:'selfDamageHP', val:4},
    negA: {name:'强风刮过', desc:'全体存活角色各随机弃1张手牌', type:'allDiscard', val:1}
  },
  "D2": {
    pos: {name:'群体治愈', desc:'全体存活角色回复1HP', type:'allHealHP', val:1},
    negS: {name:'恐怖直视', desc:'你失去4SAN', type:'selfDamageSAN', val:4},
    negA: {name:'血之共鸣', desc:'你失去2HP，场上其他角色回复1HP', type:'sacAllHealHP', val:2}
  },
  "D3": {
    pos: {name:'献祭治愈', desc:'你失去1SAN，全体回复2HP', type:'sacHealHP', val:2},
    negS: {name:'遗忘咒语', desc:'你失去1SAN，随机弃2张手牌', type:'selfDamageDiscardSAN2', val:1},
    negA: {name:'精神链接', desc:'你失去2SAN，场上其他角色回复1SAN', type:'sacAllHealSAN', val:2}
  },
  "D4": {
    pos: {name:'禁忌狂化', desc:'你失去1SAN，回复4HP', type:'sacHealSelfHP', val:4},
    negS: {name:'陷阱触发', desc:'你失去2HP', type:'selfDamageHP', val:2},
    negA: {name:'理智崩坏', desc:'你失去3SAN', type:'selfDamageSAN', val:3}
  }
};

const GOD_DEFS = {
  NYA: { name: '奈亚拉托提普', color: '#8e44ad', desc: '【借用】本回合你可以使用另一职业的技能', needsTarget: false },
  CTH: { name: '克苏鲁', color: '#1abc9c', desc: '【沉睡】使1名目标进入“翻面”状态，直到下回合', needsTarget: true }
};

const CS = {
  A: { bg:'#2c3e50', border:'#34495e' },
  B: { bg:'#1b2631', border:'#212f3c' },
  C: { bg:'#145a32', border:'#196f3d' },
  D: { bg:'#78281f', border:'#943126' },
};

// ══════════════════════════════════════════════════════════════
//  2. 核心逻辑引擎
// ══════════════════════════════════════════════════════════════

const clamp = (v) => Math.max(0, Math.min(10, v));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const copyPlayers = (ps) => ps.map(p => ({ ...p, hand: [...p.hand], godZone: [...(p.godZone || [])] }));

function isWinHand(hand) {
  const letters = new Set(hand.map(c => c.letter).filter(Boolean));
  const numbers = new Set(hand.map(c => c.number).filter(Boolean));
  return letters.size === 4 && numbers.size === 4;
}

function mkDeck() {
  let id = 0;
  const zoneCards = [];
  LETTERS.forEach(L => {
    NUMS.forEach(N => {
      const key = `${L}${N}`;
      const defs = FIXED_ZONE_EFFECTS[key];
      zoneCards.push({ id: id++, key, letter: L, number: N, ...defs.pos });
      zoneCards.push({ id: id++, key, letter: L, number: N, ...defs.negS });
      zoneCards.push({ id: id++, key, letter: L, number: N, ...defs.negA });
    });
  });
  const godCards = [
    ...Array(4).fill(0).map(() => ({ id: id++, isGod: true, godKey: 'NYA', key: 'NYA', type: 'god', ...GOD_DEFS.NYA })),
    ...Array(4).fill(0).map(() => ({ id: id++, isGod: true, godKey: 'CTH', key: 'CTH', type: 'god', ...GOD_DEFS.CTH })),
  ];
  return shuffle([...zoneCards, ...godCards]);
}

function applyFx(card, ci, ti, ps, deck, disc) {
  let P = copyPlayers(ps), D = [...deck], Disc = [...disc], msgs = [];
  let globalRule = null;
  const subjectIdx = ti != null ? ti : ci;
  const sn = P[subjectIdx]?.name;

  const healHP = (i, v) => { if (i != null && P[i] && !P[i].isDead) P[i].hp = clamp(P[i].hp + v); };
  const healSAN = (i, v) => { if (i != null && P[i] && !P[i].isDead) P[i].san = clamp(P[i].san + v); };
  const hurtHP = (i, v) => {
    if (i != null && P[i] && !P[i].isDead) {
      P[i].hp = clamp(P[i].hp - v);
      if (P[i].hp <= 0) {
        P[i].isDead = true; P[i].roleRevealed = true;
        msgs.push(`☠ ${P[i].name} 倒下了！`);
        Disc.push(...P[i].hand); P[i].hand = [];
      }
    }
  };
  const hurtSAN = (i, v) => { if (i != null && P[i] && !P[i].isDead) P[i].san = clamp(P[i].san - v); };
  const randDiscard = (i, n) => {
    if (i != null && P[i] && !P[i].isDead) {
      for (let k = 0; k < n; k++) {
        if (P[i].hand.length) {
          const x = 0 | Math.random() * P[i].hand.length;
          const c = P[i].hand.splice(x, 1)[0];
          Disc.push(c);
          msgs.push(`${P[i].name} 失去了 [${c.key}]`);
        }
      }
    }
  };
  const toggleRest = i => {
    if (i != null && P[i] && !P[i].isDead) {
      P[i].isResting = !P[i].isResting;
      msgs.push(`${P[i].name} 状态反转：${P[i].isResting ? '陷入休息' : '脱离休息'}`);
    }
  };

  const living = P.map((p, i) => ({ p, i })).filter(x => !x.p.isDead);
  const getAdj = (tgtIdx) => {
    const lIdx = living.findIndex(x => x.i === tgtIdx);
    if (lIdx < 0) return [tgtIdx];
    const adj = [tgtIdx];
    if (living.length > 1) {
      adj.push(living[(lIdx - 1 + living.length) % living.length].i);
      adj.push(living[(lIdx + 1) % living.length].i);
    }
    return [...new Set(adj)];
  };

  switch (card.type) {
    case 'selfHealHP': healHP(subjectIdx, card.val); break;
    case 'selfHealSAN': healSAN(subjectIdx, card.val); break;
    case 'allHealHP': living.forEach(x => healHP(x.i, card.val)); break;
    case 'allHealSAN': living.forEach(x => healSAN(x.i, card.val)); break;
    case 'selfRevealHandHP': P[subjectIdx].handRevealed = true; healHP(subjectIdx, 10); break;
    case 'selfRevealHandSAN': P[subjectIdx].handRevealed = true; healSAN(subjectIdx, 10); break;
    case 'selfHealBoth': healHP(subjectIdx, 1); healSAN(subjectIdx, 1); break;
    case 'selfHealBoth21': healHP(subjectIdx, 2); healSAN(subjectIdx, 1); break;
    case 'adjHealHP': getAdj(subjectIdx).forEach(i => healHP(i, 1)); break;
    case 'adjHealSAN': getAdj(subjectIdx).forEach(i => healSAN(i, 1)); break;
    case 'sacHealHP': hurtSAN(subjectIdx, 1); living.forEach(x => healHP(x.i, 2)); break;
    case 'sacHealSAN': hurtHP(subjectIdx, 1); living.forEach(x => healSAN(x.i, 2)); break;
    case 'sacHealSelfHP': hurtSAN(subjectIdx, 1); healHP(subjectIdx, 4); break;
    case 'selfDamageHP': hurtHP(subjectIdx, card.val); break;
    case 'selfDamageSAN': hurtSAN(subjectIdx, card.val); break;
    case 'selfDamageBoth': hurtHP(subjectIdx, 1); hurtSAN(subjectIdx, 1); break;
    case 'selfDamageDiscardHP': hurtHP(subjectIdx, 2); randDiscard(subjectIdx, 1); break;
    case 'selfDamageRestHP': hurtHP(subjectIdx, 2); toggleRest(subjectIdx); break;
    case 'selfDamageRestSAN': hurtSAN(subjectIdx, 2); toggleRest(subjectIdx); break;
    case 'selfRenounceGod': 
       if(P[subjectIdx].godName){ 
         hurtSAN(subjectIdx, 2); Disc.push(...P[subjectIdx].godZone); 
         P[subjectIdx].godZone=[]; P[subjectIdx].godName=null; 
       } else { hurtSAN(subjectIdx, 1); }
       break;
    case 'adjDamageHP': getAdj(subjectIdx).forEach(i => hurtHP(i, card.val)); break;
    case 'adjDamageSAN': getAdj(subjectIdx).forEach(i => hurtSAN(i, card.val)); break;
    case 'allDamageHP': living.forEach(x => hurtHP(x.i, card.val)); break;
    case 'allDamageSAN': living.forEach(x => hurtSAN(x.i, card.val)); break;
    case 'globalOnlySwap': globalRule = { type: 'ONLY_SWAP', expireTurn: subjectIdx }; break;
    case 'adjDiscard': getAdj(subjectIdx).forEach(i => randDiscard(i, 1)); break;
    case 'allDiscard': living.forEach(x => randDiscard(x.i, 1)); break;
    case 'adjRest': getAdj(subjectIdx).forEach(i => toggleRest(i)); break;
    case 'sacAllHealHP': hurtHP(subjectIdx, 2); living.forEach(x => { if (x.i !== subjectIdx) healHP(x.i, 1); }); break;
    case 'sacAllHealSAN': hurtSAN(subjectIdx, 2); living.forEach(x => { if (x.i !== subjectIdx) healSAN(x.i, 1); }); break;
  }
  return { P, D, Disc, msgs, globalRule };
}

// ══════════════════════════════════════════════════════════════
//  3. 组件与交互状态
// ══════════════════════════════════════════════════════════════

export default function DeepSeaGame() {
  const [gs, setGs] = useState(null);

  const startGame = () => {
    const players = [
      { id: 0, name: '你 (调查员)', hp: 6, san: 6, role: '寻宝者', hand: [], isDead: false, isAI: false },
      { id: 1, name: 'AI 追击者', hp: 6, san: 6, role: '追猎者', hand: [], isDead: false, isAI: true },
      { id: 2, name: 'AI 邪祀者', hp: 6, san: 6, role: '邪祀者', hand: [], isDead: false, isAI: true },
      { id: 3, name: 'AI 寻宝者', hp: 6, san: 6, role: '寻宝者', hand: [], isDead: false, isAI: true },
    ];
    setGs({
      players, deck: mkDeck(), discard: [], log: ['探索开始...'],
      currentTurn: 0, phase: 'ACTION', gameOver: null, drawReveal: null
    });
  };

  const handleDraw = () => {
    if (gs.phase !== 'ACTION') return;
    let D = [...gs.deck], Disc = [...gs.discard];
    if (D.length === 0) { D = shuffle(Disc); Disc = []; }
    const card = D.shift();
    setGs({ ...gs, deck: D, discard: Disc, drawReveal: { card }, phase: 'ZONE_CHOICE' });
  };

  const handleZoneAccept = () => {
    const card = gs.drawReveal.card;
    const { P, D, Disc, msgs, globalRule } = applyFx(card, gs.currentTurn, null, gs.players, gs.deck, gs.discard);
    P[gs.currentTurn].hand.push(card);
    
    let logMsg = `${P[gs.currentTurn].name} 接受了 [${card.key}]`;
    if (isWinHand(P[gs.currentTurn].hand)) {
      setGs({ ...gs, players: P, discard: Disc, gameOver: `${P[gs.currentTurn].name} 集齐编号获胜！` });
      return;
    }
    
    nextTurn({ ...gs, players: P, deck: D, discard: Disc, log: [...gs.log, logMsg, ...msgs], phase: 'ACTION', drawReveal: null });
  };

  const handleZoneDiscard = () => {
    const card = gs.drawReveal.card;
    const logMsg = `${gs.players[gs.currentTurn].name} 弃置了 [${card.key}] (无代价)`;
    nextTurn({ ...gs, discard: [...gs.discard, card], log: [...gs.log, logMsg], phase: 'ACTION', drawReveal: null });
  };

  const nextTurn = (nextGs) => {
    let nt = (nextGs.currentTurn + 1) % 4;
    while (nextGs.players[nt].isDead) nt = (nt + 1) % 4;
    setGs({ ...nextGs, currentTurn: nt });
  };

  // AI & 断线保护逻辑
  useEffect(() => {
    if (!gs || gs.gameOver) return;
    const curr = gs.players[gs.currentTurn];
    
    const timer = setTimeout(() => {
      if (gs.phase === 'ACTION' && curr.isAI) {
        handleDraw();
      } else if (gs.phase === 'ZONE_CHOICE') {
        // AI 或 玩家超时的自动抉择逻辑
        const card = gs.drawReveal.card;
        const isBad = card.type.includes('Damage') || card.type.includes('Discard');
        if (isBad && curr.hp <= 2) handleZoneDiscard(); // 危急时刻弃置
        else handleZoneAccept(); // 其他情况倾向于收牌（为了赢）
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [gs?.currentTurn, gs?.phase]);

  if (!gs) return <div style={styles.startPage}><button onClick={startGame} style={styles.btnLarge}>开始探索</button></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {gs.players.map((p, i) => (
          <div key={i} style={{...styles.playerBar, border: gs.currentTurn===i?'2px solid #f1c40f':'1px solid #333'}}>
            <div style={{fontWeight:'bold'}}>{p.name} {p.isResting && '🌙'}</div>
            <div style={{color:'#ff4d4d'}}>HP: {p.hp} | SAN: {p.san}</div>
            <div style={{fontSize:12, color:'#888'}}>{p.id===0 || p.isDead ? p.role : '密探'}</div>
          </div>
        ))}
      </div>

      <div style={styles.log}>
        {gs.log.slice(-6).map((l, i) => <div key={i} style={{marginBottom:4}}>{l}</div>)}
      </div>

      <div style={styles.handArea}>
        <div style={{fontSize:12, color:'#666', marginBottom:5}}>你的行囊 (需凑齐A/B/C/D和1/2/3/4):</div>
        <div style={styles.hand}>
          {gs.players[0].hand.map(c => (
            <div key={c.id} style={{...styles.card, background: CS[c.letter]?.bg, borderColor: CS[c.letter]?.border}}>{c.key}</div>
          ))}
        </div>
      </div>

      {gs.phase === 'ACTION' && gs.currentTurn === 0 && (
        <div style={styles.actionPanel}>
          <button onClick={handleDraw} style={styles.btnAction}>区域探寻 (摸牌)</button>
        </div>
      )}

      {gs.phase === 'ZONE_CHOICE' && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
             <h2 style={{color: CS[gs.drawReveal.card.letter]?.border}}>{gs.drawReveal.card.key} · {gs.drawReveal.card.name}</h2>
             <p style={{margin:'20px 0', lineHeight:1.5}}>{gs.drawReveal.card.desc}</p>
             {gs.currentTurn === 0 ? (
               <div style={{display:'flex', gap:15, justifyContent:'center'}}>
                 <button onClick={handleZoneAccept} style={styles.btnGreen}>收下并生效</button>
                 <button onClick={handleZoneDiscard} style={styles.btnRed}>弃置牌</button>
               </div>
             ) : (
               <div style={{fontStyle:'italic', color:'#888'}}>{gs.players[gs.currentTurn].name} 正在抉择...</div>
             )}
          </div>
        </div>
      )}

      {gs.gameOver && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h1>游戏结束</h1>
            <p>{gs.gameOver}</p>
            <button onClick={startGame} style={{...styles.btnAction, marginTop:20}}>再来一局</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: '#0a0a0a', color: '#ccc', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' },
  startPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' },
  header: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 10 },
  playerBar: { padding: 10, background: '#161616', borderRadius: 4 },
  log: { flex: 1, padding: 15, fontSize: 13, overflowY: 'auto', borderTop: '1px solid #222', color: '#aaa' },
  handArea: { padding: 10, background: '#050505', borderTop: '1px solid #222' },
  hand: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 5 },
  card: { minWidth: 45, height: 60, border: '2px solid', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 },
  actionPanel: { padding: 20, textAlign: 'center' },
  btnLarge: { padding: '15px 40px', fontSize: 18, background: '#2980b9', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  btnAction: { padding: '12px 30px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalContent: { background: '#1a1a1a', padding: 30, borderRadius: 8, textAlign: 'center', maxWidth: 320, border: '1px solid #333' },
  btnGreen: { padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  btnRed: { padding: '10px 20px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};