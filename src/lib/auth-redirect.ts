/** 生成带站点 basePath（GitHub Pages）的绝对回调地址 */
export function getAuthRedirectUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;

  const basePath = window.location.pathname.startsWith("/management_system")
    ? "/management_system"
    : "";
  const fullPath = `${basePath}${normalized}`;
  const withSlash = fullPath.endsWith("/") ? fullPath : `${fullPath}/`;
  return `${window.location.origin}${withSlash}`;
}
