import apiClient from '../apiClient';

import {Account} from '#/entity';

export enum AccountApi {
  list = '/account/list',
  add = '/account/add',
  update = '/account/update',
  delete = '/account/delete',
  refresh = '/account/refresh'
}

const getAccountList = () => apiClient.get<Account[]>({ url: AccountApi.list }).then((res) => {
  // 将shareList转为json对象
  res.forEach((item) => {
    if (item.shareList) {
      item.shareList = JSON.parse(item.shareList);
    }
  });
  return res;
});
export interface AccountAddReq {
  id?: number;
  email: string;
  password: string;
  shared?: number;
  custom_type: string;
  custom_token: string;
}
const addAccount = (data: AccountAddReq) => apiClient.post({ url: AccountApi.add, data });
const updateAccount = (data: AccountAddReq) => apiClient.post({ url: AccountApi.update, data });
const deleteAccount = (id: number) => apiClient.post({ url: AccountApi.delete, data: { id } });
const refreshAccount = (id: number) => apiClient.post({ url: AccountApi.refresh, data: { id } });

export default {
  getAccountList,
  addAccount,
  updateAccount,
  deleteAccount,
  refreshAccount,
};
