/**
 * 读取指定ID对应文件夹下的所有图片（约定命名：1.jpg、2.jpg... 或 img1.png、img2.png）
 * @param {string} comradeId 逝者ID（文件夹名）
 * @param {string[]} ext 图片后缀
 * @returns {Promise<string[]>} 图片路径数组
 */
export async function getFolderImages(comradeId, ext = ['jpg', 'png', 'jpeg']) {
  const basePath = `../images/${comradeId}/`;
  const maxTry = 10; // 最多尝试读取10张图片（可调整）
  const validImages = [];

  // 尝试读取 1~maxTry 命名的图片
  for (let i = 1; i <= maxTry; i++) {
    for (const e of ext) {
      const imgPath = `${basePath}${i}.${e}`;
      // 验证图片是否存在
      const exists = await checkImageExists(imgPath);
      if (exists) {
        validImages.push(imgPath);
        break; // 找到当前序号的图片，跳过其他后缀
      }
    }
  }

  // 兜底：无图片时使用默认图
  if (validImages.length === 0) {
    validImages.push('../images/default.jpg');
  }
  return validImages;
}

/**
 * 检查图片是否存在
 * @param {string} url 图片路径
 * @returns {Promise<boolean>}
 */
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}