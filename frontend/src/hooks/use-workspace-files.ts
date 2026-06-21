import { useQuery } from "@tanstack/react-query";
import V1ConversationService from "#/api/conversation-service/v1-conversation-service.api";
import { useAgentState } from "#/hooks/use-agent-state";
import { AgentState } from "#/types/agent-state";

export type WorkspaceFile = {
  path: string;
  name: string;
  size: number;
  modified_at: number;
};

export function useWorkspaceFiles(conversationId: string | null | undefined) {
  const { curAgentState } = useAgentState();
  const isReady = curAgentState !== AgentState.LOADING && !!conversationId;

  return useQuery<WorkspaceFile[]>({
    queryKey: ["workspace-files", conversationId],
    queryFn: () => V1ConversationService.listWorkspaceFiles(conversationId!),
    enabled: isReady,
    refetchInterval: 5000,
    staleTime: 2000,
  });
}
