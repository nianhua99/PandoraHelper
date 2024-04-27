import {useMutation, useQueryClient} from "@tanstack/react-query";
import shareService from "@/api/services/shareService.ts";
import {message} from "antd";


export const useAddShareMutation = () => {
  const client = useQueryClient();
  return useMutation(shareService.addShare, {
    onSuccess: () => {
      /* onSuccess */
      client.invalidateQueries(['accounts']);
      client.invalidateQueries(['shareList']);
      message.success('Success')
    },
  });
}

export const useUpdateShareMutation = () => {
  const client = useQueryClient();
  return useMutation(shareService.updateShare, {
    onSuccess: () => {
      /* onSuccess */
      client.invalidateQueries(['shareList']);
      message.success('Success')
    },
  });
}

export const useDeleteShareMutation = () => {
  const client = useQueryClient();
  return useMutation(shareService.deleteShare, {
    onSuccess: () => {
      /* onSuccess */
      client.invalidateQueries(['shareList']);
      message.success('Success')
    },
  })
}

export default {
  useAddShareMutation,
  useDeleteShareMutation,
}

