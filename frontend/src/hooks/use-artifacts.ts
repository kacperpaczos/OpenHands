import React from "react";
import { useEventStore } from "#/stores/use-event-store";
import { isOpenHandsAction, isOpenHandsObservation } from "#/types/core/guards";
import {
  isV0Event,
  isV1Event,
  isActionEvent,
  isObservationEvent,
} from "#/types/v1/type-guards";

export type ArtifactSource = "written" | "edited" | "uploaded" | "image";

export interface Artifact {
  id: string;
  path: string;
  name: string;
  source: ArtifactSource;
  extension: string;
  timestamp: string;
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function buildArtifact(
  path: string,
  source: ArtifactSource,
  timestamp: string,
): Artifact {
  const name = path.split("/").pop() ?? path;
  return {
    id: path,
    path,
    name,
    source,
    extension: getExtension(name),
    timestamp,
  };
}

export function isImageExtension(ext: string): boolean {
  return ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
    ext,
  );
}

export function isCodeExtension(ext: string): boolean {
  return [
    "py",
    "js",
    "ts",
    "tsx",
    "jsx",
    "go",
    "rs",
    "java",
    "cpp",
    "c",
    "h",
    "cs",
    "php",
    "rb",
    "swift",
    "kt",
    "sh",
    "bash",
    "zsh",
    "fish",
    "ps1",
    "sql",
    "html",
    "css",
    "scss",
    "less",
    "json",
    "yaml",
    "yml",
    "toml",
    "xml",
    "md",
    "rst",
    "tf",
    "lua",
    "r",
    "jl",
    "ex",
    "exs",
    "clj",
  ].includes(ext);
}

export function isDocumentExtension(ext: string): boolean {
  return [
    "pdf",
    "docx",
    "doc",
    "xlsx",
    "xls",
    "csv",
    "txt",
    "odt",
    "ods",
  ].includes(ext);
}

export function getArtifactType(
  ext: string,
): "image" | "code" | "document" | "archive" | "other" {
  if (isImageExtension(ext)) return "image";
  if (isCodeExtension(ext)) return "code";
  if (isDocumentExtension(ext)) return "document";
  if (["zip", "tar", "gz", "bz2", "7z", "rar", "tgz"].includes(ext))
    return "archive";
  return "other";
}

function shouldSkipPath(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.includes("__pycache__") ||
    lower.includes("/.git/") ||
    lower.includes("/node_modules/") ||
    lower.endsWith(".pyc") ||
    lower.endsWith(".pyo")
  );
}

export function useArtifacts(): Artifact[] {
  const events = useEventStore((state) => state.events);

  return React.useMemo(() => {
    const map = new Map<string, Artifact>();

    const addFile = (path: string, source: ArtifactSource, ts: string) => {
      if (!path || shouldSkipPath(path)) return;
      if (!map.has(path) || source === "written") {
        map.set(path, buildArtifact(path, source, ts));
      }
    };

    for (const event of events) {
      const ts =
        "timestamp" in event && event.timestamp
          ? (event.timestamp as string)
          : new Date().toISOString();

      if (isV0Event(event)) {
        if (isOpenHandsAction(event)) {
          if (event.action === "write") {
            addFile((event.args as { path: string }).path, "written", ts);
          } else if (event.action === "edit") {
            addFile((event.args as { path: string }).path, "edited", ts);
          } else if (event.action === "message" && event.source === "user") {
            const args = event.args as { file_urls?: string[] };
            for (const url of args.file_urls ?? []) {
              const name = url.split("/").pop() ?? url;
              if (!map.has(url)) {
                map.set(url, {
                  id: url,
                  path: url,
                  name,
                  source: "uploaded",
                  extension: getExtension(name),
                  timestamp: ts,
                });
              }
            }
          }
        } else if (isOpenHandsObservation(event)) {
          if (event.observation === "run_ipython") {
            const extras = event.extras as { image_urls?: string[] };
            for (const url of extras.image_urls ?? []) {
              if (!map.has(url)) {
                const name = url.split("/").pop() ?? "image.png";
                map.set(url, {
                  id: url,
                  path: url,
                  name,
                  source: "image",
                  extension: getExtension(name) || "png",
                  timestamp: ts,
                });
              }
            }
          }
        }
      } else if (isV1Event(event)) {
        if (isActionEvent(event)) {
          const a = event.action;
          if (
            (a.kind === "FileEditorAction" ||
              a.kind === "StrReplaceEditorAction") &&
            "path" in a &&
            a.path
          ) {
            const isCreate = "command" in a && a.command === "create";
            addFile(a.path as string, isCreate ? "written" : "edited", ts);
          }
        } else if (isObservationEvent(event)) {
          const o = event.observation;
          if (
            (o.kind === "FileEditorObservation" ||
              o.kind === "StrReplaceEditorObservation") &&
            "path" in o &&
            o.path
          ) {
            const wasCreated =
              "prev_exist" in o && !(o as { prev_exist?: boolean }).prev_exist;
            addFile(o.path as string, wasCreated ? "written" : "edited", ts);
          }
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp),
    );
  }, [events]);
}
