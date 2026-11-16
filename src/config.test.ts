import { describe, it, expect } from 'vitest';
import { ConfigSchema } from './config.ts';

describe('ConfigSchema 默认值（内层外层默认必须对齐：#94-1 不变量）', () => {
  it('完全省略 access → 三项默认 allowlist 且名单为空（deny by default）', () => {
    const cfg = ConfigSchema({});
    expect(cfg.access.c2cMode).toBe('allowlist');
    expect(cfg.access.commandMode).toBe('allowlist');
    expect(cfg.access.groupMode).toBe('allowlist');
    expect(cfg.access.c2cAllow).toEqual([]);
    expect(cfg.access.groupAllow).toEqual([]);
  });

  it('access: {} → 子字段默认填充 allowlist', () => {
    const cfg = ConfigSchema({ access: {} });
    expect(cfg.access.c2cMode).toBe('allowlist');
    expect(cfg.access.commandMode).toBe('allowlist');
    expect(cfg.access.groupMode).toBe('allowlist');
  });

  it('access 空值（YAML access: 后无内容）→ allowlist', () => {
    const cfg = ConfigSchema({ access: null });
    expect(cfg.access.c2cMode).toBe('allowlist');
    expect(cfg.access.commandMode).toBe('allowlist');
    expect(cfg.access.groupMode).toBe('allowlist');
  });

  it('显式配置不受默认影响（仍可显式选择开放或关闭）', () => {
    const cfg = ConfigSchema({ access: { c2cMode: 'open', groupMode: 'disabled' } });
    expect(cfg.access.c2cMode).toBe('open');
    expect(cfg.access.groupMode).toBe('disabled');
  });


  it.each(['allowlist', 'disabled'] as const)('preserves an explicit command mode: %s', commandMode => {
    expect(ConfigSchema({ access: { commandMode } }).access.commandMode).toBe(commandMode);
  });

  it('闲置会话默认 30 分钟回收', () => {
    const cfg = ConfigSchema({});
    expect(cfg.sessionIdleTimeout).toBe(30 * 60 * 1000);
  });

  it.each([
    [{}, 'c2c'],
    [{ proactiveDelivery: {} }, 'c2c'],
    [{ proactiveDelivery: null }, 'c2c'],
    [{ proactiveDelivery: { externalTurns: 'off' } }, 'off'],
    [{ proactiveDelivery: { externalTurns: 'all' } }, 'all'],
  ])('proactiveDelivery.externalTurns：%j → %s', (input, expected) => {
    expect(ConfigSchema(input).proactiveDelivery.externalTurns).toBe(expected);
  });
});

describe('messageHandlingMode（消息处理方式）', () => {
  it.each([{}, { messageHandlingMode: undefined }, { messageHandlingMode: null }])(
    '缺省或空值默认为排队：%j', (input) => {
      expect(ConfigSchema(input).messageHandlingMode).toBe('queue');
    },
  );

  it('显式配置为插话时生效', () => {
    expect(ConfigSchema({ messageHandlingMode: 'interrupt' }).messageHandlingMode).toBe('interrupt');
  });

  it('显式配置为排队时生效', () => {
    expect(ConfigSchema({ messageHandlingMode: 'queue' }).messageHandlingMode).toBe('queue');
  });

  it('拒绝非法模式', () => {
    expect(() => ConfigSchema({ messageHandlingMode: 'bogus' })).toThrow();
  });
});
