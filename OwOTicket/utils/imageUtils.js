/**
 * 图片处理工具类
 * 提供图片选择、base64转换等功能
 * 支持H5和原生平台
 */

class ImageUtils {
  /**
   * 选择图片并转换为base64格式
   * @param {Object} options 选择选项
   * @param {number} options.count 选择图片数量，默认1
   * @param {Array} options.sizeType 图片尺寸类型，默认['compressed']
   * @param {Array} options.sourceType 图片来源，默认['album', 'camera']
   * @param {string} options.loadingTitle 加载提示文字，默认'处理图片中...'
   * @param {number} options.quality 图片质量(0-1)，默认0.8
   * @param {number} options.maxSizeMB 最大文件大小(MB)，默认5
   * @returns {Promise<string>} 返回base64格式的图片数据
   */
  static chooseImageAndConvertToBase64(options = {}) {
    const {
      count = 1,
      sizeType = ['compressed'],
      sourceType = ['album', 'camera'],
      loadingTitle = '处理图片中...',
      quality = 0.8,
      maxSizeMB = 5
    } = options

    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          
          // 显示处理中提示
          uni.showLoading({
            title: loadingTitle
          })
          
          // 将图片转换为base64格式
          this.convertImageToBase64(tempFilePath, { quality, maxSizeMB })
            .then(base64Data => {
              uni.hideLoading()
              uni.showToast({
                title: '图片已选择',
                icon: 'success'
              })
              resolve(base64Data)
            })
            .catch(error => {
              uni.hideLoading()
              uni.showToast({
                title: '图片处理失败',
                icon: 'none'
              })
              reject(error)
            })
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }

  /**
   * 将图片文件转换为base64格式
   * @param {string} filePath 图片文件路径
   * @param {Object} options 转换选项
   * @param {number} options.quality 图片质量(0-1)，默认0.8
   * @param {number} options.maxSizeMB 最大文件大小(MB)，默认5
   * @returns {Promise<string>} 返回base64格式的图片数据
   */
  static convertImageToBase64(filePath, options = {}) {
    const { quality = 0.8, maxSizeMB = 5 } = options

    return new Promise((resolve, reject) => {
      // 检查当前平台
      // #ifdef H5
      this._convertImageToBase64H5(filePath, quality, maxSizeMB, resolve, reject)
      // #endif
      
      // #ifndef H5
      this._convertImageToBase64Native(filePath, maxSizeMB, resolve, reject)
      // #endif
    })
  }

  /**
   * 获取图片MIME类型
   * @param {string} filePath 文件路径
   * @returns {string} MIME类型
   */
  static getImageMimeType(filePath) {
    const extension = filePath.toLowerCase().split('.').pop()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'gif':
        return 'image/gif'
      case 'webp':
        return 'image/webp'
      case 'bmp':
        return 'image/bmp'
      default:
        return 'image/jpeg' // 默认为jpeg
    }
  }

  /**
   * 计算base64数据的文件大小(MB)
   * @param {string} base64Data base64数据
   * @returns {number} 文件大小(MB)
   */
  static calculateBase64Size(base64Data) {
    return (base64Data.length * 0.75) / (1024 * 1024)
  }

  /**
   * H5平台的base64转换方法
   * @private
   */
  // #ifdef H5
  static _convertImageToBase64H5(filePath, quality, maxSizeMB, resolve, reject) {
    try {
      // 创建Image对象
      const img = new Image()
      img.crossOrigin = 'anonymous' // 处理跨域问题
      
      img.onload = () => {
        try {
          // 创建Canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 设置Canvas尺寸
          canvas.width = img.width
          canvas.height = img.height
          
          // 绘制图片到Canvas
          ctx.drawImage(img, 0, 0)
          
          // 根据文件扩展名确定MIME类型
          const mimeType = this.getImageMimeType(filePath)
          
          // 转换为base64
          const base64Data = canvas.toDataURL(mimeType, quality)
          
          // 检查base64数据大小
          const sizeInMB = this.calculateBase64Size(base64Data)
          
          if (sizeInMB > maxSizeMB) {
            console.warn(`图片文件较大: ${sizeInMB.toFixed(2)}MB`)
          }         
          
          resolve(base64Data)
        } catch (error) {
          console.error('Canvas转换失败:', error)
          this._handleConversionError(filePath, resolve, reject)
        }
      }
      
      img.onerror = (error) => {
        console.error('图片加载失败:', error)
        this._handleConversionError(filePath, resolve, reject)
      }
      
      // 设置图片源
      img.src = filePath
      
    } catch (error) {
      console.error('H5转换base64失败:', error)
      this._handleConversionError(filePath, resolve, reject)
    }
  }
  // #endif

  /**
   * 原生平台的base64转换方法
   * @private
   */
  // #ifndef H5
  static _convertImageToBase64Native(filePath, maxSizeMB, resolve, reject) {
    try {
      const fileSystemManager = uni.getFileSystemManager()
      
      fileSystemManager.readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          try {
            // 根据文件扩展名确定MIME类型
            const mimeType = this.getImageMimeType(filePath)
            
            // 构建完整的base64数据URI
            const base64Data = `data:${mimeType};base64,${res.data}`
            
            // 检查base64数据大小
            const sizeInMB = this.calculateBase64Size(base64Data)
            
            if (sizeInMB > maxSizeMB) {
              console.warn(`图片文件较大: ${sizeInMB.toFixed(2)}MB`)
            }
            
            console.log('图片转换为base64成功 (Native)')
            console.log('MIME类型:', mimeType)
            console.log('数据大小:', sizeInMB.toFixed(2) + 'MB')
            
            resolve(base64Data)
          } catch (error) {
            console.error('数据处理失败:', error)
            this._handleConversionError(filePath, resolve, reject)
          }
        },
        fail: (error) => {
          console.error('文件系统转换失败:', error)
          this._handleConversionError(filePath, resolve, reject)
        }
      })
    } catch (error) {
      console.error('原生平台转换base64失败:', error)
      this._handleConversionError(filePath, resolve, reject)
    }
  }
  // #endif

  /**
   * 转换失败时的错误处理
   * @private
   */
  static _handleConversionError(filePath, resolve, reject) {
    console.log('base64转换失败，使用原始路径作为回退方案')
    
    // 如果base64转换失败，可以选择回退到使用原始路径
    // 或者直接抛出错误让调用方处理
    
    // 方案1：回退到原始路径
    resolve(filePath)
    
    // 方案2：抛出错误（如果需要严格的base64格式，可以使用这个方案）
    // reject(new Error('图片转换为base64失败'))
  }

  /**
   * 压缩图片尺寸（仅H5平台）
   * @param {string} base64Data 原始base64数据
   * @param {number} maxWidth 最大宽度
   * @param {number} maxHeight 最大高度
   * @param {number} quality 压缩质量(0-1)
   * @returns {Promise<string>} 压缩后的base64数据
   */
  // #ifdef H5
  static compressImage(base64Data, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 计算压缩后的尺寸
          let { width, height } = img
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }
          
          canvas.width = width
          canvas.height = height
          
          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, width, height)
          
          // 转换为base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          
          console.log('图片压缩完成')
          console.log('原始尺寸:', img.width + 'x' + img.height)
          console.log('压缩尺寸:', width + 'x' + height)
          
          resolve(compressedBase64)
        }
        
        img.onerror = () => {
          reject(new Error('图片压缩失败'))
        }
        
        img.src = base64Data
      } catch (error) {
        reject(error)
      }
    })
  }
  // #endif
}

export default ImageUtils
