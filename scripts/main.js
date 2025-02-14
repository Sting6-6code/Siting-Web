// 深色模式切换
const themeToggle = document.querySelector(".theme-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// 检查本地存储中的主题设置
const currentTheme = localStorage.getItem("theme");
if (currentTheme) {
  document.body.setAttribute("data-theme", currentTheme);
  if (currentTheme === "dark") {
    themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
  }
}

themeToggle.addEventListener("click", () => {
  let theme = document.body.getAttribute("data-theme");
  if (theme === "dark") {
    document.body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggle.querySelector("i").classList.replace("fa-sun", "fa-moon");
  } else {
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
  }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// 移动端菜单控制
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");
let isMenuOpen = false;

mobileMenuBtn.addEventListener("click", () => {
  isMenuOpen = !isMenuOpen;
  mobileMenu.classList.toggle("active");
  mobileMenuBtn.querySelector("i").classList.toggle("fa-bars");
  mobileMenuBtn.querySelector("i").classList.toggle("fa-times");
});

// 处理导航链接点击
document
  .querySelectorAll(".nav-links a, .mobile-nav-links a")
  .forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // 获取目标元素
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      // 如果目标元素存在
      if (targetElement) {
        // 关闭移动端菜单（如果打开）
        if (isMenuOpen) {
          mobileMenu.classList.remove("active");
          mobileMenuBtn
            .querySelector("i")
            .classList.replace("fa-times", "fa-bars");
          isMenuOpen = false;
        }

        // 计算滚动位置（考虑导航栏高度）
        const navHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight;

        // 平滑滚动到目标位置
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

// 处理滚动时的导航栏样式
let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // 添加滚动阴影效果
  if (scrollTop > 0) {
    navbar.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  } else {
    navbar.style.boxShadow = "none";
  }

  lastScrollTop = scrollTop;
});

// 点击页面其他地方关闭移动端菜单
document.addEventListener("click", (e) => {
  if (
    isMenuOpen &&
    !e.target.closest(".mobile-menu") &&
    !e.target.closest(".mobile-menu-btn")
  ) {
    mobileMenu.classList.remove("active");
    mobileMenuBtn.querySelector("i").classList.replace("fa-times", "fa-bars");
    isMenuOpen = false;
  }
});

// AI助手功能增强
const aiToggle = document.querySelector(".ai-toggle");
const aiChatWindow = document.querySelector(".ai-chat-window");
const aiClose = document.querySelector(".ai-close");
const aiInput = document.querySelector(".ai-chat-input input");
const aiSend = document.querySelector(".ai-send");
const aiMessages = document.querySelector(".ai-chat-messages");

// 聊天历史
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// 常见问题和回答
const commonQuestions = {
  你是谁: "我是一个AI助手，可以回答关于这个网站和站主的问题。",
  联系方式:
    "您可以通过网页上的联系表单或直接发送邮件到 wang.sit@northeastern.edu 与站主联系。",
  项目经验:
    "您可以在项目展示区查看详细的项目经验，包括使用的技术栈和实现的功能。",
  教育背景:
    "站主在Northeastern University攻读信息系统硕士学位，预计2026年毕业。本科毕业于Brunel University London，主修通信工程。",
  技能: '主要技术栈包括：React.js, JavaScript, Node.js, Python, MongoDB等。详细信息可以在"关于"部分查看。',
};

// 切换AI助手窗口
aiToggle.addEventListener("click", () => {
  aiChatWindow.classList.add("active");
  loadChatHistory();
  if (!localStorage.getItem("welcomeShown")) {
    setTimeout(() => {
      addMessage(
        "您好！我是AI助手，有什么可以帮您的吗？\n\n您可以问我：\n1. 关于站主的教育背景\n2. 技术栈和项目经验\n3. 如何联系站主"
      );
      localStorage.setItem("welcomeShown", "true");
    }, 500);
  }
});

aiClose.addEventListener("click", () => {
  aiChatWindow.classList.remove("active");
});

// 保存聊天历史
function saveChatHistory() {
  if (chatHistory.length > 20) {
    chatHistory = chatHistory.slice(-20);
  }
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// 加载聊天历史
function loadChatHistory() {
  aiMessages.innerHTML = "";
  chatHistory.forEach((msg) => {
    addMessage(msg.content, msg.isUser, false);
  });
}

// 显示加载动画
function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  aiMessages.appendChild(indicator);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return indicator;
}

// 发送消息
function addMessage(content, isUser = false, save = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "ai"}`;
  messageDiv.innerHTML = `
        <div class="message-content">
            ${content.replace(/\n/g, "<br>")}
        </div>
    `;
  aiMessages.appendChild(messageDiv);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  if (save) {
    chatHistory.push({ content, isUser });
    saveChatHistory();
  }
}

// 处理用户输入
async function handleUserInput(input) {
  addMessage(input, true);

  const indicator = showTypingIndicator();

  try {
    const response = await callKimiAPI(input);
    indicator.remove();
    addMessage(response);
  } catch (error) {
    indicator.remove();
    addMessage("抱歉，我遇到了一些问题。请稍后再试。");
  }
}

aiSend.addEventListener("click", () => {
  const message = aiInput.value.trim();
  if (message) {
    handleUserInput(message);
    aiInput.value = "";
  }
});

aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const message = aiInput.value.trim();
    if (message) {
      handleUserInput(message);
      aiInput.value = "";
    }
  }
});

// 点击其他地方关闭AI助手
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".ai-assistant") &&
    aiChatWindow.classList.contains("active")
  ) {
    aiChatWindow.classList.remove("active");
  }
});

// 添加图片加载错误处理
document.querySelectorAll("img").forEach((img) => {
  img.onerror = function () {
    console.error("Image failed to load:", this.src);
    // 可以设置一个默认图片
    this.src = "/assets/images/profile.JPG";
  };
});

// 图片轮播功能
const images = document.querySelectorAll(".dance-images img");
const dots = document.querySelectorAll(".gallery-dots .dot");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
let currentIndex = 0;

function showImage(index) {
  images.forEach((img) => img.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  currentIndex = (index + images.length) % images.length;
  images[currentIndex].classList.add("active");
  dots[currentIndex].classList.add("active");
}

// 添加点击事件
prevBtn?.addEventListener("click", () => showImage(currentIndex - 1));
nextBtn?.addEventListener("click", () => showImage(currentIndex + 1));

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => showImage(index));
});

// 自动轮播
let autoSlide = setInterval(() => showImage(currentIndex + 1), 5000);

// 鼠标悬停时暂停自动轮播
const gallery = document.querySelector(".dance-gallery");
gallery?.addEventListener("mouseenter", () => clearInterval(autoSlide));
gallery?.addEventListener("mouseleave", () => {
  autoSlide = setInterval(() => showImage(currentIndex + 1), 5000);
});

// 视频模态框控制
const videoTrigger = document.querySelector(".video-trigger");
const videoModal = document.querySelector(".video-modal");
const modalClose = document.querySelector(".modal-close");
const video = document.querySelector(".video-modal video");

videoTrigger?.addEventListener("click", () => {
  videoModal.classList.add("active");
  video.play();
  // 暂停图片轮播
  clearInterval(autoSlide);
});

modalClose?.addEventListener("click", () => {
  videoModal.classList.remove("active");
  video.pause();
  // 恢复图片轮播
  autoSlide = setInterval(() => showImage(currentIndex + 1), 5000);
});

// 点击模态框外部关闭
videoModal?.addEventListener("click", (e) => {
  if (e.target === videoModal) {
    videoModal.classList.remove("active");
    video.pause();
    // 恢复图片轮播
    autoSlide = setInterval(() => showImage(currentIndex + 1), 5000);
  }
});

// ESC键关闭模态框
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && videoModal.classList.contains("active")) {
    videoModal.classList.remove("active");
    video.pause();
    // 恢复图片轮播
    autoSlide = setInterval(() => showImage(currentIndex + 1), 5000);
  }
});

// 语言切换功能
const langToggle = document.querySelector(".lang-toggle");
const currentLang = langToggle.querySelector(".current-lang");
const otherLang = langToggle.querySelector(".other-lang");

// 定义文本内容
const translations = {
  zh: {
    nav: {
      home: "首页",
      about: "关于",
      projects: "项目",
      resume: "简历",
      contact: "联系",
    },
    hero: {
      title: "你好，我是王思婷",
      subtitle: "一名充满热情的全栈开发者",
    },
    about: {
      title: "关于我",
      education: "教育背景",
      schools: {
        neu: "东北大学",
        brunel: "布鲁内尔大学",
        degree1: "信息系统硕士 (2026预计毕业)",
        degree2: "通信工程学士",
      },
      skills: "技术栈",
      skillTags: {
        "react.js": "React.js",
        javascript: "JavaScript",
        html5: "HTML5",
        css3: "CSS3",
        "node.js": "Node.js",
        python: "Python",
        mongodb: "MongoDB",
        git: "Git",
      },
      interests: "兴趣爱好",
      dance: {
        title: "舞蹈",
        description: "热爱街舞，经常参加舞蹈表演和比赛",
        watchVideo: "观看完整视频",
      },
      volunteer: {
        title: "志愿者经历",
        edu: {
          title: "社区教育志愿者",
          description: "为社区儿童提供免费的编程启蒙教育",
          period: "2023 - 至今",
        },
        env: {
          title: "环保志愿者",
          description: "参与海滩清理和环保宣传活动",
          period: "2022 - 2023",
        },
      },
    },
    projects: {
      title: "项目展示",
      automation: {
        title: "Imaging Test Automation Platform",
        description: "自动化测试平台，提高40%测试效率",
      },
      sourceCode: "源码",
      demo: "演示",
    },
    resume: {
      title: "个人简历",
      download: "下载简历",
    },
    contact: {
      title: "联系我",
      name: "您的姓名",
      email: "您的邮箱",
      message: "您的留言",
      send: "发送消息",
    },
    ai: {
      title: "AI助手",
      placeholder: "输入您的问题...",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      projects: "Projects",
      resume: "Resume",
      contact: "Contact",
    },
    hero: {
      title: "Hi, I'm Siting Wang",
      subtitle: "A passionate full-stack developer",
    },
    about: {
      title: "About Me",
      education: "Education",
      schools: {
        neu: "Northeastern University",
        brunel: "Brunel University London",
        degree1: "M.S. in Information Systems (Expected 2026)",
        degree2: "B.Eng. in Communication Engineering",
      },
      skills: "Technical Skills",
      skillTags: {
        "react.js": "React.js",
        javascript: "JavaScript",
        html5: "HTML5",
        css3: "CSS3",
        "node.js": "Node.js",
        python: "Python",
        mongodb: "MongoDB",
        git: "Git",
      },
      interests: "Interests",
      dance: {
        title: "Dance",
        description:
          "Passionate about street dance, regularly participating in dance performances and competitions",
        watchVideo: "Watch Full Video",
      },
      volunteer: {
        title: "Volunteer Experience",
        edu: {
          title: "Community Education Volunteer",
          description:
            "Providing free programming education for community children",
          period: "2023 - Present",
        },
        env: {
          title: "Environmental Volunteer",
          description:
            "Participating in beach cleaning and environmental awareness activities",
          period: "2022 - 2023",
        },
      },
    },
    projects: {
      title: "Projects",
      automation: {
        title: "Imaging Test Automation Platform",
        description: "Automated testing platform, improving efficiency by 40%",
      },
      sourceCode: "Source Code",
      demo: "Demo",
    },
    resume: {
      title: "Resume",
      download: "Download Resume",
    },
    contact: {
      title: "Contact Me",
      name: "Your Name",
      email: "Your Email",
      message: "Your Message",
      send: "Send Message",
    },
    ai: {
      title: "AI Assistant",
      placeholder: "Type your question...",
    },
  },
};

// 当前语言状态
let currentLanguage = localStorage.getItem("language") || "zh";

// 更新页面文本
function updateTexts(lang) {
  const texts = translations[lang];

  // 更新导航链接
  document
    .querySelectorAll(".nav-links a, .mobile-nav-links a")
    .forEach((link) => {
      const key = link.getAttribute("href").replace("#", "");
      link.textContent = texts.nav[key];
    });

  // 更新英雄区域
  document.querySelector(".hero .title").textContent = texts.hero.title;
  document.querySelector(".hero .subtitle").textContent = texts.hero.subtitle;

  // 更新各部分标题
  document.querySelectorAll(".section-title").forEach((title) => {
    const section = title.closest("section").id;
    title.textContent = texts[section].title;
  });

  // 更新教育背景
  document
    .querySelectorAll(".education .timeline-item")
    .forEach((item, index) => {
      const school = index === 0 ? "neu" : "brunel";
      item.querySelector("h4").textContent = texts.about.schools[school];
      item.querySelector("p").textContent =
        texts.about.schools[`degree${index + 1}`];
    });

  // 更新兴趣爱好
  const danceSection = document.querySelector(".interest-item");
  if (danceSection) {
    danceSection.querySelector("h4").textContent = texts.about.dance.title;
    danceSection.querySelector("p").textContent = texts.about.dance.description;
    danceSection.querySelector(".play-overlay span").textContent =
      texts.about.dance.watchVideo;
  }

  // 更新志愿者经历
  const volunteerItems = document.querySelectorAll(".volunteer .timeline-item");
  volunteerItems.forEach((item, index) => {
    const type = index === 0 ? "edu" : "env";
    item.querySelector("h4").textContent = texts.about.volunteer[type].title;
    item.querySelector("p").textContent =
      texts.about.volunteer[type].description;
    item.querySelector(".timeline-date").textContent =
      texts.about.volunteer[type].period;
  });

  // 更新项目信息
  const projectCard = document.querySelector(".project-card");
  if (projectCard) {
    projectCard.querySelector("h3").textContent =
      texts.projects.automation.title;
    projectCard.querySelector("p").textContent =
      texts.projects.automation.description;
    projectCard.querySelectorAll(".project-links a").forEach((link) => {
      const text = link.textContent.trim();
      link.textContent = text.includes("源码")
        ? texts.projects.sourceCode
        : texts.projects.demo;
    });
  }

  // 更新简历下载按钮
  document.querySelector(".resume-download .btn").textContent =
    texts.resume.download;

  // 更新联系表单
  document.querySelector("#name").placeholder = texts.contact.name;
  document.querySelector("#email").placeholder = texts.contact.email;
  document.querySelector("#message").placeholder = texts.contact.message;
  document.querySelector(".contact-form .btn").textContent = texts.contact.send;

  // 更新 AI 助手
  document.querySelector(".ai-chat-header h3").textContent = texts.ai.title;
  document.querySelector(".ai-chat-input input").placeholder =
    texts.ai.placeholder;

  // 更新语言切换按钮
  if (lang === "zh") {
    currentLang.textContent = "中";
    otherLang.textContent = "EN";
  } else {
    currentLang.textContent = "EN";
    otherLang.textContent = "中";
  }

  // 更新教育背景标题
  document.querySelector(".education h3").textContent = texts.about.education;

  // 更新技术栈标题和内容
  document.querySelector(".skills h3").textContent = texts.about.skills;

  // 更新兴趣爱好标题
  document.querySelector(".interests h3").textContent = texts.about.interests;

  // 更新志愿者经历标题
  document.querySelector(".volunteer h3").textContent =
    texts.about.volunteer.title;

  // 更新技术栈标签（如果需要翻译）
  // 如果您想翻译技术栈的标签，需要在 translations 对象中添加对应的翻译
  if (texts.about.skillTags) {
    document.querySelectorAll(".skill-tag").forEach((tag) => {
      const originalText = tag.textContent.trim();
      const techName = originalText.replace(/^[\s\S]*\s/, ""); // 获取图标后的文本
      if (texts.about.skillTags[techName.toLowerCase()]) {
        tag.innerHTML = tag.innerHTML.replace(
          techName,
          texts.about.skillTags[techName.toLowerCase()]
        );
      }
    });
  }
}

// 切换语言
langToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  localStorage.setItem("language", currentLanguage);

  // 切换当前语言和其他语言的显示
  [currentLang.textContent, otherLang.textContent] = [
    otherLang.textContent,
    currentLang.textContent,
  ];
  [currentLang.className, otherLang.className] = [
    otherLang.className,
    currentLang.className,
  ];

  // 更新页面文本
  updateTexts(currentLanguage);
});

// 页面加载时设置初始语言
document.addEventListener("DOMContentLoaded", () => {
  updateTexts(currentLanguage);
});

// 处理联系表单提交
const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // 显示加载状态
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

  try {
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    const errors = validateForm(formData);
    if (errors.length > 0) {
      showNotification("error", errors.join("\n"));
    } else {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 显示成功消息
        showNotification("success", result.message);
        contactForm.reset();
      } else {
        // 显示错误消息
        showNotification("error", result.message);
      }
    }
  } catch (error) {
    console.error("Contact form error:", error);
    showNotification("error", "发送失败，请稍后重试。");
  } finally {
    // 恢复按钮状态
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});

// 通知提示功能
function showNotification(type, message) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${
      type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
    }"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // 添加显示类
  setTimeout(() => notification.classList.add("show"), 10);

  // 自动移除
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 添加图片懒加载
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img[loading='lazy']");
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
});

// 添加滚动进度条
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + "%";
});

// 添加全局错误处理
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  showNotification("error", "发生错误，请刷新页面重试");
});

// 改进表单验证
const validateForm = (formData) => {
  const errors = [];
  if (!formData.email.includes("@")) {
    errors.push("请输入有效的邮箱地址");
  }
  if (formData.message.length < 10) {
    errors.push("消息内容至少需要10个字符");
  }
  return errors;
};
