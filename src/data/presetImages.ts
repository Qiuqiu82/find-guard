// 导入图片资源
import p1Image from '../assets/images/pic/p1.jpg'
import p2Image from '../assets/images/pic/p2.jpg'
import p3Image from '../assets/images/pic/p3.jpg'
import p4Image from '../assets/images/pic/p4.jpg'
import p5Image from '../assets/images/pic/p5.jpg'
import p6Image from '../assets/images/pic/p6.jpg'
import p7Image from '../assets/images/pic/p7.jpg'
import p8Image from '../assets/images/pic/p8.jpg'
import p9Image from '../assets/images/pic/p9.jpg'
import office12Image from '../assets/images/pic/office12.jpg'
import office13Image from '../assets/images/pic/office13.jpg'
import office14Image from '../assets/images/pic/office14.jpg'

// 12张预置游戏图片，基于真实的关卡坐标数据
export const presetImages: any[] = [
  {
    id: 'preset-1',
    name: '邮件安全识别1',
    url: p1Image,
    size: 222000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-1-1',
        x: 75,
        y: 9,
        width: 360,
        height: 53,
        title: '注意辨别发件主题',
        description: '邮件主题为通知的，需格外注意邮件真实性',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-1-2',
        x: 177,
        y: 127,
        width: 450,
        height: 43,
        title: '发件人邮箱异常',
        description: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-1-3',
        x: 203,
        y: 555,
        width: 210,
        height: 45,
        title: '正文内容要留心',
        description: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-1-4',
        x: 188,
        y: 814,
        width: 188,
        height: 77,
        title: '注意邮件链接',
        description: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-2',
    name: '邮件安全识别2',
    url: p2Image,
    size: 262000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-2-1',
        x: 72,
        y: 7,
        width: 675,
        height: 66,
        title: '主题需要注意',
        description: '公司内部的通知但是显示的是外部的邮件说明',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-2-2',
        x: 174,
        y: 129,
        width: 420,
        height: 43,
        title: '发件人邮箱异常',
        description: '发件人域名进行了伪装，仔细查看发现还是有区别的',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-2-3',
        x: 623,
        y: 525,
        width: 240,
        height: 53,
        title: '注意邮件链接',
        description: '邮件存在链接需要格外注意，首先核实链接中的域名是否为企业真实域名，如果不是及时上报',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-3',
    name: '网站安全识别1',
    url: p3Image,
    size: 312000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-3-1',
        x: 105,
        y: 16,
        width: 180,
        height: 59,
        title: '访问网站需要有证书',
        description: '访问网站如果显示不安全，采用http访问，需要格外注意数据安全性，有被盗取数据的风险',
        connectionType: 'vertical-horizontal',
        connectionOffset: { x: 30, y: 150 }
      },
      {
        id: 'wp-3-2',
        x: 288,
        y: 16,
        width: 207,
        height: 59,
        title: '网站域名要核对',
        description: '访问网站记得核对域名，与企业真实域名存在差异',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-3-3',
        x: 180,
        y: 121,
        width: 255,
        height: 59,
        title: '网站布局异常',
        description: '企业logo名称存在少字的情况需要格外注意，有可能是伪造网站',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-3-4',
        x: 1155,
        y: 269,
        width: 570,
        height: 630,
        title: '登录内容注意甄别',
        description: '公共网站登录途径一般较多，若只是单一账号访问，并且没有注册等选项需要额外注意',
        connectionType: 'horizontal',
        connectionOffset: { x: 0, y: 100 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-4',
    name: '邮件安全识别3',
    url: p4Image,
    size: 324000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-4-1',
        x: 150,
        y: 105,
        width: 345,
        height: 53,
        title: '发件人邮箱注意看',
        description: '收到福利邮件注意，先检查一下发件人的邮箱地址',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-4-2',
        x: 863,
        y: 788,
        width: 195,
        height: 66,
        title: '邮件链接要判断',
        description: '带链接的按钮一定先甄别网站的真实性',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-4-3',
        x: 989,
        y: 886,
        width: 150,
        height: 33,
        title: '客服电话要验证真伪',
        description: '带人工客服电话的邮件，可以网上核实是否为真实客服',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-5',
    name: '邮件安全识别4',
    url: p5Image,
    size: 276000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-5-1',
        x: 150,
        y: 95,
        width: 345,
        height: 66,
        title: '发件人邮箱注意看',
        description: '收到公司内部邮件注意先检查一下发件人的邮箱地址，是否与公司域名一致',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-5-2',
        x: 788,
        y: 512,
        width: 240,
        height: 85,
        title: '邮件链接要判断',
        description: '带链接的按钮一定先甄别网站的真实性',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-5-3',
        x: 75,
        y: 788,
        width: 315,
        height: 104,
        title: '客服电话要验证真伪',
        description: '带人工客服电话的邮件，可以网上核实是否为真实客服',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-6',
    name: '邮件安全识别5',
    url: p6Image,
    size: 345000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-6-1',
        x: 173,
        y: 131,
        width: 300,
        height: 33,
        title: '发件人邮箱注意看',
        description: '收到公司内部邮件注意先检查一下发件人的邮箱地址，是否与公司域名一致',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-6-2',
        x: 525,
        y: 525,
        width: 683,
        height: 66,
        title: '邮件链接要判断',
        description: '邮件显示的链接不一定是真实链接，可以把鼠标放上去或者链接复制出来核对真实链接地址',
        connectionType: 'vertical-horizontal',
        connectionOffset: { x: 0, y: 30 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-7',
    name: '邮件安全识别6',
    url: p7Image,
    size: 492000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-7-1',
        x: 0,
        y: 13,
        width: 765,
        height: 46,
        title: '邮件主题需要警惕',
        description: '系统告警了通知优先通过内部群聊电话找安全部门确认',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-7-2',
        x: 90,
        y: 62,
        width: 645,
        height: 39,
        title: '发件邮箱要核对',
        description: '核对发件人邮箱地址是否为真实的公司内部域名',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-7-3',
        x: 45,
        y: 614,
        width: 825,
        height: 75,
        title: '需要点链接要判断',
        description: '邮件链接无法辨别真伪勿乱点随意，点击外链很可能造成电脑中病毒',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-8',
    name: '邮件安全识别7',
    url: p8Image,
    size: 222000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-8-1',
        x: 45,
        y: 13,
        width: 495,
        height: 46,
        title: '邮件主题需要警惕',
        description: '收到企业内部福利专享的邮件，可以内部群聊核实下',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-8-2',
        x: 45,
        y: 66,
        width: 570,
        height: 92,
        title: '发件邮箱要核对',
        description: '发件人确认是否为公司真实部分，发件人的域名确认是否为公司域名',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-8-3',
        x: 45,
        y: 368,
        width: 263,
        height: 223,
        title: '二维码不乱扫',
        description: '存在二维码的邮件注意甄别真实性，不要轻易扫码添加',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-8-4',
        x: 45,
        y: 879,
        width: 345,
        height: 39,
        title: '客服电话先核对',
        description: '涉及热线电话的情况，优先查询客服电话的真实性',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-9',
    name: '网站安全识别2',
    url: p9Image,
    size: 670000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-9-1',
        x: 90,
        y: 13,
        width: 525,
        height: 53,
        title: '网站域名先观察',
        description: '发现网站存在异常第一时间查看网站域名是否真实',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-9-2',
        x: 1200,
        y: 354,
        width: 570,
        height: 499,
        title: '账号密码需要辨别',
        description: '登录栏注意甄别获取的账号信息，核实忘记密码等选项的链接是否存在异常',
        connectionType: 'horizontal',
        connectionOffset: { x: 0, y: 100 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-10',
    name: '办公安全识别1',
    url: office12Image,
    size: 1200000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-10-1',
        x: 450,
        y: 105,
        width: 870,
        height: 420,
        title: '会议室白板内容要清理',
        description: '会议室白板的工作讨论内容离开时要擦除干净',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-10-2',
        x: 675,
        y: 564,
        width: 345,
        height: 236,
        title: '员工离开要锁屏',
        description: '员工离开工位电脑要及时锁屏',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-10-3',
        x: 570,
        y: 866,
        width: 510,
        height: 92,
        title: '文件要及时收起',
        description: '涉及的文件及时收起来',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-11',
    name: '办公安全识别2',
    url: office13Image,
    size: 1100000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-11-1',
        x: 1050,
        y: 118,
        width: 225,
        height: 118,
        title: '密码不要明文展示',
        description: '电脑开机密码直接贴在桌面上，容易被利用',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-11-2',
        x: 1035,
        y: 591,
        width: 210,
        height: 66,
        title: 'U盘用完及时拔出',
        description: 'U盘用完及时拔出，避免数据丢失或窃取',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-11-3',
        x: 1260,
        y: 788,
        width: 495,
        height: 92,
        title: '合同文件安全存放',
        description: '合同文件用完存放在安全位置，避免随处摆放',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-11-4',
        x: 174,
        y: 92,
        width: 855,
        height: 455,
        title: '离开工位要锁屏',
        description: '离开工位，请即时锁屏',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-12',
    name: '办公安全识别3',
    url: office14Image,
    size: 959000,
    width: 1920,
    height: 945,
    warningPoints: [
      {
        id: 'wp-12-1',
        x: 30,
        y: 709,
        width: 495,
        height: 236,
        title: '敏感文件即用即取',
        description: '打印机内部敏感文件，即用即取，避免放在公共区域',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      },
      {
        id: 'wp-12-2',
        x: 795,
        y: 551,
        width: 525,
        height: 236,
        title: '手机要及时锁屏',
        description: '个人手机要及时锁屏，请妥善保管好',
        connectionType: 'horizontal',
        connectionOffset: { x: 100, y: 0 }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
] 