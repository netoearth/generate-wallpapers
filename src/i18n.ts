export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    appTitle: '壁纸 AI',
    appSubtitle: '描述氛围感 • 一键生成4款壁纸',
    nineToSixteen: '9:16 竖屏',
    aspectRatio: '画幅比例',
    resolution: '分辨率',
    model: 'AI 生成引擎',
    history: '生成历史',
    settings: '设置',
    applySettings: '应用设置',
    language: '语言',
    switchLanguage: '切换语言',

    // Models
    modelFluxFree: 'FLUX Dev (免密免费)',
    modelFluxFreeDesc: '无需API密钥，免费极速生成高质量壁纸',
    modelGeminiPro: 'Gemini 3 Pro (付费)',
    modelGeminiProDesc: 'Google专业级生图，需绑定结算账户的API Key',
    modelGeminiFlash: 'Gemini 3.1 Flash (付费)',
    modelGeminiFlashDesc: '轻量快速生成，需绑定结算账户的API Key',
    freeTag: '推荐免费',
    paidTag: '需付费Key',

    // Vibe Input
    inputPlaceholder: '描述你想要的氛围，例如："雨夜赛博朋克 lo-fi"...',
    remixPlaceholder: '描述调整方向（或保留当前氛围进行衍生）...',
    surpriseMe: '随机灵感',
    generateButton: '生成 4 款壁纸',
    generatingButton: '正在生成 4 款壁纸...',
    remixButton: '基于此图再创作 4 款',
    remixActive: '再创作模式已激活',
    remixActiveDesc: '将基于此壁纸的视觉构图与氛围，生成下一组4款变体',
    clearReference: '清除参考图',
    vibesLabel: '推荐氛围：',

    // Grid
    variationsHeader: '4 款专属变体',
    tapToInspect: '点击查看大图、锁屏预览及再创作',
    craftingTitle: '正在构思并生成 4 款变体...',
    fullView: '全屏',
    download: '下载',
    remix: '再创作',
    emptyTitle: '定制专属于你的手机壁纸',
    emptyDesc: '输入任何你喜爱的美学风格或氛围词，AI将实时为你打造4款专为手机屏幕定制的高清壁纸。点击任意一款即可一键下载或继续衍生！',
    popularStarters: '热门氛围灵感',

    // Full Screen Modal
    lockScreen: '锁屏效果',
    hideLockScreen: '关闭锁屏',
    lockScreenNoticeTitle: '氛围感知',
    lockScreenNoticeBody: '新壁纸已准备就绪，点亮你的手机屏幕',
    downloadWallpaper: '下载高清壁纸',
    remixBatch: '以此图再创作 4 款',
    prevWallpaper: '上一张',
    nextWallpaper: '下一张',
    close: '关闭',
    copiedUrl: '壁纸链接已复制',

    // History Modal
    historyTitle: '壁纸生成记录',
    noHistory: '暂无生成记录，快去生成第一组壁纸吧！',
    clearHistory: '清空历史',
    loadBatch: '恢复此组壁纸',
    remixBatchTag: '再创作',

    // Errors
    notice: '提示',
    quotaErrorHint: '当前选择的Gemini生图模型需要开通结算的API Key（免费层配额为0）。系统已为您自动切换到免费的FLUX免密AI引擎！',
    generalError: '壁纸生成遇到问题，请重试或更换描述词。',

    // Presets
    presets: [
      { vibe: '雨夜赛博朋克 lo-fi', desc: '雨中霓虹倒影与深邃冷调街景' },
      { vibe: '复古蒸汽波日出', desc: '超现实渐变云霞与复古光晕' },
      { vibe: '北欧迷雾冷杉森林', desc: '静谧清冷的极简深绿林野' },
      { vibe: '极简黑曜辉光', desc: '纯粹暗黑AMOLED与微光流体' },
      { vibe: '幻彩深海发光水母', desc: '神秘深蓝与荧光浮游生物' },
      { vibe: '90年代动漫黄昏城景', desc: '怀旧手绘质感与暖橘落日余晖' },
      { vibe: '黄金流沙荒漠孤木', desc: '柔和夕阳沙丘与极简留白美学' },
      { vibe: '璀璨星云日食幻境', desc: '浩瀚星系与宇宙微光日环食' },
      { vibe: '治愈系翡翠苔藓微景观', desc: '晨露微光与微型生态玻璃球' },
      { vibe: '东京午夜落雨电车', desc: '窗外雨丝划过与朦胧城市灯火' },
    ],
  },

  en: {
    appTitle: 'Wallpaper AI',
    appSubtitle: 'Describe a vibe • 4 Variations',
    nineToSixteen: '9:16 Phone',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    model: 'AI Model Engine',
    history: 'History',
    settings: 'Settings',
    applySettings: 'Apply Settings',
    language: 'Language',
    switchLanguage: 'Switch Language',

    // Models
    modelFluxFree: 'FLUX Dev (Free / No Key)',
    modelFluxFreeDesc: 'Free, fast, high-quality phone wallpaper generator without API keys',
    modelGeminiPro: 'Gemini 3 Pro (Paid Key)',
    modelGeminiProDesc: 'Google studio quality, requires Gemini key with billing enabled',
    modelGeminiFlash: 'Gemini 3.1 Flash (Paid Key)',
    modelGeminiFlashDesc: 'Fast lightweight engine, requires Gemini key with billing enabled',
    freeTag: 'Free & Fast',
    paidTag: 'Paid Key',

    // Vibe Input
    inputPlaceholder: 'Describe your vibe, e.g. "rainy cyberpunk lo-fi"...',
    remixPlaceholder: 'Describe style changes (or keep current vibe to evolve)...',
    surpriseMe: 'Surprise Vibe',
    generateButton: 'Generate 4 Variations',
    generatingButton: 'Crafting 4 Wallpapers...',
    remixButton: 'Remix Next 4 Variations',
    remixActive: 'Remix Mode Active',
    remixActiveDesc: 'Using this wallpaper as visual reference for the next 4 variations',
    clearReference: 'Clear Reference',
    vibesLabel: 'Vibes:',

    // Grid
    variationsHeader: '4 Variations',
    tapToInspect: 'Tap to inspect, preview lock screen & remix',
    craftingTitle: 'Crafting 4 Variations...',
    fullView: 'Full',
    download: 'Download',
    remix: 'Remix',
    emptyTitle: 'Generate Your Next Wallpaper',
    emptyDesc: 'Type any aesthetic mood or vibe to generate 4 variations tailored for your phone screen. Tap any variation to download or remix!',
    popularStarters: 'Popular Vibe Starters',

    // Full Screen Modal
    lockScreen: 'Lock Screen',
    hideLockScreen: 'Hide Lock',
    lockScreenNoticeTitle: 'Vibe Check',
    lockScreenNoticeBody: 'Your fresh wallpaper looks pristine on your phone display',
    downloadWallpaper: 'Download Wallpaper',
    remixBatch: 'Remix Batch',
    prevWallpaper: 'Previous',
    nextWallpaper: 'Next',
    close: 'Close',
    copiedUrl: 'Wallpaper link copied',

    // History Modal
    historyTitle: 'Wallpaper History',
    noHistory: 'No wallpapers generated yet. Start with a vibe prompt above!',
    clearHistory: 'Clear History',
    loadBatch: 'Load Batch',
    remixBatchTag: 'Remix',

    // Errors
    notice: 'Notice',
    quotaErrorHint: 'Gemini image generation models require a billing-enabled account (Free Tier quota is 0). We have seamlessly switched to the free FLUX AI engine for you!',
    generalError: 'Encountered an issue while generating wallpapers. Please try again.',

    // Presets
    presets: [
      { vibe: 'rainy cyberpunk lo-fi', desc: 'Neon reflections & dark rainy streets' },
      { vibe: 'pastel vaporwave sunrise', desc: 'Surreal gradient clouds & retro glow' },
      { vibe: 'foggy nordic pine forest', desc: 'Minimalist moody green wilderness' },
      { vibe: 'minimalist obsidian glow', desc: 'Deep AMOLED black with subtle luminescence' },
      { vibe: 'ethereal deep sea jellyfish', desc: 'Bioluminescent deep ocean wonder' },
      { vibe: 'retro 90s anime city dusk', desc: 'Nostalgic twilight city silhouette' },
      { vibe: 'golden hour sand dunes', desc: 'Warm desert ripples and minimal shadows' },
      { vibe: 'cosmic solar eclipse nebula', desc: 'Interstellar corona & celestial dust' },
      { vibe: 'emerald moss terrarium', desc: 'Morning dew & micro botanical world' },
      { vibe: 'tokyo midnight neon rain', desc: 'Blurry city lights on rain-streaked glass' },
    ],
  },
};
