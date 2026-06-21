import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { Artifact } from "#/hooks/use-artifacts";
import { getArtifactType } from "#/hooks/use-artifacts";
import { ArtifactIcon } from "./artifact-icon";
import V1ConversationService from "#/api/conversation-service/v1-conversation-service.api";

interface ArtifactCardProps {
  artifact: Artifact;
  conversationId: string;
}

const SOURCE_LABELS: Record<string, string> = {
  written: "Created",
  edited: "Edited",
  uploaded: "Uploaded",
  image: "Generated",
};

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface PreviewBodyProps {
  type: string;
  artifact: Artifact;
  previewContent: string | null;
  isExternalUrl: boolean;
}

function PreviewBody({
  type,
  artifact,
  previewContent,
  isExternalUrl,
}: PreviewBodyProps) {
  if (type === "image") {
    return (
      <img
        src={isExternalUrl ? artifact.path : undefined}
        alt={artifact.name}
        className="max-w-full mx-auto"
      />
    );
  }

  if (previewContent !== null) {
    const text =
      previewContent.length > 4000
        ? `${previewContent.slice(0, 4000)}\n…`
        : previewContent;
    return (
      <pre className="text-xs text-[#C8CCD6] p-3 whitespace-pre-wrap break-all font-mono">
        {text}
      </pre>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        className="w-4 h-4 animate-spin text-[#9299AA]"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}

export function ArtifactCard({ artifact, conversationId }: ArtifactCardProps) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState<string | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewError, setPreviewError] = React.useState(false);

  const type = getArtifactType(artifact.extension);
  const isExternalUrl = artifact.path.startsWith("http");

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (isExternalUrl) {
        const res = await fetch(artifact.path);
        const blob = await res.blob();
        triggerBlobDownload(blob, artifact.name);
      } else {
        const blob = await V1ConversationService.downloadConversationFile(
          conversationId,
          artifact.path,
        );
        triggerBlobDownload(blob, artifact.name);
      }
    } catch {
      // silently fail
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (isPreviewOpen) {
      setIsPreviewOpen(false);
      return;
    }

    if (type === "image") {
      setIsPreviewOpen(true);
      return;
    }

    if (previewContent !== null) {
      setIsPreviewOpen(true);
      return;
    }

    if (isExternalUrl) {
      setPreviewError(true);
      setIsPreviewOpen(true);
      return;
    }

    try {
      const text = await V1ConversationService.readConversationFile(
        conversationId,
        artifact.path,
      );
      setPreviewContent(text);
      setIsPreviewOpen(true);
    } catch {
      setPreviewError(true);
      setIsPreviewOpen(true);
    }
  };

  const canPreview = type === "image" || type === "code" || type === "document";

  return (
    <div className="rounded-lg bg-[#1C1E24] border border-[#3A3D47] hover:border-[#5A5D6B] transition-colors overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <ArtifactIcon extension={artifact.extension} />

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium text-white truncate"
            title={artifact.name}
          >
            {artifact.name}
          </p>
          <p
            className="text-[11px] text-[#7A7D8A] truncate"
            title={artifact.path}
          >
            {artifact.path}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[9px] font-medium uppercase tracking-wide text-[#9299AA] bg-[#2C2E38] rounded px-1.5 py-0.5">
            {SOURCE_LABELS[artifact.source] ?? artifact.source}
          </span>

          {canPreview && (
            <button
              type="button"
              onClick={handlePreview}
              className="p-1.5 rounded-md text-[#9299AA] hover:text-white hover:bg-[#2C2E38] transition-colors"
              title={t(I18nKey.ARTIFACTS$PREVIEW)}
              aria-label={t(I18nKey.ARTIFACTS$PREVIEW)}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-1.5 rounded-md text-[#9299AA] hover:text-white hover:bg-[#2C2E38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t(I18nKey.ARTIFACTS$DOWNLOAD)}
            aria-label={t(I18nKey.ARTIFACTS$DOWNLOAD)}
          >
            {isDownloading ? (
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isPreviewOpen && !previewError && (
        <div className="border-t border-[#3A3D47] max-h-64 overflow-auto">
          <PreviewBody
            type={type}
            artifact={artifact}
            previewContent={previewContent}
            isExternalUrl={isExternalUrl}
          />
        </div>
      )}

      {isPreviewOpen && previewError && (
        <div className="border-t border-[#3A3D47] p-3 text-xs text-red-400">
          {t(I18nKey.ARTIFACTS$PREVIEW_ERROR)}
        </div>
      )}
    </div>
  );
}
