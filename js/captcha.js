// captcha.js - 通用验证码模块（支持加减算式）
class Captcha {
  // 构造函数：初始化时绑定DOM元素（传入元素ID，灵活适配不同页面）
  constructor(formulaId = 'captchaFormula', inputId = 'captchaInput', tipId = 'captchaTip') {
    this.formulaEl = document.getElementById(formulaId);
    this.inputEl = document.getElementById(inputId);
    this.tipEl = document.getElementById(tipId);
    this.correctAnswer = 0; // 存储当前正确答案

    // 校验DOM元素是否存在，避免报错
    if (!this.formulaEl || !this.inputEl || !this.tipEl) {
      console.error('验证码DOM元素未找到，请检查ID是否正确');
      return;
    }

    // 初始化：绑定点击生成算式事件
    this.bindEvents();
  }

  // 生成随机加减算式（核心逻辑）
  generateFormula() {
    const operators = ['+', '-'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, formulaText;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      this.correctAnswer = num1 + num2;
      formulaText = `${num1} + ${num2} = ?`;
    } else {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      this.correctAnswer = max - min;
      formulaText = `${max} - ${min} = ?`;
    }

    // 更新算式文本，清空输入框和提示
    this.formulaEl.textContent = formulaText;
    this.inputEl.value = '';
    this.tipEl.style.display = 'none';
  }

  // 绑定点击事件（点击算式生成新的）
  bindEvents() {
    this.formulaEl.addEventListener('click', () => this.generateFormula());
  }

  // 验证输入的答案是否正确
  validateAnswer() {
    const inputVal = this.inputEl.value.trim();

    // 校验：空值/非数字
    if (!inputVal || isNaN(inputVal)) {
      this.tipEl.textContent = '请输入有效数字！';
      this.tipEl.style.display = 'block';
      return false;
    }

    // 校验：答案错误
    if (Number(inputVal) !== this.correctAnswer) {
      this.tipEl.textContent = '答案错误，请重新输入！';
      this.tipEl.style.display = 'block';
      this.generateFormula(); // 错误后刷新算式
      return false;
    }

    // 验证通过
    this.tipEl.style.display = 'none';
    return true;
  }

  // 快捷方法：页面加载后自动生成第一个算式
  initAutoGenerate() {
    if (this.formulaEl) this.generateFormula();
  }
}

// 暴露到全局，方便普通脚本调用（无需模块化导入也能用）
window.Captcha = Captcha;