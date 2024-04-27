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
  sessionToken?: string;
  accessToken?: string;
  createTime?: string;
  updateTime?: string;
  shared?: number;
  shareList?: string;
  refreshToken?: string;
}

export interface Share {
  id?: number;
  accountId: number;
  email?: string;
  uniqueName: string;
  password: string;
  shareToken?: string;
  comment?: string;
  refreshEveryday?: boolean;
  expiresIn?: number;
  siteLimit?: string;
  gpt35Limit?: number;
  gpt4Limit?: number;
  showUserinfo?: boolean;
  showConversations?: boolean;
}

// share默认值
export const defaultShare: Share = {
  id: undefined,
  accountId: -1,
  email: '',
  uniqueName: '',
  password: '',
  shareToken: '',
  refreshEveryday: false,
  comment: '',
  expiresIn: 0,
  siteLimit: '',
  gpt35Limit: -1,
  gpt4Limit: -1,
  showUserinfo: false,
  showConversations: false
};
