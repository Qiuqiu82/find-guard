/**
 * FindGuard API 集成测试工具
 * 用于验证所有API接口的连接和功能
 */

import { 
  systemAPI, 
  categoryAPI, 
  levelAPI, 
  pointAPI, 
  fileAPI,
  dataAPI,
  backupAPI,
  gameAPI,
  handleAPIError 
} from '@/api/index.js'

/**
 * API测试管理器
 */
class APITestManager {
  constructor() {
    this.testResults = []
    this.startTime = null
    this.endTime = null
  }

  /**
   * 记录测试结果
   */
  recordTest(testName, success, data = null, error = null) {
    this.testResults.push({
      name: testName,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 运行单个测试
   */
  async runTest(testName, testFunction) {
    console.log(`🧪 运行测试: ${testName}`)
    
    try {
      const result = await testFunction()
      this.recordTest(testName, true, result)
      console.log(`✅ ${testName} - 通过`)
      return { success: true, data: result }
    } catch (error) {
      this.recordTest(testName, false, null, error)
      console.error(`❌ ${testName} - 失败:`, error.message)
      return { success: false, error }
    }
  }

  /**
   * 运行所有API测试
   */
  async runAllTests() {
    console.log('🚀 开始API集成测试...')
    this.startTime = new Date()
    this.testResults = []

    // 1. 系统管理API测试
    await this.testSystemAPI()
    
    // 2. 分类管理API测试
    await this.testCategoryAPI()
    
    // 3. 关卡管理API测试
    await this.testLevelAPI()
    
    // 4. 警示点管理API测试
    await this.testPointAPI()
    
    // 5. 文件管理API测试（需要文件）
    // await this.testFileAPI()
    
    // 6. 数据管理API测试
    await this.testDataAPI()
    
    // 7. 备份管理API测试
    await this.testBackupAPI()
    
    // 8. 游戏API测试
    await this.testGameAPI()

    this.endTime = new Date()
    this.printTestSummary()
  }

  /**
   * 测试系统管理API
   */
  async testSystemAPI() {
    console.log('\n📊 测试系统管理API...')
    
    // 获取系统配置
    await this.runTest('获取系统配置', async () => {
      const response = await systemAPI.getConfig()
      
      // 验证响应结构
      if (!response.success || !response.data) {
        throw new Error('响应格式错误')
      }
      
      if (!response.data.game || !response.data.upload) {
        throw new Error('配置数据结构错误')
      }
      
      return response.data
    })

    // 获取系统统计
    await this.runTest('获取系统统计', async () => {
      const response = await systemAPI.getStats()
      
      if (!response.success || !response.data) {
        throw new Error('响应格式错误')
      }
      
      const stats = response.data
      const requiredFields = ['total_levels', 'preset_levels', 'custom_levels', 'total_points']
      
      for (const field of requiredFields) {
        if (typeof stats[field] === 'undefined') {
          throw new Error(`缺少统计字段: ${field}`)
        }
      }
      
      return stats
    })
  }

  /**
   * 测试分类管理API
   */
  async testCategoryAPI() {
    console.log('\n📁 测试分类管理API...')
    
    // 获取所有分类
    await this.runTest('获取分类列表', async () => {
      const response = await categoryAPI.getAll()
      
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error('分类列表格式错误')
      }
      
      if (response.data.length === 0) {
        throw new Error('分类列表为空')
      }
      
      // 验证分类数据结构
      const category = response.data[0]
      const requiredFields = ['id', 'name', 'description', 'sort_order', 'is_active']
      
      for (const field of requiredFields) {
        if (typeof category[field] === 'undefined') {
          throw new Error(`分类缺少字段: ${field}`)
        }
      }
      
      return response.data
    })
  }

  /**
   * 测试关卡管理API
   */
  async testLevelAPI() {
    console.log('\n🎮 测试关卡管理API...')
    
    let testLevelId = null

    // 获取关卡列表
    const levelsResult = await this.runTest('获取关卡列表', async () => {
      const response = await levelAPI.getList({ size: 10 })
      
      if (!response.success || !response.data) {
        throw new Error('响应格式错误')
      }
      
      if (!Array.isArray(response.data.items)) {
        throw new Error('关卡列表格式错误')
      }
      
      if (response.data.items.length === 0) {
        throw new Error('关卡列表为空')
      }
      
      return response.data
    })

    // 如果获取关卡列表成功，测试获取关卡详情
    if (levelsResult.success && levelsResult.data.items.length > 0) {
      testLevelId = levelsResult.data.items[0].id
      
      await this.runTest('获取关卡详情', async () => {
        const response = await levelAPI.getDetail(testLevelId)
        
        if (!response.success || !response.data) {
          throw new Error('响应格式错误')
        }
        
        const level = response.data
        const requiredFields = ['id', 'level_id', 'name', 'image_url', 'difficulty']
        
        for (const field of requiredFields) {
          if (typeof level[field] === 'undefined') {
            throw new Error(`关卡缺少字段: ${field}`)
          }
        }
        
        if (!Array.isArray(level.points)) {
          throw new Error('警示点列表格式错误')
        }
        
        return level
      })
    }
  }

  /**
   * 测试警示点管理API
   */
  async testPointAPI() {
    console.log('\n📍 测试警示点管理API...')
    
    // 先获取一个关卡来测试警示点
    const levelsResponse = await levelAPI.getList({ size: 1 })
    
    if (levelsResponse.success && levelsResponse.data.items.length > 0) {
      const levelId = levelsResponse.data.items[0].id
      
      await this.runTest('获取关卡警示点', async () => {
        const response = await pointAPI.getByLevel(levelId)
        
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error('警示点列表格式错误')
        }
        
        // 如果有警示点，验证数据结构
        if (response.data.length > 0) {
          const point = response.data[0]
          const requiredFields = ['id', 'point_id', 'x', 'y', 'width', 'height', 'highlight_title', 'highlight_detail']
          
          for (const field of requiredFields) {
            if (typeof point[field] === 'undefined') {
              throw new Error(`警示点缺少字段: ${field}`)
            }
          }
        }
        
        return response.data
      })
    } else {
      console.log('⚠️ 跳过警示点API测试（没有可用关卡）')
    }
  }

  /**
   * 测试数据管理API
   */
  async testDataAPI() {
    console.log('\n💾 测试数据管理API...')
    
    // 测试数据导出
    await this.runTest('数据导出', async () => {
      const response = await dataAPI.export({
        format: 'json',
        include_images: false,
        preset_only: true
      })
      
      if (!response.success || !response.data) {
        throw new Error('导出响应格式错误')
      }
      
      const exportData = response.data
      const requiredFields = ['export_id', 'download_url', 'file_size', 'data_summary']
      
      for (const field of requiredFields) {
        if (typeof exportData[field] === 'undefined') {
          throw new Error(`导出数据缺少字段: ${field}`)
        }
      }
      
      return exportData
    })
  }

  /**
   * 测试备份管理API
   */
  async testBackupAPI() {
    console.log('\n🗄️ 测试备份管理API...')
    
    // 获取备份列表
    await this.runTest('获取备份列表', async () => {
      const response = await backupAPI.getList({ page: 1, size: 5 })
      
      if (!response.success || !response.data) {
        throw new Error('响应格式错误')
      }
      
      if (!Array.isArray(response.data.items)) {
        throw new Error('备份列表格式错误')
      }
      
      return response.data
    })
  }

  /**
   * 测试游戏API
   */
  async testGameAPI() {
    console.log('\n🎯 测试游戏API...')
    
    // 获取游戏配置
    await this.runTest('获取游戏配置', async () => {
      const response = await gameAPI.getConfig()
      
      if (!response.success || !response.data) {
        throw new Error('响应格式错误')
      }
      
      return response.data
    })
  }

  /**
   * 打印测试摘要
   */
  printTestSummary() {
    const duration = this.endTime - this.startTime
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(test => test.success).length
    const failedTests = totalTests - passedTests
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 API集成测试报告')
    console.log('='.repeat(60))
    console.log(`⏱️  测试耗时: ${duration}ms`)
    console.log(`📊 总测试数: ${totalTests}`)
    console.log(`✅ 通过: ${passedTests}`)
    console.log(`❌ 失败: ${failedTests}`)
    console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      this.testResults
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`)
        })
    }
    
    console.log('\n📝 详细结果:')
    console.table(this.testResults.map(test => ({
      测试名称: test.name,
      状态: test.success ? '✅ 通过' : '❌ 失败',
      错误: test.error || '-'
    })))
    
    console.log('='.repeat(60))
    
    if (passedTests === totalTests) {
      console.log('🎉 所有API测试通过！系统集成成功！')
    } else {
      console.log('⚠️ 部分API测试失败，请检查后台服务和网络连接。')
    }
  }

  /**
   * 获取测试结果
   */
  getTestResults() {
    return {
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(test => test.success).length,
        failed: this.testResults.filter(test => !test.success).length,
        duration: this.endTime - this.startTime,
        startTime: this.startTime,
        endTime: this.endTime
      }
    }
  }
}

/**
 * 快速API连接测试
 */
export async function quickAPITest() {
  console.log('🔍 快速API连接测试...')
  
  try {
    // 测试基本连接
    const response = await systemAPI.getConfig()
    
    if (response.success) {
      console.log('✅ API连接正常')
      console.log('📊 系统配置:', response.data)
      return true
    } else {
      console.log('❌ API响应格式错误')
      return false
    }
  } catch (error) {
    console.error('❌ API连接失败:', error.message)
    return false
  }
}

/**
 * 运行完整API测试
 */
export async function runFullAPITest() {
  const testManager = new APITestManager()
  await testManager.runAllTests()
  return testManager.getTestResults()
}

/**
 * 在浏览器控制台中使用的测试函数
 */
if (typeof window !== 'undefined') {
  window.FindGuardAPITest = {
    quick: quickAPITest,
    full: runFullAPITest,
    manager: APITestManager
  }
  
  console.log('🧪 FindGuard API测试工具已加载')
  console.log('使用方法:')
  console.log('  - 快速测试: FindGuardAPITest.quick()')
  console.log('  - 完整测试: FindGuardAPITest.full()')
}

export default {
  APITestManager,
  quickAPITest,
  runFullAPITest
}
