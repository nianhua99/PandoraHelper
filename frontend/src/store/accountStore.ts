import {useMutation, useQueryClient} from "@tanstack/react-query";
import accountService from "@/api/services/accountService.ts";
import {message} from "antd";

export const useAddAccountMutation = () => {
  const client = useQueryClient();
  return useMutation(accountService.addAccount, {
    onSuccess: () => {
      /* onSuccess */
      message.success('Add Account Success')
      client.invalidateQueries(['accounts']);
    },
  });
}

export const useUpdateAccountMutation = () => {
  const client = useQueryClient();
  return useMutation(accountService.updateAccount, {
    onSuccess: () => {
      /* onSuccess */
      message.success('Update Account Success')
      client.invalidateQueries(['accounts']);
    },
  });
}

export const useDeleteAccountMutation = () => {
  const client = useQueryClient();
  return useMutation(accountService.deleteAccount, {
    onSuccess: () => {
      /* onSuccess */
      message.success('Delete Account Success')
      client.invalidateQueries(['accounts']);
    }
  });
}

export const useRefreshAccountMutation = () => {
  const client = useQueryClient();
  return useMutation(accountService.refreshAccount, {
    onSuccess: () => {
      /* onSuccess */
      message.success('Refresh Account Success')
      client.invalidateQueries(['accounts']);
    }
  });
}
