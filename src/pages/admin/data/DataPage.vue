<template>
  <div class="data-page">
    <div class="page-header">
      <h1>数据管理</h1>
      <p>管理系统数据和用户信息</p>
    </div>
    
    <div class="data-content">
      <!-- 搜索和操作栏 -->
      <el-card class="search-card">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名、邮箱或ID"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="待验证" value="pending" />
          </el-select>
          
          <el-button type="primary" @click="handleSearch">
            <el-icon><search /></el-icon>
            搜索
          </el-button>
          
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
      
      <!-- 数据表格 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>用户数据</span>
            <div class="header-actions">
              <el-button type="success" size="small" @click="exportData">
                <el-icon><download /></el-icon>
                导出数据
              </el-button>
              <el-button type="primary" size="small" @click="addUser">
                <el-icon><plus /></el-icon>
                添加用户
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table
          :data="tableData"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" width="100" />
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editUser(row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteUser(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
                  <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Plus } from '@element-plus/icons-vue'

// 页面标题
const pageTitle = '数据管理'

// 搜索相关
const searchQuery = ref('')
const statusFilter = ref('')

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    status: 'active',
    role: '管理员',
    lastLogin: '2024-01-15 10:30:00',
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    status: 'active',
    role: '用户',
    lastLogin: '2024-01-14 15:20:00',
    createdAt: '2024-01-02 00:00:00'
  },
  {
    id: 3,
    username: 'user2',
    email: 'user2@example.com',
    status: 'inactive',
    role: '用户',
    lastLogin: '2024-01-10 09:15:00',
    createdAt: '2024-01-03 00:00:00'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)

// 搜索处理
const handleSearch = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  handleSearch()
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 添加用户
const addUser = () => {
  ElMessage.info('打开添加用户对话框')
}

// 编辑用户
const editUser = (row: any) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

// 删除用户
const deleteUser = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('用户删除成功')
  } catch {
    // 用户取消删除
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  handleSearch()
}

// 状态相关
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '禁用',
    pending: '待验证'
  }
  return statusMap[status] || status
}

// 页面加载时获取数据
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.data-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.data-content {
  max-width: 1400px;
}

.search-card,
.table-card {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
}
</style> 