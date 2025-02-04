export function convertMarkdownImages(content: string): string {
  // Markdownの画像構文を検出して<img>タグに変換
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="w-full h-auto rounded-lg my-4" />'
  );
} 