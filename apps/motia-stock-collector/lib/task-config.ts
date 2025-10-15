/**
 * 任务配置管理模块
 *
 * 功能:
 * - 动态更新任务调度配置
 * - 记录配置变更历史
 * - 触发 Motia 调度器重新加载 (如果支持)
 */

import { db } from './database.js';

/**
 * 任务配置类型
 */
export interface TaskConfig {
  taskName: string;
  schedule?: string; // Cron 表达式
  enabled?: boolean; // 是否启用
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟 (ms)
}

/**
 * 配置变更日志类型
 */
interface ConfigChangeLog {
  taskName: string;
  oldConfig: string;
  newConfig: string;
  changedAt: string;
  changedBy: string;
}

/**
 * 任务配置管理类
 */
export class TaskConfigManager {
  /**
   * 更新任务调度配置
   * @param taskName 任务名称
   * @param newSchedule 新的 Cron 表达式
   * @returns 是否成功
   */
  async updateTaskSchedule(
    taskName: string,
    newSchedule: string
  ): Promise<boolean> {
    try {
      // 验证 Cron 表达式格式
      if (!this.validateCronExpression(newSchedule)) {
        throw new Error(`Invalid cron expression: ${newSchedule}`);
      }

      // 记录配置变更
      this.logConfigChange(taskName, { schedule: newSchedule });

      // TODO: 如果 Motia 支持动态重新加载配置,在此调用 Motia API
      // 目前作为占位实现,实际上需要 Motia 框架的支持
      console.warn(
        `Task schedule update requested for ${taskName}, but Motia hot-reload is not implemented yet.`
      );
      console.info(`New schedule: ${newSchedule}`);

      return true;
    } catch (error: any) {
      console.error(`Failed to update task schedule: ${error.message}`);
      return false;
    }
  }

  /**
   * 更新任务配置 (通用方法)
   * @param taskName 任务名称
   * @param config 新配置
   * @returns 是否成功
   */
  async updateTaskConfig(
    taskName: string,
    config: Partial<TaskConfig>
  ): Promise<boolean> {
    try {
      // 验证配置
      if (config.schedule && !this.validateCronExpression(config.schedule)) {
        throw new Error(`Invalid cron expression: ${config.schedule}`);
      }

      if (config.retries !== undefined && config.retries < 0) {
        throw new Error(`Invalid retries value: ${config.retries}`);
      }

      if (config.retryDelay !== undefined && config.retryDelay < 0) {
        throw new Error(`Invalid retryDelay value: ${config.retryDelay}`);
      }

      // 记录配置变更
      this.logConfigChange(taskName, config);

      // TODO: 如果 Motia 支持动态重新加载配置,在此调用 Motia API
      console.warn(
        `Task config update requested for ${taskName}, but Motia hot-reload is not implemented yet.`
      );
      console.info(`New config:`, config);

      return true;
    } catch (error: any) {
      console.error(`Failed to update task config: ${error.message}`);
      return false;
    }
  }

  /**
   * 验证 Cron 表达式格式
   * @param cronExpression Cron 表达式
   * @returns 是否有效
   */
  private validateCronExpression(cronExpression: string): boolean {
    // 简化验证: 检查是否有 5 个字段 (分 时 日 月 周)
    const parts = cronExpression.trim().split(/\s+/);

    // 支持 5 字段或 6 字段 (带秒)
    if (parts.length !== 5 && parts.length !== 6) {
      return false;
    }

    // 简单验证每个字段是否合法
    for (const part of parts) {
      // 允许 * / - , 数字
      if (!/^[\d\*\-\/,]+$/.test(part)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 记录配置变更日志
   * @param taskName 任务名称
   * @param newConfig 新配置
   */
  private logConfigChange(
    taskName: string,
    newConfig: Partial<TaskConfig>
  ): void {
    const changeLog: ConfigChangeLog = {
      taskName,
      oldConfig: 'N/A', // TODO: 获取旧配置
      newConfig: JSON.stringify(newConfig),
      changedAt: new Date().toISOString(),
      changedBy: 'system', // TODO: 如果有用户系统,记录用户 ID
    };

    // 将配置变更记录到任务日志表
    db.logTask({
      taskName: `ConfigChange_${taskName}`,
      startTime: changeLog.changedAt,
      endTime: changeLog.changedAt,
      status: 'SUCCESS',
      recordsCount: 0,
      errorMessage: `Config updated: ${changeLog.newConfig}`,
    });

    console.info('Config change logged:', changeLog);
  }

  /**
   * 获取任务当前配置
   * @param taskName 任务名称
   * @returns 任务配置
   */
  async getTaskConfig(taskName: string): Promise<TaskConfig | null> {
    // TODO: 如果 Motia 提供 Step 元数据 API,从 Motia 获取配置
    // 目前返回硬编码的默认配置
    const defaultConfigs: Record<string, TaskConfig> = {
      ScheduleDailyCollection: {
        taskName: 'ScheduleDailyCollection',
        schedule: '0 17 * * 1-5',
        enabled: true,
      },
      CollectDailyQuotes: {
        taskName: 'CollectDailyQuotes',
        retries: 3,
        retryDelay: 60000,
        enabled: true,
      },
    };

    return defaultConfigs[taskName] || null;
  }

  /**
   * 列出所有可配置任务
   * @returns 任务名称列表
   */
  async listConfigurableTasks(): Promise<string[]> {
    // TODO: 如果 Motia 提供 Step 列表 API,动态获取
    return ['ScheduleDailyCollection', 'CollectDailyQuotes'];
  }
}

// 导出单例实例
export const taskConfigManager = new TaskConfigManager();
