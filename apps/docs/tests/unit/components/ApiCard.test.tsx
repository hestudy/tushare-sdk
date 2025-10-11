import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiCard } from '../../../src/components/ApiCard';

describe('ApiCard', () => {
  it('应该渲染基本的 API 卡片', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
      />
    );

    expect(screen.getByTestId('api-card')).toBeInTheDocument();
    expect(screen.getByText('getStockBasic')).toBeInTheDocument();
    expect(screen.getByText('获取股票基础信息')).toBeInTheDocument();
    expect(screen.getByTestId('api-card')).toHaveAttribute('href', '/api/stock/basic');
  });

  it('应该显示新增标记', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        isNew={true}
      />
    );

    expect(screen.getByTestId('api-card-badge-new')).toBeInTheDocument();
    expect(screen.getByText('新增')).toBeInTheDocument();
  });

  it('应该显示废弃标记', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        deprecated={true}
      />
    );

    expect(screen.getByTestId('api-card-badge-deprecated')).toBeInTheDocument();
    expect(screen.getByText('已废弃')).toBeInTheDocument();
    expect(screen.getByTestId('api-card')).toHaveClass('api-card--deprecated');
  });

  it('应该显示废弃说明', () => {
    const deprecationMessage = '请使用 getStockBasicV2 代替';
    
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        deprecated={true}
        deprecationMessage={deprecationMessage}
      />
    );

    expect(screen.getByTestId('api-card-deprecation')).toBeInTheDocument();
    expect(screen.getByText(deprecationMessage)).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    const tags = ['股票', '基础数据', '实时'];
    
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        tags={tags}
      />
    );

    expect(screen.getByTestId('api-card-tags')).toBeInTheDocument();
    tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('应该支持自定义 className', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        className="custom-class"
      />
    );

    expect(screen.getByTestId('api-card')).toHaveClass('custom-class');
  });

  it('应该同时显示新增和废弃标记', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        isNew={true}
        deprecated={true}
      />
    );

    expect(screen.getByTestId('api-card-badge-new')).toBeInTheDocument();
    expect(screen.getByTestId('api-card-badge-deprecated')).toBeInTheDocument();
  });

  it('不应该显示废弃说明如果未标记为废弃', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        deprecationMessage="这不应该显示"
      />
    );

    expect(screen.queryByTestId('api-card-deprecation')).not.toBeInTheDocument();
  });

  it('不应该显示标签容器如果没有标签', () => {
    render(
      <ApiCard
        name="getStockBasic"
        description="获取股票基础信息"
        link="/api/stock/basic"
      />
    );

    expect(screen.queryByTestId('api-card-tags')).not.toBeInTheDocument();
  });
});
