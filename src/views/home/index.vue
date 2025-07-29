<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// 静态导入所有图片
import p1Img from '@/assets/images/pic/p1.jpg';
import p2Img from '@/assets/images/pic/p2.jpg';
import p3Img from '@/assets/images/pic/p3.jpg';
import p4Img from '@/assets/images/pic/p4.jpg';
import p5Img from '@/assets/images/pic/p5.jpg';
import p6Img from '@/assets/images/pic/p6.jpg';
import p7Img from '@/assets/images/pic/p7.jpg';
import p8Img from '@/assets/images/pic/p8.jpg';
import p9Img from '@/assets/images/pic/p9.jpg';
import office12Img from '@/assets/images/pic/office12.jpg';
import office13Img from '@/assets/images/pic/office13.jpg';
import office14Img from '@/assets/images/pic/office14.jpg';

// 静态导入星星图标
import oneStarImg from '@/assets/icon/one-star.png';
import emptyStarImg from '@/assets/icon/empty.png';

const router = useRouter();

// 星星图标计算属性
const starIcon = computed(() => gameSuccess.value ? oneStarImg : emptyStarImg);

// 定义关卡点位类型
interface PuzzlePoint {
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
  highlightTitle?: string; // 高亮区域的标题
  highlightDetail?: string; // 高亮区域的详细说明
}

// 定义关卡类型
interface GameLevel {
  image: string;
  points: PuzzlePoint[];
}

// 游戏状态
const hearts = ref(3); // 初始3颗心
const currentLevel = ref(1); // 当前关卡
const totalLevels = 6; // 总关卡数
const timeLeft = ref(30); // 倒计时30秒
const gameStarted = ref(false); // 游戏是否开始
const gameOver = ref(false); // 游戏是否结束
const gameSuccess = ref(false); // 游戏是否成功
let timer: number | null = null; // 计时器

// 添加调试模式开关
const debugMode = ref(false); // 设置为true开启调试模式
const useOrderedImages = ref(true); // 调试时按顺序显示图片，不随机
const pauseTimer = ref(true); // 调试时暂停倒计时

// 所有可用的游戏图片和提示信息
const allGameLevels: GameLevel[] = [
  {
    image: p1Img,
    points: [
      { 
        x: 50, 
        y: 48, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 127, 
        y: 130, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 140, 
        y: 443, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 140, 
        y: 630, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p2Img,
    points: [
      { 
        x: 50, 
        y: 48, 
        width: 480, 
        height: 50, 
        found: false, 
        highlightTitle: '主题需要注意',
        highlightDetail: '公司内部的通知但是显示的是外部的邮件说明'
      },
      { 
        x: 127, 
        y: 130, 
        width: 280, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人域名进行了伪装，仔细查看发现还是有区别的'
      },
      { 
        x: 445, 
        y: 420, 
        width: 180, 
        height: 40, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '邮件存在链接需要格外注意，首先核实链接中的域名是否为企业真实域名，如果不是及时上报'
      }
    ]
  },
  {
    image: p3Img,
    points: [
      { 
        x: 70, 
        y: 50, 
        width: 135, 
        height: 45, 
        found: false, 
        highlightTitle: '访问网站需要有证书',
        highlightDetail: '访问网站如果显示不安全，采用http访问，需要格外注意数据安全性，有被盗取数据的风险'
      },
      { 
        x: 205, 
        y: 50, 
        width: 138, 
        height: 45, 
        found: false, 
        highlightTitle: '网站域名要核对',
        highlightDetail: '访问网站记得核对域名，与企业真实域名存在差异'
      },
      { 
        x: 130, 
        y: 125, 
        width: 180, 
        height: 45, 
        found: false, 
        highlightTitle: '网站布局异常',
        highlightDetail: '企业logo名称存在少字的情况需要格外注意，有可能是伪造网站'
      },
      { 
        x: 890, 
        y: 360, 
        width: 320, 
        height: 250, 
        found: false, 
        highlightTitle: '登录内容注意甄别',
        highlightDetail: '公共网站登录途径一般比较多，如果只是单一账号访问，并且没有注册等选项需要额外注意'
      }
    ]
  },
  {
    image: p4Img,
    points: [
      { 
        x: 100, 
        y: 120, 
        width: 250, 
        height: 40, 
        found: false, 
        highlightTitle: '发件人邮箱注意看',
        highlightDetail: '收到福利邮件注意，先检查一下发件人的邮箱地址'
      },
      { 
        x: 623, 
        y: 615, 
        width: 140, 
        height: 50, 
        found: false, 
        highlightTitle: '邮件链接要判断',
        highlightDetail: '带链接的按钮一定先甄别网站的真实性'
      },
      { 
        x: 720, 
        y: 685, 
        width: 100, 
        height: 25, 
        found: false, 
        highlightTitle: '客服电话要验证真伪',
        highlightDetail: '带人工客服电话的邮件，可以网上核实是否为真实客服'
      }
    ]
  },
  {
    image: p5Img,
    points: [
      { 
        x: 100, 
        y: 110, 
        width: 260, 
        height: 50, 
        found: false, 
        highlightTitle: '发件人邮箱注意看',
        highlightDetail: '收到公司内部邮件注意先检查一下发件人的邮箱地址，是否与公司域名一致'
      },
      { 
        x: 565, 
        y: 410, 
        width: 180, 
        height: 65, 
        found: false, 
        highlightTitle: '邮件链接要判断',
        highlightDetail: '带链接的按钮一定先甄别网站的真实性'
      },
      { 
        x: 50, 
        y: 620, 
        width: 210, 
        height: 66, 
        found: false, 
        highlightTitle: '客服电话要验证真伪',
        highlightDetail: '带人工客服电话的邮件，可以网上核实是否为真实客服'
      }
    ]
  },
  {
    image: p6Img,
    points: [
      { 
        x: 120, 
        y: 140, 
        width: 210, 
        height: 25, 
        found: false, 
        highlightTitle: '发件人邮箱注意看',
        highlightDetail: '收到公司内部邮件注意先检查一下发件人的邮箱地址，是否与公司域名一致'
      },
      { 
        x: 380, 
        y: 420, 
        width: 490, 
        height: 50, 
        found: false, 
        highlightTitle: '邮件链接要判断',
        highlightDetail: '邮件显示的链接不一定是真实链接，可以把鼠标放上去或者链接复制出来核对真实链接地址'
      }
    ]
  },
  {
    image: p7Img,
    points: [
      { 
        x: 0, 
        y: 45, 
        width: 510, 
        height: 35, 
        found: false, 
        highlightTitle: '邮件主题需要警惕',
        highlightDetail: '系统告警了通知优先通过内部群聊电话找安全部门确认'
      },
      { 
        x: 60, 
        y: 84, 
        width: 430, 
        height: 35, 
        found: false, 
        highlightTitle: '发件邮箱要核对',
        highlightDetail: '核对发件人邮箱地址是否为真实的公司内部域名'
      },
      { 
        x: 0, 
        y: 497, 
        width: 625, 
        height: 42, 
        found: false, 
        highlightTitle: '需要点链接要判断',
        highlightDetail: '邮件链接无法辨别真伪勿乱点随意，点击外链很可能造成电脑中病毒'
      }
    ]
  },
  {
    image: p8Img,
    points: [
      { 
        x: 30, 
        y: 45, 
        width: 330, 
        height: 35, 
        found: false, 
        highlightTitle: '邮件主题需要警惕',
        highlightDetail: '收到企业内部福利专享的邮件，可以内部群聊核实下'
      },
      { 
        x: 30, 
        y: 90, 
        width: 380, 
        height: 70, 
        found: false, 
        highlightTitle: '发件邮箱要核对',
        highlightDetail: '发件人确认是否为公司真实部分，发件人的域名确认是否为公司域名'
      },
      { 
        x: 30, 
        y: 310, 
        width: 200, 
        height: 160, 
        found: false, 
        highlightTitle: '二维码不乱扫',
        highlightDetail: '存在二维码的邮件注意甄别真实性，不要轻易扫码添加'
      },
      { 
        x: 30, 
        y: 680, 
        width: 230, 
        height: 30, 
        found: false, 
        highlightTitle: '客服电话先核对',
        highlightDetail: '涉及热线电话的情况，优先查询客服电话的真实性'
      }
    ]
  },
  {
    image: p9Img,
    points: [
      { 
        x: 60, 
        y: 45, 
        width: 380, 
        height: 40, 
        found: false, 
        highlightTitle: '网站域名先观察',
        highlightDetail: '发现网站存在异常第一时间查看网站域名是否真实'
      },
      { 
        x: 890, 
        y: 300, 
        width: 390, 
        height: 360, 
        found: false, 
        highlightTitle: '账号密码需要辨别',
        highlightDetail: '登录栏注意甄别获取的账号信息，核实忘记密码等选项的链接是否存在异常'
      }
    ]
  },
  {
    image: office12Img,
    points: [
      { 
        x: 350, 
        y: 100, 
        width: 560, 
        height: 320, 
        found: false, 
        highlightTitle: '会议室白板内容要清理',
        highlightDetail: '会议室白板的工作讨论内容离开时要擦除干净'
      },
      { 
        x: 520, 
        y: 430, 
        width: 210, 
        height: 180, 
        found: false, 
        highlightTitle: '员工离开要锁屏',
        highlightDetail: '员工离开工位电脑要及时锁屏'
      },
      { 
        x: 430, 
        y: 660, 
        width: 340, 
        height: 70, 
        found: false, 
        highlightTitle: '文件要及时收起',
        highlightDetail: '涉及的文件及时收起来'
      }
    ]
  },
  {
    image: office13Img,
    points: [
      { 
        x: 760, 
        y: 140, 
        width: 160, 
        height: 60, 
        found: false, 
        highlightTitle: '密码不要明文展示',
        highlightDetail: '电脑开机密码直接贴在桌面上，容易被利用'
      },
      { 
        x: 760, 
        y: 470, 
        width: 140, 
        height: 50, 
        found: false, 
        highlightTitle: 'U盘用完及时拔出',
        highlightDetail: 'U盘用完及时拔出，避免数据丢失或窃取'
      },
      { 
        x: 880, 
        y: 610, 
        width: 330, 
        height: 50, 
        found: false, 
        highlightTitle: '合同文件安全存放',
        highlightDetail: '合同文件用完存放在安全位置，避免随处摆放'
      },
      { 
        x: 160, 
        y: 120, 
        width: 570, 
        height: 327, 
        found: false, 
        highlightTitle: '离开工位要锁屏',
        highlightDetail: '离开工位，请即时锁屏'
      }
    ]
  },
  {
    image: office14Img,
    points: [
      { 
        x: 20, 
        y: 560, 
        width: 330, 
        height: 180, 
        found: false, 
        highlightTitle: '敏感文件即用即取',
        highlightDetail: '打印机内部敏感文件，即用即取，避免放在公共区域'
      },
      { 
        x: 630, 
        y: 440, 
        width: 380, 
        height: 180, 
        found: false, 
        highlightTitle: '手机要及时锁屏',
        highlightDetail: '个人手机要及时锁屏，请妥善保管好'
      }
    ]
  }
];

// 当前游戏的关卡数据
const gameLevels = ref<GameLevel[]>([]);

// 以下变量暂时保留，可能在后续功能中使用
// const currentTip = ref('');
// const showTip = ref(false);

// 获取当前关卡数据
const currentLevelData = computed(() => {
  if (!gameLevels.value || gameLevels.value.length === 0 || currentLevel.value < 1) {
    return { image: '', points: [] };
  }
  return gameLevels.value[currentLevel.value - 1];
});

// 当前关卡的解密点
const puzzlePoints = computed(() => {
  return currentLevelData.value?.points || [];
});

// 以下功能暂时保留，可能在后续功能中使用
// const titleRefs = ref<Record<string, HTMLElement>>({});

// 简化连接线逻辑，不再动态调整宽度，避免闪烁
// const simplifiedUpdateLines = () => {
//   // 不再需要复杂的动态宽度计算，CSS已经设置了合适的固定宽度
//   console.log('连接线样式已固定，避免闪烁');
// };

// 判断点位是否靠近屏幕右边
const isPointNearRightEdge = (point: PuzzlePoint) => {
  // 我们将固定边界设置为600px，大于这个值的点被视为靠近右边
  return point.x > 600;
};

// 获取窗口宽度的响应式变量
const windowWidth = ref(0);

// 更新窗口宽度
const updateWindowWidth = () => {
  windowWidth.value = window ? window.innerWidth : 1000; // 默认值为1000
};

// 错误点击次数
const wrongClicks = ref(0);

// 计算已发现的解密点数量
const foundPoints = computed(() => {
  return puzzlePoints.value.filter(point => point.found).length;
});

// 计算所有解密点是否都已找到
const allPointsFound = computed(() => {
  return foundPoints.value === puzzlePoints.value.length;
});

// 计算时间块数组，总共10个块
const timeBlocks = computed(() => {
  const totalBlocks = 10;
  const visibleBlocks = Math.ceil((timeLeft.value / 30) * totalBlocks);
  return Array(totalBlocks).fill(0).map((_, index) => index < visibleBlocks);
});

// 随机打乱数组顺序
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 随机选择6个关卡
const selectRandomLevels = (): GameLevel[] => {
  // 如果是调试模式且设置了按顺序显示，则直接返回前6个关卡
  if (debugMode.value && useOrderedImages.value) {
    return JSON.parse(JSON.stringify(allGameLevels.slice(0, 6)));
  }
  
  // 正常随机逻辑
  const allLevelsCopy: GameLevel[] = JSON.parse(JSON.stringify(allGameLevels));
  const shuffledLevels = shuffleArray(allLevelsCopy);
  return shuffledLevels.slice(0, 6);
};

// 添加直接跳转到指定关卡的功能
const jumpToLevel = (levelIndex: number) => {
  if (levelIndex >= 0 && levelIndex < allGameLevels.length) {
    // 更新当前游戏关卡，只包含选定的一个关卡
    gameLevels.value = [JSON.parse(JSON.stringify(allGameLevels[levelIndex]))];
    
    // 重置游戏状态但保持在当前关卡
    currentLevel.value = 1;
    hearts.value = 3;
    timeLeft.value = 30;
    gameStarted.value = true;
    gameOver.value = false;
    gameSuccess.value = false;
    wrongClicks.value = 0;
    
    // 重新启动计时器
    if (timer) clearInterval(timer);
    startTimer();
    
    // 保存当前选择的图片索引到本地存储，以便页面刷新后保持
    localStorage.setItem('currentDebugImageIndex', levelIndex.toString());
  }
};

// 初始化游戏
const initGame = () => {
  hearts.value = 3;
  timeLeft.value = 30;
  currentLevel.value = 1;
  gameStarted.value = true;
  gameOver.value = false;
  gameSuccess.value = false;
  wrongClicks.value = 0;
  
  // 如果是调试模式，尝试从本地存储获取上次选择的图片索引
  if (debugMode.value) {
    const savedIndex = localStorage.getItem('currentDebugImageIndex');
    if (savedIndex !== null) {
      const index = parseInt(savedIndex);
      if (index >= 0 && index < allGameLevels.length) {
        // 直接加载保存的图片
        gameLevels.value = [JSON.parse(JSON.stringify(allGameLevels[index]))];
        return; // 提前返回，不执行下面的随机选择
      }
    }
  }
  
  // 随机选择6个关卡
  gameLevels.value = selectRandomLevels();
  
  // 启动倒计时
  startTimer();
};

// 启动倒计时
const startTimer = () => {
  if (timer) clearInterval(timer);
  
  // 如果调试模式下设置了暂停倒计时，则不启动计时器
  if (debugMode.value && pauseTimer.value) {
    return;
  }
  
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      // 时间用完，结束游戏
      endGame();
    }
  }, 1000);
};

// 切换暂停计时器状态
const togglePauseTimer = () => {
  pauseTimer.value = !pauseTimer.value;
  if (pauseTimer.value) {
    // 暂停计时器
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  } else {
    // 重新启动计时器
    startTimer();
  }
};

// 结束游戏
const endGame = () => {
  if (timer) clearInterval(timer);
  gameStarted.value = false;
  gameOver.value = true;
  
  // 只有在爱心还有剩余且所有不同点都找到的情况下才算成功
  // 如果倒计时结束（timeLeft <= 0）且没有找到所有不同点，则失败
  if (hearts.value > 0 && allPointsFound.value) {
    gameSuccess.value = true;
  } else {
    gameSuccess.value = false;
  }
};

// 继续游戏（下一关）
const continueGame = () => {
  if (currentLevel.value < totalLevels) {
    currentLevel.value++;
    timeLeft.value = 30;
    gameStarted.value = true;
    gameOver.value = false;
    gameSuccess.value = false;
    wrongClicks.value = 0;
    
    // 重新启动计时器
    startTimer();
  } else {
    // 游戏通关，所有关卡完成
    gameOver.value = true;
    gameSuccess.value = true;
  }
};

// 重新开始游戏
const restartGame = () => {
  console.log("重新开始游戏");
  currentLevel.value = 1;
  initGame();
};

// 点击图片区域处理
const handleImageClick = (event: MouseEvent) => {
  if (gameOver.value || !gameStarted.value) return;
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 检查是否点击了解密点
  let clickedPoint = false;
  
  for (let i = 0; i < puzzlePoints.value.length; i++) {
    const point = puzzlePoints.value[i];
    if (!point.found && 
        x >= point.x && x <= point.x + point.width && 
        y >= point.y && y <= point.y + point.height) {
      // 找到了一个解密点
      point.found = true;
      clickedPoint = true;
      
      // 添加点击反馈效果 - 移除闪烁效果，直接显示透明高亮
      // const gameImage = event.currentTarget as HTMLElement;
      
      // 检查是否全部找到
      if (allPointsFound.value) {
        endGame();
      }
      break;
    }
  }
  
  // 如果没有点击到解密点，扣除爱心
  if (!clickedPoint) {
    wrongClicks.value++;
    
    // 每次错误都扣半颗心
    hearts.value -= 0.5;
    
    // 检查游戏是否结束
    if (hearts.value <= 0) {
      hearts.value = 0;
      endGame();
    }
  }
};

// 返回首页
const goToHome = () => {
  if (timer) clearInterval(timer);
  router.push('/');
};

// 组件挂载时初始化游戏
onMounted(() => {
  initGame();
  
  // 更新窗口宽度
  updateWindowWidth();
  
  // 添加窗口大小变化的监听器
  if (window) {
    window.addEventListener('resize', updateWindowWidth);
  }
  
  // 不再需要MutationObserver来动态更新连接线
  // 移除之前的观察者逻辑，改为使用固定样式
});

// 监听点的变化，不再需要更新连接线
// 移除之前的监听逻辑

// 组件卸载时清除计时器和事件监听器
onUnmounted(() => {
  if (timer) clearInterval(timer);
  
  // 移除窗口大小变化的监听器
  if (window) {
    window.removeEventListener('resize', updateWindowWidth);
  }
});

const showSuccessText = ref(false);
const showStars = ref(false);

// 计算半心的样式，使其在视觉上与其他心形保持一致
const halfHeartStyle = computed(() => {
  const isMobile = windowWidth.value <= 768;
  if (isMobile) {
    return {
      width: '30px',
      height: '26px',
      transform: 'scale(1.1) translateX(-1px)',
      objectFit: 'contain' as const
    };
  } else {
    return {
      width: '57px',
      height: '50px',
      transform: 'scale(1.1) translateX(-2px)',
      objectFit: 'contain' as const
    };
  }
});

watch(gameOver, async (val) => {
  if (val) {
    showSuccessText.value = false;
    showStars.value = false;
    await nextTick();
    showStars.value = true;
    setTimeout(() => {
      showSuccessText.value = true;
    }, 600); // 星星动画0.3*3=0.9s，文字在0.6s时开始淡入
  }
});
</script>

<template>
  <div class="game-container">
    <!-- 游戏顶部导航栏 -->
    <div class="game-header" :class="{ 'header-padding': !gameOver }">
      <!-- 爱心生命值 -->
      <div class="hearts">
        <div class="heart" v-for="i in 3" :key="i">
          <img v-if="hearts >= i" src="@/assets/icon/a-all.png" class="heart-full" alt="满爱心" />
          <img v-else-if="hearts === i - 0.5" 
               src="@/assets/icon/a-half.png" 
               class="heart-half" 
               alt="半爱心"
               :style="halfHeartStyle" />
          <img class="heart-empty" v-else src="@/assets/icon/a-null.png" alt="空爱心" />
        </div>
      </div>
      
      <!-- 倒计时和关卡进度 -->
      <div class="timer-container">
        <!-- 倒计时 -->
        <div class="timer">
          <div class="timer-wrapper">
            <div class="timer-blocks">
              <div 
                v-for="(active, index) in timeBlocks" 
                :key="index"
                class="time-block" 
                :class="{ 'active': active }"
              ></div>
            </div>
            <div class="timer-text">{{ timeLeft }}s</div>
          </div>
        </div>
        
        <!-- 关卡进度 -->
        <div class="level-progress">
          <span class="level-current">{{ currentLevel }}</span>
          <span class="level-slash">/</span>
          <span class="level-total">{{ totalLevels }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <!-- 游戏说明 -->
        <div class="instruction">请在规定时间内找出下图中的可疑处</div>
        
        <!-- 主页图标 -->
        <div class="home-icon" @click="goToHome">
          <img src="@/assets/icon/home.png" alt="主页" />
        </div>
      </div>
    </div>
    
    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 红光闪烁效果（覆盖整个页面高度） -->
      <div v-if="gameStarted && !gameOver && timeLeft <= 10" class="red-glow left"></div>
      <div v-if="gameStarted && !gameOver && timeLeft <= 10" class="red-glow right"></div>
      <!-- 游戏进行中 -->
      <template v-if="gameStarted && !gameOver">
        <div class="game-image" @click="handleImageClick">
          <img :src="currentLevelData.image" alt="找不同游戏图" />
          
          <!-- 已发现状态 -->
          <div class="found-status-game">
            已发现: {{ foundPoints }}/{{ puzzlePoints.length }}
          </div>
          
          <!-- 显示已找到的解密点高亮区域 -->
          <div 
            v-for="(point, index) in puzzlePoints" 
            :key="index"
            v-show="point.found"
            class="highlight-area"
            :style="{ 
              left: `${point.x}px`, 
              top: `${point.y}px`, 
              width: `${point.width}px`, 
              height: `${point.height}px` 
            }"
          ></div>
          
          <!-- 连接线渲染，消除v-for和v-if混用 -->
          <div v-for="(point, index) in puzzlePoints" :key="`line-${index}`" v-show="point.found">
            <!-- 图9点2、图3点4：整体下移100px并加长 -->
            <template v-if="(currentLevelData.image.includes('p9.jpg') && index === 1) || (currentLevelData.image.includes('p3.jpg') && index === 3)">
              <div
                :class="['connection-line', isPointNearRightEdge(point) ? 'connection-line-left' : 'connection-line-right']"
                :style="{
                  position: 'absolute',
                  left: isPointNearRightEdge(point) ? `${point.x - 230}px` : `${point.x + point.width}px`,
                  top: `${point.y + point.height/2 + 100}px`,
                  width: isPointNearRightEdge(point) ? '260px' : '120px',
                  height: '3px',
                  backgroundColor: '#1a175d',
                  zIndex: 10,
                  transform: 'translateY(-50%)'
                }"
                :data-index="index"
              ></div>
            </template>
            <!-- 图3点1：折线（竖150px，横150px，竖线起点右移30px） -->
            <template v-else-if="currentLevelData.image.includes('p3.jpg') && index === 0">
              <!-- 竖线 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.x + 30}px`,
                  top: `${point.y + point.height}px`,
                  width: '3px',
                  height: '150px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
              <!-- 横线 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.x + 30}px`,
                  top: `${point.y + point.height + 150}px`,
                  width: '150px',
                  height: '3px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
            </template>
            <!-- 图6点2：折线（竖30px，横30px，竖线起点为下边线中间） -->
            <template v-else-if="currentLevelData.image.includes('p6.jpg') && index === 1">
              <!-- 竖线 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.x + point.width/2}px`,
                  top: `${point.y + point.height}px`,
                  width: '3px',
                  height: '30px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
              <!-- 横线 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.x + point.width/2}px`,
                  top: `${point.y + point.height + 30}px`,
                  width: '30px',
                  height: '3px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
            </template>
            <!-- 其他点：直线 -->
            <template v-else>
              <div
                :class="['connection-line', isPointNearRightEdge(point) ? 'connection-line-left' : 'connection-line-right']"
                :style="{
                  position: 'absolute',
                  left: isPointNearRightEdge(point) ? `${point.x - 230}px` : `${point.x + point.width}px`,
                  top: `${point.y + point.height/2}px`,
                  width: isPointNearRightEdge(point) ? '230px' : '80px',
                  height: '3px',
                  backgroundColor: '#1a175d',
                  zIndex: 10,
                  transform: 'translateY(-50%)'
                }"
                :data-index="index"
              ></div>
            </template>
          </div>
          
          <!-- 高亮区域标题和详细说明 -->
          <div 
            v-for="(point, index) in puzzlePoints" 
            :key="`info-${index}`"
            v-show="point.found"
            class="highlight-container"
            :style="{
              top: (currentLevelData.image.includes('p9.jpg') && index === 1) || (currentLevelData.image.includes('p3.jpg') && index === 3)
                ? `${point.y + point.height/2 + 100 - 30}px`
                : (currentLevelData.image.includes('p3.jpg') && index === 0)
                  ? `${point.y + point.height + 150 - 30}px`
                  : (currentLevelData.image.includes('p6.jpg') && index === 1)
                    ? `${point.y + point.height + 30 - 30}px`
                    : `${point.y + point.height/2 - 30}px`,
              left: isPointNearRightEdge(point) 
                ? `${point.x - 230}px` 
                : (currentLevelData.image.includes('p3.jpg') && index === 0)
                  ? `${point.x + 180}px`
                  : (currentLevelData.image.includes('p6.jpg') && index === 1)
                    ? `${point.x + point.width/2 + 30}px`
                    : `${point.x + point.width + 80}px`,
              right: 'auto',
              zIndex: 20
            }"
            :ref="`highlightContainer-${index}`"
            :data-position="isPointNearRightEdge(point) ? 'left' : 'right'"
            :data-index="index"
          >
              <!-- 高亮区域标题 -->
              <div class="highlight-title" v-if="point.highlightTitle" :data-index="index" :data-position="isPointNearRightEdge(point) ? 'left' : 'right'">
                {{ point.highlightTitle }}
              </div>
              
              <!-- 高亮区域详细说明 -->
              <div class="highlight-detail" v-if="point.highlightDetail" :data-index="index" :data-position="isPointNearRightEdge(point) ? 'left' : 'right'">
                {{ point.highlightDetail }}
              </div>
          </div>
          
          <!-- 调试用：显示解密点位置 -->
          <template v-if="debugMode">
            <div 
              v-for="(point, index) in puzzlePoints" 
              :key="'debug-'+index"
              class="puzzle-point"
              :class="{ 'found': point.found }"
              :style="{ 
                left: `${point.x}px`, 
                top: `${point.y}px`, 
                width: `${point.width}px`, 
                height: `${point.height}px` 
              }"
            >
              <div class="debug-info">
                {{ index + 1 }}: ({{ point.x }},{{ point.y }}) {{ point.width }}x{{ point.height }}
              </div>
            </div>
          </template>
        </div>
        <div class="game-status">
          <!-- 调试模式控制 -->
          <div v-if="debugMode" class="debug-controls">
            <div class="debug-label">调试模式：</div>
            <button class="debug-button" @click="debugMode = !debugMode">{{ debugMode ? '关闭' : '开启' }}</button>
            <div class="debug-label">顺序显示：</div>
            <button class="debug-button" @click="useOrderedImages = !useOrderedImages">{{ useOrderedImages ? '关闭' : '开启' }}</button>
            <div class="debug-label">暂停计时：</div>
            <button class="debug-button" @click="togglePauseTimer">{{ pauseTimer ? '继续' : '暂停' }}</button>
            <button class="debug-button" @click="restartGame()">重新开始</button>
          </div>
        </div>
        
        <!-- 调试模式：图片选择器 提交-->
        <div v-if="debugMode" class="debug-image-selector">
          <div class="debug-label">选择图片进行调试：</div>
          <div class="debug-image-buttons">
            <button 
              v-for="(_, index) in allGameLevels" 
              :key="'level-'+index"
              class="debug-image-button"
              @click="jumpToLevel(index)"
            >
              图片{{ index + 1 }}
            </button>
          </div>
        </div>
      </template>
      
    </div>
    
    <!-- 游戏结束覆盖层 -->
    <div v-if="gameOver" class="game-result">
      <div class="result-image-container">
        <div class="star-animate-bg">
          <img class="star-bg" src="@/assets/images/bg.png" alt="bg" />
          <div class="star-group" v-if="showStars">
            <img class="star star1" :src="starIcon" />
            <img class="star star2 star-middle" :src="starIcon" />
            <img class="star star3" :src="starIcon" />
          </div>
          <div class="success-text" :class="{ show: showSuccessText }">{{ gameSuccess ? '恭喜过关' : '闯关失败' }}</div>
          <button
            v-if="gameSuccess && currentLevel < totalLevels"
            class="game-result-btn"
            @click="continueGame"
          >继续游戏</button>
          <button
            v-else
            class="game-result-btn"
            @click="restartGame"
          >重新游戏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #1e1c72; /* 将背景色改为与导航栏相同的颜色 */
}

.game-header {
  background-color: #1e1c72;
  color: white;
  padding-top: 0 !important;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 保持水平布局 */
  height: 70px; /* 调整回合适的高度 */
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 10;
  border-bottom: none;
  margin-bottom: 0;
  position: relative;
}

.header-padding {
  padding-top: 30px !important;
}

/* 头部右侧区域样式 */
.header-right {
  display: flex;
  align-items: center;
  margin-top: 0; /* 移除向下偏移 */
}

.hearts {
  display: flex;
  gap: 8px;
  margin-left: 30px;
  margin-top: 0; /* 移除向下偏移 */
}

.heart {
  position: relative;
  width: 57px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.heart-full,
.heart-half,
.heart-empty {
  width: 57px;
  height: 50px;
  object-fit: contain;
  display: block;
}

.timer-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 700px;
  margin: 0 8px;
  margin-top: 0; /* 移除向下偏移 */
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.timer-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(0, 200, 255, 0.1);
  border-radius: 19px;
  padding: 6px 12px;
  border: 2px solid #00c8ff;
  width: 100%;
  max-width: 540px;
  justify-content: space-between; /* 让时间块和数字分别在两端 */
}

.timer-blocks {
  display: flex;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
}

.time-block {
  width: 30px;
  height: 30px;
  background-color: #00c8ff;
  border-radius: 11px;
}

.time-block:not(.active) {
  opacity: 0.2;
}

.timer-text {
  color: #00c8ff;
  font-weight: bold;
  font-size: 20px;
  margin-left: 0; /* 移除左边距，因为已经用space-between分隔 */
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 48px; /* 保证数字宽度一致 */
}

.level-progress {
  display: flex;
  align-items: center;
  margin-left: 10px;
  white-space: nowrap;
}

.level-current {
  font-size: 42px;
  font-weight: bold;
  line-height: 1;
}

.level-total {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}

.level-slash {
  font-size: 26px;
  font-weight: bold;
  margin: 0 4px;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  margin-top: 0; /* 移除向下偏移 */
}

.instruction {
  font-size: 26px;
  color: #7680c0;
  white-space: nowrap;
  margin-left: 0px;
  margin-right: 20px;
}

.home-icon {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 20px; /* 恢复右边距 */
}

.home-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.game-area {
  flex: 1;
  padding-top: 0; /* 移除顶部内边距 */
  margin: 0; /* 确保没有任何边距 */
  background-color: transparent; /* 改为透明背景 */
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.game-image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: visible; /* 修改为visible以便高亮文字可以溢出 */
  cursor: pointer;
  box-shadow: none;
  background-color: #1e1c72; /* 与导航栏相同的背景色 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  margin-top: 0; /* 移除顶部间距 */
}

.game-image img {
  max-width: 100%;
  max-height: 100%;
  width: auto; /* 使用自动宽度 */
  height: auto; /* 使用自动高度 */
  object-fit: contain; /* 改回contain确保图片完整显示 */
  display: block;
  background-color: #1e1c72; /* 与背景色保持一致 */
}

/* 高亮区域样式 */
.highlight-area {
  position: absolute;
  background-color: rgba(249, 239, 240, 0.4); /* 浅粉色背景带更高透明度 */
  border: 2.5px solid #1a175d; /* 加粗的深蓝色边框 */
  border-radius: 30px; /* 圆弧矩形 */
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow: 0 0 8px rgba(26, 23, 93, 0.5); /* 添加阴影效果增强可见性 */
}

/* 高亮区域标题和详情的容器 */
.highlight-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 改为左对齐 */
  z-index: 6;
  max-width: 90%; /* 确保不超出图片宽度 */
}

/* 高亮区域标题样式 */
.highlight-title {
  position: absolute;
  background-color: #ff454d; /* 红色背景 */
  color: white;
  padding: 8px 15px;
  border-radius: 30px; /* 大圆角 */
  border: 2px solid #1a175d; /* 深蓝色边框 */
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  z-index: 8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-left: -20px; /* 向左偏移，让标题在详情的左侧 */
  top: 0; /* 位于顶部 */
  left: 0; /* 从左侧开始 */
  display: inline-block; /* 确保内容宽度符合内容 */
}

/* 高亮区域详细说明样式 */
.highlight-detail {
  position: absolute;
  background-color: white; /* 白色背景 */
  color: #1a175d; /* 深蓝色文字 */
  padding: 10px 15px;
  padding-top: 15px; /* 增加顶部内边距，为标题重叠留出空间 */
  padding-left: 25px; /* 增加左侧内边距，为标题留出空间 */
  border-radius: 14px; /* 较小圆角 */
  border: 2px solid #1a175d; /* 深蓝色边框 */
  font-size: 14px;
  width: max-content;
  text-align: left;
  z-index: 7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  top: 20px; /* 位于标题下方 */
  left: 20px; /* 从左侧开始，但比标题靠右 */
}

/* 当高亮区域在左侧显示时的样式 */
.highlight-container[data-position="left"] .highlight-title {
  position: absolute;
  left: auto; /* 取消左侧定位 */
  right: 0; /* 从右侧开始 */
  margin-left: 0; /* 取消左侧偏移 */
  margin-right: -20px; /* 向右偏移 */
}

.highlight-container[data-position="left"] .highlight-detail {
  position: absolute;
  left: auto; /* 取消左侧定位 */
  right: 20px; /* 从右侧开始，但比标题靠左 */
  padding-left: 15px; /* 恢复正常左侧内边距 */
  padding-right: 25px; /* 增加右侧内边距，为标题留出空间 */
}

/* 添加调试边框 - 仅在开发时使用，用于确认元素位置 */
.highlight-container[data-position="left"] {
  border: 1px dashed transparent; /* 透明边框不影响正常显示 */
}

.highlight-container[data-position="left"] .highlight-title {
  /* 已有样式保持不变 */
}

/* 连接线样式 */
.connection-line {
  position: absolute;
  height: 2.5px; /* 线宽 */
  background-color: #1a175d;
  z-index: 5;
  margin-right: -1px; /* 确保没有间隙 */
  transition: none; /* 移除动画，避免闪烁 */
  transform: translateY(-50%); /* 垂直居中 */
  width: 80px; /* 默认宽度 */
  pointer-events: none; /* 避免连接线捕获事件 */
}

/* 右侧连接线样式 */
.connection-line-right {
  width: 80px;
  transform: translateY(-50%) translateX(-1.25px); /* 垂直居中并微调 */
}

/* 左侧连接线样式 */
.connection-line-left {
  width: 230px !important; /* 左侧连接线宽度更长，确保能连接到左侧标题，使用!important确保优先级 */
  transform: translateY(-50%); /* 垂直居中 */
  right: auto; /* 清除右侧定位 */
}

/* 确保文字容器不会被图片遮挡 */
.highlight-title, .highlight-detail {
  pointer-events: none; /* 允许点击穿透 */
}

.puzzle-point {
  position: absolute;
  border: 2px solid red;
  background-color: rgba(255, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10;
}

.puzzle-point.found {
  background-color: rgba(0, 255, 0, 0.3);
  border: 2px solid green;
}

/* 添加调试信息样式 */
.debug-info {
  position: absolute;
  top: -25px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 5px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 20;
}

.debug-controls {
  display: flex;
  align-items: center;
  margin-left: 20px;
  flex-wrap: wrap;
}

.debug-label {
  font-size: 14px;
  margin-right: 10px;
  color: white;
}

.debug-button {
  padding: 4px 8px;
  background-color: #1e1c72;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 10px;
}

/* 调试图片选择器样式调整 */
.debug-image-selector {
  position: absolute;
  bottom: 70px; /* 放在状态栏上方 */
  left: 0;
  right: 0;
  margin-top: 0;
  padding: 10px;
  background-color: rgba(30, 28, 114, 0.7); /* 增加背景透明度 */
  border-radius: 8px;
  z-index: 5;
}

.debug-image-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.debug-image-button {
  padding: 5px 10px;
  background-color: #1e1c72;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.game-status {
  position: absolute; /* 改为绝对定位 */
  bottom: 20px; /* 距离底部20px */
  left: 0;
  right: 0;
  margin-top: 0; /* 移除顶部边距 */
  display: flex;
  justify-content: center;
  height: 35px;
  align-items: center;
  z-index: 5; /* 确保状态栏在图片上方 */
}

.found-status {
  background-color: #1e1c72;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.found-status-game {
  position: absolute;
  top: 35px;
  right: 60px;
  background-color: #1e1c72;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 15;
}

.game-result {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(27, 24, 94, 0.8);
  z-index: 1000;
}

.result-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.success-message {
  color: #1e1c72;
  font-size: 36px;
  margin-bottom: 30px;
  display: none;
}

.fail-message {
  color: #ff4757;
  font-size: 36px;
  margin-bottom: 30px;
  display: none;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
}

.continue-button {
  background-color: #1e1c72;
  color: white;
}

.continue-button:hover {
  background-color: #2d2a9d;
}

.restart-button {
  background-color: #ff4757;
  color: white;
}

.restart-button:hover {
  background-color: #ff5e6a;
}

.red-glow {
  position: fixed;
  top: 0;
  width: 100px;
  height: 100vh;
  z-index: 12;
  pointer-events: none;
  background: linear-gradient(to right, rgba(255,0,0,0.18), transparent);
  animation: red-flash 0.7s infinite alternate;
}
.red-glow.right {
  right: 0;
  left: auto;
  background: linear-gradient(to left, rgba(255,0,0,0.18), transparent);
}
.red-glow.left {
  left: 0;
  right: auto;
}
@keyframes red-flash {
  0% { opacity: 0.2; }
  100% { opacity: 1; }
}

.star-animate-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 480px;
  height: 360px;
  max-width: 95vw;
  max-height: 80vh;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.star-bg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  position: absolute;
  left: 0; top: 0;
  z-index: 1;
}
.star-group {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 2;
}
.star {
  width: 85px;
  height: 85px;
  margin: 0 -8px; /* 负距离保持美观 */
  opacity: 0;
  transform: scale(0.2);
  animation: star-grow 0.3s cubic-bezier(.5,1.8,.5,1.1) forwards;
}
.star1 { animation-delay: 0s; }
.star2 { animation-delay: 0.3s; }
.star3 { animation-delay: 0.6s; }
.star-middle {
  width: 140px;
  height: 140px;
  margin-bottom: -7px;
}

@keyframes star-grow {
  0% { opacity: 0; transform: scale(0.2);}
  60% { opacity: 1; transform: scale(1.2);}
  100% { opacity: 1; transform: scale(1);}
}

.success-text {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translateX(-50%);
  color: #09cefb;
  font-size: 35px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 3;
  pointer-events: none;
  letter-spacing: 0.25em;
}
.success-text.show {
  opacity: 1;
}

.game-result-btn {
  position: absolute;
  left: 50%;
  top: 95%;
  transform: translate(-50%, -50%);
  background: #1e1c72;
  color: #fff;
  font-size: 29px;
  font-weight: bold;
  border: 7px solid #09cefb;
  border-radius: 38px;
  padding: 7px 36px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: none;
  letter-spacing: 0.08em;
}


@media (max-width: 768px) {
  .game-container {
    max-width: 100%;
  }
  
  .game-header {
    padding: 0; /* 移除内边距 */
    height: 60px; /* 移动端高度调整 */
  }
  
  /* 移动设备上调整高亮区域样式 */
  .highlight-container {
    max-width: 95%;
  }
  
  .highlight-title {
    font-size: 12px;
    padding: 6px 12px;
    margin-left: -15px;
  }
  
  .highlight-detail {
    font-size: 12px;
    padding-left: 15px;
  }
  
  /* 移动端上的连接线 */
  .connection-line {
    width: 40px !important;
  }
  
  /* 移动端上的左侧连接线 */
  .connection-line-left {
  width: 120px !important;
}

  .level-progress {
    margin-left: 20px;
  }
  
  .level-number {
    font-size: 30px;
  }
  
  .level-slash {
    font-size: 16px;
  }
  
  .timer-container {
    margin: 0 8px;
  }

  .timer-wrapper {
    padding: 6px 10px;
    border-radius: 10px;
    width: auto;
  }
  
  .timer-blocks {
    gap: 4px;
  }

  .time-block {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }
  
  .timer-text {
    font-size: 18px;
    margin-left: 10px;
  }
  
  .instruction {
    font-size: 14px;
    margin-left: 15px;
    margin-right: 6px;
    
  }
  
  .hearts {
    margin-left: 10px;
  }
  
  .heart {
    width: 30px;
    height: 26px;
  }
  
  .heart-full,
  .heart-half,
  .heart-empty {
    width: 30px;
    height: 26px;
  }
  
  .home-icon {
    width: 32px;
    height: 32px;
    margin-right: 10px;
  }
  
  .home-icon img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
}

/* 添加点击反馈的脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
    box-shadow: 0 0 0 0 rgba(26, 23, 93, 0.7);
  }
  70% {
    transform: scale(1.05);
    opacity: 0.3;
    box-shadow: 0 0 0 10px rgba(26, 23, 93, 0);
  }
  100% {
    transform: scale(1);
    opacity: 0;
    box-shadow: 0 0 0 0 rgba(26, 23, 93, 0);
  }
}
</style> 