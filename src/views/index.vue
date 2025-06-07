<template>
  <div class="app-container home">
    <!-- 欢迎卡片 -->
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <el-card class="welcome-card">
          <div class="welcome-header">
            <div class="welcome-icon">
              <i class="el-icon-house"></i>
            </div>
            <h1>欢迎使用社区居家养老服务系统</h1>
            <p>为长者提供便捷、贴心、高质量的居家养老服务管理平台</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容卡片 -->
    <el-row :gutter="20" class="mt20">
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="content-card intro-card">
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper blue">
                <i class="el-icon-aim"></i>
              </div>
              <span>系统简介</span>
            </div>
          </template>
          <div class="card-content">
            <p>社区居家养老服务系统为社区提供专业的长者服务解决方案，通过信息化手段提升养老服务质量，创建和谐美好的晚年生活环境。</p>
            <p>本系统围绕长者的实际需求，整合社区资源，提供全方位的养老服务支持。</p>
            <div class="card-footer">
              <div class="card-decoration blue"></div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="content-card purpose-card">
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper purple">
                <i class="el-icon-medal"></i>
              </div>
              <span>服务宗旨</span>
            </div>
          </template>
          <div class="card-content">
            <div class="purpose-item">
              <i class="el-icon-user-solid"></i>
              <span>以人为本，关爱长者</span>
            </div>
            <div class="purpose-item">
              <i class="el-icon-s-cooperation"></i>
              <span>专业服务，温馨贴心</span>
            </div>
            <div class="purpose-item">
              <i class="el-icon-s-help"></i>
              <span>社区互助，和谐共享</span>
            </div>
            <div class="purpose-item">
              <i class="el-icon-s-flag"></i>
              <span>创新发展，品质保障</span>
            </div>
            <div class="card-footer">
              <div class="card-decoration purple"></div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="content-card feature-card">
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper orange">
                <i class="el-icon-star-on"></i>
              </div>
              <span>服务特色</span>
            </div>
          </template>
          <div class="card-content">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-check"></i>
              </div>
              <div class="feature-text">
                <h4>专业团队</h4>
                <p>经验丰富的养老服务团队</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-sunny"></i>
              </div>
              <div class="feature-text">
                <h4>全天候服务</h4>
                <p>24小时随时待命</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-set-up"></i>
              </div>
              <div class="feature-text">
                <h4>个性定制</h4>
                <p>根据需求提供个性化服务</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-service"></i>
              </div>
              <div class="feature-text">
                <h4>社区互动</h4>
                <p>丰富的活动和互助交流平台</p>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-decoration orange"></div>
            </div>
            
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-row :gutter="20" class="mt20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24">
        <el-card shadow="hover" class="system-info">
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper green">
                <i class="el-icon-info"></i>
              </div>
              <span>系统信息</span>
            </div>
          </template>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item">
                <i class="el-icon-tickets"></i>
                <div class="info-text">
                  <div class="info-label">当前版本</div>
                  <div class="info-value">v{{ version }}</div>
                </div>
              </div>
              <div class="info-item">
                <i class="el-icon-user"></i>
                <div class="info-text">
                  <div class="info-label">技术支持</div>
                  <div class="info-value">社区居家养老服务管理团队</div>
                </div>
              </div>
              <div class="info-item">
                <i class="el-icon-phone"></i>
                <div class="info-text">
                  <div class="info-label">联系电话</div>
                  <div class="info-value">400-123-4567</div>
                </div>
              </div>
            </div>
            <div class="description-box">
              <div class="info-label">系统描述</div>
              <div class="info-value">本系统旨在提供全面的社区居家养老服务管理解决方案，包括老人信息管理、健康档案、活动管理、服务预约等功能，帮助提升养老服务质量和效率。</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref } from 'vue';

const version = ref('1.0.0');
</script>

<style scoped lang="scss">
.home {
  font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #333;
  padding: 0 10px;
  
  .mt20 {
    margin-top: 24px;
  }
  
  // 欢迎卡片样式
  .welcome-card {
    border-radius: 10px;
    overflow: hidden;
    border: none;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    
    .el-card__body {
      padding: 0;
    }
    
    .welcome-header {
      background: linear-gradient(120deg, #f86638, #fd8d47);
      color: white;
      text-align: center;
      padding: 40px 20px;
      position: relative;
      
      .welcome-icon {
        margin-bottom: 20px;
        
        i {
          font-size: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          padding: 15px;
        }
      }
      
      h1 {
        font-size: 30px;
        font-weight: 600;
        margin-bottom: 15px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      p {
        font-size: 18px;
        opacity: 0.9;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }
  }
  
  // 卡片头部样式
  .card-header {
    display: flex;
    align-items: center;
    border-bottom: none;
    padding: 20px;
    
    .icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      
      &.blue {
        background: linear-gradient(135deg, #3f87f5, #45b3e0);
      }
      
      &.purple {
        background: linear-gradient(135deg, #9368e9, #b276ff);
      }
      
      &.orange {
        background: linear-gradient(135deg, #f86638, #fd8d47);
      }
      
      &.green {
        background: linear-gradient(135deg, #1eb880, #45c997);
      }
      
      i {
        font-size: 20px;
        color: white;
      }
    }
    
    span {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  // 内容卡片通用样式
  .content-card {
    border-radius: 10px;
    border: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    height: 380px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .el-card__body {
      flex: 1;
      padding: 0;
    }
    
    .card-content {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      
      p {
        margin: 0 0 15px;
        color: #555;
        line-height: 1.7;
        font-size: 15px;
      }
      
      .card-footer {
        margin-top: auto;
        position: relative;
        height: 30px;
      }
      
      .card-decoration {
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        opacity: 0.1;
        
        &.blue {
          background: linear-gradient(135deg, #3f87f5, #45b3e0);
        }
        
        &.purple {
          background: linear-gradient(135deg, #9368e9, #b276ff);
        }
        
        &.orange {
          background: linear-gradient(135deg, #f86638, #fd8d47);
        }
      }
    }
  }
  
  // 服务宗旨卡片样式
  .purpose-card {
    .purpose-item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px 15px;
      border-radius: 8px;
      background: #f8f9fc;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f0f3f9;
        transform: translateX(5px);
      }
      
      i {
        color: #9368e9;
        font-size: 20px;
        margin-right: 15px;
      }
      
      span {
        color: #444;
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
  
  // 服务特色卡片样式
  .feature-card {
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 18px;
      
      .feature-icon {
        min-width: 40px;
        height: 40px;
        background: rgba(248, 102, 56, 0.1);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 15px;
        
        i {
          color: #f86638;
          font-size: 18px;
        }
      }
      
      .feature-text {
        h4 {
          margin: 0 0 5px;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
  
  // 系统信息样式
  .system-info {
    border-radius: 10px;
    border: none;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    
    .info-content {
      padding: 20px;
      
      .info-grid {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 20px;
        
        .info-item {
          flex: 1;
          min-width: 250px;
          display: flex;
          align-items: center;
          background: #f8f9fc;
          margin: 0 10px 10px 0;
          padding: 15px;
          border-radius: 8px;
          
          i {
            font-size: 24px;
            color: #1eb880;
            margin-right: 15px;
          }
          
          .info-text {
            .info-label {
              font-size: 14px;
              color: #888;
              margin-bottom: 5px;
            }
            
            .info-value {
              font-size: 15px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }
      
      .description-box {
        background: #f8f9fc;
        padding: 15px;
        border-radius: 8px;
        
        .info-label {
          font-size: 14px;
          color: #888;
          margin-bottom: 10px;
        }
        
        .info-value {
          color: #333;
          line-height: 1.7;
          font-size: 15px;
        }
      }
    }
  }
  
  // 响应式调整
  @media (max-width: 768px) {
    .content-card {
      height: auto;
      margin-bottom: 20px;
    }
    
    .info-grid .info-item {
      min-width: 100%;
    }
  }
}
</style>