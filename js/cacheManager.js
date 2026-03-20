/**
 * 缓存管理器：处理LocalStorage缓存的读写和过期判断
 * 适配浏览器环境，避免直接请求目标服务器
 */

// 缓存过期时间（1小时 = 3600*1000毫秒，可自定义）
const CACHE_EXPIRE_TIME = 3600 * 1000; 

/**
 * 读取本地缓存
 * @param {string} cacheKey - 缓存唯一标识（如'news-cache'）
 * @returns {Object|null} 缓存数据 { timestamp: 时间戳, data: 爬取数据 }
 */
function readCache(cacheKey) {
    try {
        const cacheStr = localStorage.getItem(cacheKey);
        if (!cacheStr) return null;
        return JSON.parse(cacheStr);
    } catch (error) {
        console.log(`读取${cacheKey}缓存失败：`, error);
        return null;
    }
}

/**
 * 写入数据到本地缓存
 * @param {string} cacheKey - 缓存唯一标识
 * @param {Array} data - 要缓存的爬虫数据
 */
function writeCache(cacheKey, data) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log(`${cacheKey}缓存已更新`);
    } catch (error) {
        console.error(`写入${cacheKey}缓存失败：`, error);
    }
}

/**
 * 判断缓存是否过期
 * @param {number} cacheTimestamp - 缓存的时间戳
 * @returns {boolean} true=过期/需重新爬取，false=未过期/可用
 */
function isCacheExpired(cacheTimestamp) {
    if (!cacheTimestamp) return true;
    return Date.now() - cacheTimestamp > CACHE_EXPIRE_TIME;
}

// 导出缓存方法（供api.js调用）
export { readCache, writeCache, isCacheExpired };