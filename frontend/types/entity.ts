import { BasicStatus, PermissionType } from './enum';

export interface UserToken {
  accessToken?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  password?: string;
  avatar?: string;
  role?: Role;
  status?: BasicStatus;
  permissions?: Permission[];
}

export type ProductType = "chatgpt" | "claude";

export interface Organization {
  id: string;
  name: string;
  status: 'enable' | 'disable';
  desc?: string;
  order?: number;
  children?: Organization[];
}

export interface Permission {
  id: string;
  parentId: string;
  name: string;
  label: string;
  type: PermissionType;
  route: string;
  status?: BasicStatus;
  order?: number;
  icon?: string;
  component?: string;
  hide?: boolean;
  frameSrc?: string;
  newFeature?: boolean;
  children?: Permission[];
}

export interface Role {
  id: string;
  name: string;
  label: string;
  status: BasicStatus;
  order?: number;
  desc?: string;
  permission?: Permission[];
}

export interface Account {
  id: number;
  email: string;
  password: string;
  accountType: ProductType;
  createTime?: string;
  updateTime?: string;
  shared?: number;
  shareList?: string;
}

export interface ChatGPTAccount extends Account {
  refreshToken?: string;
  accessToken?: string;
}

export interface ClaudeAccount extends Account {
  sessionKey?: string;
}

export interface Share {
  id?: number;
  accountId: number;
  email?: string;
  uniqueName: string;
  password: string;
  comment?: string;
  expiresIn?: number;
  expiresAt?: string;
  siteLimit?: string;
  shareType?: ProductType;
}

export interface ClaudeShare extends Share {

}

export interface ChatGPTShare extends Share {
  showConversations?: boolean;
  shareToken?: string;
  refreshEveryday?: boolean;
  gpt35Limit?: number;
  gpt4Limit?: number;
  gpt4oLimit?: number;
  gpt4oMiniLimit?: number;
  o1Limit?: number;
  o1MiniLimit?: number;
  showUserinfo?: boolean;
  temporaryChat?: boolean;
}

// share默认值
export const defaultShare: ChatGPTShare & ClaudeShare = {
  id: undefined,
  accountId: -1,
  email: '',
  uniqueName: '',
  password: '',
  shareToken: '',
  refreshEveryday: false,
  comment: '',
  expiresIn: 0,
  expiresAt: undefined,
  siteLimit: '',
  gpt35Limit: -1,
  gpt4Limit: -1,
  gpt4oLimit: -1,
  gpt4oMiniLimit: -1,
  o1Limit: -1,
  o1MiniLimit: -1,
  showUserinfo: false,
  temporaryChat: false,
  showConversations: false,
};
