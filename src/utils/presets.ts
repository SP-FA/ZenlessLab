export interface CharacterPreset {
  name: string;
  rarity: 'S' | 'A';
  baseAtk: number;
  baseHp: number;
}

export interface WEnginePreset {
  name: string;
  rarity: 'S' | 'A' | 'B';
  baseAtk: number;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { name: '星徽比利', rarity: 'S', baseAtk: 784, baseHp: 8497 },
  { name: '普罗米娅', rarity: 'S', baseAtk: 872, baseHp: 7788 },
  { name: '希希芙', rarity: 'S', baseAtk: 863, baseHp: 7673 },
  { name: '南宫羽', rarity: 'S', baseAtk: 671, baseHp: 8373 },
  { name: '爱芮', rarity: 'S', baseAtk: 788, baseHp: 7749 },
  { name: '千夏', rarity: 'S', baseAtk: 676, baseHp: 8477 },
  { name: '照', rarity: 'S', baseAtk: 691, baseHp: 9117 },
  { name: '叶瞬光', rarity: 'S', baseAtk: 863, baseHp: 7674 },
  { name: '般岳', rarity: 'S', baseAtk: 785, baseHp: 8497 },
  { name: '琉音', rarity: 'S', baseAtk: 683, baseHp: 8251 },
  { name: '伊德海莉', rarity: 'S', baseAtk: 785, baseHp: 8497 },
  { name: '卢西娅', rarity: 'S', baseAtk: 683, baseHp: 8477 },
  { name: '奥菲丝', rarity: 'S', baseAtk: 855, baseHp: 7789 },
  { name: '席德', rarity: 'S', baseAtk: 855, baseHp: 7674 },
  { name: '爱丽丝', rarity: 'S', baseAtk: 806, baseHp: 7674 },
  { name: '浮波柚叶', rarity: 'S', baseAtk: 683, baseHp: 8829 },
  { name: '橘福福', rarity: 'S', baseAtk: 691, baseHp: 8251 },
  { name: '仪玄', rarity: 'S', baseAtk: 873, baseHp: 7954 },
  { name: '雨果', rarity: 'S', baseAtk: 844, baseHp: 7941 },
  { name: '薇薇安', rarity: 'S', baseAtk: 853, baseHp: 7673 },
  { name: '扳机', rarity: 'S', baseAtk: 676, baseHp: 7923 },
  { name: '零号安比', rarity: 'S', baseAtk: 854, baseHp: 7673 },
  { name: '伊芙琳', rarity: 'S', baseAtk: 854, baseHp: 7788 },
  { name: '耀佳音', rarity: 'S', baseAtk: 640, baseHp: 8609 },
  { name: '悠真', rarity: 'S', baseAtk: 840, baseHp: 7405 },
  { name: '星见雅', rarity: 'S', baseAtk: 805, baseHp: 7673 },
  { name: '莱特', rarity: 'S', baseAtk: 797, baseHp: 8253 },
  { name: '月城柳', rarity: 'S', baseAtk: 797, baseHp: 7788 },
  { name: '柏妮思', rarity: 'S', baseAtk: 788, baseHp: 7368 },
  { name: '凯撒', rarity: 'S', baseAtk: 636, baseHp: 9526 },
  { name: '简', rarity: 'S', baseAtk: 805, baseHp: 7788 },
  { name: '青衣', rarity: 'S', baseAtk: 683, baseHp: 8250 },
  { name: '朱鸢', rarity: 'S', baseAtk: 844, baseHp: 7482 },
  { name: '圆鲨鲨', rarity: 'S', baseAtk: 863, baseHp: 7673 },
  { name: '夏潾', rarity: 'S', baseAtk: 813, baseHp: 7673 },
  { name: '丽娜', rarity: 'S', baseAtk: 642, baseHp: 8609 },
  { name: '珂蕾妲', rarity: 'S', baseAtk: 660, baseHp: 8127 },
  { name: '莱卡恩', rarity: 'S', baseAtk: 653, baseHp: 8416 },
  { name: '猫又', rarity: 'S', baseAtk: 835, baseHp: 7560 },
  { name: '格莉丝', rarity: 'S', baseAtk: 750, baseHp: 7482 },

  { name: '真斗', rarity: 'A', baseAtk: 680, baseHp: 7725 },
  { name: '潘引壶', rarity: 'A', baseAtk: 587, baseHp: 8454 },
  { name: '波可娜', rarity: 'A', baseAtk: 590, baseHp: 7612 },
  { name: '赛斯', rarity: 'A', baseAtk: 568, baseHp: 8701 },
  { name: '露西', rarity: 'A', baseAtk: 583, baseHp: 8025 },
  { name: '派派', rarity: 'A', baseAtk: 683, baseHp: 6976 },
  { name: '可琳', rarity: 'A', baseAtk: 732, baseHp: 6976 },
  { name: '安东', rarity: 'A', baseAtk: 716, baseHp: 7219 },
  { name: '本', rarity: 'A', baseAtk: 867, baseHp: 8577 },
  { name: '苍角', rarity: 'A', baseAtk: 590, baseHp: 8025 },
  { name: '比利', rarity: 'A', baseAtk: 712, baseHp: 6901 },
  { name: '妮可', rarity: 'A', baseAtk: 574, baseHp: 8145 },
  { name: '安比', rarity: 'A', baseAtk: 583, baseHp: 7500 },
];

export const WENGINE_PRESETS: WEnginePreset[] = [
  { name: '辉骑面铠', rarity: 'S', baseAtk: 713 },
  { name: '朔月裁霜', rarity: 'S', baseAtk: 713 },
  { name: '鳞齿寻踪', rarity: 'S', baseAtk: 713 },
  { name: '霓虹妄想', rarity: 'S', baseAtk: 713 },
  { name: '壳中之灵', rarity: 'S', baseAtk: 713 },
  { name: '思络成歌', rarity: 'S', baseAtk: 713 },
  { name: '半糖雪兔', rarity: 'S', baseAtk: 713 },
  { name: '云霓孤光', rarity: 'S', baseAtk: 743 },
  { name: '怒目金刚', rarity: 'S', baseAtk: 713 },
  { name: '昨夜来电', rarity: 'S', baseAtk: 713 },
  { name: '海妖摇篮', rarity: 'S', baseAtk: 713 },
  { name: '铸梦炉歌', rarity: 'S', baseAtk: 713 },
  { name: '嚣枪喧焰', rarity: 'S', baseAtk: 713 },
  { name: '机巧心种', rarity: 'S', baseAtk: 713 },
  { name: '十方锻星', rarity: 'S', baseAtk: 713 },
  { name: '狸法七变化', rarity: 'S', baseAtk: 713 },
  { name: '福虓炉炉', rarity: 'S', baseAtk: 713 },
  { name: '青溟笼舍', rarity: 'S', baseAtk: 743 },
  { name: '千面日陨', rarity: 'S', baseAtk: 713 },
  { name: '飞鸟星梦', rarity: 'S', baseAtk: 713 },
  { name: '索魂影眸', rarity: 'S', baseAtk: 713 },
  { name: '牺牲洁纯', rarity: 'S', baseAtk: 713 },
  { name: '心弦夜响', rarity: 'S', baseAtk: 713 },
  { name: '玲珑妆匣', rarity: 'S', baseAtk: 713 },
  { name: '残心青囊', rarity: 'S', baseAtk: 713 },
  { name: '霰落星殿', rarity: 'S', baseAtk: 743 },
  { name: '焰心桂冠', rarity: 'S', baseAtk: 713 },
  { name: '时流贤者', rarity: 'S', baseAtk: 713 },
  { name: '灼心摇壶', rarity: 'S', baseAtk: 713 },
  { name: '奔袭獠牙', rarity: 'S', baseAtk: 713 },
  { name: '淬锋钳刺', rarity: 'S', baseAtk: 713 },
  { name: '玉壶青冰', rarity: 'S', baseAtk: 713 },
  { name: '防暴者Ⅵ型', rarity: 'S', baseAtk: 713 },
  { name: '深海访客', rarity: 'S', baseAtk: 713 },
  { name: '嵌合编译器', rarity: 'S', baseAtk: 684 },
  { name: '硫磺石', rarity: 'S', baseAtk: 684 },
  { name: '啜泣摇篮', rarity: 'S', baseAtk: 684 },
  { name: '拘缚者', rarity: 'S', baseAtk: 684 },
  { name: '钢铁肉垫', rarity: 'S', baseAtk: 684 },
  { name: '燃狱齿轮', rarity: 'S', baseAtk: 684 },

  { name: '炎炙沸釜', rarity: 'A', baseAtk: 594 },
  { name: '青漪灵鼎', rarity: 'A', baseAtk: 594 },
  { name: '燔火胧夜', rarity: 'A', baseAtk: 624 },
  { name: '光影刻刀', rarity: 'A', baseAtk: 592 },
  { name: '震元奇枢', rarity: 'A', baseAtk: 624 },
  { name: '电波漫步', rarity: 'A', baseAtk: 594 },
  { name: '幻变魔方', rarity: 'A', baseAtk: 594 },
  { name: '裁纸刀', rarity: 'A', baseAtk: 624 },
  { name: '强音热望', rarity: 'A', baseAtk: 594 },
  { name: '秩序者-特化型', rarity: 'A', baseAtk: 624 },
  { name: '轰鸣座驾', rarity: 'A', baseAtk: 624 },
  { name: '好斗的阿炮', rarity: 'A', baseAtk: 624 },
  { name: '鎏金花信', rarity: 'A', baseAtk: 594 },
  { name: '左轮转子', rarity: 'A', baseAtk: 594 },
  { name: '逍遥游球', rarity: 'A', baseAtk: 594 },
  { name: '春日融融', rarity: 'A', baseAtk: 594 },
  { name: '兔能环', rarity: 'A', baseAtk: 594 },
  { name: '时光切片', rarity: 'A', baseAtk: 595 },
  { name: '雨林饕客', rarity: 'A', baseAtk: 594 },
  { name: '正版变身器', rarity: 'A', baseAtk: 594 },
  { name: '双生泣星', rarity: 'A', baseAtk: 594 },
  { name: '街头巨星', rarity: 'A', baseAtk: 594 },
  { name: '含羞恶面', rarity: 'A', baseAtk: 624 },
  { name: '贵重骨核', rarity: 'A', baseAtk: 594 },
  { name: '触电唇彩', rarity: 'A', baseAtk: 594 },
  { name: '家政员', rarity: 'A', baseAtk: 624 },
  { name: '仿制星徽引擎', rarity: 'A', baseAtk: 624 },
  { name: '旋钻机-赤轴', rarity: 'A', baseAtk: 624 },
  { name: '加农转子', rarity: 'A', baseAtk: 594 },
  { name: '德玛拉电池Ⅱ型', rarity: 'A', baseAtk: 624 },
  { name: '比格气缸', rarity: 'A', baseAtk: 624 },
  { name: '聚宝箱', rarity: 'A', baseAtk: 624 },
  { name: '人为刀俎', rarity: 'A', baseAtk: 594 },
  { name: '星徽引擎', rarity: 'A', baseAtk: 594 },
];

export interface DriveDiscPreset {
  name: string;
  twoPieceEffect: string;
  fourPieceEffect: string;
  color: string;
}

export const DRIVE_DISC_PRESETS: DriveDiscPreset[] = [
  {
    name: '囚徒手记',
    twoPieceEffect: '冰属性伤害+10%',
    fourPieceEffect: '装备者触发[异放]时，装备者异常精通提升48点，持续30秒；重复触发时刷新持续时间；装备者触发[冻结]效果时，装备者造成的所有属性异常伤害、[紊乱]伤害提升16%，持续30秒，重复触发时刷新持续时间',
    color: '#361db5'
  },{
    name: '雪兔梦游仙境',
    twoPieceEffect: '生命值+10%',
    fourPieceEffect: '[防护]角色装备时：装备者发动[强化特殊技]或队伍中任意队友发动[招架支援]、[回避支援]时，全队角色造成伤害提升6%，最多叠加3层，持续25秒，层数逐层衰减，获得或衰减时刷新持续时间，同名被动效果之间不可叠加',
    color: '#348dd3'
  },{
    name: '流光咏叹',
    twoPieceEffect: '以太伤害+10%',
    fourPieceEffect: '装备者发动[普通攻击]命中敌人时，自身异常精通提升36点，持续8秒，重复触发时刷新持续时间；当场上有敌人进入失衡状态时，装备者造成的伤害提升25%，持续18秒，重复触发时刷新持续时间',
    color: '#ffb5bb'
  },{
    name: '沧浪行歌',
    twoPieceEffect: '物理伤害+10%',
    fourPieceEffect: '装备者处于任意[以太帷幕]中时，自身暴击率提高10%，离开[以太帷幕]后，该增益效果仍然保留，持续15秒；装备者为强攻角色时，开启[以太帷幕]或延长[以太帷幕]的持续时间会使自身暴击率提升10%和攻击力提升10%，持续30秒，重复触发时刷新持续时间',
    color: '#c35244'
  },{
    name: '月光骑士颂',
    twoPieceEffect: '能量自动回复+20%',
    fourPieceEffect: '装备者为[支援]角色时，发动[强化特殊技]或[终结技]会使全队角色造成的伤害提升18%，持续25秒，重复触发时刷新持续时间，同名被动效果之间不可叠加',
    color: '#e0d7bc'
  },{
    name: '拂晓生花',
    twoPieceEffect: '[普通攻击]造成的伤害提升15%',
    fourPieceEffect: '[普通攻击]造成的伤害提升20%，装备者为[强攻]角色时，发动[强化特殊技]或[终结技]会使[普通攻击]造成的伤害额外提升20%，持续25秒，重复触发时刷新持续时间',
    color: '#feaf1f'
  },{
    name: '山大王',
    twoPieceEffect: '攻击造成的失衡值提升6%',
    fourPieceEffect: '装备者为[击破]角色时，发动[强化特殊技]或[连携技]会使全队角色暴击伤害提升15%，装备者的暴击率大于等于50%时暴击伤害额外提升15%，持续15秒，重复触发时刷新持续时间，同名被动效果之间不可叠加',
    color: '#f29b08'
  },{
    name: '云岿如我',
    twoPieceEffect: '生命值+10%',
    fourPieceEffect: '发动[强化特殊技]、[连携技]、[终结技]时，暴击率提升4%，最多叠加3层，持续15秒，重复触发时刷新持续时间，拥有3层效果时，造成的贯穿伤害提升10%',
    color: '#b28c5b'
  },{
    name: '法厄同之歌',
    twoPieceEffect: '异常掌控+8%',
    fourPieceEffect: '队伍中任意角色发动[强化特殊技]时，装备者的异常精通提升45点，持续8秒；如果发动[强化特殊技]的角色不是装备者本人时，装备者造成的以太伤害提升25%',
    color: '#6b46de'
  },{
    name: '如影相随',
    twoPieceEffect: '[追加攻击]和[冲刺攻击]造成的伤害提升15%',
    fourPieceEffect: '[追加攻击]和[冲刺攻击]命中敌人时，若造成的伤害与装备者的属性一致，则获得1层增益效果，同一招式内最多触发一次；每拥有1层增益效果，装备者的攻击力提升4%，暴击率提升4%，最多叠加3层，持续15秒，重复触发时刷新持续时间',
    color: '#f98300'
  },{
    name: '折枝剑歌',
    twoPieceEffect: '暴击伤害+16%',
    fourPieceEffect: '异常掌控大于等于115点时，装备者的暴击伤害提升30%；队伍中任意角色对敌人施加[冻结]或触发[碎冰】效果时，装备者的暴击率提升12%，持续15秒',
    color: '#6bb0d4'
  },{
    name: '静听嘉音',
    twoPieceEffect: '攻击力+10%',
    fourPieceEffect: '队伍中任意角色通过[快速支援]入场时，全队角色获得1层[嘉音]，最多叠加3层，持续15秒，重复触发时刷新持续时间，每拥有1层[嘉音]，通过[快速支援]入场的角色造成的伤害提升8%，同名被动效果之间不可叠加',
    color: '#bba174'
  },{
    name: '混沌爵士',
    twoPieceEffect: '异常精通+30点',
    fourPieceEffect: '火属性伤害和电属性伤害提升15%；位于后场时，[强化特殊技]和[支援攻击]造成的伤害提升20%，换入前场后，该增益效果仍然保留，持续5秒，保留效果7.5秒内最多触发一次',
    color: '#ecc316'
  },{
    name: '原始朋克',
    twoPieceEffect: '施加的护盾值提升15%',
    fourPieceEffect: '队伍中任意角色发动[招架支援]或[回避支援]时，全队角色造成的伤害提升15%，持续10秒，同名被动效果之间不可叠加',
    color: '#ff4e21'
  },{
    name: '啄木鸟电音',
    twoPieceEffect: '暴击率+8%',
    fourPieceEffect: '[普通攻击]、[闪避反击]或[强化特殊技]命中敌人并触发暴击时，分别为装备者提供1层增益效果，每层增益效果使装备者的攻击力提升9%，持续6秒，不同招式分别结算持续时间',
    color: '#168755'
  },{
    name: '河豚电音',
    twoPieceEffect: '穿透率+8%',
    fourPieceEffect: '[终结技]造成的伤害提升20%；发动[终结技]时，装备者的攻击力提升15%，持续12秒',
    color: '#161413'
  },{
    name: '震星迪斯科',
    twoPieceEffect: '冲击力+6%',
    fourPieceEffect: '[普通攻击]、[冲刺攻击]、[闪避反击]对主要攻击目标造成的失衡值提升20%',
    color: '#583ce4'
  },{
    name: '自由蓝调',
    twoPieceEffect: '异常精通+30点',
    fourPieceEffect: '[强化特殊技]命中敌人时，根据装备者的属性类型，使目标对应属性异常积蓄抗性降低20%，持续8秒，相同属性类型的效果不可叠加',
    color: '#74a386'
  },{
    name: '激素朋克',
    twoPieceEffect: '攻击力+10%',
    fourPieceEffect: '成为接战状态下的当前操作角色时，装备者的攻击力提升25%，持续10秒，20秒内最多触发一次',
    color: '#bbe029'
  },{
    name: '灵魂摇滚',
    twoPieceEffect: '防御力+16%',
    fourPieceEffect: '受到敌方攻击并损失生命值时，装备者受到的伤害降低40%，持续2.5秒，15秒内最多触发一次',
    color: '#eca216'
  },{
    name: '摇摆爵士',
    twoPieceEffect: '能量自动回复+20%',
    fourPieceEffect: '发动[连携技]或[终结技]时，全队造成的伤害提升15%，持续12秒，同名被动效果之间不可叠加',
    color: '#29b34a'
  },{
    name: '炎狱重金属',
    twoPieceEffect: '火属性伤害+10%',
    fourPieceEffect: '攻击命中处于[灼烧]状态下的敌人时，装备者的暴击率提升28%，持续8秒',
    color: '#de1b79'
  },{
    name: '混沌重金属',
    twoPieceEffect: '以太伤害+10%',
    fourPieceEffect: '装备者的暴击伤害提升20%；队伍中任意角色触发[侵蚀]伤害时，该增益效果额外提升5.5%，最多叠加6层，持续8秒，重复触发刷新持续时间',
    color: '#58bd4d'
  },{
    name: '雷暴重金属',
    twoPieceEffect: '电属性伤害+10%',
    fourPieceEffect: '当场上存在处于[感电]状态下的敌人时，装备者的攻击力提升28%',
    color: '#6b2df4'
  },{
    name: '极地重金属',
    twoPieceEffect: '冰属性伤害+10%',
    fourPieceEffect: '[普通攻击]和[冲刺攻击]造成的伤害提升20%，队伍中任意角色对敌人施加[冻结]或触发[碎冰]效果时，该增益效果额外提升20%，持续12秒',
    color: '#0dd497'
  },{
    name: '獠牙重金属',
    twoPieceEffect: '物理伤害+10%',
    fourPieceEffect: '队伍中任意角色对敌人施加[强击]效果时，装备者对目标的造成的伤害提升35%，持续12秒',
    color: '#e12826'
  },
];
