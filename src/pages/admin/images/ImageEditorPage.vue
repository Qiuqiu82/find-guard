<template>
  <div>
    <!-- 全屏编辑模式 - 纯净游戏界面 -->
    <div v-if="isFullscreenEdit" class="fullscreen-edit-container">
      <!-- 游戏顶部导航栏 -->
      <div class="game-header">
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
          
          <!-- 退出全屏编辑按钮 -->
          <div class="exit-fullscreen-btn" @click="exitEditor">
            <span>退出编辑</span>
          </div>
          
          <!-- 全屏编辑按钮 -->
          <div class="fullscreen-edit-btn" @click="toggleFullscreenEdit">
            <span>全屏编辑</span>
          </div>
        </div>
      </div>
      
      <!-- 编辑工具栏 -->
      <div class="edit-toolbar">
        <!-- 绘制控制按钮 -->
        <div class="drawing-controls">
          <button 
            v-if="!isDrawingMode"
            @click="startDrawingMode"
            class="draw-btn primary"
            title="开始绘制警示点"
          >
            ✏️ 绘制警示点
          </button>
          <button 
            v-else
            @click="exitDrawingMode"
            class="draw-btn danger"
            title="退出绘制模式"
          >
            ❌ 退出绘制
          </button>
        </div>
      </div>

      <!-- 连接线类型快速切换工具栏 -->
      <div class="connection-toolbar" v-if="selectedPointIndex !== null">
        <div class="toolbar-title">
          <span>点位 {{ selectedPointIndex + 1 }} - 连接线类型快速切换</span>
          <button @click="selectedPointIndex = null" class="close-toolbar">×</button>
        </div>
        <div class="toolbar-buttons">
          <button 
            v-for="option in CONNECTION_TYPE_OPTIONS" 
            :key="option.value"
            @click="quickChangeConnectionType(option.value)"
            :class="['connection-btn', { 'active': puzzlePoints[selectedPointIndex]?.connectionType === option.value }]"
            :title="option.label"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <!-- 游戏图片区域 -->
      <div class="game-image-area">
        <div ref="gameImageRef" class="game-image" 
             :data-drawing="isDrawingMode"
             @click="handleImageClick"
             @mousedown="handleMouseDown"
             @mousemove="handleMouseMove"
             @mouseup="handleMouseUp"
             @mouseleave="handleMouseUp">
          <img :src="currentLevelData.image" alt="找不同游戏图" @load="onImageLoaded" />
          
          <!-- 已发现状态 -->
          <div class="found-status-game">
            已发现: {{ foundPoints }}/{{ puzzlePoints.length }}
          </div>
          
          <!-- 显示已找到的解密点高亮区域 -->
          <div 
            v-for="(point, index) in responsivePuzzlePoints" 
            :key="index"
            v-show="isFullscreenEdit || point.found"
            class="highlight-area"
            :style="{ 
              left: `${point.pixelX}px`, 
              top: `${point.pixelY}px`, 
              width: `${point.pixelWidth}px`, 
              height: `${point.pixelHeight}px` 
            }"
          ></div>
          
          <!-- 连接线渲染 - 基于 connectionType -->
          <div v-for="(point, index) in responsivePuzzlePoints" :key="`line-${index}`" v-show="isFullscreenEdit || point.found">
            <!-- 先竖后横连接线 -->
            <template v-if="point.connectionType === 'vertical-horizontal'">
              <!-- 竖线 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.pixelX+53}px`,
                  top: `${point.pixelY + point.pixelHeight}px`,
                  width: '3px',
                  height: '100px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
              <!-- 横线 - 从竖线底部开始，向右延伸 -->
              <div
                :style="{
                  position: 'absolute',
                  left: `${point.pixelX + 53}px`,
                  top: `${point.pixelY + point.pixelHeight + 100}px`,
                  width: '100px',
                  height: '3px',
                  backgroundColor: '#1a175d',
                  zIndex: 10
                }"
              ></div>
            </template>
            
            <!-- 无连接线 - 不显示任何连接线 -->
            <template v-else-if="!point.connectionType">
              <!-- 不显示连接线 -->
            </template>
            
            <!-- 水平连接线（智能方向） - 默认和horizontal类型 -->
            <template v-else>
              <div
                :class="['connection-line', isPointNearRightEdge(point) ? 'connection-line-left' : 'connection-line-right']"
                :style="{
                  position: 'absolute',
                  left: isPointNearRightEdge(point) ? `${point.pixelX - 230}px` : `${point.pixelX + point.pixelWidth}px`,
                  top: `${point.pixelY + point.pixelHeight/2}px`,
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
          

          
          <!-- 解密点高亮区域 -->
          <div 
            v-for="(point, index) in responsivePuzzlePoints" 
            :key="index"
            class="puzzle-point"
            :class="{ 'found': point.found, 'selected': selectedPointIndex === index }"
            :style="{ 
              left: `${point.pixelX}px`, 
              top: `${point.pixelY}px`, 
              width: `${point.pixelWidth}px`, 
              height: `${point.pixelHeight}px` 
            }"
            @click="handlePointClick(index)"
            :title="`点位 ${index + 1} - ${getConnectionTypeLabel(point.connectionType || 'horizontal')} - 点击编辑连接线类型`"
          ></div>
          
          <!-- 正在绘制的警示框 -->
          <div 
            v-if="isDrawingMode && isMouseDown && currentDrawingRect"
            class="drawing-rect"
            :style="{
              left: `${currentDrawingRect.left}px`,
              top: `${currentDrawingRect.top}px`,
              width: `${currentDrawingRect.width}px`,
              height: `${currentDrawingRect.height}px`
            }"
          ></div>

          <!-- 高亮标题和详细说明 - 使用动态定位逻辑 -->
          <div 
            v-for="(point, index) in responsivePuzzlePoints" 
            :key="`highlight-${index}`"
            v-show="isFullscreenEdit || point.found"
            class="highlight-container"
            :data-position="isPointNearRightEdge(point) ? 'left' : 'right'"
            :style="{
              position: 'absolute',
              top: getHighlightTop(point, index) + 'px',
              left: getHighlightLeft(point, index) + 'px',
              right: 'auto',
              zIndex: 20
            }"
            :ref="`highlightContainer-${index}`"
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
        </div>
      </div>
      

    </div>
    
    <!-- 普通管理界面 -->
    <div v-else class="admin-interface">
      <div class="admin-header">
        <h1>图片编辑器</h1>
        <el-button type="primary" @click="toggleFullscreenEdit">
          <el-icon><Expand /></el-icon>
          进入全屏编辑
        </el-button>
      </div>
      
      <div class="admin-content">
        <p>这是图片编辑器的管理界面。点击"进入全屏编辑"按钮可以进入全屏编辑模式。</p>
      </div>
    </div>
    
    <!-- 警示点设置对话框 -->
    <Teleport to="body">
      <el-dialog
        v-model="showWarningPointDialog"
        title="设置警示点"
        width="500px"
        :close-on-click-modal="false"
        @close="cancelWarningPoint"
        :z-index="999999"
        destroy-on-close
      >
      <el-form :model="newWarningPoint" label-width="100px" v-if="newWarningPoint">
        <el-form-item label="标题">
          <el-input
            v-model="newWarningPoint.highlightTitle"
            placeholder="输入警示标题"
            maxlength="50"
            show-word-limit
            autofocus
          />
        </el-form-item>
        
        <el-form-item label="详细内容">
          <el-input
            v-model="newWarningPoint.highlightDetail"
            type="textarea"
            :rows="4"
            placeholder="输入详细说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="连接线类型">
          <el-select 
            v-model="newWarningPoint.connectionType" 
            style="width: 100%" 
            placeholder="选择连接线类型"
          >
            <el-option 
              v-for="option in CONNECTION_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelWarningPoint">取消</el-button>
          <el-button type="primary" @click="saveWarningPoint">确认</el-button>
          <el-button type="success" @click="saveAndNextWarningPoint">保存并下一个</el-button>
        </div>
      </template>
      </el-dialog>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox, ElDialog, ElButton, ElInput, ElSelect, ElOption, ElForm, ElFormItem } from 'element-plus'
import { Expand, Fold, Refresh } from '@element-plus/icons-vue'
import { CONNECTION_TYPE_OPTIONS, DEFAULT_CONNECTION_TYPE, isValidConnectionType, getConnectionTypeLabel } from '../../../constants/connectionTypes'

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
const route = useRoute();
const store = useStore();

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
  title?: string; // 兼容性字段
  description?: string; // 兼容性字段
  connectionType?: 'horizontal' | 'vertical-horizontal'; // 连接线类型：横线 / 先竖后横
}

// 定义关卡类型
interface GameLevel {
  id?: string;
  image: string;
  points: PuzzlePoint[];
  puzzlePoints?: PuzzlePoint[];
  warningPoints?: PuzzlePoint[];
}

// 游戏状态
const hearts = ref(3); // 初始3颗心
const currentLevel = ref(1); // 当前关卡
const totalLevels = ref(6); // 总关卡数 - 改为响应式，可调整
const timeLeft = ref(30); // 倒计时30秒
const gameStarted = ref(false); // 游戏是否开始
const gameOver = ref(false); // 游戏是否结束
const gameSuccess = ref(false); // 游戏是否成功
const waitingForGameEnd = ref(false); // 等待游戏结束（显示最后区域提示时）
const isTimeUp = ref(false); // 是否是倒计时结束导致的游戏结束
let timer: number | null = null; // 计时器

// 添加调试模式开关
const debugMode = ref(true); // 默认开启调试模式
const useOrderedImages = ref(true); // 调试时按顺序显示图片，不随机
const pauseTimer = ref(true); // 调试时暂停倒计时

// 定义图片的原始设计尺寸（基于这个尺寸设置的坐标）
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 945;

// 原来基于的设计尺寸
const OLD_DESIGN_WIDTH = 1280;
const OLD_DESIGN_HEIGHT = 720;

// 坐标缩放比例
const SCALE_X = DESIGN_WIDTH / OLD_DESIGN_WIDTH; // 1.5
const SCALE_Y = DESIGN_HEIGHT / OLD_DESIGN_HEIGHT; // 1.3125

// 所有可用的游戏图片和提示信息（使用原始绝对坐标）
const allGameLevelsRaw: GameLevel[] = [
  {
    image: p1Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性',
        connectionType: 'horizontal'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名',
        connectionType: 'horizontal'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询',
        connectionType: 'horizontal'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行',
        connectionType: 'horizontal'
      }
    ]
  },
  {
    image: p2Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        connectionType: 'horizontal',
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p3Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p4Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p5Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p6Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p7Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p8Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40,
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: p9Img,
    points: [
      { 
        x: 50, 
        y: 7, 
        width: 240, 
        height: 40, 
        found: false, 
        highlightTitle: '注意辨别发件主题',
        highlightDetail: '邮件主题为通知的，需格外注意邮件真实性'
      },
      { 
        x: 118, 
        y: 97, 
        width: 300, 
        height: 33, 
        found: false, 
        highlightTitle: '发件人邮箱异常',
        highlightDetail: '发件人伪造安全服务中心，需要核实实际域名是否为公司内部真实域名'
      },
      { 
        x: 135, 
        y: 423, 
        width: 140, 
        height: 34, 
        found: false, 
        highlightTitle: '正文内容要留心',
        highlightDetail: '邮件内容包含登录地点异常，制造紧张气氛，首先通过邮箱网站进行查询'
      },
      { 
        x: 125, 
        y: 620, 
        width: 125, 
        height: 59, 
        found: false, 
        highlightTitle: '注意邮件链接',
        highlightDetail: '避免从邮件内部重置密码链接进行点击访问，如需重置密码通过官方途径进行'
      }
    ]
  },
  {
    image: office12Img,
    points: [
      { 
        x: 20, 
        y: 540, 
        width: 330, 
        height: 180, 
        found: false, 
        highlightTitle: '敏感文件即用即取',
        highlightDetail: '打印机内部敏感文件，即用即取，避免放在公共区域'
      },
      { 
        x: 530, 
        y: 420, 
        width: 350, 
        height: 180, 
        found: false, 
        highlightTitle: '手机要及时锁屏',
        highlightDetail: '个人手机要及时锁屏，请妥善保管好'
      }
    ]
  },
  {
    image: office13Img,
    points: [
      { 
        x: 20, 
        y: 540, 
        width: 330, 
        height: 180, 
        found: false, 
        highlightTitle: '敏感文件即用即取',
        highlightDetail: '打印机内部敏感文件，即用即取，避免放在公共区域'
      },
      { 
        x: 530, 
        y: 420, 
        width: 350, 
        height: 180, 
        found: false, 
        highlightTitle: '手机要及时锁屏',
        highlightDetail: '个人手机要及时锁屏，请妥善保管好'
      }
    ]
  },
  {
    image: office14Img,
    points: [
      { 
        x: 20, 
        y: 540, 
        width: 330, 
        height: 180, 
        found: false, 
        highlightTitle: '敏感文件即用即取',
        highlightDetail: '打印机内部敏感文件，即用即取，避免放在公共区域'
      },
      { 
        x: 530, 
        y: 420, 
        width: 350, 
        height: 180, 
        found: false, 
        highlightTitle: '手机要及时锁屏',
        highlightDetail: '个人手机要及时锁屏，请妥善保管好'
      }
    ]
  }
];

// 缩放坐标到正确尺寸的游戏数据
const allGameLevels: GameLevel[] = allGameLevelsRaw.map(level => ({
  ...level,
  points: level.points.map(point => ({
    ...point,
    x: point.x * SCALE_X,
    y: point.y * SCALE_Y,
    width: point.width * SCALE_X,
    height: point.height * SCALE_Y
  }))
}));

// 当前游戏的关卡数据
const gameLevels = ref<GameLevel[]>([]);

// 动态加载的游戏关卡数据（从编辑器保存的数据）
const dynamicGameLevels = ref<GameLevel[]>([]);

// 合并后的所有可用关卡数据
const allAvailableLevels = computed(() => {
  // 优先使用编辑器保存的动态数据，如果没有则使用默认数据
  if (dynamicGameLevels.value.length > 0) {
    return dynamicGameLevels.value;
  }
  // 确保返回默认数据，即使dynamicGameLevels为空
  console.log('使用默认游戏数据，关卡数:', allGameLevels.length);
  return allGameLevels;
});

// 获取当前关卡数据
const currentLevelData = computed(() => {
  if (!gameLevels.value || gameLevels.value.length === 0 || currentLevel.value < 1) {
    return { image: '', points: [] };
  }
  return gameLevels.value[currentLevel.value - 1];
});

// 当前关卡的解密点
const puzzlePoints = ref<PuzzlePoint[]>([]);

// 游戏图片引用 - 需要在watch之前定义
const gameImageRef = ref<HTMLElement | null>(null);

// 监听当前关卡数据变化，更新警示点
watch(() => currentLevelData.value, (newLevelData) => {
  // 统一获取点位数据，优先使用 points 字段
  const points = newLevelData?.points || newLevelData?.puzzlePoints || newLevelData?.warningPoints || [];
  console.log('🔄 编辑器：当前关卡数据变化，更新警示点:', {
    currentLevel: currentLevel.value,
    newLevelData: newLevelData,
    points: points,
    pointsCount: points.length,
    gameLevelsLength: gameLevels.value.length
  });
  
  // 如果没有点位数据，直接清空
  if (points.length === 0) {
    puzzlePoints.value = [];
    console.log('🔄 编辑器：无点位数据，清空警示点数组');
    return;
  }
  
  // 验证点位数据格式
  console.log('🔍 编辑器：验证点位数据格式');
  points.forEach((point, index) => {
    console.log(`点位 ${index}:`, {
      坐标范围: `x:${point.x}, y:${point.y}, w:${point.width}, h:${point.height}`,
      标题: point.highlightTitle || point.title || '未设置',
      详情: point.highlightDetail || point.description || '未设置',
      连接类型: point.connectionType || 'horizontal'
    });
  });
  
  // 编辑器中，需要将比例坐标转换为像素坐标用于显示和编辑
  const imageElement = gameImageRef.value?.querySelector('img');
  if (!imageElement || !imageElement.complete || imageElement.naturalWidth === 0) {
    console.log('⏳ 编辑器：图片尚未加载完成，等待后再转换坐标');
    // 先暂时保存原始数据，等图片加载完成后再转换
    puzzlePoints.value = [...points];
    // 延迟重试坐标转换
    setTimeout(() => {
      console.log('⏰ 编辑器：延迟重试坐标转换');
      const retryImageElement = gameImageRef.value?.querySelector('img');
      if (retryImageElement && retryImageElement.complete && retryImageElement.naturalWidth > 0) {
        console.log('🔄 编辑器：延迟重试成功，开始坐标转换');
        convertStoredDataToPixelCoordinates(points, retryImageElement);
      } else {
        console.log('⚠️ 编辑器：延迟重试失败，图片仍未加载完成');
      }
    }, 100);
    return;
  }
  
  convertStoredDataToPixelCoordinates(points, imageElement);
}, { immediate: true, deep: true });

// 编辑器专用：将存储的数据转换为像素坐标用于显示和编辑
const convertStoredDataToPixelCoordinates = (points: PuzzlePoint[], imageElement: HTMLImageElement) => {
  const naturalWidth = imageElement.naturalWidth;
  const naturalHeight = imageElement.naturalHeight;
  
  console.log('🎨 编辑器：开始将存储数据转换为像素坐标，图片自然尺寸:', { naturalWidth, naturalHeight });
  console.log('🎨 编辑器：输入的原始点位数据:', points);
  
  // 数据清理和验证
  const cleanedPoints = points.filter(point => {
    // 过滤掉明显无效的数据
    if (typeof point.x !== 'number' || typeof point.y !== 'number' || 
        typeof point.width !== 'number' || typeof point.height !== 'number') {
      console.warn('⚠️ 发现非数字坐标数据，已过滤:', point);
      return false;
    }
    if (point.width <= 0 || point.height <= 0) {
      console.warn('⚠️ 发现无效尺寸数据，已过滤:', point);
      return false;
    }
    return true;
  });
  
  if (cleanedPoints.length !== points.length) {
    console.log(`🧹 数据清理完成，从 ${points.length} 个点位清理为 ${cleanedPoints.length} 个有效点位`);
  }
  
  // 将存储的比例坐标转换为像素坐标用于编辑器显示
  const convertedPoints = cleanedPoints.map((point, index) => {
    console.log(`🔍 处理点位 ${index}:`, point);
    
    // 🎯 统一坐标判断：与index.vue完全相同的逻辑
    // 检测坐标类型：比例坐标 (0-1) 还是像素坐标
    const isPercentCoords = point.x <= 1 && point.y <= 1 && point.width <= 1 && point.height <= 1;
    
    // 🚨 特殊检查：过滤掉异常的(0,0,1,1)数据，这通常是错误的全图覆盖数据
    const isAbnormalData = point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1;
    
    if (isAbnormalData) {
      console.warn(`⚠️ 发现异常的(0,0,1,1)数据，点位 ${index}，将修复为合理坐标:`, point);
      // 提供合理的默认比例坐标，然后转换为像素坐标
      const fixedRatio = {
        x: 0.1 + (index * 0.15), // 水平分布
        y: 0.2 + (index * 0.1),  // 垂直分布  
        width: 0.12,              // 12%宽度
        height: 0.08,             // 8%高度
      };
      
      const converted = {
        ...point,
        x: Math.round(fixedRatio.x * naturalWidth),
        y: Math.round(fixedRatio.y * naturalHeight),
        width: Math.round(fixedRatio.width * naturalWidth),
        height: Math.round(fixedRatio.height * naturalHeight),
        highlightTitle: point.highlightTitle || `警示点 ${index + 1}`,
        highlightDetail: point.highlightDetail || '请重新设置此点位的位置和描述'
      };
      
      console.log(`🔧 异常数据已修复，点位 ${index}:`, { 原始: point, 修复比例: fixedRatio, 转换像素: converted });
      return converted;
    }
    
    console.log(`🧮 点位 ${index} 坐标判断详情:`, {
      原始数据: point,
      判断结果: {
        是否比例坐标: isPercentCoords,
        X范围检查: { value: point.x, 在0到1之间: point.x >= 0 && point.x <= 1 },
        Y范围检查: { value: point.y, 在0到1之间: point.y >= 0 && point.y <= 1 },
        Width范围检查: { value: point.width, 在0到1之间: point.width > 0 && point.width <= 1 },
        Height范围检查: { value: point.height, 在0到1之间: point.height > 0 && point.height <= 1 },
        小数位检查: {
          X有小数: point.x % 1 !== 0,
          Y有小数: point.y % 1 !== 0,
          Width有小数: point.width % 1 !== 0,
          Height有小数: point.height % 1 !== 0
        }
      },
      图片自然尺寸: { naturalWidth, naturalHeight }
    });
    
    if (isPercentCoords) {
      // 是比例坐标，转换为像素坐标用于编辑器显示和编辑
      const converted = {
        ...point,
        x: Math.round(point.x * naturalWidth),
        y: Math.round(point.y * naturalHeight),
        width: Math.round(point.width * naturalWidth),
        height: Math.round(point.height * naturalHeight)
      };
      
      console.log(`✅ 点位 ${index} 比例→像素坐标转换:`, { 
        原始比例: point, 
        转换像素: converted,
        图片自然尺寸: { naturalWidth, naturalHeight },
        转换计算: {
          计算X: `${point.x} * ${naturalWidth} = ${point.x * naturalWidth} → ${converted.x}`,
          计算Y: `${point.y} * ${naturalHeight} = ${point.y * naturalHeight} → ${converted.y}`,
          计算Width: `${point.width} * ${naturalWidth} = ${point.width * naturalWidth} → ${converted.width}`,
          计算Height: `${point.height} * ${naturalHeight} = ${point.height * naturalHeight} → ${converted.height}`
        },
        检查: {
          转换后是否超出图片: converted.x > naturalWidth || converted.y > naturalHeight,
          转换后尺寸是否合理: converted.width <= naturalWidth && converted.height <= naturalHeight,
          转换后是否为0坐标: converted.x === 0 && converted.y === 0,
          转换后是否覆盖全图: converted.x === 0 && converted.y === 0 && converted.width === naturalWidth && converted.height === naturalHeight
        }
      });
      
      // ✅ 验证转换结果的合理性（异常数据已在前面处理过）
      if (converted.x < 0 || converted.y < 0 || converted.width <= 0 || converted.height <= 0) {
        console.warn(`⚠️ 转换结果包含负值或零值，点位 ${index}:`, converted);
        // 确保最小尺寸
        converted.x = Math.max(0, converted.x);
        converted.y = Math.max(0, converted.y);
        converted.width = Math.max(10, converted.width);
        converted.height = Math.max(10, converted.height);
      }
      
      // 确保不超出图片边界
      if (converted.x + converted.width > naturalWidth) {
        converted.width = naturalWidth - converted.x;
      }
      if (converted.y + converted.height > naturalHeight) {
        converted.height = naturalHeight - converted.y;
      }
      
      return converted;
    } else {
      // 检查是否是过大的像素坐标，可能需要当作比例坐标处理
      if (point.x > naturalWidth || point.y > naturalHeight || 
          point.width > naturalWidth || point.height > naturalHeight) {
        console.warn(`⚠️ 点位 ${index} 坐标异常，超出图片范围，可能是被误判的比例坐标:`, point);
        
        // 检查是否可能是比例坐标但被错误识别为像素坐标
        // 如果数值很大但小于等于图片尺寸的1.5倍，可能是像素坐标
        const maxReasonablePixel = Math.max(naturalWidth, naturalHeight) * 1.5;
        if (point.x <= maxReasonablePixel && point.y <= maxReasonablePixel && 
            point.width <= maxReasonablePixel && point.height <= maxReasonablePixel) {
          // 限制在图片范围内
          const converted = {
            ...point,
            x: Math.min(Math.max(0, point.x), naturalWidth - 1),
            y: Math.min(Math.max(0, point.y), naturalHeight - 1),
            width: Math.min(point.width, naturalWidth - point.x),
            height: Math.min(point.height, naturalHeight - point.y)
          };
          console.log(`🔧 点位 ${index} 像素坐标范围修正:`, { 原始: point, 修正: converted });
          return converted;
        } else {
          // 数值过大，可能是比例坐标，但坐标值大于1（错误数据）
          // 尝试重新识别为比例坐标
          if (point.x > 1 || point.y > 1) {
            // 可能是1920x1080等设计尺寸的像素坐标，需要转换为当前图片的像素坐标
            const scaleX = naturalWidth / 1920; // 假设原设计尺寸为1920
            const scaleY = naturalHeight / 1080; // 假设原设计尺寸为1080
            const converted = {
              ...point,
              x: Math.round(point.x * scaleX),
              y: Math.round(point.y * scaleY),
              width: Math.round(point.width * scaleX),
              height: Math.round(point.height * scaleY)
            };
            console.log(`🔧 点位 ${index} 设计坐标→像素坐标转换:`, { 原始: point, 转换: converted, 缩放: { scaleX, scaleY } });
            return converted;
          }
          
          // 最后的兜底逻辑：当作无效数据，返回一个默认的小矩形
          console.error(`❌ 点位 ${index} 数据无法识别，使用默认坐标`);
          return {
            ...point,
            x: 50,
            y: 50,
            width: 100,
            height: 50
          };
        }
      }
      
      // 已经是合理的像素坐标，直接用于编辑器
      console.log(`🎯 点位 ${index} 已是像素坐标，直接使用:`, point);
      return point;
    }
  });
  
  // 更新编辑器中的像素坐标数组
  puzzlePoints.value = convertedPoints;
  console.log('🎨 编辑器：像素坐标数组已更新:', puzzlePoints.value);
  
  // 触发界面重新渲染
  nextTick(() => {
    recalculateTrigger.value++;
    console.log('🎨 编辑器：触发界面重新渲染');
  });
};

// 编辑器中的响应式坐标计算（puzzlePoints已经是像素坐标）
const responsivePuzzlePoints = computed(() => {
  return puzzlePoints.value.map((point, index) => {
    const imageInfo = getImageDisplayInfo();
    if (!imageInfo) {
      console.log('⚠️ 编辑器：getImageDisplayInfo 返回 null，使用原始像素坐标');
      return {
        ...point,
        pixelX: point.x,
        pixelY: point.y,
        pixelWidth: point.width,
        pixelHeight: point.height,
        // 确保字段名称正确，优先使用 highlightTitle 和 highlightDetail
        highlightTitle: point.highlightTitle || point.title || `警示点 ${index + 1}`,
        highlightDetail: point.highlightDetail || point.description || '请设置详细说明'
      };
    }
    
    // 编辑器中，puzzlePoints 已经是基于图片自然尺寸的像素坐标
    // 需要转换为基于当前显示尺寸的坐标
    const img = gameImageRef.value?.querySelector('img');
    const naturalWidth = img?.naturalWidth || DESIGN_WIDTH;
    const naturalHeight = img?.naturalHeight || DESIGN_HEIGHT;
    
    // 计算从自然尺寸到显示尺寸的缩放比例
    const scaleX = imageInfo.displayWidth / naturalWidth;
    const scaleY = imageInfo.displayHeight / naturalHeight;
    
    // 从自然像素坐标转换为显示像素坐标
    const pixelX = point.x * scaleX + imageInfo.offsetX;
    const pixelY = point.y * scaleY + imageInfo.offsetY;
    const pixelWidth = point.width * scaleX;
    const pixelHeight = point.height * scaleY;
    
    // 添加调试信息（仅对最新的点）
    if (index === puzzlePoints.value.length - 1) {
      console.log(`🎨 编辑器：警示点${index}显示坐标转换：`, {
        编辑器像素坐标: { x: point.x, y: point.y, width: point.width, height: point.height },
        图片信息: imageInfo,
        自然尺寸: { naturalWidth, naturalHeight },
        缩放比例: { scaleX, scaleY },
        最终显示坐标: { pixelX, pixelY, pixelWidth, pixelHeight }
      });
    }
    
    return {
      ...point,
      pixelX,
      pixelY,
      pixelWidth,
      pixelHeight,
      // 确保字段名称正确，优先使用 highlightTitle 和 highlightDetail
      highlightTitle: point.highlightTitle || point.title || `警示点 ${index + 1}`,
      highlightDetail: point.highlightDetail || point.description || '请设置详细说明'
    };
  });
});

// 判断点位是否靠近屏幕右边（基于缩放后的坐标）
const isPointNearRightEdge = (point: PuzzlePoint) => {
  // 基于缩放后的坐标判断：600 * 1.5 = 900px边界
  return point.x > 900;
};

// 获取窗口宽度的响应式变量
const windowWidth = ref(0);

// 更新窗口宽度和触发响应式坐标重新计算
const updateWindowWidth = () => {
  windowWidth.value = window ? window.innerWidth : 1000; // 默认值为1000
  // 等待DOM更新后重新计算坐标
  nextTick(() => {
    // 触发重新计算
    recalculateTrigger.value++;
  });
};

// 强制重新计算的触发器
const recalculateTrigger = ref(0);

// 图片加载完成的处理
const onImageLoaded = () => {
  console.log('🖼️ 编辑器：图片加载完成，重新处理坐标');
  nextTick(() => {
    // 图片加载完成后，重新处理当前关卡数据以确保坐标正确
    const currentData = currentLevelData.value;
    if (currentData && currentData.points && currentData.points.length > 0) {
      const imageElement = gameImageRef.value?.querySelector('img');
      if (imageElement && imageElement.naturalWidth > 0) {
        console.log('🖼️ 编辑器：图片自然尺寸:', imageElement.naturalWidth, 'x', imageElement.naturalHeight);
        
        // 编辑器中使用专门的坐标转换函数
        const points = currentData.points || [];
        convertStoredDataToPixelCoordinates(points, imageElement);
        console.log('🖼️ 编辑器：图片加载后坐标转换完成');
      }
    }
    
    // 触发重新计算显示坐标
    recalculateTrigger.value++;
    
    // 确保游戏数据已初始化
    if (gameLevels.value.length === 0) {
      console.log('🖼️ 编辑器：图片加载完成，但游戏数据未初始化，现在初始化...');
      initGame();
      return; // 等待下一次图片加载事件
    }
    
    // 调试信息：显示图片的实际尺寸
    if (gameImageRef.value) {
      const img = gameImageRef.value.querySelector('img');
      if (img) {
        console.log('🖼️ 编辑器调试信息：');
        console.log('- 图片自然尺寸:', img.naturalWidth, 'x', img.naturalHeight);
        console.log('- 图片显示尺寸:', img.getBoundingClientRect().width, 'x', img.getBoundingClientRect().height);
        console.log('- 设计尺寸:', DESIGN_WIDTH, 'x', DESIGN_HEIGHT);
      }
    }
  });
};

// 获取图片的实际显示尺寸和位置
const getImageDisplayInfo = () => {
  // 访问触发器以确保在需要时重新计算
  recalculateTrigger.value;
  
  if (!gameImageRef.value) return null;
  
  const img = gameImageRef.value.querySelector('img');
  if (!img) return null;
  
  // 检查图片是否已加载
  if (!img.complete || img.naturalWidth === 0) return null;
  
  const imgRect = img.getBoundingClientRect();
  const containerRect = gameImageRef.value.getBoundingClientRect();
  
  return {
    // 图片实际显示的宽高
    displayWidth: imgRect.width,
    displayHeight: imgRect.height,
    // 图片在容器中的偏移（居中显示时的偏移）
    offsetX: imgRect.left - containerRect.left,
    offsetY: imgRect.top - containerRect.top
  };
};

// 将点击坐标转换为原始图片坐标
const convertClickToOriginal = (clickX: number, clickY: number) => {
  const imageInfo = getImageDisplayInfo();
  if (!imageInfo) return { x: clickX, y: clickY };
  
  // 获取图片的自然尺寸
  const img = gameImageRef.value?.querySelector('img');
  const naturalWidth = img?.naturalWidth || DESIGN_WIDTH;
  const naturalHeight = img?.naturalHeight || DESIGN_HEIGHT;
  
  // 计算相对于图片的坐标
  const relativeX = clickX - imageInfo.offsetX;
  const relativeY = clickY - imageInfo.offsetY;
  
  // 转换为原始图片坐标
  const originalX = (relativeX / imageInfo.displayWidth) * naturalWidth;
  const originalY = (relativeY / imageInfo.displayHeight) * naturalHeight;
  
  return { x: originalX, y: originalY };
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

// 随机选择n个关卡
const selectRandomLevels = (): GameLevel[] => {
  console.log('🎲 selectRandomLevels: 开始选择关卡');
  console.log('🎲 allAvailableLevels.value.length:', allAvailableLevels.value.length);
  console.log('🎲 totalLevels.value:', totalLevels.value);
  
  // 确保有可用的关卡数据
  if (!allAvailableLevels.value || allAvailableLevels.value.length === 0) {
    console.error('❌ selectRandomLevels: 没有可用的关卡数据！');
    return [];
  }
  
  // 如果是调试模式且设置了按顺序显示，则直接返回前n个关卡
  if (debugMode.value && useOrderedImages.value) {
    const result = JSON.parse(JSON.stringify(allAvailableLevels.value.slice(0, totalLevels.value)));
    console.log('🎲 调试模式按顺序显示，返回关卡数:', result.length);
    return result;
  }
  
  // 正常随机逻辑
  const allLevelsCopy: GameLevel[] = JSON.parse(JSON.stringify(allAvailableLevels.value));
  const shuffledLevels = shuffleArray(allLevelsCopy);
  const result = shuffledLevels.slice(0, totalLevels.value);
  console.log('🎲 随机选择完成，返回关卡数:', result.length);
  return result;
};

// 添加直接跳转到指定关卡的功能
const jumpToLevel = (levelIndex: number) => {
  if (levelIndex >= 0 && levelIndex < allAvailableLevels.value.length) {
    // 更新当前游戏关卡，包含所有需要的关卡
    const allLevelsCopy: GameLevel[] = JSON.parse(JSON.stringify(allAvailableLevels.value));
    // 将选中的图片放到第一位，然后添加其他图片
    const selectedLevel = allLevelsCopy[levelIndex];
    const otherLevels = allLevelsCopy.filter((_, i) => i !== levelIndex);
    gameLevels.value = [selectedLevel, ...otherLevels.slice(0, totalLevels.value - 1)];
    
    // 重置游戏状态但保持在当前关卡
    currentLevel.value = 1;
    hearts.value = 3;
    timeLeft.value = 30;
    gameStarted.value = true;
    gameOver.value = false;
    gameSuccess.value = false;
    wrongClicks.value = 0;
    isTimeUp.value = false; // 重置倒计时结束状态
    
    // 重新启动计时器
    if (timer) clearInterval(timer);
    startTimer();
    
    // 保存当前选择的图片索引到本地存储，以便页面刷新后保持
    localStorage.setItem('currentDebugImageIndex', levelIndex.toString());
  }
};

// 初始化游戏
const initGame = () => {
  console.log('🎮 开始初始化游戏...');
  
  // 从本地存储读取关卡数设置
  const savedTotalLevels = localStorage.getItem('gameTotalLevels');
  if (savedTotalLevels) {
    const parsed = parseInt(savedTotalLevels);
    if (parsed >= 1 && parsed <= allAvailableLevels.value.length) {
      totalLevels.value = parsed;
      console.log('📊 从本地存储读取关卡数:', totalLevels.value);
    }
  }
  
  // 加载动态游戏数据
  loadDynamicGameData();
  console.log('📁 动态游戏数据加载完成，可用关卡数:', allAvailableLevels.value.length);
  
  // 确保有可用的关卡数据
  if (allAvailableLevels.value.length === 0) {
    console.error('❌ 没有可用的关卡数据！');
    return;
  }
  
  hearts.value = 3;
  timeLeft.value = 30;
  currentLevel.value = 1;
  gameStarted.value = true;
  gameOver.value = false;
  gameSuccess.value = false;
  waitingForGameEnd.value = false;
  wrongClicks.value = 0;
  isTimeUp.value = false; // 重置倒计时结束状态
  
  console.log('🎯 游戏状态初始化完成:', {
    hearts: hearts.value,
    timeLeft: timeLeft.value,
    currentLevel: currentLevel.value,
    gameStarted: gameStarted.value,
    gameOver: gameOver.value
  });
  
  // 如果是调试模式，尝试从本地存储获取上次选择的图片索引
  if (debugMode.value) {
    const savedIndex = localStorage.getItem('currentDebugImageIndex');
    if (savedIndex !== null) {
      const index = parseInt(savedIndex);
      if (index >= 0 && index < allAvailableLevels.value.length) {
        console.log('🔍 调试模式：从本地存储读取上次选择的图片索引:', index);
        // 在调试模式下，仍然需要包含所有关卡，但可以从指定索引开始
        const allLevelsCopy: GameLevel[] = JSON.parse(JSON.stringify(allAvailableLevels.value));
        // 将选中的图片放到第一位，然后添加其他图片
        const selectedLevel = allLevelsCopy[index];
        const otherLevels = allLevelsCopy.filter((_, i) => i !== index);
        gameLevels.value = [selectedLevel, ...otherLevels.slice(0, totalLevels.value - 1)];
        console.log('🎯 调试模式：使用指定图片作为第一关');
        return; // 提前返回，不执行下面的随机选择
      }
    }
  }
  
  // 随机选择n个关卡
  gameLevels.value = selectRandomLevels();
  console.log('🎲 随机选择关卡完成，当前游戏关卡数:', gameLevels.value.length);
  
  // 启动倒计时
  startTimer();
  console.log('⏰ 倒计时已启动');
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
      isTimeUp.value = true;
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
  
  // 判断游戏成功条件：
  // 1. 爱心还有剩余且所有不同点都找到 = 成功
  // 2. 倒计时结束（timeLeft <= 0）且没有找到所有不同点 = 失败
  if (hearts.value > 0 && allPointsFound.value) {
    gameSuccess.value = true;
    // 正常通关，不是倒计时结束
    isTimeUp.value = false;
  } else {
    gameSuccess.value = false;
    // 失败情况，保持 isTimeUp 状态不变
  }
};

// 下一关
const continueGame = () => {
  if (currentLevel.value < totalLevels.value) {
    currentLevel.value++;
    timeLeft.value = 30;
    gameStarted.value = true;
    gameOver.value = false;
    gameSuccess.value = false;
    waitingForGameEnd.value = false;
    wrongClicks.value = 0;
    isTimeUp.value = false; // 重置倒计时结束状态
    
    // 重新启动计时器
    startTimer();
    

  } else {
    // 游戏通关，所有关卡完成
    gameOver.value = true;
    gameSuccess.value = true;
    isTimeUp.value = false; // 重置倒计时结束状态
  }
};

// 重新开始游戏
const restartGame = () => {
  console.log("重新开始游戏");
  currentLevel.value = 1;
  isTimeUp.value = false; // 重置倒计时结束状态
  initGame();
};

// 点击图片区域处理
const handleImageClick = (event: MouseEvent) => {
  // 如果在绘制模式下，不处理游戏逻辑
  if (isDrawingMode.value || isFullscreenEdit.value) return;
  
  if (gameOver.value || !gameStarted.value || waitingForGameEnd.value) return;
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  // 将点击坐标转换为原始图片坐标
  const originalClick = convertClickToOriginal(clickX, clickY);
  
  // 检查是否点击了解密点
  let clickedPoint = false;
  
  for (let i = 0; i < puzzlePoints.value.length; i++) {
    const point = puzzlePoints.value[i];
    if (!point.found && 
        originalClick.x >= point.x && originalClick.x <= point.x + point.width && 
        originalClick.y >= point.y && originalClick.y <= point.y + point.height) {
      // 找到了一个解密点
      point.found = true;
      clickedPoint = true;
      
      // 检查是否全部找到
      if (allPointsFound.value) {
        // 设置等待状态，禁用进一步点击
        waitingForGameEnd.value = true;
        
        // 延迟1.5秒显示最后一个区域的提示后再结束游戏
        setTimeout(() => {
          waitingForGameEnd.value = false;
          endGame();
        }, 1500);
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
  console.log('🎮 ImageEditorPage 组件挂载，开始初始化游戏');
  
  // 确保调试模式开启
  debugMode.value = true;
  console.log('🔧 调试模式已开启:', debugMode.value);
  
  // 初始化游戏
  initGame();
  
  // 更新窗口宽度
  updateWindowWidth();
  
  // 添加窗口大小变化的监听器
  if (window) {
    window.addEventListener('resize', updateWindowWidth);
  }
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeyDown);
  
  // 添加页面可见性变化监听器，确保从编辑器返回后能重新加载数据
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  console.log('🎮 游戏初始化完成');
  
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

// 组件卸载时清除计时器和事件监听器
onUnmounted(() => {
  if (timer) clearInterval(timer);
  
  // 移除窗口大小变化的监听器
  if (window) {
    window.removeEventListener('resize', updateWindowWidth);
  }
  
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
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

// 关卡编辑器相关
const showLevelEditor = ref(false);
const homeIconClickCount = ref(0);
const lastClickTime = ref(0);

// 处理主页图标点击，连续点击5次进入编辑器
const handleHomeIconClick = () => {
  const currentTime = Date.now();
  
  // 如果距离上次点击超过2秒，重置计数
  if (currentTime - lastClickTime.value > 2000) {
    homeIconClickCount.value = 1;
  } else {
    homeIconClickCount.value++;
  }
  
  lastClickTime.value = currentTime;
  
  // 如果连续点击5次，进入管理系统
  if (homeIconClickCount.value >= 5) {
    router.push('/admin/settings');
    homeIconClickCount.value = 0; // 重置计数
  }
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // ESC键退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen();
  }
  
  // 可以在这里添加其他键盘快捷键功能
  // 例如：按空格键暂停游戏等
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件！');
      target.value = '';
      return;
    }
    
    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片文件大小不能超过5MB！');
      target.value = '';
      return;
    }
    
    // 提示用户使用管理系统
    alert('图片上传功能已在管理系统中实现！\n\n请连续点击5次主页图标进入管理系统，然后使用"图片管理"功能。');
    target.value = ''; // 清空文件选择
  }
};

// 加载动态游戏数据
const loadDynamicGameData = () => {
  try {
    const savedLevels = localStorage.getItem('gameLevels');
    if (savedLevels) {
      const parsedLevels = JSON.parse(savedLevels);
      if (Array.isArray(parsedLevels) && parsedLevels.length > 0) {
        // 验证数据结构
        const validLevels = parsedLevels.filter(level => 
          level.image && 
          Array.isArray(level.points) &&
          typeof level.image === 'string'
        );
        
        if (validLevels.length > 0) {
          console.log('🎮 加载动态游戏数据:', validLevels.length, '个关卡');
          dynamicGameLevels.value = validLevels;
          return;
        }
      }
    }
    
    // 如果没有有效的动态数据，清空动态数据，让allAvailableLevels使用默认数据
    console.log('🎮 没有有效的动态数据，将使用默认游戏数据');
    dynamicGameLevels.value = [];
  } catch (error) {
    console.error('❌ 加载动态游戏数据失败:', error);
    dynamicGameLevels.value = [];
  }
};

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面变为可见时，重新加载动态游戏数据
    console.log('🔄 页面重新可见，重新加载游戏数据');
    loadDynamicGameData();
    
    // 如果游戏正在进行中，重新初始化游戏以使用新数据
    if (gameStarted.value && !gameOver.value) {
      console.log('🎮 重新初始化游戏以使用新数据');
      initGame();
    }
  }
};

// 连接线样式编辑器相关
const editorCollapsed = ref(false)
const editorPosition = reactive({ x: 20, y: 70 }) // 在状态栏下方
const isDraggingEditor = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 连接线管理相关
const pointLineTypes = ref<Record<number, string>>({});
const customOffsets = ref<Record<number, { vertical: number; horizontal: number }>>({});
const selectedPointIndex = ref<number | null>(null);

const editingPoint = ref<PuzzlePoint | null>(null);

// 计算属性
const editorStyle = computed(() => ({
  left: `${editorPosition.x}px`,
  top: `${editorPosition.y}px`
}))

// 编辑器方法
const toggleEditor = () => {
  editorCollapsed.value = !editorCollapsed.value
  saveEditorState()
}

const startEditorDrag = (e: MouseEvent) => {
  isDraggingEditor.value = true
  dragStart.value = {
    x: e.clientX - editorPosition.x,
    y: e.clientY - editorPosition.y
  }
  
  document.addEventListener('mousemove', onEditorDrag)
  document.addEventListener('mouseup', stopEditorDrag)
}

const onEditorDrag = (e: MouseEvent) => {
  if (!isDraggingEditor.value) return
  
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y
  
  // 限制在窗口内
  const maxX = window.innerWidth - 300
  const maxY = window.innerHeight - 400
  
  editorPosition.x = Math.max(0, Math.min(newX, maxX))
  editorPosition.y = Math.max(70, Math.min(newY, maxY)) // 不能拖到状态栏上方
}

const stopEditorDrag = () => {
  isDraggingEditor.value = false
  document.removeEventListener('mousemove', onEditorDrag)
  document.removeEventListener('mouseup', stopEditorDrag)
  saveEditorState()
}

const resetEditorPosition = () => {
  editorPosition.x = 20
  editorPosition.y = 70
  saveEditorState()
}

const saveEditorState = () => {
  localStorage.setItem('imageEditor_editor', JSON.stringify({
    position: editorPosition,
    collapsed: editorCollapsed.value
  }))
}

const loadEditorState = () => {
  try {
    const saved = localStorage.getItem('imageEditor_editor')
    if (saved) {
      const state = JSON.parse(saved)
      editorPosition.x = state.position.x
      editorPosition.y = state.position.y
      editorCollapsed.value = state.collapsed
    }
  } catch (error) {
    console.warn('Failed to load editor state:', error)
  }
}

// 绘制相关
const drawMode = ref<'select' | 'rectangle' | 'move' | 'delete'>('select')
const connectionType = ref<'horizontal' | 'vertical' | 'horizontal-vertical'>('horizontal')
const selectedPoint = ref<any>(null)
const toolbarRef = ref<HTMLDivElement>()

const setDrawMode = (mode: 'select' | 'rectangle' | 'move' | 'delete') => {
  drawMode.value = mode
  selectedPoint.value = null
}

const setConnectionType = (type: 'horizontal' | 'vertical' | 'horizontal-vertical') => {
  connectionType.value = type
}

// 连接线管理方法
const initializeLineTypes = () => {
  // 等待点位数据加载完成
  if (!puzzlePoints.value || puzzlePoints.value.length === 0) {
    console.log('initializeLineTypes: 点位数据未准备好，等待...');
    return;
  }
  
  console.log('initializeLineTypes: 开始初始化连接线类型，点位数量:', puzzlePoints.value.length);
  
  // 根据图片和点位设置默认连接线类型
  puzzlePoints.value.forEach((point, index) => {
    const imageName = currentLevelData.value?.image || '';
    
    // 图9点2、图3点4：整体下移100px并加长
    if ((imageName.includes('p9.jpg') && index === 1) || 
        (imageName.includes('p3.jpg') && index === 3)) {
      pointLineTypes.value[index] = 'straight';
      point.connectionType = 'horizontal';
      customOffsets.value[index] = { vertical: 100, horizontal: 0 };
    }
    // 图3点1：折线（竖150px，横150px，竖线起点右移30px）
    else if (imageName.includes('p3.jpg') && index === 0) {
      pointLineTypes.value[index] = 'l-shape';
      point.connectionType = 'vertical-horizontal';
      customOffsets.value[index] = { vertical: 0, horizontal: 30 };
    }
    // 图6点2：折线（竖30px，横30px，竖线起点为下边线中间）
    else if (imageName.includes('p6.jpg') && index === 1) {
      pointLineTypes.value[index] = 'l-shape';
      point.connectionType = 'vertical-horizontal';
      customOffsets.value[index] = { vertical: 0, horizontal: 0 };
    }
    // 其他点：普通直线
    else {
      pointLineTypes.value[index] = 'straight';
      point.connectionType = 'horizontal';
      customOffsets.value[index] = { vertical: 0, horizontal: 0 };
    }
  });
  
  console.log('initializeLineTypes: 连接线类型初始化完成:', pointLineTypes.value);
  console.log('initializeLineTypes: 点位 connectionType 初始化完成:', puzzlePoints.value.map(p => p.connectionType));
};

// 获取L型折线竖线的left位置
const getLShapeVerticalLeft = (point: any, index: number) => {
  const imageName = currentLevelData.value.image;
  
  if (imageName.includes('p3.jpg') && index === 0) {
    return point.pixelX + 30;
  } else if (imageName.includes('p6.jpg') && index === 1) {
    return point.pixelX + point.pixelWidth/2;
  }
  
  return point.pixelX;
};

// 获取L型折线的高度
const getLShapeHeight = (index: number) => {
  const imageName = currentLevelData.value.image;
  
  if (imageName.includes('p3.jpg') && index === 0) {
    return 150;
  } else if (imageName.includes('p6.jpg') && index === 1) {
    return 30;
  }
  
  return 100;
};

// 获取L型折线的宽度
const getLShapeWidth = (index: number) => {
  const imageName = currentLevelData.value.image;
  
  if (imageName.includes('p3.jpg') && index === 0) {
    return 150;
  } else if (imageName.includes('p6.jpg') && index === 1) {
    return 30;
  }
  
  return 100;
};

// 获取高亮区域的top位置
const getHighlightTop = (point: any, index: number) => {
  const connectionType = point.connectionType || 'horizontal';
  
  if (connectionType === 'vertical-horizontal') {
    // 先竖后横：竖线100px + 横线位置 - 30px偏移
    return point.pixelY + point.pixelHeight + 100 - 30;
  } else {
    // 横线：点位中心 - 30px偏移
    return point.pixelY + point.pixelHeight/2 - 30;
  }
};

// 获取高亮区域的left位置
const getHighlightLeft = (point: any, index: number) => {
  const connectionType = point.connectionType || 'horizontal';
  const isLeft = isPointNearRightEdge(point);
  
  if (connectionType === 'vertical-horizontal') {
    // 先竖后横：横线居中，向左偏移50px
    return point.pixelX + point.pixelWidth/2 - 50;
  } else {
    // 横线：根据点位位置决定
    if (isLeft) {
      return point.pixelX - 230;
    } else {
      return point.pixelX + point.pixelWidth + 80;
    }
  }
};

// 获取自定义偏移量
const getCustomOffset = (index: number, direction: 'vertical' | 'horizontal') => {
  return customOffsets.value[index]?.[direction] || 0;
};

// 更新连接线类型
const updateLineType = (pointIndex: number, lineType: string) => {
  pointLineTypes.value[pointIndex] = lineType;
  saveLineConfig();
};

// 更新自定义偏移量
const updateCustomOffset = (pointIndex: number, direction: 'vertical' | 'horizontal', value: number) => {
  if (!customOffsets.value[pointIndex]) {
    customOffsets.value[pointIndex] = { vertical: 0, horizontal: 0 };
  }
  customOffsets.value[pointIndex][direction] = value;
  saveLineConfig();
};

// 保存连接线配置
const saveLineConfig = () => {
  const config = {
    lineTypes: pointLineTypes.value,
    customOffsets: customOffsets.value
  };
  localStorage.setItem('connectionLineConfig', JSON.stringify(config));
};

// 加载连接线配置
const loadLineConfig = () => {
  try {
    const saved = localStorage.getItem('connectionLineConfig');
    if (saved) {
      const config = JSON.parse(saved);
      pointLineTypes.value = config.lineTypes || {};
      customOffsets.value = config.customOffsets || {};
    }
  } catch (error) {
    console.warn('Failed to load connection line config:', error);
  }
};

// 重置连接线配置
const resetLineConfig = () => {
  pointLineTypes.value = {};
  customOffsets.value = {};
  initializeLineTypes();
  saveLineConfig();
};

// 保存、导出、重置方法
const saveImage = () => {
  saveLineConfig();
  ElMessage.success('图片和连接线配置保存成功')
}

const exportImage = () => {
  ElMessage.success('图片导出成功')
}

const resetImage = () => {
  resetLineConfig();
  ElMessage.success('图片和连接线配置已重置')
}

const deleteSelectedPoint = () => {
  if (!selectedPoint.value) return
  ElMessage.success('警示点删除成功')
}

// 全屏切换
const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true;
      console.log('进入全屏模式');
    }).catch(err => {
      console.error('进入全屏失败:', err);
    });
  } else {
    // 退出全屏
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
      console.log('退出全屏模式');
    }).catch(err => {
      console.error('退出全屏失败:', err);
    });
  }
};

// 全屏编辑模式状态
const isFullscreenEdit = ref(false);

// 绘制模式相关状态
const isDrawingMode = ref(false);
const isMouseDown = ref(false);
const startPoint = ref({ x: 0, y: 0 });
const currentPoint = ref({ x: 0, y: 0 });
const currentDrawingRect = ref<{ left: number; top: number; width: number; height: number } | null>(null);

// 警示点设置对话框
const showWarningPointDialog = ref(false);
const newWarningPoint = ref<PuzzlePoint | null>(null);

// 从路由参数加载特定图片
const loadImageFromRoute = () => {
  const imageId = route.params.id as string;
  console.log('🔄 开始重新加载图片，ID:', imageId);
  
  // 先清空现有数据，避免累积错误
  puzzlePoints.value = [];
  selectedPointIndex.value = null; // 重置选中的点位索引
  recalculateTrigger.value++; // 触发坐标重新计算
  
  // 清理旧的调试信息
  console.clear();
  
  // 强制清理可能存在的错误数据缓存
  const cacheKeys = ['currentLevelData', 'gameLevels', 'connectionLineConfig'];
  cacheKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`🧹 清理缓存: ${key}`);
    } catch (e) {
      console.warn(`清理缓存失败: ${key}`, e);
    }
  });
  
  try {
    // 从localStorage或sessionStorage中获取图片数据
    let imageData = localStorage.getItem(`image_${imageId}`);
    
    // 如果localStorage中没有，尝试从sessionStorage获取
    if (!imageData) {
      imageData = sessionStorage.getItem(`image_${imageId}`);
      if (imageData) {
        console.log('从sessionStorage加载图片数据');
      }
    } else {
      console.log('从localStorage加载图片数据');
    }
    
    if (imageData) {
      const gameLevel = JSON.parse(imageData);
      console.log('🔄 加载的原始图片数据:', gameLevel);
      
      // 确保数据格式正确，并统一字段名称
      const points = gameLevel.points || gameLevel.puzzlePoints || gameLevel.warningPoints || [];
      const normalizedGameLevel = {
        ...gameLevel,
        points: points,
        puzzlePoints: points, // 保持兼容性
        warningPoints: points // 保持兼容性
      };
      
      console.log('🔄 标准化后的图片数据:', normalizedGameLevel);
      console.log('🔄 原始点位数据:', points);
      
      // 验证和清理点位数据
      let cleanedPoints = points;
      if (points.length > 0) {
        // 🔍 检查并清理真正的异常数据：(0,0,1,1) 全图覆盖
        const hasFullCoverageData = points.some(point => 
          point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1
        );
        
        // 🔍 检查是否为之前错误生成的斜线分布数据
        const isDiagonalPatternData = points.length > 1 && points.every((point, index) => {
          return Math.abs(point.x - (0.1 + index * 0.15)) < 0.01 && 
                 Math.abs(point.y - (0.2 + index * 0.1)) < 0.01 &&
                 Math.abs(point.width - 0.12) < 0.01 &&
                 Math.abs(point.height - 0.08) < 0.01;
        });
        
        if (hasFullCoverageData) {
          console.warn('⚠️ 检测到异常的(0,0,1,1)全图覆盖数据，正在清理...');
          cleanedPoints = points.filter(point => 
            !(point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1)
          );
          
          // 立即保存清理后的数据
          const cleanedImageData = {
            ...gameLevel,
            points: cleanedPoints,
            puzzlePoints: cleanedPoints,
            warningPoints: cleanedPoints,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(`image_${imageId}`, JSON.stringify(cleanedImageData));
          console.log('✅ 全图覆盖异常数据已清理并保存');
        }
        
        if (isDiagonalPatternData) {
          console.warn('⚠️ 检测到之前错误生成的斜线分布数据，建议用户重新设置');
          console.warn('💡 用户可以在控制台执行 debugImageEditor.removeDiagonalData() 来清理这些数据');
        }
        
        cleanedPoints.forEach((point, index) => {
          console.log(`🔍 点位 ${index} 数据验证:`, {
            坐标: { x: point.x, y: point.y, width: point.width, height: point.height },
            是否比例坐标: point.x <= 1 && point.y <= 1 && point.width <= 1 && point.height <= 1,
            标题: point.highlightTitle || point.title,
            详情: point.highlightDetail || point.description,
            连接类型: point.connectionType
          });
        });
      }
      
      // 使用清理后的数据更新关卡数据
      const finalGameLevel = {
        ...normalizedGameLevel,
        points: cleanedPoints,
        puzzlePoints: cleanedPoints,
        warningPoints: cleanedPoints
      };
      
      // 设置为当前关卡数据，并重置gameLevels只包含这一张图片
      gameLevels.value = [finalGameLevel];
      currentLevel.value = 1;
      
      // 自动进入全屏编辑模式
      isFullscreenEdit.value = true;
      
      console.log('🔄 图片加载成功，等待watch触发坐标转换');
      console.log('🔍 设置的gameLevels:', gameLevels.value);
      console.log('🔍 设置的currentLevel:', currentLevel.value);
      
      // 等待下一帧确保DOM更新后触发重新计算
      nextTick(() => {
        console.log('🔄 nextTick: 触发坐标重新计算');
        recalculateTrigger.value++;
        
        // 强制等待更久一点，确保图片真正加载完成
        setTimeout(() => {
          const imageElement = gameImageRef.value?.querySelector('img');
          if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
            console.log('🔄 编辑器：强制重新执行坐标转换，图片自然尺寸:', imageElement.naturalWidth, 'x', imageElement.naturalHeight);
            if (normalizedGameLevel.points && normalizedGameLevel.points.length > 0) {
              convertStoredDataToPixelCoordinates(normalizedGameLevel.points, imageElement);
            }
          } else {
            console.log('⚠️ 编辑器：延迟检查图片仍未完全加载');
          }
        }, 200);
      });
      
      return true;
    } else {
      console.error('找不到图片数据，ID:', imageId);
      ElMessage.error('找不到指定的图片数据');
      return false;
    }
  } catch (error) {
    console.error('加载图片数据失败:', error);
    ElMessage.error('加载图片数据失败');
    return false;
  }
};

// 检查URL参数，如果包含fullscreen=true，则自动进入全屏编辑模式
// 监听路由参数变化，确保重新进入编辑器时正确加载数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('🔄 路由参数变化，重新加载图片，从', oldId, '到', newId);
    const success = loadImageFromRoute();
    if (!success) {
      router.push('/admin/images');
    }
  }
}, { immediate: false });

onMounted(() => {
  console.log('组件挂载，路由参数:', route.params);
  
  // 添加全局调试函数
  (window as any).debugImageEditor = {
    showStoredData: debugShowStoredData,
    removeDiagonalData: debugRemoveDiagonalData,
    verifyData: debugVerifyAndFixData,
    cleanupBadData: debugCleanupBadData,
    forceSetPoints: debugForceSetPoints,
    getCurrentPoints: () => puzzlePoints.value,
    getImageInfo: getImageDisplayInfo,
    cleanAbnormalData: () => {
      const originalCount = puzzlePoints.value.length;
      const cleanedPoints = puzzlePoints.value.filter((point: any, index: number) => {
        if (point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1) {
          console.warn(`🧹 删除异常点位 ${index}:`, point);
          return false;
        }
        if (point.x < 0 || point.y < 0 || point.width <= 0 || point.height <= 0) {
          console.warn(`🧹 删除无效点位 ${index}:`, point);
          return false;
        }
        return true;
      });
      puzzlePoints.value = cleanedPoints;
      saveCurrentImageData(true);
      console.log(`🧹 异常数据清理完成: ${originalCount} -> ${cleanedPoints.length}，已保存`);
    },
    recalculate: () => {
      recalculateTrigger.value++;
      console.log('🔄 手动触发重新计算');
    }
  };
  console.log('🔧 调试工具已添加到 window.debugImageEditor');
  
  // 如果有图片ID参数，直接加载该图片
  if (route.params.id) {
    const success = loadImageFromRoute();
    if (!success) {
      // 如果加载失败，回退到图片管理页面
      router.push('/admin/images');
      return;
    }
  } else {
    // 没有ID参数，按原来的逻辑初始化游戏
    console.log('没有图片ID参数，初始化默认游戏数据...');
    initGame();
    
    if (route.query.fullscreen === 'true') {
      isFullscreenEdit.value = true;
      console.log('检测到URL参数，自动进入全屏编辑模式');
      
      // 在全屏编辑模式下，确保有可用的关卡数据
      nextTick(() => {
        if (gameLevels.value.length === 0) {
          console.log('全屏编辑模式：游戏关卡数据为空，重新初始化...');
          initGame();
        }
        
        // 确保当前关卡有效
        if (currentLevel.value < 1 || currentLevel.value > gameLevels.value.length) {
          currentLevel.value = 1;
          console.log('全屏编辑模式：重置当前关卡为1');
        }
        
        console.log('全屏编辑模式：当前关卡:', currentLevel.value, '总关卡数:', gameLevels.value.length);
      });
    }
  }
  
  // 加载编辑器状态
  loadEditorState();
  
  // 初始化连接线配置
  loadLineConfig();
  
  // 监听点位数据变化，自动初始化连接线类型
  watch(puzzlePoints, (newPoints) => {
    if (newPoints && newPoints.length > 0) {
      console.log('点位数据已加载，自动初始化连接线类型，点位数量:', newPoints.length);
      initializeLineTypes();
    }
  }, { immediate: true });
  
  // 添加调试信息
  setTimeout(() => {
    console.log('🔍 调试信息 - 组件挂载后:');
    console.log('allAvailableLevels:', allAvailableLevels.value.length);
    console.log('gameLevels:', gameLevels.value.length);
    console.log('currentLevel:', currentLevel.value);
    console.log('currentLevelData:', currentLevelData.value);
    console.log('puzzlePoints:', puzzlePoints.value.length);
    
    // 如果游戏数据仍然为空，尝试重新初始化
    if (gameLevels.value.length === 0) {
      console.log('🔍 延迟检查：游戏数据为空，尝试重新初始化...');
      initGame();
    }
  }, 1000);
});

// 切换全屏编辑模式
const toggleFullscreenEdit = () => {
  isFullscreenEdit.value = !isFullscreenEdit.value;
  if (isFullscreenEdit.value) {
    console.log('进入全屏编辑模式');
    // 进入全屏编辑模式时重置选中状态并触发坐标重新计算
    selectedPointIndex.value = null;
    nextTick(() => {
      recalculateTrigger.value++;
    });
  } else {
    console.log('退出全屏编辑模式');
    // 退出时也重置选中状态
    selectedPointIndex.value = null;
  }
};

// 退出编辑器
const exitEditor = () => {
  console.log('退出图片编辑器');
  router.push('/admin/images');
};

// 处理点点击事件
const handlePointClick = (index: number) => {
  // 设置选中的点位索引（用于显示快速切换工具栏）
  selectedPointIndex.value = index;
  
  // 获取点位信息（不再弹出对话框，只使用右侧快速切换工具栏）
  const point = { ...puzzlePoints.value[index] };
  
  // 确保 connectionType 有默认值
  if (!point.connectionType) {
    point.connectionType = 'horizontal';
  }
  
  // 同步更新 pointLineTypes
  if (point.connectionType === 'horizontal') {
    pointLineTypes.value[index] = 'straight';
  } else if (point.connectionType === 'vertical-horizontal') {
    pointLineTypes.value[index] = 'l-shape';
  }
  
  editingPoint.value = point;
  // 不再打开对话框，已有右侧快速切换工具栏
  // connectionTypeDialogVisible.value = true;
  console.log(`点${index + 1}被点击了，当前连接线类型: ${point.connectionType}, pointLineType: ${pointLineTypes.value[index]}`);
};

// 绘制模式控制函数
const startDrawingMode = () => {
  isDrawingMode.value = true;
  selectedPointIndex.value = null; // 清除选中的点位
  ElMessage.info('进入绘制模式，请在图片上拖拽鼠标绘制警示区域');
};

const exitDrawingMode = () => {
  isDrawingMode.value = false;
  isMouseDown.value = false;
  currentDrawingRect.value = null;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
  ElMessage.info('已退出绘制模式');
};

// 鼠标绘制事件处理
const handleMouseDown = (event: MouseEvent) => {
  if (!isDrawingMode.value || !gameImageRef.value) return;
  
  event.preventDefault();
  isMouseDown.value = true;
  
  const rect = gameImageRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  startPoint.value = { x, y };
  currentPoint.value = { x, y };
  
  // 初始化绘制矩形
  currentDrawingRect.value = {
    left: x,
    top: y,
    width: 0,
    height: 0
  };
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawingMode.value || !isMouseDown.value || !gameImageRef.value) return;
  
  event.preventDefault();
  
  const rect = gameImageRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  currentPoint.value = { x, y };
  
  // 更新绘制矩形
  const left = Math.min(startPoint.value.x, x);
  const top = Math.min(startPoint.value.y, y);
  const width = Math.abs(x - startPoint.value.x);
  const height = Math.abs(y - startPoint.value.y);
  
  currentDrawingRect.value = { left, top, width, height };
};

const handleMouseUp = (event: MouseEvent) => {
  if (!isDrawingMode.value || !isMouseDown.value) return;
  
  isMouseDown.value = false;
  
  // 检查绘制的区域是否足够大
  if (currentDrawingRect.value && 
      currentDrawingRect.value.width > 10 && 
      currentDrawingRect.value.height > 10) {
    console.log('调用 finishDrawing，绘制区域：', currentDrawingRect.value);
    finishDrawing();
  } else {
    // 区域太小，清除绘制
    currentDrawingRect.value = null;
    ElMessage.warning('绘制区域太小，请重新绘制');
  }
};

// 完成绘制，显示设置对话框
const finishDrawing = () => {
  console.log('finishDrawing 被调用');
  if (!currentDrawingRect.value || !gameImageRef.value) return;
  
  const imageElement = gameImageRef.value.querySelector('img') as HTMLImageElement;
  if (!imageElement || !imageElement.complete || imageElement.naturalWidth === 0) {
    console.error('❌ 图片未加载完成，无法完成绘制');
    ElMessage.error('图片未加载完成，请等待后重试');
    return;
  }
  
  // 使用与显示时相同的方法获取图片显示信息
  const imageInfo = getImageDisplayInfo();
  if (!imageInfo) {
    console.error('❌ 无法获取图片显示信息');
    ElMessage.error('无法获取图片显示信息，请重试');
    return;
  }
  
  const naturalWidth = imageElement.naturalWidth;
  const naturalHeight = imageElement.naturalHeight;
  
  console.log('🎨 绘制坐标转换开始:', {
    绘制区域: currentDrawingRect.value,
    图片显示信息: imageInfo,
    图片自然尺寸: { naturalWidth, naturalHeight }
  });
  
  // 计算相对于图片显示区域的坐标（减去偏移）
  const relativeX = currentDrawingRect.value.left - imageInfo.offsetX;
  const relativeY = currentDrawingRect.value.top - imageInfo.offsetY;
  
  // 确保相对坐标在有效范围内
  if (relativeX < 0 || relativeY < 0 || 
      relativeX >= imageInfo.displayWidth || relativeY >= imageInfo.displayHeight) {
    console.error('❌ 绘制区域超出图片范围:', { relativeX, relativeY, imageInfo });
    ElMessage.error('绘制区域超出图片范围，请重新绘制');
    return;
  }
  
  // 转换为相对于自然尺寸的像素坐标
  const naturalX = (relativeX / imageInfo.displayWidth) * naturalWidth;
  const naturalY = (relativeY / imageInfo.displayHeight) * naturalHeight;
  const naturalWidth_rect = (currentDrawingRect.value.width / imageInfo.displayWidth) * naturalWidth;
  const naturalHeight_rect = (currentDrawingRect.value.height / imageInfo.displayHeight) * naturalHeight;
  
  // 验证计算结果的合理性
  if (naturalX < 0 || naturalY < 0 || naturalWidth_rect <= 0 || naturalHeight_rect <= 0 ||
      naturalX + naturalWidth_rect > naturalWidth || naturalY + naturalHeight_rect > naturalHeight) {
    console.error('❌ 坐标转换结果异常:', {
      naturalX, naturalY, naturalWidth_rect, naturalHeight_rect,
      naturalWidth, naturalHeight
    });
    ElMessage.error('坐标转换失败，请重新绘制');
    return;
  }
  
  // 创建新的警示点数据 - 直接使用自然尺寸的像素坐标（与预置图片格式一致）
  newWarningPoint.value = {
    x: Math.round(naturalX),           // 自然尺寸像素坐标
    y: Math.round(naturalY),           // 自然尺寸像素坐标  
    width: Math.round(naturalWidth_rect),      // 自然尺寸像素坐标
    height: Math.round(naturalHeight_rect),    // 自然尺寸像素坐标
    found: false,
    highlightTitle: '',
    highlightDetail: '',
    connectionType: 'horizontal'
  };
  
  console.log('🎨 编辑器绘制坐标转换调试信息：', {
    绘制区域显示坐标: currentDrawingRect.value,
    图片显示信息: imageInfo,
    图片自然尺寸: { naturalWidth, naturalHeight },
    相对显示坐标: { relativeX, relativeY },
    自然像素坐标: { naturalX, naturalY, naturalWidth_rect, naturalHeight_rect },
    最终像素坐标: { 
      x: Math.round(naturalX), 
      y: Math.round(naturalY), 
      width: Math.round(naturalWidth_rect), 
      height: Math.round(naturalHeight_rect) 
    }
  });
  console.log('新警示点数据（纯像素坐标）：', newWarningPoint.value);
  console.log('准备显示对话框，当前 showWarningPointDialog：', showWarningPointDialog.value);
  
  // 显示设置对话框
  showWarningPointDialog.value = true;
  
  console.log('对话框状态已设置为 true：', showWarningPointDialog.value);
  
  // 清除绘制状态
  currentDrawingRect.value = null;
};

// 警示点设置对话框处理
const saveWarningPoint = async () => {
  if (!newWarningPoint.value) return;
  
  // 验证必填字段
  if (!newWarningPoint.value.highlightTitle?.trim()) {
    ElMessage.warning('请输入警示标题');
    return;
  }
  
  if (!newWarningPoint.value.highlightDetail?.trim()) {
    ElMessage.warning('请输入详细内容');
    return;
  }
  
  // 验证警示点坐标的有效性
  if (newWarningPoint.value.x < 0 || newWarningPoint.value.y < 0 ||
      newWarningPoint.value.width <= 0 || newWarningPoint.value.height <= 0) {
    console.error('❌ 警示点坐标无效:', newWarningPoint.value);
    ElMessage.error('警示点坐标无效，请重新绘制');
    return;
  }
  
  // 验证坐标不是异常的全图覆盖数据
  if (newWarningPoint.value.x === 0 && newWarningPoint.value.y === 0 && 
      newWarningPoint.value.width === 1 && newWarningPoint.value.height === 1) {
    console.error('❌ 检测到异常的全图覆盖坐标，拒绝保存');
    ElMessage.error('检测到异常坐标，请重新绘制');
    return;
  }
  
  // 添加到当前关卡的点位数组 - 使用 reactive 更新确保响应式
  const pointToAdd = {...newWarningPoint.value};
  console.log('🎯 添加警示点:', pointToAdd);
  
  // 直接修改数组以触发响应式更新
  puzzlePoints.value = [...puzzlePoints.value, pointToAdd];
  
  console.log('🎯 更新后的警示点数组:', puzzlePoints.value);
  
  // 立即触发界面重新渲染
  nextTick(() => {
    console.log('🎯 界面应该已更新，当前警示点数量:', puzzlePoints.value.length);
  });
  
  // 保存到localStorage（如果是从路由加载的图片） - 使用防抖
  if (route.params.id) {
    saveCurrentImageData(); // 防抖保存，1秒后执行
  }
  
  ElMessage.success('警示点已添加');
  showWarningPointDialog.value = false;
  newWarningPoint.value = null;
};

const saveAndNextWarningPoint = async () => {
  if (!newWarningPoint.value) return;
  
  // 验证必填字段
  if (!newWarningPoint.value.highlightTitle?.trim()) {
    ElMessage.warning('请输入警示标题');
    return;
  }
  
  if (!newWarningPoint.value.highlightDetail?.trim()) {
    ElMessage.warning('请输入详细内容');
    return;
  }
  
  // 验证警示点坐标的有效性
  if (newWarningPoint.value.x < 0 || newWarningPoint.value.y < 0 ||
      newWarningPoint.value.width <= 0 || newWarningPoint.value.height <= 0) {
    console.error('❌ 警示点坐标无效:', newWarningPoint.value);
    ElMessage.error('警示点坐标无效，请重新绘制');
    return;
  }
  
  // 验证坐标不是异常的全图覆盖数据
  if (newWarningPoint.value.x === 0 && newWarningPoint.value.y === 0 && 
      newWarningPoint.value.width === 1 && newWarningPoint.value.height === 1) {
    console.error('❌ 检测到异常的全图覆盖坐标，拒绝保存');
    ElMessage.error('检测到异常坐标，请重新绘制');
    return;
  }
  
  // 添加到当前关卡的点位数组 - 使用 reactive 更新确保响应式
  const pointToAdd = {...newWarningPoint.value};
  console.log('🎯 添加警示点(继续模式):', pointToAdd);
  
  // 直接修改数组以触发响应式更新
  puzzlePoints.value = [...puzzlePoints.value, pointToAdd];
  
  console.log('🎯 更新后的警示点数组(继续模式):', puzzlePoints.value);
  
  // 保存到localStorage（如果是从路由加载的图片） - 使用防抖
  if (route.params.id) {
    saveCurrentImageData(); // 防抖保存，1秒后执行
  }
  
  ElMessage.success('警示点已添加，可以继续绘制下一个');
  showWarningPointDialog.value = false;
  newWarningPoint.value = null;
  
  // 继续保持绘制模式，用户可以继续绘制下一个警示点
};

const cancelWarningPoint = () => {
  showWarningPointDialog.value = false;
  newWarningPoint.value = null;
  currentDrawingRect.value = null;
};

// 更新Store中的数据，确保游戏页面能获取到最新数据
const updateStoreData = async (updatedImageData: any) => {
  try {
    const imageId = route.params.id as string;
    
    // 获取当前Store中的所有关卡
    const currentLevels = store.getters['game/currentLevels'] || [];
    
    // 查找是否已存在该图片的关卡
    // 优先通过完整URL匹配，如果没有则通过imageId匹配
    const currentImageUrl = updatedImageData.image || updatedImageData.url;
    const existingIndex = currentLevels.findIndex((level: GameLevel) => {
      // 首先尝试完整URL匹配
      if (level.image === currentImageUrl) {
        return true;
      }
      // 如果URL不匹配，尝试通过imageId匹配（向后兼容）
      return level.image && level.image.includes(imageId);
    });
    
    // 添加调试日志
    console.log('🔍 图片匹配调试信息:', {
      imageId,
      currentImageUrl,
      existingIndex,
      currentLevelsCount: currentLevels.length,
      existingImages: currentLevels.map((level: GameLevel, index: number) => ({
        index,
        image: level.image,
        pointsCount: level.points?.length || 0
      }))
    });
    
    // 构建新的关卡数据 - 验证并过滤有效的点位数据
    const validPoints = puzzlePoints.value.filter((point: any) => {
      // 过滤掉异常坐标
      if (point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1) {
        console.warn('⚠️ 过滤异常的全图覆盖坐标:', point);
        return false;
      }
      
      // 过滤掉负数或零尺寸的点位
      if (point.x < 0 || point.y < 0 || point.width <= 0 || point.height <= 0) {
        console.warn('⚠️ 过滤无效坐标:', point);
        return false;
      }
      
      return true;
    });
    
    console.log(`📝 Store更新：共${puzzlePoints.value.length}个点位，过滤后剩余${validPoints.length}个有效点位`);
    
    const newLevelData: GameLevel = {
      image: updatedImageData.image || updatedImageData.url,
      points: validPoints.map((point: any) => ({
        x: Math.round(point.x),        // 确保是整数像素坐标
        y: Math.round(point.y),        // 确保是整数像素坐标
        width: Math.round(point.width),    // 确保是整数像素坐标
        height: Math.round(point.height),  // 确保是整数像素坐标
        found: false,
        connectionType: point.connectionType || 'none',
        highlightTitle: point.highlightTitle || point.title || '未命名警示点',
        highlightDetail: point.highlightDetail || point.description || '请添加详细说明'
      }))
    };
    
    if (existingIndex >= 0) {
      // 更新现有关卡
      store.dispatch('game/updateLevel', {
        index: existingIndex,
        level: newLevelData
      });
      console.log('📝 已更新Store中的现有关卡', existingIndex);
    } else {
      // 添加新关卡 - 但要先确认这确实是一个新图片
      const isReallyNew = !currentLevels.some((level: GameLevel) => {
        // 更严格的检查：比较图片的主要部分，忽略参数差异
        const levelImageBase = level.image.split('?')[0];
        const currentImageBase = currentImageUrl.split('?')[0];
        return levelImageBase === currentImageBase;
      });
      
      if (isReallyNew) {
        store.dispatch('game/addLevel', newLevelData);
        console.log('➕ 已向Store添加新关卡');
      } else {
        console.warn('⚠️ 图片已存在，跳过添加操作，imageId:', imageId, 'currentImageUrl:', currentImageUrl);
        // 尝试找到真正的匹配项并更新
        const realIndex = currentLevels.findIndex((level: GameLevel) => {
          const levelImageBase = level.image.split('?')[0];
          const currentImageBase = currentImageUrl.split('?')[0];
          return levelImageBase === currentImageBase;
        });
        if (realIndex >= 0) {
          store.dispatch('game/updateLevel', {
            index: realIndex,
            level: newLevelData
          });
          console.log('📝 找到真正匹配的关卡并更新:', realIndex);
        }
      }
    }
    
    // 强制保存Store数据到localStorage的game-data键
    const gameData = await store.dispatch('game/exportData');
    localStorage.setItem('game-data', JSON.stringify(gameData));
    console.log('💾 Store数据已同步到game-data');
    
  } catch (error) {
    console.error('更新Store数据失败:', error);
  }
};

// 防抖保存 - 避免频繁保存
let saveTimeout: number | null = null;

// 保存当前图片数据到localStorage
const saveCurrentImageData = async (immediate = false) => {
  if (!route.params.id || !currentLevelData.value) return;
  
  // 如果不是立即保存，使用防抖机制
  if (!immediate) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveCurrentImageData(true);
    }, 1000); // 1秒防抖
    return;
  }
  
  try {
    const imageId = route.params.id as string;
    
    // 🎯 统一坐标系统：直接保存像素坐标，与预置图片格式一致
    console.log('💾 保存图片数据，使用纯像素坐标格式（与预置图片一致）');
    
    // 过滤并验证有效的点位数据
    const validPuzzlePoints = puzzlePoints.value.filter((point, index) => {
      // 过滤异常的全图覆盖坐标
      if (point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1) {
        console.warn(`⚠️ 点位 ${index} 发现异常的全图覆盖坐标，已过滤:`, point);
        return false;
      }
      
      // 过滤无效坐标
      if (point.x < 0 || point.y < 0 || point.width <= 0 || point.height <= 0) {
        console.warn(`⚠️ 点位 ${index} 坐标无效，已过滤:`, point);
        return false;
      }
      
      return true;
    });
    
    console.log(`💾 保存数据：共${puzzlePoints.value.length}个点位，过滤后剩余${validPuzzlePoints.length}个有效点位`);
    
    // 转换为最终保存格式
    const convertedPoints = validPuzzlePoints.map((point, index) => {
      console.log(`💾 保存点位 ${index} 原始像素数据:`, point);
      
      // 验证坐标的合理性
      const imageElement = gameImageRef.value?.querySelector('img');
      if (imageElement) {
        const naturalWidth = imageElement.naturalWidth;
        const naturalHeight = imageElement.naturalHeight;
        
        if (point.x < 0 || point.y < 0 || 
            point.x + point.width > naturalWidth || 
            point.y + point.height > naturalHeight) {
          console.warn(`⚠️ 点位 ${index} 坐标超出图片边界:`, {
            point,
            imageSize: { naturalWidth, naturalHeight }
          });
        }
      }
      
      // 直接返回像素坐标，与预置图片格式一致
      return {
        ...point,
        // 确保坐标为整数
        x: Math.round(point.x),
        y: Math.round(point.y),
        width: Math.round(point.width),
        height: Math.round(point.height)
      };
    });
    
    const updatedImageData = {
      ...currentLevelData.value,
      points: convertedPoints,
      puzzlePoints: convertedPoints,
      warningPoints: convertedPoints, // 保持兼容性
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`image_${imageId}`, JSON.stringify(updatedImageData));
    
    // 同时更新Store中的数据，确保游戏页面能获取到最新数据
    await updateStoreData(updatedImageData);
    
    // 额外触发Store的强制刷新
    await store.dispatch('game/forceRefresh');
    
    // 🔄 同步更新ImagesPage的数据：发送自定义事件通知列表页面刷新
    try {
      // 触发storage事件，通知ImagesPage刷新
      window.dispatchEvent(new StorageEvent('storage', {
        key: `image_${imageId}`,
        newValue: JSON.stringify(updatedImageData),
        url: window.location.href
      }))
      
      console.log('🔔 已通知ImagesPage刷新数据:', imageId)
    } catch (error) {
      console.warn('通知ImagesPage失败:', error)
    }
    
    console.log('✅ 图片数据已保存，使用纯像素坐标格式（与预置图片一致）');
  } catch (error) {
    console.error('保存图片数据失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 快速切换连接线类型
const quickChangeConnectionType = (newConnectionType: any) => {
  if (selectedPointIndex.value !== null) {
    const index = selectedPointIndex.value;
    
    // 更新点位数据
    puzzlePoints.value[index].connectionType = newConnectionType;
    
    // 同步更新 pointLineTypes
    if (newConnectionType === 'horizontal') {
      pointLineTypes.value[index] = 'straight';
    } else if (newConnectionType === 'vertical-horizontal') {
      pointLineTypes.value[index] = 'l-shape';
    }
    
    // 更新当前关卡数据中的连接线类型
    if (currentLevelData.value && currentLevelData.value.puzzlePoints) {
      currentLevelData.value.puzzlePoints[index].connectionType = newConnectionType;
    }
    
    // 更新所有关卡数据中对应的点位
    const currentLevelId = currentLevelData.value?.id;
    if (currentLevelId && gameLevels.value.length > 0) {
      const levelIndex = gameLevels.value.findIndex(level => level.id === currentLevelId);
      if (levelIndex !== -1 && gameLevels.value[levelIndex].puzzlePoints) {
        gameLevels.value[levelIndex].puzzlePoints[index].connectionType = newConnectionType;
      }
    }
    
    // 保存到本地存储
    saveGameData();
    
    // 显示保存成功消息
    ElMessage.success(`点位 ${index + 1} 的连接线类型已更新为: ${getConnectionTypeLabel(newConnectionType)}`);
    
    console.log(`点位 ${index + 1} 快速切换连接线类型为: ${newConnectionType}`);
  }
};

// 保存游戏数据到本地存储
const saveGameData = () => {
  try {
    // 保存当前关卡数据
    if (currentLevelData.value) {
      localStorage.setItem('currentLevelData', JSON.stringify(currentLevelData.value));
    }
    
    // 保存所有关卡数据
    if (gameLevels.value.length > 0) {
      localStorage.setItem('gameLevels', JSON.stringify(gameLevels.value));
    }
    
    console.log('游戏数据已保存到本地存储');
  } catch (error) {
    console.error('保存游戏数据失败:', error);
  }
};

// 点位选择处理
const onPointSelected = (pointIndex: number) => {
  console.log('选择了点位:', pointIndex);
  console.log('当前点位数据:', puzzlePoints.value);
  console.log('当前连接线类型:', pointLineTypes.value);
  console.log('当前自定义偏移量:', customOffsets.value);
  // 可以在这里添加点位选择后的逻辑
};

// 调试: 重新初始化游戏
const debugInitGame = () => {
  console.log('🔧 调试: 重新初始化游戏...');
  console.log('当前游戏关卡数:', gameLevels.value.length);
  console.log('当前点位数据:', puzzlePoints.value);
  console.log('当前关卡数据:', currentLevelData.value);
  
  // 重新初始化游戏
  initGame();
  
  // 等待一下再检查状态
  setTimeout(() => {
    console.log('重新初始化后的状态:');
    console.log('游戏关卡数:', gameLevels.value.length);
    console.log('点位数据:', puzzlePoints.value);
    console.log('关卡数据:', currentLevelData.value);
    
    // 重新初始化连接线类型
    if (puzzlePoints.value && puzzlePoints.value.length > 0) {
      initializeLineTypes();
    }
  }, 100);
};

// 调试: 查看localStorage中的实际数据
const debugShowStoredData = () => {
  const imageId = route.params.id as string;
  if (!imageId) {
    console.log('❌ 没有图片ID');
    return;
  }
  
  const storedData = localStorage.getItem(`image_${imageId}`);
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      console.log('📁 localStorage中的完整数据:', parsed);
      
      const points = parsed.points || parsed.puzzlePoints || [];
      console.log('📁 点位数据详情:');
      points.forEach((point: any, index: number) => {
        console.log(`  点位 ${index}:`, {
          坐标: { x: point.x, y: point.y, width: point.width, height: point.height },
          标题: point.highlightTitle || point.title,
          详情: point.highlightDetail || point.description,
          是否为斜线分布: (
            Math.abs(point.x - (0.1 + index * 0.15)) < 0.01 && 
            Math.abs(point.y - (0.2 + index * 0.1)) < 0.01
          )
        });
      });
    } catch (e) {
      console.error('解析数据失败:', e);
    }
  } else {
    console.log('❌ 没有找到localStorage数据');
  }
};

// 调试: 检测并移除斜线分布的异常数据
const debugRemoveDiagonalData = () => {
  const imageId = route.params.id as string;
  if (!imageId) {
    console.log('❌ 没有图片ID');
    return;
  }
  
  const storedData = localStorage.getItem(`image_${imageId}`);
  if (!storedData) {
    console.log('❌ 没有找到localStorage数据');
    return;
  }
  
  try {
    const parsed = JSON.parse(storedData);
    const points = parsed.points || parsed.puzzlePoints || [];
    
    // 检测是否为斜线分布数据
    const isDiagonalData = points.length > 1 && points.every((point: any, index: number) => {
      return Math.abs(point.x - (0.1 + index * 0.15)) < 0.01 && 
             Math.abs(point.y - (0.2 + index * 0.1)) < 0.01 &&
             Math.abs(point.width - 0.12) < 0.01 &&
             Math.abs(point.height - 0.08) < 0.01;
    });
    
    if (isDiagonalData) {
      console.warn('⚠️ 检测到斜线分布的异常数据！正在清理...');
      
      // 清理localStorage数据
      localStorage.removeItem(`image_${imageId}`);
      console.log('✅ 已清理localStorage中的异常数据');
      
      // 重置当前编辑器中的数据
      puzzlePoints.value = [];
      gameLevels.value = [];
      currentLevel.value = 1;
      
      console.log('✅ 已重置编辑器数据，请重新添加警示点');
      alert('检测到异常的斜线分布数据已清理，请重新添加警示点！');
      
      // 刷新页面
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      console.log('✅ 数据正常，未检测到斜线分布异常');
    }
  } catch (e) {
    console.error('解析数据失败:', e);
  }
};

// 调试: 清理异常的全图覆盖数据
const debugCleanupBadData = () => {
  console.log('🧹 开始清理异常数据...');
  
  const imageId = route.params.id as string;
  if (!imageId) {
    console.log('❌ 没有图片ID，无法清理数据');
    return;
  }
  
  // 清理localStorage中的异常数据
  const storedData = localStorage.getItem(`image_${imageId}`);
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      console.log('检查localStorage数据:', parsed);
      
      // 检查是否有全图覆盖的异常点位
      const points = parsed.points || parsed.puzzlePoints || [];
      const badPoints = points.filter((point: any) => 
        point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1
      );
      
      if (badPoints.length > 0) {
        console.warn('⚠️ 发现异常的全图覆盖数据，正在清理...', badPoints);
        
        // 移除异常数据
        const cleanedPoints = points.filter((point: any) => 
          !(point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1)
        );
        
        const cleanedData = {
          ...parsed,
          points: cleanedPoints,
          puzzlePoints: cleanedPoints
        };
        
        localStorage.setItem(`image_${imageId}`, JSON.stringify(cleanedData));
        console.log('✅ localStorage数据已清理完成');
        
        // 重新加载数据
        location.reload();
      } else {
        console.log('✅ localStorage数据正常，无需清理');
      }
    } catch (e) {
      console.error('解析localStorage数据失败:', e);
    }
  }
  
  // 检查Store中的数据
  const currentLevels = store.getters['game/currentLevels'] || [];
  console.log('检查Store中的关卡数据:', currentLevels);
  
  let hasStoreBadData = false;
  currentLevels.forEach((level: any, index: number) => {
    if (level.image && level.image.includes(imageId)) {
      const badPoints = (level.points || []).filter((point: any) => 
        point.x === 0 && point.y === 0 && point.width === 1 && point.height === 1
      );
      if (badPoints.length > 0) {
        console.warn(`⚠️ Store关卡 ${index} 发现异常数据:`, badPoints);
        hasStoreBadData = true;
      }
    }
  });
  
  if (hasStoreBadData) {
    console.log('🔄 建议清理Store数据，重新保存正确的点位数据');
  }
};

// 调试: 验证和修复数据格式
const debugVerifyAndFixData = () => {
  console.log('🔍 开始验证数据格式...');
  
  // 检查当前puzzlePoints数据
  console.log('当前puzzlePoints数据:', puzzlePoints.value);
  
  puzzlePoints.value.forEach((point, index) => {
    console.log(`点位 ${index} 详细分析:`, {
      '原始数据': point,
      '坐标类型判断': {
        '是否为数字': typeof point.x === 'number' && typeof point.y === 'number',
        '是否在0-1范围': point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1,
        '尺寸是否合理': point.width > 0 && point.height > 0,
        '是否有小数位': point.x % 1 !== 0 || point.y % 1 !== 0
      },
      '标题详情': {
        highlightTitle: point.highlightTitle,
        highlightDetail: point.highlightDetail,
        '旧格式title': point.title,
        '旧格式description': point.description
      }
    });
  });
  
  // 检查存储的数据
  const imageId = route.params.id as string;
  if (imageId) {
    const storedData = localStorage.getItem(`image_${imageId}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log('存储的原始数据:', parsed);
        console.log('存储的点位数据:', parsed.points || parsed.puzzlePoints || parsed.warningPoints);
      } catch (e) {
        console.error('解析存储数据失败:', e);
      }
    }
  }
};

// 调试: 强制设置测试点位数据
const debugForceSetPoints = () => {
  console.log('🔧 调试: 强制设置测试点位数据...');
  
  // 检查是否有可用的关卡数据
  if (gameLevels.value.length === 0) {
    console.log('没有可用的关卡数据，先初始化游戏...');
    initGame();
    
    setTimeout(() => {
      debugForceSetPoints();
    }, 100);
    return;
  }
  
  // 强制设置当前关卡为1
  currentLevel.value = 1;
  
  // 检查当前关卡数据
  const levelData = gameLevels.value[0];
  console.log('第一关数据:', levelData);
  
  if (levelData && levelData.points && levelData.points.length > 0) {
    console.log('第一关点位数据:', levelData.points);
    
    // 强制触发响应式更新
    nextTick(() => {
      console.log('强制更新后的点位数据:', puzzlePoints.value);
      console.log('当前关卡数据:', currentLevelData.value);
      
      // 初始化连接线类型
      if (puzzlePoints.value && puzzlePoints.value.length > 0) {
        initializeLineTypes();
      }
    });
  } else {
    console.log('第一关没有点位数据，尝试从本地存储加载...');
    
    // 尝试从本地存储加载
    const savedLevels = localStorage.getItem('gameLevels');
    if (savedLevels) {
      try {
        const parsedLevels = JSON.parse(savedLevels);
        if (Array.isArray(parsedLevels) && parsedLevels.length > 0) {
          console.log('从本地存储加载的关卡数据:', parsedLevels);
          
          // 更新动态游戏数据
          dynamicGameLevels.value = parsedLevels;
          
          // 重新初始化游戏
          initGame();
          
          setTimeout(() => {
            console.log('从本地存储加载后的状态:');
            console.log('游戏关卡数:', gameLevels.value.length);
            console.log('点位数据:', puzzlePoints.value);
          }, 100);
        }
      } catch (error) {
        console.error('解析本地存储数据失败:', error);
      }
    }
  }
};


</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  width: 100vw; /* 使用视口宽度 */
  height: 100vh; /* 使用视口高度 */
  overflow: hidden;
  background-color: #1e1c72; /* 将背景色改为与导航栏相同的颜色 */
  position: fixed; /* 固定定位，覆盖整个视口 */
  top: 0;
  left: 0;
  z-index: 9999; /* 确保在最上层 */
}

/* 全屏模式下的样式 */
.game-container.fullscreen {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  background-color: #1e1c72;
}

/* 非全屏模式下的样式 */
.game-container:not(.fullscreen) {
  position: relative;
  width: 100%;
  height: 100vh;
  z-index: 1;
}

/* 移除重复的样式定义，只保留全屏编辑模式下的样式 */

.fullscreen-toggle {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.fullscreen-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.fullscreen-text {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
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



/* 连接线样式 - 完全按照index.vue的样式 */
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
  font-size: 20px;
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

/* 连接线样式编辑器样式 */
.connection-line-editor {
  position: fixed;
  width: 300px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  user-select: none;
  top: 70px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.connection-line-editor.collapsed {
  width: 220px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: rgba(245, 247, 250, 0.9);
  border-radius: 12px 12px 0 0;
  cursor: move;
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
}

.editor-title {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.editor-controls {
  display: flex;
  gap: 6px;
}

.editor-content {
  padding: 20px;
}

.editor-section {
  margin-bottom: 24px;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.point-actions {
  margin-top: 16px;
  text-align: center;
}

.point-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 连接线管理样式 */
.connection-line-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-selector label,
.line-type-editor label,
.offset-controls label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  font-weight: 500;
}

.offset-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line-actions {
  margin-top: 8px;
}

@media (max-width: 768px) {
  /* 移动端样式已移到全屏编辑模式样式中 */
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

/* 调试信息显示样式 */
.debug-info-display {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  z-index: 100;
  font-size: 14px;
  max-width: 300px;
}

.debug-info-item {
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 编辑工具栏样式 */
.edit-toolbar {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #1a175d;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 24px rgba(26, 23, 93, 0.3);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.drawing-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draw-btn {
  padding: 10px 15px;
  border: 2px solid #1a175d;
  border-radius: 8px;
  background: white;
  color: #1a175d;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
}

.draw-btn.primary {
  background: #1a175d;
  color: white;
}

.draw-btn.primary:hover {
  background: #2d2a8a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 23, 93, 0.4);
}

.draw-btn.danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.draw-btn.danger:hover {
  background: #c82333;
  border-color: #bd2130;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

/* 绘制矩形样式 */
.drawing-rect {
  position: absolute;
  border: 4px dashed #1e1c72;
  background-color: rgba(30, 28, 114, 0.1);
  pointer-events: none;
  z-index: 15;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(30, 28, 114, 0.3);
}

/* 绘制模式下的鼠标样式 */
.game-image {
  cursor: default;
}

.game-image[data-drawing="true"] {
  cursor: crosshair;
}

/* 浮动工具栏样式 */

/* 全屏编辑模式样式 */
.fullscreen-edit-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #1e1c72;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 全屏编辑模式下隐藏所有管理界面元素 */
.fullscreen-edit-container ~ *,
.fullscreen-edit-container + * {
  display: none !important;
}

/* 强制隐藏左边导航栏 */
.fullscreen-edit-container ~ .admin-layout,
.fullscreen-edit-container ~ .layout-container,
.fullscreen-edit-container ~ .sidebar,
.fullscreen-edit-container ~ .left-nav,
.fullscreen-edit-container ~ .nav-sidebar {
  display: none !important;
}

/* 强制隐藏顶部管理栏 */
.fullscreen-edit-container ~ .top-bar,
.fullscreen-edit-container ~ .header,
.fullscreen-edit-container ~ .admin-header {
  display: none !important;
}

.fullscreen-edit-container .game-header {
  background-color: #1e1c72;
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 10;
  border-bottom: none;
  margin-bottom: 0;
  position: relative;
}

.fullscreen-edit-container .game-image-area {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.fullscreen-edit-container .game-image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: visible;
  cursor: pointer;
  box-shadow: none;
  background-color: #1e1c72;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
}

.fullscreen-edit-container .game-image img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  background-color: #1e1c72;
}

/* 完全按照index.vue的头部样式 */
.fullscreen-edit-container .hearts {
  display: flex;
  gap: 8px;
  margin-left: 20px;
  margin-top: 0;
}

.fullscreen-edit-container .heart {
  position: relative;
  width: 57px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fullscreen-edit-container .heart-full,
.fullscreen-edit-container .heart-half,
.fullscreen-edit-container .heart-empty {
  width: 57px;
  height: 50px;
  object-fit: contain;
  display: block;
}

.fullscreen-edit-container .timer-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 700px;
  margin: 0 8px;
  margin-top: 0;
}

.fullscreen-edit-container .timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.fullscreen-edit-container .timer-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(0, 200, 255, 0.1);
  border-radius: 19px;
  padding: 6px 12px;
  border: 2px solid #00c8ff;
  width: 100%;
  max-width: 540px;
  justify-content: space-between;
}

.fullscreen-edit-container .timer-blocks {
  display: flex;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
}

.fullscreen-edit-container .time-block {
  width: 30px;
  height: 30px;
  background-color: #00c8ff;
  border-radius: 11px;
}

.fullscreen-edit-container .time-block:not(.active) {
  opacity: 0.2;
}

.fullscreen-edit-container .timer-text {
  color: #00c8ff;
  font-weight: bold;
  font-size: 20px;
  margin-left: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 48px;
}

.fullscreen-edit-container .level-progress {
  display: flex;
  align-items: center;
  margin-left: 10px;
  white-space: nowrap;
}

.fullscreen-edit-container .level-current {
  font-size: 42px;
  font-weight: bold;
  line-height: 1;
}

.fullscreen-edit-container .level-total {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}

.fullscreen-edit-container .level-slash {
  font-size: 26px;
  font-weight: bold;
  margin: 0 4px;
  line-height: 1;
}

.fullscreen-edit-container .header-right {
  display: flex;
  align-items: center;
  margin-top: 0;
}

.fullscreen-edit-container .instruction {
  font-size: 26px;
  color: #7680c0;
  white-space: nowrap;
  margin-left: 0px;
  margin-right: 20px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .fullscreen-edit-container .game-header {
    padding: 0;
    height: 60px;
  }
  
  .fullscreen-edit-container .hearts {
    margin-left: 10px;
  }
  
  .fullscreen-edit-container .heart {
    width: 30px;
    height: 26px;
  }
  
  .fullscreen-edit-container .heart-full,
  .fullscreen-edit-container .heart-half,
  .fullscreen-edit-container .heart-empty {
    width: 30px;
    height: 26px;
  }
  
  .fullscreen-edit-container .level-progress {
    margin-left: 20px;
  }
  
  .fullscreen-edit-container .level-current {
    font-size: 30px;
  }
  
  .fullscreen-edit-container .level-slash {
    font-size: 16px;
  }
  
  .fullscreen-edit-container .timer-container {
    margin: 0 8px;
  }

  .fullscreen-edit-container .timer-wrapper {
    padding: 6px 10px;
    border-radius: 10px;
    width: auto;
  }
  
  .fullscreen-edit-container .timer-blocks {
    gap: 4px;
  }

  .fullscreen-edit-container .time-block {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }
  
  .fullscreen-edit-container .timer-text {
    font-size: 18px;
    margin-left: 10px;
  }
  
  .fullscreen-edit-container .instruction {
    font-size: 14px;
    margin-left: 15px;
    margin-right: 6px;
  }
}

/* 全屏编辑按钮样式 */
.fullscreen-edit-btn {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.fullscreen-edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.fullscreen-edit-btn span {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

/* 退出全屏编辑按钮样式 */
.exit-fullscreen-btn {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 20px;
  border: 2px solid rgba(255, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.exit-fullscreen-btn:hover {
  background-color: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.7);
}

.exit-fullscreen-btn span {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

/* 普通管理界面样式 */
.admin-interface {
  background-color: #2a288f;
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
}

/* 浮动工具栏样式已移到上方 */

.connection-editor {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-section {
  display: flex;
  flex-direction: column;
}

.editor-actions {
  display: flex;
  justify-content: space-between;
}

.close-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
}

.save-btn, .reset-btn, .delete-btn {
  background-color: #1e1c72;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

/* 连接线类型快速切换工具栏样式 */
.connection-toolbar {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #1a175d;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 24px rgba(26, 23, 93, 0.3);
  z-index: 1000;
  min-width: 300px;
  backdrop-filter: blur(10px);
}

.toolbar-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: bold;
  color: #1a175d;
  font-size: 14px;
}

.close-toolbar {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-toolbar:hover {
  background: #ff3838;
  transform: scale(1.1);
}

.toolbar-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-btn {
  padding: 10px 15px;
  border: 2px solid #1a175d;
  border-radius: 8px;
  background: white;
  color: #1a175d;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.connection-btn:hover {
  background: #f0f0ff;
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(26, 23, 93, 0.2);
}

.connection-btn.active {
  background: #1a175d;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(26, 23, 93, 0.3);
}

.connection-btn.active:hover {
  background: #2c2980;
  transform: translateX(0);
}

/* 响应式设计 - 小屏幕适配 */
@media (max-width: 768px) {
  .connection-toolbar {
    right: 10px;
    left: 10px;
    min-width: auto;
    top: 70px;
  }
  
  .toolbar-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .connection-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
    font-size: 12px;
    padding: 8px 12px;
  }
}

/* 选中的点位高亮样式 */
.puzzle-point.selected {
  border: 4px solid #ff6b35 !important;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.6) !important;
  background-color: rgba(255, 107, 53, 0.2) !important;
  z-index: 15 !important;
  animation: pulse-selected 1.5s infinite;
}

@keyframes pulse-selected {
  0% { 
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 107, 53, 0.8);
  }
  100% { 
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
  }
}
</style> 