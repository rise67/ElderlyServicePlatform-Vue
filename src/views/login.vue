<template>
  <div class="login">
    <div class="login-container">
      <div class="login-left">
        <div class="login-title">
          <img src="../assets/logo/logo.png" alt="Logo" class="login-logo">
          <h2>社区居家养老服务<br>管理系统</h2>
        </div>
        <div class="login-subtitle">
          <p>关爱长者，从心开始</p>
          <p>打造专业、温馨的养老服务平台</p>
        </div>
      </div>
      
      <div class="login-right">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <h3 class="title">账号登录</h3>
          
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入账号"
            >
              <template #prefix><svg-icon icon-class="user" class="input-icon" /></template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="input-icon" /></template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              v-model="loginForm.code"
              size="large"
              auto-complete="off"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="validCode" class="input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img"/>
            </div>
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <a href="javascript:void(0)" class="forget-password">忘记密码?</a>
          </div>
          
          <el-form-item class="login-button-container">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
          
          <div class="register-link" v-if="register">
            <span>没有账号?</span>
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form>
      </div>
    </div>
    
    <div class="el-login-footer">
      <span>社区居家养老服务管理系统 © {{ new Date().getFullYear() }} 版权所有</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      //codeUrl.value = "data:image/gif;base64," + res.img;
      codeUrl.value = res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }
  
  .login-container {
    display: flex;
    width: 900px;
    height: 500px;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
  }
  
  .login-left {
    width: 400px;
    background: linear-gradient(135deg, #e45a1f, #fd8d47);
    color: white;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .login-title {
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      
      .login-logo {
        width: 60px;
        height: 60px;
        margin-right: 20px;
      }
      
      h2 {
        font-size: 24px;
        font-weight: 600;
        line-height: 1.4;
        margin: 0;
      }
    }
    
    .login-subtitle {
      p {
        font-size: 16px;
        margin: 10px 0;
        opacity: 0.9;
        font-weight: 300;
      }
      
      &:before {
        content: '';
        display: block;
        width: 40px;
        height: 3px;
        background: white;
        margin-bottom: 20px;
      }
    }
  }
  
  .login-right {
    width: 500px;
    background: white;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-form {
    width: 100%;
    
    .title {
      font-size: 24px;
      color: #333;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 500;
    }
    
    .el-form-item {
      margin-bottom: 25px;
    }
    
    .el-input {
      height: 46px;
      
      :deep(.el-input__wrapper) {
        padding: 0 15px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        
        &.is-focus {
          box-shadow: 0 0 0 1px #e45a1f;
        }
      }
      
      input {
        height: 46px;
        font-size: 15px;
        color: #333;
      }
      
      .input-icon {
        font-size: 18px;
        color: #999;
      }
    }
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    
    .forget-password {
      color: #e45a1f;
      font-size: 14px;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .login-button-container {
    margin-bottom: 20px;
  }
  
  .login-button {
    width: 100%;
    height: 46px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    background: linear-gradient(135deg, #e45a1f, #fd8d47);
    border: none;
    
    &:hover, &:focus {
      background: linear-gradient(135deg, #d45217, #ec8540);
      border: none;
    }
  }
  
  .login-code {
    height: 46px;
    margin-left: 10px;
    
    img {
      height: 100%;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        filter: brightness(1.05);
      }
    }
  }
  
  .register-link {
    text-align: center;
    font-size: 14px;
    color: #666;
    
    .link-type {
      color: #e45a1f;
      text-decoration: none;
      margin-left: 5px;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .el-login-footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    z-index: 1;
  }
}

@media (max-width: 992px) {
  .login .login-container {
    width: 90%;
    max-width: 500px;
    height: auto;
    flex-direction: column;
  }
  
  .login .login-left {
    width: 100%;
    padding: 30px;
  }
  
  .login .login-right {
    width: 100%;
  }
}
</style>