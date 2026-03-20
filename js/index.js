/**
 * 首页渲染逻辑：加载逝者核心信息，生成卡片式板块
 */
import { getFolderImages } from '../fileUtils.js'; // 导入工具函数

async function initIndex() {
  // 加载逝者数据
  const comrades = await fetchComradesData();
  if (!comrades) return;

  // 渲染卡片
  const container = document.getElementById('comradesContainer');
  container.innerHTML = '';

  // 遍历每个逝者，异步获取首图
  for (const comrade of comrades) {
    // 获取对应文件夹下的所有图片，取第一张作为首图
    const imgList = await getFolderImages(comrade.id);
    const firstImg = imgList[0];

    const card = document.createElement('div');
    card.className = 'card comrade-card';
    /// 点击卡片跳转
    card.onclick = () => {
      window.location.href = `./detail.html?id=${comrade.id}`;
    };

    card.innerHTML = `
      <img src="${firstImg}" alt="${comrade.name}" class="avatar gray-img">
      <div class="name">${comrade.name}</div>
      <div class="info">所属院校：${comrade.school}</div>
      <div class="info">离世时间：${comrade.deathDate}</div>
      <a href="./detail.html?id=${comrade.id}" class="enter">查看详情 <i class="fas fa-arrow-right"></i></a>
    `;

    container.appendChild(card);
  }
}

/**
 * 加载逝者核心数据
 */
async function fetchComradesData() {
  try {
    const response = await fetch('./data/comrades.json');
    if (!response.ok) throw new Error('数据加载失败');
    return await response.json();
  } catch (error) {
    console.error('加载逝者数据失败：', error);
    alert('数据加载失败，请稍后重试');
    return null;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initIndex);
