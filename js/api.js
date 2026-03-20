import { readCache, writeCache, isCacheExpired } from './cacheManager.js';

/**
 * 通用数据请求函数（基础版，无缓存）
 * @param {string} url - 数据文件路径/接口地址
 * @returns {Promise} 返回数据Promise
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`请求失败：${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('数据加载失败：', error);
        return null;
    }
}

/**
 * 带缓存的爬虫数据请求函数（核心）
 * @param {string} url - 爬虫目标地址/本地JSON路径
 * @param {string} cacheKey - 缓存标识
 * @returns {Promise} 缓存数据/新爬取数据
 */
async function fetchCrawlerData(url, cacheKey) {
    // 1. 读取本地缓存
    const cacheData = readCache(cacheKey);

    // 2. 缓存有效 → 直接返回缓存数据
    if (cacheData && !isCacheExpired(cacheData.timestamp)) {
        console.log(`使用${cacheKey}缓存数据，无需请求服务器`);
        return cacheData.data;
    }

    // 3. 缓存过期/无缓存 → 发起请求获取新数据
    try {
        const newData = await fetchData(url);
        if (newData) {
            // 4. 写入新数据到缓存
            writeCache(cacheKey, newData);
            console.log(`爬取新数据并更新${cacheKey}缓存`);
        }
        return newData;
    } catch (error) {
        console.error('爬虫数据更新失败：', error);
        // 兜底：爬取失败时返回旧缓存（避免页面无数据）
        return cacheData ? cacheData.data : null;
    }
}

// 加载同学纪念信息（无缓存，静态数据）
export async function getComradeData() {
    return await fetchData('./data/comrade.json');
}

// 加载媒体/资讯数据（带缓存，爬虫数据）
export async function getNewsData() {
    // 缓存标识（唯一）
    const cacheKey = 'news-cache';
    // 爬虫目标地址（本地JSON / 远程接口均可）
    const crawlerUrl = './data/news.json';
    return await fetchCrawlerData(crawlerUrl, cacheKey);
}

// 加载社交平台话题数据（带缓存）
export async function getSocialData() {
    const cacheKey = 'social-cache';
    const crawlerUrl = './data/social.json';
    return await fetchCrawlerData(crawlerUrl, cacheKey);
}