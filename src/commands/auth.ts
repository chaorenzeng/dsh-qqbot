/** Applies after conversation admission and also guards direct command-handler calls. */
export function commandAccessError(mode: string | undefined, senderId: string | undefined, allowed: boolean): string | undefined {
  if (mode === 'disabled') return 'QQ 斜杠命令已关闭。';
  if (!senderId) return '无法确认发送者身份，不能执行斜杠命令。';
  // 缺省一律拒绝（deny by default）：旧配置缺 commandMode 时不得当成 open 放行，
  // 也不依赖调用方传入的 allowed 值，避免旧 profile 绕过授权。
  if (mode === undefined) return 'QQ 斜杠命令未配置访问模式，默认拒绝；请在设置里授权。';
  if (mode === 'open') return undefined;
  if (mode === 'allowlist' && allowed) return undefined;
  return '你不在斜杠命令白名单中，请联系机器人管理者。';
}
