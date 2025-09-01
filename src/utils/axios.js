/**
 * Axios 配置文件
 * 统一配置请求拦截器、响应拦截器和跨域处理
 */

import axios from 'axios'

// 根据环境设置 base URL
const baseURL = import.meta.env.DEV 
  ? '/api'  // 开发环境使用代理
  : 'http://localhost:4000/api'  // 生产环境直接请求

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'findguard-api-key-2024'
  },
  // 跨域配置
  withCredentials: false, // 不发送凭据（cookies）
  crossDomain: true
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    console.log('🚀 发送请求:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    })
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    
    // 检查业务状态码
    if (response.data && !response.data.success) {
      const error = new Error(response.data.error?.message || '请求失败')
      error.code = response.data.error?.code
      error.response = response
      throw error
    }
    
    return response.data
  },
  (error) => {
    console.error('❌ 响应拦截器错误:', error)
    
    // 网络错误处理
    if (!error.response) {
      console.error('🌐 网络连接失败，请检查：')
      console.error('1. 后台服务是否启动 (http://localhost:4000)')
      console.error('2. 网络连接是否正常')
      error.message = '网络连接失败，请检查后台服务是否启动'
    } else {
      // HTTP 错误处理
      const { status, statusText } = error.response
      switch (status) {
        case 400:
          error.message = '请求参数错误'
          break
        case 401:
          error.message = '未授权访问'
          break
        case 403:
          error.message = '禁止访问'
          break
        case 404:
          error.message = '请求的资源不存在'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        default:
          error.message = `请求失败: ${status} ${statusText}`
      }
    }
    
    return Promise.reject(error)
  }
)

// 导出 axios 实例
export default axiosInstance

// 导出常用方法
export const get = (url, params = {}) => {
  return axiosInstance.get(url, { params })
}

export const post = (url, data = {}) => {
  return axiosInstance.post(url, data)
}

export const put = (url, data = {}) => {
  return axiosInstance.put(url, data)
}

export const del = (url, params = {}) => {
  return axiosInstance.delete(url, { params })
}

// 文件上传方法
export const upload = (url, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentage)
      }
    }
  })
}

// CORS 预检请求测试
export const testCORS = async () => {
  try {
    console.log('🧪 测试 CORS 配置...')
    const response = await axiosInstance.get('/test')
    console.log('✅ CORS 配置正常')
    return response
  } catch (error) {
    console.error('❌ CORS 配置异常:', error.message)
    throw error
  }
}
