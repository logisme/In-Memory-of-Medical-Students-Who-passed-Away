// 保留原有所有函数，仅新增/修改图片读取逻辑
export function saveToFile(data) {
  localStorage.setItem('medicalStudents', JSON.stringify(data));
}

export function readFromFile() {
  const data = localStorage.getItem('medicalStudents');
  return data ? JSON.parse(data) : [];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ---------------- 仅修改以下图片相关逻辑 ----------------
// 项目根路径（修复404核心：补充项目目录）
const PROJECT_ROOT = '/In-Memory-of-Medical-Students-Who-passed-Away/';
// 支持的图片格式
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
// 单个图片请求超时（避免卡死）
const REQUEST_TIMEOUT = 3000;

/**
 * 核心修改：扫描指定文件夹下的有效图片（并行请求，精准匹配）
 * 调用方式不变，仅优化内部逻辑
 * @param {string} folderName 文件夹名（如 chen/sun）
 * @returns {Promise<string[]>} 有效图片URL列表
 */
export async function getFolderImages(folderName) {
  if (!folderName) {
    console.warn('文件夹名称不能为空');
    return [];
  }

  // 步骤1：生成待校验的图片URL（按序号1~20，可根据实际调整最大序号）
  const maxIndex = 20; // 可根据实际文件夹内的最大文件数调整
  const checkUrls = [];
  for (let i = 1; i <= maxIndex; i++) {
    for (const format of SUPPORTED_FORMATS) {
      // 修复路径：拼接项目根目录
      const url = `${PROJECT_ROOT}images/${folderName}/${i}.${format}`;
      checkUrls.push(url);
    }
  }

  // 步骤2：并行请求所有URL（核心优化：同时请求，替代串行循环）
  const promises = checkUrls.map(url => checkImageExists(url));
  const results = await Promise.all(promises);

  // 步骤3：筛选出存在的图片URL
  const validUrls = results.filter(url => url !== null);
  return validUrls;
}

/**
 * 辅助函数：校验单张图片是否存在（带超时）
 * @param {string} url 图片URL
 * @returns {Promise<string|null>} 存在返回URL，否则返回null
 */
async function checkImageExists(url) {
  return new Promise(resolve => {
    // 超时控制：避免请求卡死
    const timer = setTimeout(() => resolve(null), REQUEST_TIMEOUT);

    const img = new Image();
    // 图片加载成功
    img.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };
    // 图片加载失败（404/网络错误）
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}
