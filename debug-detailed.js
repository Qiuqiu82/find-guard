// 详细调试按钮显示逻辑
console.log('=== 详细调试按钮显示逻辑 ===');

// 模拟游戏状态
let gameSuccess = false;
let currentLevel = 1;
let totalLevels = 6;
let isTimeUp = false;
let hearts = 3;
let allPointsFound = false;

console.log('\n--- 初始状态 ---');
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);

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

// 模拟 continueGame 函数逻辑
const simulateContinueGame = () => {
  console.log('\n--- 模拟 continueGame 函数 ---');
  console.log('进入前 - currentLevel:', currentLevel);
  console.log('进入前 - totalLevels:', totalLevels);
  console.log('进入前 - currentLevel < totalLevels:', currentLevel < totalLevels);
  
  if (currentLevel < totalLevels) {
    currentLevel++;
    console.log('✅ 进入下一关，currentLevel 变为:', currentLevel);
    console.log('现在 currentLevel < totalLevels:', currentLevel < totalLevels);
  } else {
    console.log('❌ 已经是最后一关，无法继续');
  }
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
  
  console.log('\n条件检查:');
  console.log('gameSuccess:', gameSuccess);
  console.log('currentLevel < totalLevels:', currentLevel < totalLevels);
  console.log('!isTimeUp:', !isTimeUp);
  console.log('所有条件都满足:', gameSuccess && currentLevel < totalLevels && !isTimeUp);
  
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

// 测试场景：第一关完成后
console.log('\n=== 测试场景：第一关完成后 ===');
console.log('第一关完成前的状态:');
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);

// 第一关完成
hearts = 3;
allPointsFound = true;
simulateEndGame();

// 检查按钮显示
checkButtonLogic();

// 模拟点击"下一关"按钮
console.log('\n=== 模拟点击"下一关"按钮 ===');
simulateContinueGame();

// 再次检查状态
console.log('\n=== 进入下一关后的状态 ===');
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);

console.log('\n=== 调试完成 ==='); 