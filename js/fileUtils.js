/**
 * 读取指定ID对应文件夹下的所有图片（约定命名：1.jpg、2.jpg... 或 img1.png、img2.png）
 * @param {string} comradeId 逝者ID（文件夹名）
 * @param {string[]} ext 图片后缀
 * @returns {Promise<string[]>} 图片路径数组
 */
export async function getFolderImages(comradeId, ext = ['jpg', 'png']) {
  const basePath = `./images/${comradeId}/`;
  const maxTry = 5; // 最多尝试读取10张图片（可调整）

  // 核心修改：生成1~maxTry的序号数组，并行检查每张图片
  const imageCheckPromises = Array.from({ length: maxTry }, (_, i) => {
    const index = i + 1; // 图片序号从1开始
    // 检查单张图片的所有后缀（找到第一个存在的就返回路径）
    return checkSingleImageWithExts(basePath, index, ext);
  });

  // 并行执行所有图片检查，等待全部完成
  const imageResults = await Promise.all(imageCheckPromises);
  // 过滤掉不存在的图片（null值），得到有效图片路径
  const validImages = imageResults.filter(path => path !== null);

  // 保留原有兜底逻辑：无图片时使用默认图
  if (validImages.length === 0) {
    validImages.push('../images/default.jpg');
  }
  return validImages;
}

/**
 * 检查单个序号的图片（遍历所有后缀，找到第一个存在的返回路径）
 * @param {string} basePath 基础路径
 * @param {number} index 图片序号
 * @param {string[]} exts 后缀列表
 * @returns {Promise<string|null>} 存在返回路径，不存在返回null
 */
async function checkSingleImageWithExts(basePath, index, exts) {
  for (const e of exts) {
    const imgPath = `${basePath}${index}.${e}`;
    const exists = await checkImageExists(imgPath);
    if (exists) {
      return imgPath; // 找到存在的后缀，立即返回路径
    }
  }
  return null; // 所有后缀都不存在，返回null
}

/**
 * 检查图片是否存在（优化版：HEAD请求+降级兜底）
 * @param {string} url 图片路径
 * @returns {Promise<boolean>}
 */
function checkImageExists(url) {
  return new Promise(async (resolve) => {
    try {
      // 优先用HEAD请求快速检查（不下载图片内容）
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      resolve(response.ok); // 200-299状态码表示存在
    } catch (err) {
      // 降级为Image对象检查（兼容跨域/特殊场景）
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `${url}?t=${Date.now()}`; // 避免缓存误判
    }
  });
}
