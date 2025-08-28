// 测试修复后的按钮显示逻辑
console.log('=== 测试修复后的按钮显示逻辑 ===');

// 模拟游戏状态
let gameSuccess = false;
let currentLevel = 1;
let totalLevels = 6;
let isTimeUp = false;

console.log('\n--- 初始状态 ---');
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);

// 模拟第一关完成
console.log('\n=== 第一关完成 ===');
gameSuccess = true;
currentLevel = 1;
totalLevels = 6;
isTimeUp = false;

console.log('状态:');
console.log('gameSuccess:', gameSuccess);
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);
console.log('isTimeUp:', isTimeUp);

// 检查按钮显示条件
const showNextLevelButton = gameSuccess && currentLevel < totalLevels && !isTimeUp;
console.log('\n按钮显示条件检查:');
console.log('gameSuccess:', gameSuccess);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);
console.log('!isTimeUp:', !isTimeUp);
console.log('所有条件都满足:', showNextLevelButton);

if (showNextLevelButton) {
  console.log('✅ 应该显示"下一关"按钮');
} else {
  console.log('❌ 不显示"下一关"按钮');
}

// 模拟进入下一关
console.log('\n=== 进入下一关 ===');
currentLevel = 2;
console.log('currentLevel 变为:', currentLevel);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);

// 再次检查按钮显示
const showNextLevelButton2 = gameSuccess && currentLevel < totalLevels && !isTimeUp;
console.log('\n进入第二关后的按钮显示条件:');
console.log('showNextLevelButton:', showNextLevelButton2);

if (showNextLevelButton2) {
  console.log('✅ 第二关仍然应该显示"下一关"按钮');
} else {
  console.log('❌ 第二关不显示"下一关"按钮');
}

// 测试最后一关
console.log('\n=== 测试最后一关 ===');
currentLevel = 6;
totalLevels = 6;
console.log('currentLevel:', currentLevel);
console.log('totalLevels:', totalLevels);
console.log('currentLevel < totalLevels:', currentLevel < totalLevels);

const showNextLevelButtonLast = gameSuccess && currentLevel < totalLevels && !isTimeUp;
console.log('\n最后一关的按钮显示条件:');
console.log('showNextLevelButton:', showNextLevelButtonLast);

if (showNextLevelButtonLast) {
  console.log('✅ 最后一关应该显示"下一关"按钮');
} else {
  console.log('❌ 最后一关不显示"下一关"按钮，应该显示"重新开始"');
}

console.log('\n=== 测试完成 ===');
console.log('总结: 第一关完成后应该显示"下一关"按钮，最后一关完成后应该显示"重新开始"按钮'); 