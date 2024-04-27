import {message} from "antd";

export const onCopy = (text?: string,t?: any, e?: any) => {
  if (!text) {
    return;
  }
  e?.preventDefault();
  e?.stopPropagation();
  try {
    navigator.clipboard.writeText(text);
    // 提示复制成功
    message.success(t('token.copySuccess'));
  } catch (e) {
    console.error('copy failed', e);
    // 选定文本
    e.target.select();
  }
}
