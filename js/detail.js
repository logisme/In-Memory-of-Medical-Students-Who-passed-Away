// 保留你原有引入（无需可注释）
import { readCache, writeCache, isCacheExpired } from './cacheManager.js';
import { getFolderImages } from './fileUtils.js'; // 导入工具函数

// ========== 迁移进来的生效逻辑（核心） ==========
let correctCaptchaAnswer = 0; // 验证码正确答案（内联script中生效的变量）

/**
 * 生成随机加减验证码（迁移内联script中生效的逻辑）
 */
function generateFormulaCaptcha() {
  const operators = ['+', '-'];
  const randomOp = operators[Math.floor(Math.random() * operators.length)];
  
  let num1 = Math.floor(Math.random() * 20) + 1;
  let num2 = Math.floor(Math.random() * 20) + 1;
  let formulaText = '';

  // 保证减法结果非负（内联script中生效的逻辑）
  if (randomOp === '+') {
    correctCaptchaAnswer = num1 + num2;
    formulaText = `${num1} + ${num2} = ?`;
  } else {
    const maxNum = Math.max(num1, num2);
    const minNum = Math.min(num1, num2);
    correctCaptchaAnswer = maxNum - minNum;
    formulaText = `${maxNum} - ${minNum} = ?`;
  }

  // 渲染到你原有DOM（保留ID不变）
  document.getElementById('captchaFormula').textContent = formulaText;
  // 清空输入和提示（内联script中生效的逻辑）
  document.getElementById('captchaInput').value = '';
  document.getElementById('captchaTip').style.display = 'none';
}

/**
 * 验证验证码（迁移内联script中生效的验证逻辑）
 */
function validateCaptcha() {
  const input = document.getElementById('captchaInput');
  const tip = document.getElementById('captchaTip');
  const userAnswer = parseInt(input.value.trim());

  if (isNaN(userAnswer) || userAnswer !== correctCaptchaAnswer) {
    tip.style.display = 'block';
    return false;
  }
  tip.style.display = 'none';
  return true;
}

export function initDetail(comradeId = 'default') {
  console.log('初始化详情页，逝者ID：', comradeId);
  
  // DOM加载完成后执行
  if (document.readyState === 'complete') {
    initPage(comradeId);
  } else {
    document.addEventListener('DOMContentLoaded', () => initPage(comradeId));
  }
}

/**
 * 初始化页面（整合迁移的逻辑 + 原有逻辑）
 */
async function initPage(comradeId) { // 改为async
  // 1. 执行迁移进来的生效逻辑（页面加载生成验证码）
  generateFormulaCaptcha();
  // 绑定验证码点击刷新（内联script中生效的事件）
  document.getElementById('captchaFormula').addEventListener('click', generateFormulaCaptcha);
  // 绑定提交按钮事件（内联script中生效的提交逻辑）
  bindSubmitEvent(comradeId);

  // 2. 核心修改：从comrades.json读取基础数据
  const comrade = await getComradeDetail(comradeId);
  if (comrade) {
    // 读取对应文件夹下的所有图片
    const photoPaths = await getFolderImages(comradeId);
    // 渲染个人信息（传入图片列表）
    renderComradeDetail(comrade, photoPaths);
    renderTimeline(comrade.timeline || []); // 防止timeline为空报错
    // 渲染媒体通告（复用comrade.news字段）
    renderMedia(comrade.news || []);
    // 渲染社交平台（复用comrade.social字段）
    renderSocial(comrade.social || []);
  }
  renderSavedMessages(comradeId);
}

/**
 * 绑定提交事件（迁移内联script中生效的提交逻辑）
 */
function bindSubmitEvent(comradeId) {
  document.getElementById('submitBtn').addEventListener('click', () => {
    // 保留你原有DOM选择器（无修改）
    const textarea = document.querySelector('.message-form textarea');
    const content = textarea.value.trim();
    const captchaInput = document.getElementById('captchaInput');

    // 1. 验证内容（内联script中生效的逻辑）
    if (!content) {
      alert('请输入缅怀寄语！');
      return;
    }
    // 2. 验证验证码（迁移的逻辑）
    if (!validateCaptcha()) {
      generateFormulaCaptcha(); // 刷新验证码
      captchaInput.value = '';
      return;
    }

    // 3. 保存留言（保留你原有逻辑）
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newMessage = {
      author: `匿名缅怀者 | ${timeStr}`,
      content: content
    };
    saveMessage(comradeId, newMessage);

    // 4. 即时渲染（保留你原有逻辑）
    const messageItem = document.createElement('div');
    messageItem.className = 'item';
    messageItem.innerHTML = `
      <div class="author">${newMessage.author}</div>
      <div class="content">${newMessage.content}</div>
    `;
    document.getElementById('messageList').prepend(messageItem);

    // 5. 重置表单（内联script中生效的逻辑）
    textarea.value = '';
    captchaInput.value = '';
    generateFormulaCaptcha();
    alert('寄语提交成功！');
  });
}

async function getComradeDetail(comradeId) {
  try {
    const res = await fetch('./data/comrades.json');
    const data = await res.json();
    return data.find(item => item.id === comradeId);
  } catch (e) {
    console.error('加载逝者数据失败：', e);
    return null;
  }
}

/**
 * 重构：渲染个人信息模块（自动读取文件夹图片 + 轮播 + 点击放大）
 */
function renderComradeDetail(comrade, photoPaths) {
  if (!comrade) return;

  // 1. 替换页面标题
  document.querySelector('.header .name').textContent = `${comrade.name || '未知'} 纪念页`;
  document.title = `${comrade.name || '未知'} | 白衣初心 纪念页`;

  // 2. 渲染个人信息模块（替换单图为轮播组件）
  const infoSection = document.querySelector('.info-section .content');
  if (!infoSection) return;

  infoSection.innerHTML = `
    <div class="avatar-carousel">
      <!-- 轮播图容器 -->
      <div class="carousel-wrapper">
        <div class="carousel-inner" style="transform: translateX(0);">
          ${photoPaths.map((path, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${path}" alt="${comrade.name || '逝者'}-${index+1}" 
                   class="avatar gray-img" data-src="${path}">
            </div>
          `).join('')}
        </div>
        <!-- 左右切换按钮 -->
        <button class="carousel-btn prev-btn" ${photoPaths.length <= 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left carousel-arrow"></i>
        </button>
        <button class="carousel-btn next-btn" ${photoPaths.length <= 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-right carousel-arrow"></i>
        </button>
      </div>
      <!-- 轮播指示器 -->
      <div class="carousel-indicators">
        ${photoPaths.map((_, index) => `
          <span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `).join('')}
      </div>
    </div>
    <div class="basic">
      <div class="row">
        <div class="label">姓名</div>
        <div class="value">${comrade.name || '未知'}</div>
      </div>
      <div class="row">
        <div class="label">所属院校</div>
        <div class="value">${comrade.school || '未知'}</div>
      </div>
      <div class="row">
        <div class="label">规培科室</div>
        <div class="value">${comrade.department || '未知'}</div>
      </div>
      <div class="row">
        <div class="label">生卒年月</div>
        <div class="value">${comrade.birthDeath || '未知'}</div>
      </div>
      <div class="row">
        <div class="label">简要生平</div>
        <div class="value">${comrade.biography || '暂无相关信息'}</div>
      </div>
    </div>
  `;

  // ========== 图片轮播逻辑 ==========
  initCarousel(photoPaths.length);

  // ========== 图片点击放大逻辑（兼容轮播） ==========
  initImageModal();
}

/**
 * 初始化轮播功能
 * @param {number} photoCount 图片数量
 */
function initCarousel(photoCount) {
  if (photoCount <= 1) return; // 单图无需轮播

  const carouselInner = document.querySelector('.carousel-inner');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const indicators = document.querySelectorAll('.indicator');
  let currentIndex = 0;

  // 切换轮播图核心方法
  function switchToIndex(index) {
    // 边界处理
    if (index < 0) index = photoCount - 1;
    if (index >= photoCount) index = 0;
    
    // 更新轮播容器位置
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    carouselInner.style.transition = 'transform 0.3s ease';
    
    // 更新指示器状态
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    
    currentIndex = index;
  }

  // 绑定左右按钮
  prevBtn.addEventListener('click', () => switchToIndex(currentIndex - 1));
  nextBtn.addEventListener('click', () => switchToIndex(currentIndex + 1));

  // 绑定指示器点击
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const targetIndex = parseInt(ind.dataset.index);
      switchToIndex(targetIndex);
    });
  });

  // 可选：自动轮播（3秒/次）
  let autoPlayTimer = setInterval(() => {
    switchToIndex(currentIndex + 1);
  }, 3000);

  // 鼠标悬停暂停自动轮播
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  carouselWrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
  carouselWrapper.addEventListener('mouseleave', () => {
    autoPlayTimer = setInterval(() => switchToIndex(currentIndex + 1), 3000);
  });
}

/**
 * 初始化图片放大弹窗（兼容轮播图）
 */
function initImageModal() {
  // 创建图片放大弹窗（确保只创建一次）
  let imgModal = document.getElementById('imgModal');
  if (!imgModal) {
    imgModal = document.createElement('div');
    imgModal.id = 'imgModal';
    imgModal.className = 'img-modal';
    imgModal.innerHTML = `
      <span class="close-btn" id="closeImgModal">&times;</span>
      <img id="modalImg" src="" alt="放大图片">
    `;
    document.body.appendChild(imgModal);
  }

  const modalImg = document.getElementById('modalImg');
  const closeImgModal = document.getElementById('closeImgModal');

  // 绑定所有轮播图的点击放大
  document.querySelectorAll('.carousel-item .avatar').forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.dataset.src;
      imgModal.style.display = 'flex';
    });
  });

  // 关闭弹窗
  closeImgModal.addEventListener('click', () => {
    imgModal.style.display = 'none';
  });

  // 点击弹窗外区域关闭
  imgModal.addEventListener('click', (e) => {
    if (e.target === imgModal) {
      imgModal.style.display = 'none';
    }
  });
}

function renderTimeline(timeline) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  // 防止timeline非数组导致报错
  const timelineData = Array.isArray(timeline) ? timeline : [];
  if (timelineData.length === 0) {
    container.innerHTML = '<div class="empty-tip">暂无时间线信息</div>';
    return;
  }
  container.innerHTML = timelineData.map(item => `
    <div class="timeline-item">
      <div class="date">${item.date || '未知时间'}</div>
      <div class="content">${item.content || '无内容'}</div>
    </div>
  `).join('');
}

/**
 * 渲染官方媒体通告（适配comrades.json的news字段）
 */
function renderMedia(data) {
  const container = document.getElementById('mediaList');
  if (!container) return;
  const mediaData = Array.isArray(data) ? data : [];
  if (mediaData.length === 0) {
    container.innerHTML = '<div class="empty-tip">暂无官方/媒体通告</div>';
    return;
  }
  container.innerHTML = mediaData.map(item => `
    <div class="media-item">
      <div class="title"><a href="${item.url || 'javascript:void(0)'}" target="_blank">${item.title || '无标题'}</a></div>
      <div class="source">来源：<a href="${item.sourceUrl || 'javascript:void(0)'}" target="_blank">${item.source || '未知来源'}</a> | 时间：${item.date || '未知时间'}</div>
      <div class="content">${item.content || '无内容'}</div>
    </div>
  `).join('');
}

/**
 * 核心修改：渲染社交平台话题（替换为本地图片图标，适配相对路径）
 */
function renderSocial(data) {
  const container = document.getElementById('socialList');
  if (!container) return;
  const socialData = Array.isArray(data) ? data : [];
  if (socialData.length === 0) {
    container.innerHTML = '<div class="empty-tip">暂无社交平台话题</div>';
    return;
  }

  // 关键：平台与本地图标路径映射（根据HTML位置调整路径！）
  // 若HTML在pages/下，路径为 ../icon/xxx；若和icon同级，改为 ./icon/xxx
  const platformIconMap = {
    '知乎': './icon/zhihu.webp',
    '小红书': './icon/xhs.webp',
    '微博': './icon/weibo.webp',
    '微信公众号': './icon/weixin.webp',
    '搜狐': './icon/sh.webp'
  };

  // 渲染社交项（替换字体图标为本地图片）
  container.innerHTML = socialData.map(item => {
    const platform = item.platform || '未知平台';
    // 获取对应图标路径，无匹配则用默认
    const iconSrc = platformIconMap[platform] || platformIconMap['未知平台'];
    return `
      <div class="social-item">
        <div class="platform">
          <!-- 核心：用img标签加载本地图标，绑定platform-icon样式 -->
          <img src="${iconSrc}" class="platform-icon" alt="${platform}">
          ${platform}
        </div>
        <div class="title"><a href="${item.url || 'javascript:void(0)'}" target="_blank">${item.title || '无标题'}</a></div>
        <div class="desc">${item.desc || item.content || '无描述'}</div>
      </div>
    `;
  }).join('');
}

// 保留你原有保存/渲染留言逻辑
function saveMessage(comradeId, message) {
  if (!comradeId || !message) return;
  const key = `messages_${comradeId}`;
  const oldMessages = JSON.parse(localStorage.getItem(key) || '[]');
  oldMessages.push(message);
  localStorage.setItem(key, JSON.stringify(oldMessages));
}

function renderSavedMessages(comradeId) {
  const key = `messages_${comradeId}`;
  const messages = JSON.parse(localStorage.getItem(key) || '[]');
  const container = document.getElementById('messageList');
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = '<div class="empty-tip">暂无缅怀寄语，快来留下你的心声吧</div>';
    return;
  }
  
  container.innerHTML = '';
  messages.reverse().forEach(msg => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div class="author">${msg.author || '匿名用户'}</div>
      <div class="content">${msg.content || '无内容'}</div>
    `;
    container.appendChild(item);
  });
}
