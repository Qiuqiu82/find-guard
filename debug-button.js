// 调试按钮显示逻辑
console.log('=== 调试按钮显示逻辑 ===');

// 模拟游戏状态
let gameSuccess = false;
let currentLevel = 1;
let totalLevels = 6;
let isTimeUp = false;
let hearts = 3;
let allPointsFound = false;

// 模拟 endGame 函数逻辑
const simulateEndGame = () => {
  console.log('\n--- 模拟 endGame 函数 ---');
  console.log('hearts:', hearts);
  console.log('allPointsFound:', allPointsFound);
  
  if (hearts > 0 && allPointsFound) {
    gameSuccess = true;
    isTimeUp = false;
    console.log('✅ 游戏成功！gameSuccess = true, isTimeUp = false');
  } else {
    gameSuccess = false;
    console.log('❌ 游戏失败！gameSuccess = false');
  }
  
  console.log('最终状态:');
  console.log('gameSuccess:', gameSuccess);
  console.log('isTimeUp:', isTimeUp);
};

// 模拟按钮显示逻辑
const checkButtonLogic = () => {
  console.log('\n--- 检查按钮显示逻辑 ---');
  console.log('gameSuccess:', gameSuccess);
  console.log('currentLevel:', currentLevel);
  console.log('totalLevels:', totalLevels);
  console.log('isTimeUp:', isTimeUp);
  
  const showNextLevelButton = gameSuccess && currentLevel < totalLevels && !isTimeUp;
  const buttonText = isTimeUp ? '重新游戏' : '重新开始';
  
  console.log('\n按钮显示结果:');
  console.log('显示"下一关"按钮:', showNextLevelButton);
  console.log('显示按钮文字:', buttonText);
  
  if (showNextLevelButton) {
    console.log('✅ 应该显示"下一关"按钮');
  } else {
    console.log('❌ 不显示"下一关"按钮');
    if (!gameSuccess) {
      console.log('   - 原因: gameSuccess 为 false');
    }
    if (currentLevel >= totalLevels) {
      console.log('   - 原因: currentLevel >= totalLevels');
    }
    if (isTimeUp) {
      console.log('   - 原因: isTimeUp 为 true');
    }
  }
};

// 测试场景1：正常通关
console.log('\n=== 测试场景1：正常通关 ===');
hearts = 3;
allPointsFound = true;
simulateEndGame();
checkButtonLogic();

// 测试场景2：爱心用完
console.log('\n=== 测试场景2：爱心用完 ===');
hearts = 0;
allPointsFound = true;
simulateEndGame();
checkButtonLogic();

// 测试场景3：没有找到所有点
console.log('\n=== 测试场景3：没有找到所有点 ===');
hearts = 3;
allPointsFound = false;
simulateEndGame();
checkButtonLogic();

// 测试场景4：最后一关
console.log('\n=== 测试场景4：最后一关 ===');
hearts = 3;
allPointsFound = true;
currentLevel = 6;
simulateEndGame();
checkButtonLogic();

console.log('\n=== 调试完成 ==='); 