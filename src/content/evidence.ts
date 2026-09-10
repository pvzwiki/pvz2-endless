export const evidence = {
  randomStreams: {
    number: '07', addresses: ['0x101d47624', '0x101c79bec', '0x101ce66dc', '0x100121044'],
    en: { title: 'Separate random-state consumers', text: 'Fresh DangerRoom initialization constructs designer state, materializes waves, runs world postprocessing, installs runtime actions and loot tags, then reseeds the WaveManager. Jam uses the global RNG; Modern queue shuffling calls imported C++ machinery. The website uses a small seeded example generator for repeatable rule demonstrations; it does not reproduce these native random streams.' },
    'zh-CN': { title: '独立的随机状态消耗者', text: '全新 DangerRoom 初始化构建设计器状态、转换波次、运行世界后处理、安装运行时动作与掉落标记，随后重新播种 WaveManager。Jam 使用全局 RNG；摩登世界队列打乱调用导入的 C++ 机制。网站使用小型带种子的示例生成器，演示可重复的规则计算；它不复现这些原生随机流。' },
  },
  circleLifetime: {
    number: '06', addresses: ['0x100ccab7c', '0x100ccb0a4', '0x100cda0cc'],
    en: { title: 'One shared circle, refreshed rather than stacked', text: 'The first creation fixes the circle destination and costume auxiliary effect. A later activation reuses the shared circle and restarts its 15-second loop, preserving captured references. Cleanup clears the tracked stun condition but stores no original positions to restore. Start and end animations are separate from the timed loop.' },
    'zh-CN': { title: '共享法阵刷新，不叠加', text: '首次创建确定法阵目标位置与装扮附加效果。之后的激活复用共享法阵，重新开始 15 秒循环，保留被捕获对象的引用。清理会清除追踪的眩晕状态，但没有保存可供恢复的原始位置。起始与结束动画独立于计时循环。' },
  },
  "interpolation": {
    "number": "01",
    "addresses": [
      "0x101ab6028"
    ],
    "en": {
      "title": "Draw first, interpolate second",
      "text": "The helper performs two inclusive integer draws, clamps the level fraction, uses float32 fused multiply-add to interpolate the drawn endpoints, and truncates to an integer. Both draws occur even at a fixed endpoint or outside the level range. Its random consumption must be retained when reconstructing a designer sequence."
    },
    "zh-CN": {
      "title": "先抽取，再插值",
      "text": "辅助函数进行两次包含边界的整数抽取，限制关卡比例，使用 float32 融合乘加对抽取的端点插值，最后截断为整数。即使端点固定或关卡超出区间，两次抽取仍然发生。重建设计器序列时，需要保留这些随机数消耗。"
    }
  },
  "jam": {
    "number": "02",
    "addresses": [
      "0x101c79bec",
      "0x101ce76d8"
    ],
    "en": {
      "title": "Jam replaces instructions before creation",
      "text": "DangerRoomJamDesigner edits the spawn-property vector through removal and appended replacement instructions. It selects one replacement type per event, preserving replaced instruction levels and total entry count, without rerunning the ordinary budget check. AdditionalPlantfood is unchanged. The WaveManager health sample runs after the resulting wave actions create their entities."
    },
    "zh-CN": {
      "title": "Jam 在创建前替换指令",
      "text": "DangerRoomJamDesigner 通过移除和追加替换指令来修改生成属性向量。每个事件选择一种替换类型，保留被替换指令的等级与条目总数，不重新执行普通预算检查。AdditionalPlantfood 不变。WaveManager 的生命值采样在最终波次动作创建实体之后执行。"
    }
  },
  "dinosaurs": {
    "number": "03",
    "addresses": [
      "0x10172986c"
    ],
    "en": {
      "title": "Independent dinosaur actions",
      "text": "The designer selects a type subset and adds dinosaur actions to the wave properties. Event count, first-wave index, and spacing use the shared endpoint-draw interpolation helper. One type is chosen for an event; rows are drawn from a consumable vector, replenished as needed. These actions are added outside ordinary zombie budget filling."
    },
    "zh-CN": {
      "title": "独立的恐龙动作",
      "text": "设计器选择类型子集，并向波次属性添加恐龙动作。事件数量、首波索引与间隔使用共享的端点抽取插值函数。每个事件选择一种类型；行号从可消耗的向量中抽取，需要时补充。这些动作在普通僵尸预算填充之外添加。"
    }
  },
  "portals": {
    "number": "04",
    "addresses": [
      "0x100739c58",
      "0x101b04448",
      "0x100120f80",
      "0x100121a00"
    ],
    "en": {
      "title": "The portal action's actual payload",
      "text": "The designer computes a count and list-range values, but the ordinary portal action does not forward them to the created grid item. Its post-create helper returns directly. Runtime initialization copies the full configured family list, retaining duplicate slots, then shuffles it. Emission creates children with wave marker -5; the default interval bounds are 10 and 12 game seconds."
    },
    "zh-CN": {
      "title": "传送门动作的实际载荷",
      "text": "设计器计算数量与列表范围值，但普通传送门动作并未将它们传给创建的网格物件。其创建后辅助函数直接返回。运行时初始化复制配置中的完整家族列表，保留重复槽位，然后打乱。释放时创建的子僵尸带有波次标记 -5；默认间隔边界为 10 和 12 游戏秒。"
    }
  },
  "steam": {
    "number": "05",
    "addresses": [
      "0x100b980c0",
      "0x101ec8840"
    ],
    "en": {
      "title": "Steam's setup and runtime clocks",
      "text": "The later setup hook derives smoke-hole and pipeline counts from the clamped level fraction. Smoke uses a clearing-triggered cooldown and a damage update over neighboring cells. The pipeline's duration parameter and its state deadlines are distinct: the baseline parameter is 2, while deadlines are t+1, t+2, and t+3, with a strict comparison on the last transition. Blocking-plant damage is applied per plant per update."
    },
    "zh-CN": {
      "title": "蒸汽时代的设置与运行时钟",
      "text": "较晚的设置钩子根据限制后的关卡比例计算烟雾孔与管道数量。烟雾使用清除触发的冷却，以及对相邻格子的伤害更新。管道的时长参数与状态截止时间不同：基线参数为 2，截止时间则为 t+1、t+2、t+3，最后一次转换使用严格比较。阻挡植物受到的伤害按每株、每次更新施加。"
    }
  },
  "spawnLevels": {
    "number": "01",
    "addresses": [
      "0x101d4561c",
      "0x101b3a27c"
    ],
    "en": {
      "title": "Float32 level requests",
      "text": "The native chain uses fused multiply-add with the float32 base/add coefficients, decimal truncation, a cap of 10, then floor/ceil clamped to 1–10. When those bounds differ, the upper choice is accepted when the integer residue is below the float32 fractional part multiplied by 100. The default inputs 2 and 3 both produce approximately 1.100000024 and accept residues 0–10."
    },
    "zh-CN": {
      "title": "Float32 等级请求",
      "text": "原生流程使用 float32 基础值／增量系数进行融合乘加，再做小数截断、限制上限为 10，最后将下取整／上取整结果限制到 1–10。边界不同时，整数余数小于 float32 小数部分乘以 100 的结果，就接受较高等级。默认输入 2 与 3 都产生约 1.100000024，并接受余数 0–10。"
    }
  },
  "strengthTable": {
    "number": "02",
    "addresses": [
      "0x1019938a0",
      "0x101993af8",
      "0x101d6db00"
    ],
    "en": {
      "title": "Shared table lookup and missing rows",
      "text": "The non-Zomboss DangerRoom lookup uses the shared ZombieLevelStats vector at effective entity level minus one. A missing row returns multiplier 1. The supplied vector has five rows; the neccd.zls response replaces the ordered attack/health pairs. The level-module ZombieMaxLevel default is -1, and the ordinary definitions omit an override."
    },
    "zh-CN": {
      "title": "共享表查询与缺失行",
      "text": "非 Zomboss 的 DangerRoom 查询使用共享 ZombieLevelStats 向量，以实体有效等级减一作为索引。缺失行返回倍率 1。随包向量有五行；neccd.zls 响应会替换有序的攻击／生命值对。等级模块的 ZombieMaxLevel 默认为 -1，普通定义未声明覆盖值。"
    }
  },
  "bite": {
    "number": "03",
    "addresses": [
      "0x1019b55b0",
      "0x10199f658"
    ],
    "en": {
      "title": "The base chewing-rate chain",
      "text": "The rate getter first uses a positive EatDPSRatio multiplied by maximum body health, then positive extraEatDPS, then positive baseEatDPS, then the property EatDPS. The base bite path multiplies this selected rate by the attack-table multiplier, attack pace, frame time, and 1 + 0.2 × (effective level - 1), with further condition/type modifiers and a nonnegative clamp."
    },
    "zh-CN": {
      "title": "基础啃咬速率的选择链",
      "text": "速率查询先使用正值 EatDPSRatio 乘以最大本体生命值，再依次选择正值 extraEatDPS、正值 baseEatDPS，最后回退到属性 EatDPS。基础啃咬路径将选中速率乘以攻击表倍率、攻击速度、帧时间和 1 + 0.2 ×（有效等级 - 1），还包含其他状态／类型修正及非负限制。"
    }
  },
  "leaders": {
    "number": "04",
    "addresses": [
      "0x1019afe48",
      "0x10199a84c"
    ],
    "en": {
      "title": "Leader marking and retreat",
      "text": "First marking scales current body HP and stores it as maximum HP; helmet handling also accounts for its reduction factor. Repeated true marking does not repeat this operation. This path does not change the entity level or directly multiply cached attack. Overlay thresholds use combined maximum body/helmet health. The ordinary retreat threshold is X < 232 with a 2.3-game-second countdown."
    },
    "zh-CN": {
      "title": "首领标记与撤退",
      "text": "首次标记缩放当前本体生命值并保存为最大生命值；头盔处理还考虑其削减因子。重复设置真值不会再次执行这一操作。这条路径不改变实体等级，也不直接乘算缓存攻击值。外观阈值使用本体／头盔最大生命值之和。普通撤退阈值为 X < 232，倒计时为 2.3 游戏秒。"
    }
  },
  "positions": {
    "number": "01",
    "addresses": [
      "0x1014c40c0",
      "0x1014c47e8",
      "0x1014c544c",
      "0x1023aa5b8"
    ],
    "en": {
      "title": "Creation, width, and per-action spacing",
      "text": "The ordinary jittered action creates its entity batch, then applies per-row spacing. Its empty custom-offset vector selects the default increment of 80 plus an integer draw in 0–29. Initial right-entry X adds HitRect.mWidth to the stage's result. Fifteen standard stages use the common entry method; Dark conditionally selects a qualifying gravestone shortcut and otherwise falls back to that method."
    },
    "zh-CN": {
      "title": "创建、宽度与每动作间距",
      "text": "普通随机间距动作先创建整批实体，再应用各行间距。自定义偏移向量为空时，使用默认增量 80，加上 0–29 的整数抽取。右侧入场的初始 X 在场景结果上加上 HitRect.mWidth。十五个标准场景使用共同入口方法；黑暗时代有条件地选择符合要求的墓碑捷径，否则回退到共同方法。"
    }
  },
  "rowGates": {
    "number": "02",
    "addresses": [
      "0x101595f3c",
      "0x1014fd55c",
      "0x101511010",
      "0x10156ac7c"
    ],
    "en": {
      "title": "Eligibility gates and the zero endpoint",
      "text": "The common predicate checks row count, enabled state, GridExtents.mY, and the stage gate. Pirate uses exact type-name tests; Future restricts disco_mech at the outer rows. Zero-weight records remain in the sampler. Its inclusive cumulative comparison can select the first zero-weight record at an exact-zero draw, as confirmed by a controlled native helper check. That check does not measure the endpoint's frequency in play."
    },
    "zh-CN": {
      "title": "资格条件与零端点",
      "text": "共同谓词检查行数、启用状态、GridExtents.mY 和场景条件。海盗港湾使用精确类型名检查；未来世界限制 disco_mech 的最外侧行。零权重记录仍保留在采样器中。其包含边界的累积比较，在抽取值恰为零时可以选择第一条零权重记录，受控原生辅助函数检查证实了这一点。该检查没有测量此端点在实际游玩中的频率。"
    }
  },
  "rowHistory": {
    "number": "03",
    "addresses": [
      "0x10156ab20",
      "0x10156aba0",
      "0x10157f418",
      "0x1016246ac"
    ],
    "en": {
      "title": "History counters, not a spawn timer",
      "text": "The Board constructor starts both historical counters at zero. The sampler adjusts normalized base weights using float32 operations and mutates the eligible row histories after selection. The article gives its algebraic form and rounded nominal shares. The separate timestamp starts at FLT_MAX; the traced mower write requires WaveGeneratorModule, while standard ordinary Endless uses WaveManagerModuleProperties."
    },
    "zh-CN": {
      "title": "历史计数器，而非生成计时器",
      "text": "Board 构造器将两个历史计数器初始化为零。采样器以 float32 运算调整归一化基础权重，选择后更新符合条件的行历史。正文给出其代数形式与舍入后的名义份额。独立时间戳初始为 FLT_MAX；追踪到的小推车写入要求 WaveGeneratorModule，而标准普通无尽使用 WaveManagerModuleProperties。"
    }
  },
  "circle": {
    "number": "04",
    "addresses": [
      "0x100ccab7c",
      "0x100cd9ea0",
      "0x1019958d4"
    ],
    "en": {
      "title": "Ghost Horse's added-to-Board event",
      "text": "The base placement hook synchronously emits OnZombieAddedToBoard. An active circle accepts eligible runtime small/mid entities, subject to flag, state, and elite checks, and writes its fixed destination. It neither chooses a fresh weighted row nor rewrites row history. The localization identifies animnuts as 球果训练家 and the horse as 幽林马. King/Fisherman subclass code continues after the base event."
    },
    "zh-CN": {
      "title": "幽林马的加入 Board 事件",
      "text": "基础位置钩子同步发出 OnZombieAddedToBoard。活动法阵接受运行时为小型／中型且通过标记、状态与精英检查的实体，并写入固定目标位置。它既不重新抽取加权行，也不重写行历史。本地化将 animnuts 命名为球果训练家，将马命名为幽林马。国王／渔夫的子类代码在基础事件之后继续执行。"
    }
  },
  "specialRows": {
    "number": "05",
    "addresses": [
      "0x10238803c",
      "0x10151e4ec",
      "0x102389300",
      "0x101520cac"
    ],
    "en": {
      "title": "Two related row scans with different self handling",
      "text": "Both hooks scan same-class objects already in the Board zombie list, including the newly created batch. Fisherman excludes the current object; King does not. Neither scan filters only living objects. With no row, normal King handling enters ZS_Die, while Fisherman's flagged branch requests removal immediately. Both reach base loot handling, and neither retries or refunds the spawn instruction."
    },
    "zh-CN": {
      "title": "相近的行扫描，不同的自身处理",
      "text": "两个钩子都扫描 Board 僵尸列表中的同类对象，包括新创建的批次。渔夫排除当前对象；国王不排除。两者都不是仅扫描存活对象。没有可用行时，普通国王处理进入 ZS_Die，渔夫带该标记的分支则立即请求移除。两者都会到达基础掉落处理，也都不会重试或退还生成指令。"
    }
  },
  "waveHealth": {
    "number": "01",
    "addresses": [
      "0x101ce76d8",
      "0x102082abc",
      "0x101ce7ce0",
      "0x1019b09c0",
      "0x10199dfc8",
      "0x101988e70"
    ],
    "en": {
      "title": "Post-action health snapshot",
      "text": "Wave start invokes all action callbacks before querying eligible current-wave health and storing m_currentWaveTotalHealth. The query filters the spawn-wave marker and excluded states and obtains virtual health values. Later checks compare newly queried health with the stored integer threshold. Placement rejection precedes the initial query; deaths after that query can lower remaining health without rewriting the snapshot."
    },
    "zh-CN": {
      "title": "动作完成后的生命值快照",
      "text": "波次开始时先调用所有动作回调，再查询符合条件的当前波次生命值并保存到 m_currentWaveTotalHealth。查询筛选生成波次标记与排除状态，并取得虚拟生命值。之后的检查将重新查询的生命值与保存的整数阈值比较。位置拒绝早于初始查询；查询之后的死亡可以降低剩余生命值，而不重写快照。"
    }
  },
  "waveClock": {
    "number": "02",
    "addresses": [
      "0x101ce7380",
      "0x101ce7ce0",
      "0x101ce6fe0"
    ],
    "en": {
      "title": "Timed advancement and large-wave delay",
      "text": "The normal timed-state update checks the next deadline and the minimum interval since the last wave, together with its mode guards. The health path can move the deadline earlier. The large-wave announcement state adds HugeWaveDelay to the existing deadline. Constructor timings are baselines; the WaveManager properties also attempt a DefaultWaveManagerProperties lookup."
    },
    "zh-CN": {
      "title": "计时推进与大波延迟",
      "text": "普通计时状态的更新同时检查下次截止时间、距上一波的最小间隔，以及模式条件。生命值路径可以提前截止时间。大波提示状态在已有截止时间上加上 HugeWaveDelay。构造器时间值属于基线；WaveManager 属性还会尝试查询 DefaultWaveManagerProperties。"
    }
  },
  "skipOption": {
    "number": "03",
    "addresses": [
      "0x101581d5c",
      "0x101ce7094",
      "0x101ce6e8c"
    ],
    "en": {
      "title": "Automatic manual-style requests",
      "text": "The false-to-true next-wave visibility event checks HasSkipNextWave and the boundary guards, then invokes the manual request handler. That ordinary WaveManager branch calls the advance function directly. The normal visibility condition uses nextWaveTime minus half the spawn interval. The automatic guard uses the regular FlagWaveInterval; it does not separately inspect a final-wave marker here."
    },
    "zh-CN": {
      "title": "自动发出的手动式请求",
      "text": "下一波可见性从假变为真的事件检查 HasSkipNextWave 与边界条件，再调用手动请求处理器。普通 WaveManager 分支直接调用推进函数。普通可见性条件使用 nextWaveTime 减去生成间隔的一半。自动保护条件使用常规 FlagWaveInterval；此处没有独立检查最终波标记。"
    }
  },
  "rushOption": {
    "number": "04",
    "addresses": [
      "0x1015946a8",
      "0x1019853a8",
      "0x101999778"
    ],
    "en": {
      "title": "The creation-time initial-rush condition",
      "text": "Entity creation checks the profile option, HastyOnStart, wave marker, and a mode exclusion before applying condition 7. The condition tracker doubles the movement-pace factor before later adjustments. Zombie update clears the condition at X <= 792. This creation branch does not reapply it after knockback. The catalog's four explicit false type flags are retained in the reference data."
    },
    "zh-CN": {
      "title": "创建时的初始加速状态",
      "text": "实体创建检查档案选项、HastyOnStart、波次标记及模式排除条件，再施加状态 7。状态追踪器在后续调整前将移动速度因子翻倍。僵尸更新在 X <= 792 时清除该状态。这条创建分支不会在击退后重新施加。目录中四个明确为假的类型标记保留在参考数据中。"
    }
  },
  "completion": {
    "number": "05",
    "addresses": [
      "0x101555514",
      "0x101ce4250",
      "0x101b5c264"
    ],
    "en": {
      "title": "Completion is an AND over registered predicates",
      "text": "The module-manager aggregate rejects an empty predicate vector and stops at its first false result. WaveManager registers a finished-state check; standard ordinary files also register ZombiesDeadWinCon. The latter scans qualifying zombie pointers without a current-wave restriction, applies explicit exceptions, and then checks grid-item collection 0x30 for blocking virtual predicates."
    },
    "zh-CN": {
      "title": "完成是注册谓词之间的逻辑与",
      "text": "模块管理器的汇总检查拒绝空谓词向量，并在第一个假结果处停止。WaveManager 注册结束状态检查；标准普通文件还注册 ZombiesDeadWinCon。后者扫描符合条件的僵尸指针，不限制为当前波次，应用明确的例外后，再检查网格物件集合 0x30 中阻止完成的虚拟谓词。"
    }
  },
  "portalClose": {
    "number": "06",
    "addresses": [
      "0x100122734",
      "0x100121a00",
      "0x100121e44"
    ],
    "en": {
      "title": "The portal remains a blocker until removal",
      "text": "GridItemZombiePortal's completion-blocking virtual returns true unconditionally. The ordinary emitter consumes the final queue entry and still advances its next deadline. A later empty-queue check starts the close animation, whose callback requests removal and invalidates the weak identity. Queue exhaustion and removal are separate states."
    },
    "zh-CN": {
      "title": "传送门在移除前仍阻止完成",
      "text": "GridItemZombiePortal 用于阻止完成的虚拟函数无条件返回真。普通释放器消耗最后一个队列条目后，仍会推进下次截止时间。之后的空队列检查开始关闭动画，由回调请求移除并使弱身份失效。队列耗尽与移除是不同状态。"
    }
  },
  "loss": {
    "number": "07",
    "addresses": [
      "0x10153839c",
      "0x1015386b4"
    ],
    "en": {
      "title": "The ordinary loss boundary",
      "text": "The module checks CanTriggerZombieWin, virtual state predicates, entity flags, and additional mode/type conditions before comparing X - 200 with the configured threshold. The article gives the unshifted case; a Board flag can shift that threshold and another mode can add a Y condition. The eligibility helper does not test for a nonnegative spawn-wave marker."
    },
    "zh-CN": {
      "title": "普通失败边界",
      "text": "模块先检查 CanTriggerZombieWin、虚拟状态谓词、实体标记及其他模式／类型条件，再将 X - 200 与配置阈值比较。正文给出未偏移情况；Board 标记可以移动阈值，另一种模式还可增加 Y 条件。资格辅助函数不要求生成波次标记为非负。"
    }
  },
  "progression": {
    "number": "08",
    "addresses": [
      "0x101ffc3e0",
      "0x101d6cf7c",
      "0x101c360dc",
      "0x101d4a4e8"
    ],
    "en": {
      "title": "Returned progress and the continuation boundary",
      "text": "The successful end-level response assigns its returned record before completion UI/events continue. The ordinary victory route then loads the next world file only when stored progress plus one is below 150. The filename helper uses the effective BossInterval. This is the inspected continuation rule, not a universal claim about server admission through other start/skip routes. All standard ordinary files declare CanSaveGameState false."
    },
    "zh-CN": {
      "title": "返回进度与继续关卡边界",
      "text": "成功的结束关卡响应先写入返回记录，再继续完成界面／事件。普通胜利路径随后只在已存进度加一小于 150 时加载下一份世界文件。文件名辅助函数使用有效的 BossInterval。这是所检查的继续关卡规则，并非对其他开始／跳关路径服务器准入的普遍断言。所有标准普通文件都声明 CanSaveGameState 为假。"
    }
  },
  "foodPlan": {
    "number": "01",
    "addresses": [
      "0x101ab6840",
      "0x101ce8a54"
    ],
    "en": {
      "title": "Plant-food count construction",
      "text": "The builder samples all eligible FlagWaveSetupList rows for a FlagCount. It reduces eligible PlantfoodSetupList minima and maxima using a minimum operation for each bound, then allocates the resulting count to waves. Materialization copies each wave's count into AdditionalPlantfood. The generated ordinary action leaves DynamicPlantfood and SpawnPlantName empty."
    },
    "zh-CN": {
      "title": "能量豆数量的构建",
      "text": "构建器从所有符合条件的 FlagWaveSetupList 行中抽取 FlagCount。它分别对符合条件的 PlantfoodSetupList 最小值和最大值取最小值，再把所得数量分配到波次。转换流程将每波数量复制到 AdditionalPlantfood。生成的普通动作将 DynamicPlantfood 与 SpawnPlantName 留空。"
    }
  },
  "foodMarker": {
    "number": "02",
    "addresses": [
      "0x1014c40c0",
      "0x1014c4324",
      "0x1019af834"
    ],
    "en": {
      "title": "A consumed request can be rejected",
      "text": "The ordered creation loop decrements quota before calling the entity marker. CanSpawnPlantFood false skips consumption; true consumes a unit. The marker separately checks profile/mode gates and rejects IsA(ZombieGargantuar) in DangerRoom. It returns no success result, and the caller has no refund or retry branch. These property and runtime-class tests are separate."
    },
    "zh-CN": {
      "title": "已消耗的请求仍可能被拒绝",
      "text": "有序创建循环在调用实体标记函数之前减少配额。CanSpawnPlantFood 为假时跳过消耗，为真时消耗一个单位。标记函数另外检查档案／模式条件，并在 DangerRoom 中拒绝 IsA(ZombieGargantuar)。它不返回成功结果，调用方没有退还或重试分支。属性检查与运行时类检查相互独立。"
    }
  },
  "foodDrop": {
    "number": "03",
    "addresses": [
      "0x1019a5dac",
      "0x10158157c",
      "0x101588a24"
    ],
    "en": {
      "title": "From carrier condition to pickup factory",
      "text": "Base loot dispatch emits the Board event before setting its processed-loot flag. The listener checks that flag, m_canDropLoot, hasplantfood, and mode guards. Its ordinary empty-name branch clears the carrier condition and invokes the pickup factory. The base removal callback also reaches loot dispatch; removal is not inherently a no-loot operation."
    },
    "zh-CN": {
      "title": "从携带状态到拾取物工厂",
      "text": "基础掉落分发在设置已处理掉落标记之前发出 Board 事件。监听器检查该标记、m_canDropLoot、hasplantfood 和模式条件。普通空名称分支清除携带状态并调用拾取物工厂。基础移除回调也会到达掉落分发；移除本身并不意味着没有掉落。"
    }
  },
  "lootSchedule": {
    "number": "04",
    "addresses": [
      "0x101ce66dc",
      "0x101a8b5e8",
      "0x101a8b124"
    ],
    "en": {
      "title": "Saved per-entry scheduling state",
      "text": "The installer invokes general-loot planning after world postprocessing and before the runtime WaveManager reseed. Eligible table rows retain separate UniqueId histories. The planner advances LevelLengthsPlayed, handles strictly due drops and schedules, and requests saving the records. Count and phase draws consume the global RNG. World/profile eligibility and effective table overrides are additional inputs."
    },
    "zh-CN": {
      "title": "按条目保存的计划状态",
      "text": "安装器在世界后处理之后、运行时 WaveManager 重新播种之前调用一般掉落规划。符合条件的表格行保留各自的 UniqueId 历史。规划器推进 LevelLengthsPlayed，处理严格到期的掉落与计划，并请求保存记录。数量与相位抽取消耗全局随机数。世界／档案资格和有效表格覆盖值也是输入。"
    }
  },
  "lootAssignment": {
    "number": "05",
    "addresses": [
      "0x101ce66dc",
      "0x1014c513c",
      "0x1019afe38"
    ],
    "en": {
      "title": "Individual-cost weighting without replacement",
      "text": "The pass collects ZombieSpawnerAction type vectors and creates parallel loot arrays. Nonzero loot codes are assigned by cumulative resolved WavePointCost; each tagged instruction and its cost leave subsequent draws. The tags do not reorder instructions or alter their level, row, leader, or plant-food fields. Entity creation later copies the annotation to the entity's stored loot code."
    },
    "zh-CN": {
      "title": "按单个成本加权的不放回分配",
      "text": "该流程收集 ZombieSpawnerAction 类型向量并创建平行掉落数组。非零掉落代码按解析后的 WavePointCost 累积值分配；每个已标记指令及其成本不再参与后续抽取。标记不会重排指令，也不改变等级、行、首领或能量豆字段。实体创建之后把注释复制为实体保存的掉落代码。"
    }
  },
  "lootDispatch": {
    "number": "06",
    "addresses": [
      "0x101a89994",
      "0x1019a5dac",
      "0x101a8b78c"
    ],
    "en": {
      "title": "Enum labels versus dispatched aliases",
      "text": "Registration names codes 1, 2, and 3 SilverCoin, GoldCoin, and Diamond. The inspected base dispatcher requests coin_silver for 1 and coin_gold for both 2 and 3. Codes 4–13 create no pickup through this dispatcher. These are requested pickup aliases; inventory credit is not inferred from the enum label."
    },
    "zh-CN": {
      "title": "枚举标签与实际分发别名",
      "text": "注册代码将 1、2、3 命名为 SilverCoin、GoldCoin、Diamond。所检查的基础分发函数为 1 请求 coin_silver，为 2 和 3 都请求 coin_gold。代码 4–13 不通过这个分发函数创建拾取物。这些是请求的拾取物别名，不能根据枚举标签推断物品栏入账。"
    }
  },
  selection: {
    number: '01', addresses: ['0x101ab6840'],
    en: { title: 'Pool selection by index', text: 'The builder adds the stage basic type, then chooses ZombieTypeCount entries from the configured pool. Each selected vector entry is removed before the next bounded draw. The baseline count is 4. Weight is not read by this selection pass.' },
    'zh-CN': { title: '按索引选择池条目', text: '构建器先加入场景的基础种类，再从配置池中选择 ZombieTypeCount 个条目。每个选中的向量条目在下一次有界抽取前移除。基线数量为 4。这个选择流程不读取 Weight。' },
  },
  highCost: {
    number: '02', addresses: ['0x101ab6d78'],
    en: { title: 'The high-cost replacement', text: 'Above BigZombieSureExistLevel, baseline 50, the helper checks for a selected type whose WavePointCost is at least 1500. If absent, it draws from qualifying remaining pool entries and replaces the last pool selection. The predicate concerns cost, not a particular runtime zombie class.' },
    'zh-CN': { title: '高成本替换', text: '超过 BigZombieSureExistLevel（基线为 50）后，辅助函数检查已选种类中是否有 WavePointCost 至少为 1500 的类型。若没有，就从剩余池中符合条件的条目里抽取，替换最后一次池选择。这个谓词检查成本，而非某个特定的运行时僵尸类。' },
  },
  filling: {
    number: '03', addresses: ['0x101ce7f08', '0x100366650'],
    en: { title: 'The weighted integer bag', text: 'The ordinary filler drops candidates whose WavePointCost exceeds the remaining budget, draws through the integer weighted bag, appends the chosen type, and subtracts its cost. FirstWave and the separate Cost property are not inputs to these helpers. Bounded integer draws use modulo reduction; bag shares describe interval lengths, not a claim of perfectly uniform RNG residues.' },
    'zh-CN': { title: '整数权重抽签袋', text: '普通填充流程去掉 WavePointCost 超过剩余预算的候选，通过整数权重袋抽取，追加选中种类，并扣除其成本。FirstWave 和单独的 Cost 属性不参与这些辅助函数。有界整数抽取使用模约减；袋内份额描述区间长度，并不声称随机数余数严格均匀。' },
  },
  unseen: {
    number: '04', addresses: ['0x101ce8598'],
    en: { title: 'Strict final-wave reservation', text: 'Before normal final-wave filling, the materializer visits selected types not yet seen. A type is appended only when its cost is strictly less than the current remaining budget. The budget is reduced after each insertion, so ordering and earlier insertions affect later eligibility.' },
    'zh-CN': { title: '严格的最终波补入条件', text: '在普通最终波填充前，波次转换流程访问尚未出现的已选种类。只有成本严格小于当前剩余预算时才追加。每次插入都会减少预算，因此顺序和更早的插入会影响后续资格。' },
  },
  ordering: {
    number: '05', addresses: ['0x100c03c8c'],
    en: { title: 'Ordering and the component example', text: 'The native ordered-set comparator compares type-pointer values. The website uses selected display order and a small seeded example RNG. The isolated filler demonstrates budget spending; the construction and music views generate preceding waves, final reservation, per-instruction levels, and the level-wide leader attempt. They demonstrate the traced rules without reproducing a native random sequence.' },
    'zh-CN': { title: '顺序与组件示例', text: '原生有序集合比较器比较类型指针值。网站使用所显示的已选顺序和小型带种子的示例 RNG。独立填充器展示预算消耗；构建与音乐视图生成此前各波、最终波预留、各指令等级，以及每关一次的首领尝试。它们演示已追踪的规则，不复现原生随机序列。' },
  },
  extras: {
    number: '06', addresses: ['0x101ce8a54', '0x101ab6840'],
    en: { title: 'Extra leader entries', text: 'The materializer attempts extra entries from displayed level 4 onward. The shared baseline declares LeaderProbability = 0.4 and LeaderMinWaveCost = 100. Leader eligibility uses a strict cost-greater-than test, followed by weighted selection. Successful entries are appended outside the ordinary filler budget. Wealth probability is zero in this baseline, but its chance draw is still consumed.' },
    'zh-CN': { title: '额外首领条目', text: '波次转换流程从显示关卡 4 起尝试额外条目。共享基线声明 LeaderProbability = 0.4、LeaderMinWaveCost = 100。首领资格使用成本严格大于阈值的检查，随后加权选择。成功条目在普通填充预算之外追加。该基线中的财神概率为零，但仍消耗其概率抽取。' },
  },
  shared: {
    number: '01', addresses: ['0x101ab6840', '0x101d6db00'],
    en: { title: 'The shared inputs', text: 'The ordinary description builder reads point fields from the shared DangerRoomPropertySheet. The response setter writes server-supplied values into that same object. The local generator declarations are a separate set of fields; they are not the point inputs consumed by this builder.' },
    'zh-CN': { title: '共享输入', text: '普通描述构建器读取共享 DangerRoomPropertySheet 中的点数字段。响应设置函数将服务器提供的数值写入同一个对象。生成器自身的声明属于另一组字段，不是这个构建器使用的点数输入。' },
  },
  level: {
    number: '02', addresses: ['0x101d6ca84', '0x101d4a4e8', '0x101c360dc'],
    en: { title: 'Which level number?', text: 'The designer getter returns the stored progress value plus one. The filename helper chooses the Boss variant when the displayed number is divisible by the shared BossInterval, whose bundled value is 5. The inspected post-victory continuation branch loads a next level only below 150. The explorer therefore offers ordinary numbers from 1–149; this client branch does not establish a universal server admission rule.' },
    'zh-CN': { title: '使用哪个关卡数？', text: '供设计器使用的读取函数返回已存进度值加一。文件名辅助函数在显示关卡数可被共享 BossInterval 整除时选择 Boss 变体，其内置值为 5。已检查的胜利后继续分支只在下一个关卡数小于 150 时加载关卡。因此交互示例提供 1–149 中的普通关卡数；这个客户端分支不能确立通用的服务器准入规则。' },
  },
  layout: {
    number: '03', addresses: ['0x101ab6840', '0x101d4a7e8'],
    en: { title: 'Wave count and flag spacing', text: 'The description builder uses MinWaveCount, MaxWaveCount, WaveAddEach, and WaveAddInterval. The inspected constructor defaults are 6, 15, 1, and 5. This guide uses the supplied gameplay wave settings 5, 15, 1, and 10. Within the resulting 5–15-wave range, the target group count is 1 below 7 waves, 2 below 12, and 3 otherwise. The resulting spacing equals the wave count divided by that target, rounded up.' },
    'zh-CN': { title: '波次数与旗帜间隔', text: '描述构建器使用 MinWaveCount、MaxWaveCount、WaveAddEach 和 WaveAddInterval。已检查的构造函数默认值分别是 6、15、1 和 5。本指南采用收到的实际游玩波次设置 5、15、1 和 10。在得到的 5–15 波范围内，目标分组数在少于 7 波时为 1，少于 12 波时为 2，其余为 3。得到的间隔等于波次数除以目标分组数，再向上取整。' },
  },
  budget: {
    number: '04', addresses: ['0x101ab6840', '0x101d4a7e8'],
    en: { title: 'The underlying budget', text: 'The shared constructor supplies StartingPoints = 100, BasePointIncrementPerWave = 30, and BasePointIncrementPerLevel = 5. The description builder adds the combined per-wave increment once for each zero-based wave index.' },
    'zh-CN': { title: '基础预算', text: '共享构造函数提供 StartingPoints = 100、BasePointIncrementPerWave = 30 和 BasePointIncrementPerLevel = 5。描述构建器根据从零开始的波次索引，逐次增加合并后的每波增量。' },
  },
  boost: {
    number: '05', addresses: ['0x101ce8a54'],
    en: { title: 'One boost at either boundary', text: 'The materialization path multiplies the base budget by 2.5 when the wave is at a regular flag boundary or is final. It applies the multiplier once even when both conditions hold. The product uses float32 arithmetic and is truncated to an integer. The next wave continues from the unboosted base progression.' },
    'zh-CN': { title: '任一边界，一次加成', text: '波次转换流程在常规旗帜边界波或最终波上，将基础预算乘以 2.5。即使同时满足两个条件，也只应用一次倍率。乘积使用 float32 运算，再截断为整数。下一波继续沿用未加成的基础增长规律。' },
  },
  scope: {
    number: '06', addresses: ['0x101ce7f08', '0x101c79bec', '0x101ce4f5c'],
    en: { title: 'What the budget pays for', text: 'The weighted filler consumes points using each selected type’s WavePointCost. Extra leaders are appended after normal filling; the flag zombie is installed as a separate action. Eighties can replace instructions in postprocessing without repeating the ordinary budget check. The budget therefore describes one stage of construction, not a final zombie count or total-health cap.' },
    'zh-CN': { title: '预算支付什么', text: '加权填充流程按所选种类的 WavePointCost 消耗点数。额外首领在普通填充完成后追加；旗帜僵尸作为独立动作安装。Eighties 可以在后处理时替换指令，而不重新进行普通预算检查。因此预算描述的是构建中的一个阶段，不是最终僵尸数量，也不是总生命值上限。' },
  },
} as const;
export type EvidenceId = keyof typeof evidence;
