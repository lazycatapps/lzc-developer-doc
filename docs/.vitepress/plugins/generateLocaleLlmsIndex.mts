import { promises as fs } from "node:fs";
import path from "node:path";
import type { PluginOption } from "vite";
import type { DefaultTheme } from "vitepress";

type LocaleLlmsConfig = {
  docsSubDir: string;
  outputFile: string;
  fullOutputFile?: string;
  linkPrefix: string;
  generatePageMarkdown?: boolean;
  description?: string;
  fallbackTitle?: string;
  sidebar: DefaultTheme.Sidebar;
};

type LocaleEntry = {
  path: string;
  title: string;
};

function stripFrontmatter(content: string) {
  if (!content.startsWith("---\n")) {
    return content;
  }

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    return content;
  }

  return content.slice(end + 5);
}

function extractTitle(content: string, fallback: string) {
  const body = stripFrontmatter(content);
  const heading = body.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() || fallback;
}

function normalizeLink(link: string, linkPrefix: string) {
  const prefix = linkPrefix.replace(/^\//, "").replace(/\/$/, "");
  const normalizedPrefix = prefix.length > 0 ? `${prefix}/` : "";
  const cleaned = link
    .replace(new RegExp(`^/${normalizedPrefix}`), "")
    .replace(/^\//, "");

  return cleaned.endsWith(".html") ? `${cleaned.slice(0, -5)}.md` : cleaned;
}

function collectSidebarLinks(items: DefaultTheme.SidebarItem[], linkPrefix: string) {
  const links: string[] = [];

  for (const item of items) {
    if ("link" in item && typeof item.link === "string") {
      links.push(normalizeLink(item.link, linkPrefix));
    }

    if ("items" in item && Array.isArray(item.items)) {
      links.push(...collectSidebarLinks(item.items, linkPrefix));
    }
  }

  return links;
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }

      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        return [];
      }

      return [fullPath];
    }),
  );

  return files.flat();
}

function flattenSidebar(sidebar: DefaultTheme.Sidebar) {
  return Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flat();
}

function buildLink(linkPrefix: string, relativePath: string) {
  const prefix = linkPrefix === "/" ? "" : linkPrefix.replace(/\/$/, "");
  return `${prefix}/${relativePath}`;
}

function buildOutputRelativePath(linkPrefix: string, relativePath: string) {
  return buildLink(linkPrefix, relativePath).replace(/^\//, "");
}

function buildFrontmatterBlock(entry: LocaleEntry, linkPrefix: string, body: string) {
  const lines = [
    "---",
    `title: ${entry.title}`,
    `url: ${buildLink(linkPrefix, entry.path)}`,
    "---",
    "",
    body.trim(),
  ];

  return lines.join("\n");
}

async function writePageMarkdownFiles(
  distDir: string,
  linkPrefix: string,
  localeDocsDir: string,
  entries: LocaleEntry[],
) {
  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(localeDocsDir, entry.path);
      const targetPath = path.join(
        distDir,
        buildOutputRelativePath(linkPrefix, entry.path),
      );
      const rawContent = await fs.readFile(sourcePath, "utf-8");
      const body = stripFrontmatter(rawContent);
      const pageContent = `${buildFrontmatterBlock(entry, linkPrefix, body)}\n`;

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, pageContent, "utf-8");
    }),
  );
}

export function generateLocaleLlmsIndex(config: LocaleLlmsConfig): PluginOption {
  return {
    name: `generate-locale-llms-index:${config.outputFile}`,
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const docsDir = path.resolve(__dirname, "..", "..");
      const localeDocsDir = path.join(docsDir, config.docsSubDir);
      const distDir = path.join(docsDir, ".vitepress", "dist");
      const targetPath = path.join(distDir, config.outputFile);

      try {
        const localeFiles = await collectMarkdownFiles(localeDocsDir);
        const entries = await Promise.all(
          localeFiles.map(async (filePath): Promise<LocaleEntry> => {
            const relativePath = path
              .relative(localeDocsDir, filePath)
              .split(path.sep)
              .join("/");
            const content = await fs.readFile(filePath, "utf-8");

            return {
              title: extractTitle(content, relativePath),
              path: relativePath,
            };
          }),
        );

        const entryMap = new Map(entries.map((entry) => [entry.path, entry]));
        const orderedPaths = collectSidebarLinks(
          flattenSidebar(config.sidebar),
          config.linkPrefix,
        );
        const seen = new Set<string>();
        const orderedEntries = orderedPaths
          .map((link) => entryMap.get(link))
          .filter((entry): entry is LocaleEntry => Boolean(entry))
          .filter((entry) => {
            if (seen.has(entry.path)) {
              return false;
            }

            seen.add(entry.path);
            return true;
          });
        const extraEntries = entries
          .filter((entry) => !seen.has(entry.path))
          .sort((a, b) => a.path.localeCompare(b.path));
        const indexContent = await fs.readFile(
          path.join(localeDocsDir, "index.md"),
          "utf-8",
        );
        const title = extractTitle(
          indexContent,
          config.fallbackTitle ?? "LLM Documentation",
        );
        const toc = [...orderedEntries, ...extraEntries]
          .map((entry) => `- [${entry.title}](${buildLink(config.linkPrefix, entry.path)})`)
          .join("\n");
        const description =
          config.description ?? "This file contains links to all documentation sections.";
        const content = `# ${title}\n\n${description}\n\n## Table of Contents\n\n${toc}\n`;
        const allEntries = [...orderedEntries, ...extraEntries];

        await fs.writeFile(targetPath, content, "utf-8");

        if (config.generatePageMarkdown !== false) {
          await writePageMarkdownFiles(
            distDir,
            config.linkPrefix,
            localeDocsDir,
            allEntries,
          );
        }

        if (config.fullOutputFile) {
          const fullTargetPath = path.join(distDir, config.fullOutputFile);
          const fullSections = await Promise.all(
            allEntries.map(async (entry) => {
              const filePath = path.join(localeDocsDir, entry.path);
              const rawContent = await fs.readFile(filePath, "utf-8");
              const body = stripFrontmatter(rawContent);

              return buildFrontmatterBlock(entry, config.linkPrefix, body);
            }),
          );
          const fullContent = fullSections.join("\n\n---\n\n");

          await fs.writeFile(fullTargetPath, `${fullContent}\n`, "utf-8");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to generate ${config.outputFile}: ${message}`);
      }
    },
  };
}

export type { LocaleLlmsConfig };
