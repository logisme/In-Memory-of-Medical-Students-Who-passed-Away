import { getComradeData, getNewsData, getSocialData } from './api.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 渲染逝者信息
    await renderComrades();
    // 渲染媒体/资讯数据
    await renderNews();
    // 渲染社交平台话题
    await renderSocial();
    // 绑定寄语提交事件
    bindMessageSubmit();
});

/**
 * 渲染逝者信息
 */
async function renderComrades() {
    const comradeData = await getComradeData();
    if (!comradeData) return;

    const comradeContainer = document.querySelector('#comrade-info');
    // 清空原有内容（保留标题）
    const title = comradeContainer.querySelector('h2');
    comradeContainer.innerHTML = '';
    comradeContainer.appendChild(title);

    // 遍历生成逝者卡片
    comradeData.forEach(comrade => {
        const card = document.createElement('div');
        card.className = 'comrade-card wiki-card';
        card.innerHTML = `
            <div class="card-header">${comrade.name}</div>
            <div class="card-body">
                <div class="info-row">
                    <span class="info-label">规培科室</span>
                    <span class="info-value">${comrade.department}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">生卒年月</span>
                    <span class="info-value">${comrade.birthDeath}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">简要生平</span>
                    <span class="info-value">${comrade.biography}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">纪念照片</span>
                    <span class="info-value">
                        <img src="${comrade.photoUrl}" alt="${comrade.name}照片" class="gray-img comrade-photo">
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">所属院校</span>
                    <span class="info-value">${comrade.school}</span>
                </div>
            </div>
        `;
        comradeContainer.appendChild(card);
    });
}

/**
 * 渲染媒体/资讯数据
 */
async function renderNews() {
    const newsData = await getNewsData();
    if (!newsData) return;

    const newsContainer = document.querySelector('#media-report .media-list');
    newsContainer.innerHTML = '';

    // 遍历生成媒体通告
    newsData.forEach(news => {
        const item = document.createElement('div');
        item.className = 'media-item';
        item.innerHTML = `
            <div class="media-title">
                <a href="${news.url}" target="_blank">${news.title}</a>
            </div>
            <div class="media-source">来源：<a href="${news.sourceUrl}" target="_blank">${news.source}</a> | 时间：${news.date}</div>
            <div class="media-content">${news.content}</div>
        `;
        newsContainer.appendChild(item);
    });
}

/**
 * 渲染社交平台话题
 */
async function renderSocial() {
    const socialData = await getSocialData();
    if (!socialData) return;

    const socialContainer = document.querySelector('#social-topic .social-list');
    socialContainer.innerHTML = '';

    // 遍历生成社交话题
    socialData.forEach(topic => {
        const item = document.createElement('div');
        item.className = 'social-item';
        item.innerHTML = `
            <div class="social-platform">${topic.platform}</div>
            <div class="social-title">
                <a href="${topic.url}" target="_blank">${topic.title}</a>
            </div>
            <div class="social-desc">${topic.desc}</div>
        `;
        socialContainer.appendChild(item);
    });
}

/**
 * 绑定寄语提交事件
 */
function bindMessageSubmit() {
    const form = document.querySelector('.message-form');
    const textarea = form.querySelector('textarea');
    const button = form.querySelector('button');
    const messageList = document.querySelector('#message-list');

    button.addEventListener('click', () => {
        const content = textarea.value.trim();
        if (!content) {
            alert('请输入寄语内容');
            return;
        }

        // 生成新寄语项
        const now = new Date();
        const timeStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        messageItem.innerHTML = `
            <div class="author">来自 匿名缅怀者 | ${timeStr}</div>
            <div class="content">${content}</div>
        `;

        // 插入到列表顶部
        messageList.insertBefore(messageItem, messageList.firstChild);
        // 清空输入框
        textarea.value = '';
        // 提示成功
        alert('寄语提交成功，感谢您的缅怀');
    });
}