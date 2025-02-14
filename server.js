const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/assets", express.static("assets"));

const KIMI_API_KEY = process.env.KIMI_API_KEY;

// 配置 SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 添加重试逻辑
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        return { response, data };
      }

      console.log(`Attempt ${i + 1} failed:`, data);

      if (i === retries - 1) {
        throw new Error(
          `Failed after ${retries} attempts: ${JSON.stringify(data)}`
        );
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // 递增延迟
    }
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log(
      "Received request with messages:",
      JSON.stringify(req.body.messages, null, 2)
    );
    console.log("Using API Key:", KIMI_API_KEY.substring(0, 10) + "...");

    const { response, data } = await fetchWithRetry(
      "https://api.moonshot.cn/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KIMI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: req.body.messages,
          temperature: 0.3,
        }),
      }
    );

    console.log("API Response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(
        "Invalid response format from API: " + JSON.stringify(data)
      );
    }

    res.json(data);
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: error.toString(),
    });
  }
});

// 添加测试端点
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    apiKey: KIMI_API_KEY ? "present" : "missing",
    apiKeyLength: KIMI_API_KEY ? KIMI_API_KEY.length : 0,
  });
});

// 处理联系表单提交
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // 验证请求数据
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "请填写所有必填字段。",
    });
  }

  try {
    const msg = {
      to: "wang.sit@northeastern.edu", // 您的邮箱
      from: "您在步骤3验证的邮箱地址", // 必须是您在 SendGrid 验证过的邮箱
      subject: `Portfolio Website Contact - ${name}`,
      replyTo: email,
      html: `
        <h3>Portfolio Website Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    await sgMail.send(msg);
    res.json({ success: true, message: "邮件发送成功！" });
  } catch (error) {
    console.error("Email error:", error);
    res
      .status(500)
      .json({ success: false, message: "邮件发送失败，请稍后重试。" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
  console.log(
    "API Key status:",
    KIMI_API_KEY ? `present (length: ${KIMI_API_KEY.length})` : "missing"
  );
});
