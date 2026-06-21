import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useArtifacts } from "#/hooks/use-artifacts";
import { useConversationId } from "#/hooks/use-conversation-id";
import { ArtifactCard } from "#/components/features/artifacts/artifact-card";

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-full bg-[#2C2E38] flex items-center justify-center">
        <svg
          className="w-7 h-7 text-[#9299AA]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <div>
        <p className="text-[#C8CCD6] font-medium">
          {t(I18nKey.ARTIFACTS$EMPTY)}
        </p>
        <p className="text-sm text-[#7A7D8A] mt-1 max-w-xs">
          {t(I18nKey.ARTIFACTS$EMPTY_HINT)}
        </p>
      </div>
    </div>
  );
}

export default function ArtifactsTab() {
  const { t } = useTranslation();
  const { conversationId } = useConversationId();
  const artifacts = useArtifacts(conversationId);

  return (
    <main className="h-full flex flex-col overflow-hidden">
      {artifacts.length > 0 && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs text-[#7A7D8A]">
            {artifacts.length}{" "}
            {artifacts.length === 1
              ? t(I18nKey.COMMON$ARTIFACTS).toLowerCase().replace(/s$/, "")
              : t(I18nKey.COMMON$ARTIFACTS).toLowerCase()}
          </span>
        </div>
      )}

      {artifacts.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex-1 overflow-y-auto p-4 pt-2 flex flex-col gap-2 custom-scrollbar-always">
          {artifacts.map((artifact) => (
            <li key={artifact.id}>
              <ArtifactCard
                artifact={artifact}
                conversationId={conversationId}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
