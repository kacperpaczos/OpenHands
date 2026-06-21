import { getArtifactType } from "#/hooks/use-artifacts";

interface ArtifactIconProps {
  extension: string;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  image: "text-pink-400",
  code: "text-blue-400",
  document: "text-green-400",
  archive: "text-yellow-400",
  other: "text-gray-400",
};

const EXT_BADGE_COLORS: Record<string, string> = {
  py: "bg-blue-600",
  js: "bg-yellow-500",
  ts: "bg-blue-500",
  tsx: "bg-cyan-500",
  jsx: "bg-cyan-400",
  go: "bg-sky-500",
  rs: "bg-orange-600",
  java: "bg-red-600",
  md: "bg-gray-500",
  json: "bg-yellow-600",
  yaml: "bg-purple-500",
  yml: "bg-purple-500",
  html: "bg-orange-500",
  css: "bg-blue-400",
  sh: "bg-green-600",
  bash: "bg-green-600",
  sql: "bg-teal-600",
  pdf: "bg-red-500",
  xlsx: "bg-green-700",
  xls: "bg-green-700",
  csv: "bg-green-600",
  docx: "bg-blue-700",
  zip: "bg-yellow-700",
  tar: "bg-yellow-700",
  gz: "bg-yellow-700",
  png: "bg-pink-500",
  jpg: "bg-pink-500",
  jpeg: "bg-pink-500",
  svg: "bg-pink-400",
  gif: "bg-pink-600",
};

export function ArtifactIcon({ extension, className = "" }: ArtifactIconProps) {
  const type = getArtifactType(extension);
  const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.other;
  const badgeColor = EXT_BADGE_COLORS[extension] ?? "bg-gray-600";

  const iconPath = (() => {
    switch (type) {
      case "image":
        return "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
      case "code":
        return "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4";
      case "document":
        return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
      case "archive":
        return "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4";
      default:
        return "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
    }
  })();

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <svg
        className={`w-8 h-8 ${colorClass}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {extension && (
        <span
          className={`absolute -bottom-1 -right-1 text-[7px] font-bold uppercase px-0.5 rounded ${badgeColor} text-white leading-tight`}
        >
          {extension.slice(0, 4)}
        </span>
      )}
    </div>
  );
}
