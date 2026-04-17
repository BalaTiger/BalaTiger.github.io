const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const step0 = `// ══════════════════════════════════════════════════════════════
//  AI STEP
// ══════════════════════════════════════════════════════════════
function discardAiHandToLimit(P, ct, Disc, L) {
  const aiHandLimit = P[ct]._nyaHandLimit ?? 4;
  while(P[ct].hand.length > aiHandLimit) {
    const c = P[ct].hand.shift();
    Disc.push(c);
    L.push(\`\${P[ct].name} 弃 \${cardLogText(c, {alwaysShowName:true})}（上限）\`);
  }
}

function aiStep(gs){`;
code = code.replace('function aiStep(gs){', step0);

const step1 = `let preSkillDiscard=null;

  const buildReturnPack = (nextGs, P_afterAction) => ({
    ...nextGs,
    _aiDrawnCard: gs._aiDrawnCard ?? gs._drawnCard ?? null,
    _discardedDrawnCard: gs._discardedDrawnCard ?? false,
    _aiName: ai.name,
    _playersBeforeNextDraw: P_afterAction,
    _playersBeforeSkillAction: playersBeforeSkillAction,
    _preSkillLogs: preSkillLogs,
    _preSkillDiscard: preSkillDiscard,
    ...(aiHuntEvents.length ? { _aiHuntEvents: aiHuntEvents } : {})
  });`;
code = code.replace('let preSkillDiscard=null;', step1);

code = code.replace(
  'return{...nextGs,_aiDrawnCard:gs._aiDrawnCard??gs._drawnCard??null,_discardedDrawnCard:gs._discardedDrawnCard??false,_aiName:ai.name,_playersBeforeNextDraw:_P_afterAction,_playersBeforeSkillAction:playersBeforeSkillAction,_preSkillLogs:preSkillLogs,_preSkillDiscard:preSkillDiscard,_aiHuntEvents:aiHuntEvents};',
  'return buildReturnPack(nextGs, _P_afterAction);'
);
code = code.replace(
  'return{...nextGs,_aiDrawnCard:gs._aiDrawnCard??gs._drawnCard??null,_discardedDrawnCard:gs._discardedDrawnCard??false,_aiName:ai.name,_playersBeforeNextDraw:_P_afterRest,_playersBeforeSkillAction:playersBeforeSkillAction,_preSkillLogs:preSkillLogs,_preSkillDiscard:preSkillDiscard};',
  'return buildReturnPack(nextGs, _P_afterRest);'
);
code = code.replace(
  'return{...nextGs,_aiDrawnCard:gs._aiDrawnCard??gs._drawnCard??null,_discardedDrawnCard:gs._discardedDrawnCard??false,_aiName:ai.name,_playersBeforeNextDraw:_P_afterAction,_playersBeforeSkillAction:playersBeforeSkillAction,_preSkillLogs:preSkillLogs,_preSkillDiscard:preSkillDiscard};',
  'return buildReturnPack(nextGs, _P_afterAction);'
);

const limitStr = 'const aiHandLimit=P[ct]._nyaHandLimit??4;\n    while(P[ct].hand.length>aiHandLimit){const c=P[ct].hand.shift();Disc.push(c);L.push(`${ai.name} 弃 ${cardLogText(c,{alwaysShowName:true})}（上限）`);}';
code = code.replace(limitStr, 'discardAiHandToLimit(P, ct, Disc, L);');
code = code.replace(limitStr, 'discardAiHandToLimit(P, ct, Disc, L);');

const varsToDel = `// 追猎者/邪祀者积极发动技能(65%); 寻宝者随进度提升(35%→55%)
  const myNonGod=P[ct].hand.filter(c=>!c.isGod);
  const myProgress=aiEffRole===ROLE_TREASURE
    ?(new Set(myNonGod.map(c=>c.letter)).size+new Set(myNonGod.map(c=>c.number)).size):0;
  
  // 给追猎者更高的出手倾向以促成连续追捕
  let skillRate = 0.35;
  if (aiEffRole === ROLE_HUNTER) skillRate = 0.97;
  else if (aiEffRole === ROLE_CULTIST) skillRate = 0.95;
  else if (myProgress >= 7) skillRate = 0.55;

  const canUseSkill = !gs.restUsed && (aiEffRole === ROLE_HUNTER ? true : !gs.skillUsed);
  const hunterZoneCards = P[ct].hand.filter(isZoneCard);
  const hunterHandLimit = P[ct]._nyaHandLimit ?? 4;
  const hunterOverLimit = hunterZoneCards.length > hunterHandLimit;
  const someoneWounded = P.some((p,i)=>i!==ct && !p.isDead && p.hp < 10);
  let huntContinue = true;
  let newAbandoned = gs.huntAbandoned || [];
  const getHunterTargets = () => getHunterChaseTargets(P,ct,newAbandoned);
  const shouldHunterUseSkill = canUseSkill && aiEffRole===ROLE_HUNTER && hunterZoneCards.length>0 && getHunterTargets().length>0 && (hunterOverLimit || someoneWounded);
  const canBewitch = aiEffRole===ROLE_CULTIST && P[ct].hand.length>0 && alive.length>0;
  const canSwapHands = aiEffRole===ROLE_TREASURE && P[ct].hand.length>0 && alive.some(p=>p.hand.length>0);
  const shouldNonHunterUseSkill = canUseSkill && Math.random() < skillRate && (
    canBewitch ||
    canSwapHands
  );
  let useSkill = aiEffRole===ROLE_HUNTER
    ? shouldHunterUseSkill
    : shouldNonHunterUseSkill;
  const aiSkillDecision=decideAiSkillUsage(gs,P,ct,aiEffRole,getHunterTargets());
  useSkill=aiSkillDecision.useSkill;
  let cultistBewitchPlan = null;`;

const varsReplacement = `  let huntContinue = true;
  let newAbandoned = gs.huntAbandoned || [];
  const getHunterTargets = () => getHunterChaseTargets(P,ct,newAbandoned);

  const aiSkillDecision=decideAiSkillUsage(gs,P,ct,aiEffRole,getHunterTargets());
  let useSkill=aiSkillDecision.useSkill;
  let cultistBewitchPlan = null;
  const hunterZoneCards = P[ct].hand.filter(isZoneCard);`;

code = code.replace(varsToDel, varsReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log('Done!');
