import apiClient from '../apiClient';
import {UserInfo} from "#/entity.ts";

// import {UserInfo, UserToken} from '#/entity';

export interface SignInReq {
  password: string;
  validateCode?: string;
  token?: string;
}

// export type SignInRes = UserToken & {user: UserInfo};
export type SignInRes = {
  accessToken: string;
  user: UserInfo;
};

export enum UserApi {
  SignIn = 'login',
  Logout = '/auth/logout',
  LoginShare = '/login_share',
}

const signin = (data: SignInReq) => apiClient.post({ url: UserApi.SignIn, data });
const logout = () => apiClient.get({ url: UserApi.Logout });

export default {
  signin,
  logout,
};
