export const equipmentEvidence = {
  evolutionFlow: {
    number: '18',
    addresses: [
      '0x1009730e8',
      '0x1009a6948',
      '0x1009a6d1c',
      '0x1009a9280',
      '0x1009a981c',
      '0x101836e50',
      '0x1019fca1c',
    ],
    en: {
      title: 'One activation, deferred effects',
      text: 'The base trigger sets the next main-field deadline before the target pass. Each eligible source builds and shuffles its result pool, then creates a loop effect carrying its type, cell, and level. Rank 4 scans columns with rows in the inner loop, before any queued removal; its grownew effects use the same shuffle stream. The walkthrough supplies target order, effective prices, per-cell blocking reasons, and callback order. Stage checks use the base rule plus an explicit Lily Pad override result. Its ordered candidate input is the maintained catalog projection. Each callback follows the traced remove/check/add ordering rather than rerolling its result.',
    },
    'zh-CN': {
      title: '一次激活与延后执行的特效',
      text: '基础触发先设置下次主动技能截止时间，再处理目标。每个合格源植物建立并打乱结果池，然后创建携带类型、格位置与等级的 loop 特效。品阶 4 按列扫描，行在内层循环，发生在任何排队移除之前；grownew 特效使用同一打乱随机流。流程示例输入目标顺序、有效价格、逐格阻止原因与回调顺序。场景检查采用基础规则，并单独输入睡莲重写函数的结果。有序候选输入来自维护的目录投影。每个回调遵循已追踪的移除／检查／添加顺序，不重新抽取结果。',
    },
  },
  globalReseeding: {
    number: '19',
    addresses: [
      '0x1034fca38',
      '0x10198019c',
      '0x10197f7a4',
      '0x101095248',
      '0x1000e172c',
      '0x101eeab00',
      '0x10229a9c8',
      '0x100b21ec8',
      '0x100b24b1c',
    ],
    en: {
      title: 'Clock reseeding is shared across systems',
      text: 'The branch census finds 38 calls to the shared seed wrapper, 30 passing time(NULL). Attributed clock callers include the weighted loot selector, its coin-spring sibling, the Gashapon spin, three instruction-equivalent Zomboss loot implementations, and two Gardener Grass paths. The loot selector reseeds immediately before its bounded draw; Gashapon reseeds at spin entry before its later selection logic. These sites all replace state at 0x104e3e580. A second reseed discards earlier intervening draws; only draws after that reseed can shift a subsequent consumer. The libc++ shuffle engine is a separate object.',
    },
    'zh-CN': {
      title: '跨系统共享的时钟重新播种',
      text: '分支清点找到共享播种封装的 38 处调用，其中 30 处传入 time(NULL)。已对应的时钟调用方包括加权掉落选择器、金币泉同类例程、扭蛋抽取、三份指令等价的僵王掉落实现，以及两条地锯草路径。掉落选择器在有界抽取前立即播种；扭蛋在抽取入口、后续选择逻辑之前播种。这些位置都替换 0x104e3e580 的状态。第二次播种会丢弃此前插入的抽取；只有该次播种之后的抽取，才会移动后续消耗者的位置。libc++ 打乱引擎是另一个对象。',
    },
  },
  evolutionArea: {
    number: '01',
    addresses: ['0x1009a6948', '0x1009a6b5c', '0x102151420'],
    en: {
      title: 'Collect targets in a 3×3 rectangle',
      text: 'Activation subtracts one from each stored cell coordinate and collects objects whose grid rectangles overlap a hard-coded 3×3 area. Condition checks reject sheeped, mind_controlled_extra, and the three witch_group transformations. The per-plant driver adds consumable, alias, class, hero, and parallel-type gates. Rectangle overlap also admits a multi-cell plant touching the area.',
    },
    'zh-CN': {
      title: '收集 3×3 区域中的目标',
      text: '激活流程从保存的格坐标分别减一，收集网格矩形与固定 3×3 区域重叠的对象。状态条件排除 sheeped、mind_controlled_extra 与三种 witch_group 变形。逐植物流程还检查消耗型、别名、类、英雄与 parallel 类型。多格植物只要与区域重叠也会被收集。',
    },
  },
  evolutionPool: {
    number: '02',
    addresses: ['0x1009a6640', '0x1009a8b48'],
    en: {
      title: 'Seven catalog filters',
      text: 'The Enabled default is true. Enabled, four literal aliases, four overriding plant classes, HeroProperties, the parallel_ prefix, IsConsumable, and plantBlackList reduce the selected 383 definitions to 257. The exported projection retains the input fields. Cost, stage eligibility, and per-tile planting checks further restrict the result. The stage virtual has a Lily Pad override.',
    },
    'zh-CN': {
      title: '七道目录筛选',
      text: 'Enabled 默认为真。Enabled、四个硬编码别名、四个重写植物类、HeroProperties、parallel_ 前缀、IsConsumable 与 plantBlackList，将选定的 383 个定义缩减为 257 个。导出数据保留筛选输入字段。成本、场景资格与逐格种植检查继续限制结果。场景虚函数对睡莲另有重写。',
    },
  },
  evolutionCost: {
    number: '03',
    addresses: ['0x1009a8838', '0x10183629c', '0x1009a8d84', '0x1009a8f18'],
    en: {
      title: 'Effective source cost versus declared candidate cost',
      text: 'The source calls PlantType virtual +0x70 with arguments -2 and 0. Its base path applies mode prices, level deltas, discounts, multipliers, and a zero clamp. Candidates read the raw Cost field and require Cost > source cost. The filtered catalog maximum is 500; its three entries are wintermelon, banana, and cobcannon. An empty result returns a null handle and the driver creates no removal effect.',
    },
    'zh-CN': {
      title: '源植物有效成本与候选声明成本',
      text: '源植物调用 PlantType 虚函数 +0x70，参数为 -2 和 0。基础路径应用模式价格、等级增量、折扣、倍率与零下限。候选直接读取 Cost 字段，要求 Cost > 源植物成本。筛选目录的最高值为 500，三个成员为 wintermelon、banana、cobcannon。空结果返回空句柄，逐植物流程不会创建移除特效。',
    },
  },
  evolutionReplace: {
    number: '04',
    addresses: ['0x1009a841c', '0x1009a981c', '0x1009a9b4c', '0x1009a9b8c'],
    en: {
      title: 'Deferred replacement and unequal checks',
      text: 'The effect stores a cell, replacement type, animation name, original level, and old-plant weak pointer. The loop event tags and kills the old plant before checking replacement placement. Selection excuses blocked-reason 79; the final check excuses no reason. Failure skips AddPlant, with no rollback in this path. Other source-plant state is not copied through this effect; AddPlant may obtain new state from the board or profile.',
    },
    'zh-CN': {
      title: '延后替换与不同的检查条件',
      text: '特效保存格位置、替换类型、动画名、原等级与旧植物弱引用。loop 事件先标记并杀死旧植物，再检查替换位置。选择时豁免阻止原因 79，最终检查不豁免任何原因。失败会跳过 AddPlant，此路径没有回滚。其他源植物状态不通过该特效复制；AddPlant 可以从战场或存档取得新状态。',
    },
  },
  evolutionPassives: {
    number: '05',
    addresses: ['0x1009a7728', '0x1009a78c0', '0x1009a75d0', '0x1009a6d1c', '0x1009a90b0'],
    en: {
      title: 'Three separate passive paths',
      text: 'The two rank-2 rate getters consult the 26-entry TargetablePlantTypes whitelist. The rank-3 timer advances one interval per due update and draws rows 0–4. Rank 4 scans empty cells before the deferred removals, selecting plants with Cost <= 100. Its level fold starts at 1 and takes a minimum, so ordinary positive packet levels cannot raise it. The report traces the rate getters; their callers into final plant statistics need separate attribution.',
    },
    'zh-CN': {
      title: '三条独立被动路径',
      text: '两个 2 阶倍率读取函数查询含 26 项的 TargetablePlantTypes 白名单。3 阶计时器每次到期更新只推进一个间隔，并在行 0–4 中抽取。4 阶在延后移除之前扫描空格，选择 Cost <= 100 的植物。其等级归约从 1 开始取最小值，因此普通正值卡包等级无法将它提高。报告追踪的是倍率读取函数；通向最终植物数值的调用方需要另行对应。',
    },
  },
  shuffleLibrary: {
    number: '06',
    addresses: ['0x1009a9280', '0x100121044', '0x10001bf38'],
    en: {
      title: 'The separate libc++ shuffle stream',
      text: 'The imported __rs_get and __rs_default symbols identify two-argument std::random_shuffle. Its forward permutation uses uniform_int_distribution with rejection. The maintained host-libc++ probe repeats the same permutations across five process launches and matches mt19937 seed 5489. This identifies the measured library engine; the target iOS library is a separate provenance link. All consumers of that engine share its position, including Evolution and Modern portals.',
    },
    'zh-CN': {
      title: '独立的 libc++ 打乱随机流',
      text: '导入的 __rs_get 与 __rs_default 符号标识双参数 std::random_shuffle。前向排列通过带拒绝采样的 uniform_int_distribution 取值。维护的宿主 libc++ 检查在五次进程启动中重复相同排列，并匹配种子 5489 的 mt19937。这确定了被测库的引擎；目标 iOS 库属于另一项来源对应。该引擎的消耗者共享位置，包括进化与摩登传送门。',
    },
  },
  gloveCredit: {
    number: '07',
    addresses: ['0x1019a341c', '0x1019a35fc', '0x1019a3cd0', '0x100307a68'],
    en: {
      title: 'Damage credit and the one-shot flag',
      text: 'Each plant-sourced hit writes the most recent plant handle to zombie +0x648. Both normal damage reward paths test and set +0x644 before calling the reward routine. A failed inner gate still consumes this normal-path credit. SpartanBambooMatrixSystem calls the routine once per registered resolving plant and does not consult that flag.',
    },
    'zh-CN': {
      title: '伤害归属与一次性标记',
      text: '每次植物来源的伤害都把最新植物句柄写入僵尸 +0x648。两条普通伤害奖励路径都先检查并设置 +0x644，再调用奖励例程。内部条件失败也会消耗该普通路径的功劳。SpartanBambooMatrixSystem 对每株成功解析的登记植物调用一次奖励例程，不查询该标记。',
    },
  },
  gloveGates: {
    number: '08',
    addresses: ['0x10175611c', '0x101756178', '0x101756268', '0x101588a24'],
    en: {
      title: 'Strict chance and deadline gates',
      text: 'Plant food requires draw < rate and stored deadline < the clock at singleton +0x24. Success creates a pickup and then stores clock + 8.0. The clock service has not been identified, so 8.0 is retained as clock units. The routine also applies board and mode gates. The spawn path has no per-wave plant-food cap and does not query the stored plant-food meter; pickup collection is a later operation.',
    },
    'zh-CN': {
      title: '严格的概率与截止时间条件',
      text: '能量豆要求 draw < rate，且保存的截止时间 < 单例 +0x24 的时钟。成功先创建拾取物，再保存 时钟 + 8.0。时钟服务身份尚未对应，因此保留 8.0 个时钟单位。例程还检查战场与模式条件。生成路径没有每波能量豆上限，也不查询已储存能量豆计量槽；拾取入账属于后续操作。',
    },
  },
  accessoryValues: {
    number: '09',
    addresses: ['0x1015d4f80', '0x10184c620', '0x1017423fc'],
    en: {
      title: 'Accessory entries supply the numbers',
      text: 'Super quality selects SuperBoostList by stored level, admitting indices 0–5 for the six-entry MaxLevel-5 items. Invalid levels fall back to Boosts, which is empty for these items. The aggregator sums matching entry Values[0]. The referenced PlantBoostPropertySheet binds Type only; its own Values declaration is not the effect magnitude consumed here. Purple Glove plant-food entries are 0.10, 0.15, and 0.18 at levels 3–5.',
    },
    'zh-CN': {
      title: '数值来自挂件条目',
      text: '超级品质按保存等级索引 SuperBoostList；对于 MaxLevel 为 5、含六项的物品，接受索引 0–5。无效等级回退至 Boosts，这些物品的该列表为空。聚合器累加匹配条目的 Values[0]。被引用的 PlantBoostPropertySheet 只绑定 Type，其自身声明的 Values 不是此处使用的效果强度。紫色手套在等级 3–5 的能量豆条目为 0.10、0.15、0.18。',
    },
  },
  clockRecharge: {
    number: '10',
    addresses: ['0x101916fb0', '0x101917d5c', '0x10191c094'],
    en: {
      title: 'Recharge factor and the reset roll',
      text: 'The seed packet stores 1 / (1 + sum fast_plant) at +0x20c. Other setup paths can subsequently modify that field. clear_planting is stored separately at +0x214. On the eligible packet-use path a global float draw below that value selects code 2 rather than code 3. Localized text links that branch to the recharge reset; the numeric state names are an inference, not a recovered enum.',
    },
    'zh-CN': {
      title: '冷却因子与重置抽取',
      text: '种子卡把 1 / (1 + fast_plant 总和) 保存到 +0x20c，其他设置路径之后还可以修改该字段。clear_planting 单独保存在 +0x214。符合条件的用卡路径中，全局浮点抽取低于该值时选择代码 2，否则为代码 3。本地化描述把该分支与冷却重置相联系；数字状态名称是推断，并非还原出的枚举。',
    },
  },
  accessoryText: {
    number: '11',
    addresses: ['0x100f6657c', '0x101542ac8'],
    en: {
      title: 'Text, data, and display order',
      text: 'Small Clock SuperBoostList[4] supplies 0.22 / 0.22 / [0.13,1], while its level-4 text prints 19% / 19% / 13%. Sun Helmet stun-interval text prints 6 and 4 at levels 4 and 5, against declared 7 and 6. Queen Ice Crown id 21056 is absent from the priority list; the display comparator places listed accessories before unlisted ones.',
    },
    'zh-CN': {
      title: '描述、数据与显示顺序',
      text: '小时钟 SuperBoostList[4] 为 0.22 / 0.22 / [0.13,1]，等级 4 的描述却显示 19% / 19% / 13%。太阳锅盔在等级 4、5 的眩晕间隔描述为 6、4，声明则为 7、6。女王冰冠 id 21056 不在优先级列表中；显示比较器把列表内挂件排在列表外挂件之前。',
    },
  },
  artifactFormula: {
    number: '12',
    addresses: ['0x10026ec9c', '0x10026e73c', '0x10026fb5c', '0x100272790', '0x1002728a8'],
    en: {
      title: 'Display and runtime paths share arithmetic',
      text: 'Display reads go through the bounds-checked field helper 0x10026fb5c, with a near-zero guard on the final MainField entry. The runtime helper 0x100272790 selects through 0x1002728a8, substitutes via 0x1002736fc, and calls the same arithmetic engine 0x10026e73c. That second array selector lacks the display helper’s element bounds check. Arithmetic uses signed integers when the converted expression has no dot and float32 otherwise. The broader display-only claim in the framework report is superseded by this runtime call chain.',
    },
    'zh-CN': {
      title: '描述与运行时共享算术引擎',
      text: '描述读取经过带边界检查的字段辅助函数 0x10026fb5c，并对 MainField 最后一项应用近零保护。运行时辅助函数 0x100272790 经 0x1002728a8 选择字段，由 0x1002736fc 替换变量，再调用同一算术引擎 0x10026e73c。第二个数组选择器缺少描述辅助函数的元素边界检查。转换后表达式没有小数点时使用有符号整数，否则使用 float32。框架报告较宽泛的“仅用于描述”说法，应由这条运行时调用链修正。',
    },
  },
  artifactUses: {
    number: '13',
    addresses: ['0x10026fde0', '0x100272b18', '0x100972c20'],
    en: {
      title: 'Two guards and later modifiers',
      text: 'For stage*1.0-1.0, rank 1 evaluates to zero. The description helper adjusts a near-zero final MainField value to 1; the runtime common-data path separately converts and changes values 0 and 1 to 1 before later rescaling and use-count boosts. Thus the bare expression does not establish a displayed zero. MainField’s preceding entry supplies the runtime cooldown, with a later cooldown boost.',
    },
    'zh-CN': {
      title: '两处保护与后续修正',
      text: '对 stage*1.0-1.0，品阶 1 的原始结果为零。描述辅助函数把 MainField 最后一项的近零值改为 1；运行时公共数据路径单独转换，并在后续缩放和次数加成前把 0、1 都置为 1。因此仅凭原始公式不能断言显示零次。MainField 的前一项提供运行时冷却，之后还会应用冷却加成。',
    },
  },
  artifactProgression: {
    number: '14',
    addresses: ['0x1002736fc', '0x10026f7ac', '0x100f9c4a0'],
    en: {
      title: 'Ranks, levels, and the shared Endless counter',
      text: 'ArtifactInfo rank is the stage variable; level is separate. The shared cultivation table has level upgrades 1–29 and rank upgrades requiring levels 10, 20, and 30. The board stores one ArtifactData. Endless’s GetArtifactLeftTimes reads one manager int32, without an artifact key; localized rules describe carry-over and switching between levels. The per-artifact common-data use count and this Endless pool are separate quantities.',
    },
    'zh-CN': {
      title: '品阶、等级与无尽共享计数',
      text: 'ArtifactInfo 的 rank 对应 stage 变量，level 独立。共享培养表包含等级 1–29 的升级行，以及分别要求等级 10、20、30 的品阶升级。战场保存一个 ArtifactData。无尽的 GetArtifactLeftTimes 读取管理器上的一个 int32，没有神器键；本地化规则描述跨关保留与关间切换。单件神器公共数据中的次数与这个无尽共享池是两个不同量。',
    },
  },
  gameRandom: {
    number: '15',
    addresses: ['0x1034ff944', '0x103608ff4', '0x1036090b4', '0x10360921c'],
    en: {
      title: 'The shared game generator',
      text: 'The game-owned MT19937 starts at 4357, returns its low 31 bits, uses modulo for bounded integers, and divides floating draws by 2147483647.0 before float32 conversion. A branch census finds 38 calls to the global seed wrapper, including 30 that pass time(NULL). Separate object-owned generators and a random_device-seeded process engine also exist. These game reseeds do not reach libc++’s shuffle engine.',
    },
    'zh-CN': {
      title: '共享游戏生成器',
      text: '游戏自有 MT19937 从 4357 开始，返回低 31 位，有界整数取模，浮点抽取除以 2147483647.0 后转换为 float32。分支清点找到 38 处全局播种调用，其中 30 处传入 time(NULL)。此外还存在对象自有生成器与使用 random_device 播种的进程引擎。这些游戏播种不影响 libc++ 打乱引擎。',
    },
  },
  gardenerReseed: {
    number: '16',
    addresses: ['0x100b21e98', '0x100b21ec8', '0x100b24898', '0x100b24b1c'],
    en: {
      title: 'A firing routine resets unrelated random state',
      text: 'Gardener Grass’s fire routine calls time(NULL) and reseeds before checking whether the plant is level 5. The lower-level branch takes no draw after this reset. Its effect-object critical-hit path also reseeds immediately before a bounded-100 draw. Equal seeds yield the same first result; an intervening draw after a reseed can change which output a consumer receives.',
    },
    'zh-CN': {
      title: '攻击例程重置其他系统的随机状态',
      text: '地锯草攻击例程先调用 time(NULL) 并重新播种，再检查植物是否为等级 5。较低等级分支在重置后不进行抽取。其特效对象暴击路径也在 bounded-100 抽取之前立即播种。相同种子产生相同首项；播种后插入的其他抽取可以改变某个消耗者拿到的输出。',
    },
  },
  gashaponWeights: {
    number: '17',
    addresses: ['0x101095224', '0x1010953e4', '0x10109540c'],
    en: {
      title: 'Redrawing inside a cumulative scan',
      text: 'The five-entry selector constructs cumulative weights, but its loop back-edge returns to the random draw. Entry i receives product(1-Cj/T) for earlier entries times Ci/T. With five equal weights the idealized shares are 0.2, 0.32, 0.288, 0.1536, and 0.0384. This equal-weight example demonstrates the algorithm; it is not an attribution of the artifact’s unbound resource weight vectors. The inclusive float endpoint also permits a no-selection remainder.',
    },
    'zh-CN': {
      title: '在累积扫描内部重新抽取',
      text: '五项选择器构造累积权重，但循环回边返回随机抽取位置。第 i 项的份额为此前各项 (1-Cj/T) 的乘积再乘 Ci/T。五项等权时，理想化份额为 0.2、0.32、0.288、0.1536、0.0384。等权示例展示算法，不把尚未对应的资源权重向量当作此处输入。浮点区间包含上端点，还允许一个未选中任何项的剩余情况。',
    },
  },
} as const;
