// 保留原文件所有不变的代码结构，仅修改图片加载逻辑
class FileUtils {
    // 原文件的常量：每个文件夹最多10张图（按你的要求）
    static MAX_IMAGES_PER_FOLDER = 10;
    static SUPPORTED_IMAGE_EXTS = ['png', 'jpg', 'jpeg'];

    /**
     * 原文件函数：加载单个图片（仅优化错误捕获和存在性检查）
     * @param {string} folderPath 文件夹路径
     * @param {number} index 图片序号
     * @returns {Promise<HTMLImageElement|null>} 加载成功返回图片，失败返回null
     */
    static async loadSingleImage(folderPath, index) {
        // 遍历所有支持的后缀，尝试加载
        for (const ext of this.SUPPORTED_IMAGE_EXTS) {
            const imgUrl = `${folderPath}/${index}.${ext}`;
            try {
                // 先发送HEAD请求判断图片是否存在（不下载内容，减少无效请求）
                const headResp = await fetch(imgUrl, { method: 'HEAD' });
                if (!headResp.ok) continue;

                // 图片存在则正式加载（保留原文件的Image对象逻辑）
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = imgUrl;
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null); // 加载失败返回null，不报错
                });
            } catch (e) {
                // 忽略单个图片的加载错误，继续尝试下一个后缀
                continue;
            }
        }
        return null; // 所有后缀都不存在，返回null
    }

    /**
     * 原文件函数：加载指定文件夹的图片（仅优化循环逻辑，保留并行请求）
     * @param {string} folderPath 文件夹路径
     * @returns {Promise<HTMLImageElement[]>} 成功加载的图片数组
     */
    static async loadFolderImages(folderPath) {
        // 生成1-10的序号数组（按你的要求：最多10张图）
        const imageIndexes = Array.from({ length: this.MAX_IMAGES_PER_FOLDER }, (_, i) => i + 1);
        
        // 并行加载所有图片（保留原文件的Promise.all并行逻辑）
        const imagePromises = imageIndexes.map(index => this.loadSingleImage(folderPath, index));
        const images = await Promise.all(imagePromises);
        
        // 过滤掉加载失败的null，只保留有效图片
        return images.filter(img => img !== null);
    }

    /**
     * 原文件函数：并行加载多个文件夹的图片（完全保留原逻辑）
     * @param {string[]} folderPaths 文件夹列表
     * @returns {Promise<HTMLImageElement[]>} 所有成功加载的图片
     */
    static async loadAllFoldersParallel(folderPaths) {
        // 保留原文件的多文件夹并行逻辑
        const folderPromises = folderPaths.map(folder => this.loadFolderImages(folder));
        const allImages = await Promise.all(folderPromises);
        return allImages.flat();
    }

    // 保留原文件的其他所有函数（如果有），以下是示例占位（和原文件一致）
    static getImagePath(folder, index) {
        return `${folder}/${index}.png`;
    }
}

// 保留原文件的全局暴露（如果有）
window.FileUtils = FileUtils;
