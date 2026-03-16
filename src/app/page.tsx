import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { UserAuthProvider } from '@/components/UserAuthProvider';
import SiteHeader from '@/components/SiteHeader';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;

const HeroBanner = styled.section`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  text-align: center;
  padding: 100px 24px;
`;

const HeroTitle = styled.h1`
  color: white;
  font-size: 48px;
  margin-bottom: 16px;
`;

const HeroSubtitle = styled.p`
  color: rgba(255,255,255,0.85);
  font-size: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureSection = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const features = [
  { title: '安全認證', description: '基於 JWT 的雙 Token 認證機制，確保您的帳號安全。' },
  { title: '彈性管理', description: '完整的使用者管理後台，支援分頁瀏覽和 CRUD 操作。' },
  { title: '現代架構', description: '採用 Next.js App Router，提供最佳的開發體驗。' },
  { title: '型別安全', description: '全面使用 TypeScript + Zod，確保資料驗證無誤。' },
  { title: 'API 文件', description: '自動生成 OpenAPI 文件，方便前後端協作。' },
  { title: '響應式設計', description: '支援各種螢幕尺寸，提供良好的使用者體驗。' },
];

export default function HomePage() {
  return (
    <UserAuthProvider>
      <SiteHeader />
      <HeroBanner>
        <HeroTitle>歡迎使用 Next Test App</HeroTitle>
        <HeroSubtitle>
          一個基於 Next.js 的全端應用程式，提供完整的使用者管理與認證功能。
        </HeroSubtitle>
      </HeroBanner>
      <FeatureSection>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          功能特點
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((f) => (
            <Col key={f.title} xs={24} sm={12} lg={8}>
              <Card title={f.title} bordered={false} style={{ height: '100%' }}>
                <Paragraph>{f.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </FeatureSection>
    </UserAuthProvider>
  );
}
