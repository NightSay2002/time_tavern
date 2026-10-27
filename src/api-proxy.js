import { isIP } from "node:net";
import { Client, ProxyAgent } from "undici";

let cachedProxy = null;

export function resolveApiProxySettings(envSource = process.env) {
  const address = String(envSource.API_PROXY_URL || "").trim();
  if (!address) return null;
  try {
    const url = new URL(address.includes("://") ? address : `http://${address}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname ||
        url.pathname !== "/" || url.search || url.hash) {
      throw new Error("invalid proxy");
    }
    const explicitUsername = String(envSource.API_PROXY_USERNAME || "").trim();
    const explicitPassword = String(envSource.API_PROXY_PASSWORD || "");
    const useExplicitCredentials = Boolean(explicitUsername || explicitPassword);
    const username = useExplicitCredentials ? explicitUsername : decodeURIComponent(url.username);
    const password = useExplicitCredentials ? explicitPassword : decodeURIComponent(url.password);
    if ((!username && password) || username.includes(":")) throw new Error("invalid credentials");
    url.username = "";
    url.password = "";
    return {
      uri: url.origin,
      token: username ? `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` : undefined
    };
  } catch {
    const error = new Error("API Proxy 設定無效，請使用 http://主機:連接埠 或 https://主機:連接埠，並檢查代理帳號密碼。");
    error.code = "INVALID_API_PROXY";
    throw error;
  }
}

export function getApiProxyDispatcher(envSource = process.env) {
  const settings = resolveApiProxySettings(envSource);
  if (settings && cachedProxy?.uri === settings.uri && cachedProxy.token === settings.token) {
    return cachedProxy.dispatcher;
  }
  const previous = cachedProxy;
  cachedProxy = settings ? {
    ...settings,
    dispatcher: new ProxyAgent({
      ...settings,
      clientFactory: (url, options) => new Client(url, {
        ...options,
        connect(connection, callback) {
          // Node 25 rejects IP addresses in SNI; certificate verification still uses the host.
          options.connect({ ...connection, servername: isIP(connection.servername) ? undefined : connection.servername }, callback);
        }
      })
    })
  } : null;
  // Existing requests finish before the old connection pool closes.
  if (previous) void previous.dispatcher.close().catch(() => {});
  return cachedProxy?.dispatcher;
}

export function fetchModelApi(url, options = {}, envSource = process.env) {
  const dispatcher = getApiProxyDispatcher(envSource);
  return fetch(url, dispatcher ? { ...options, dispatcher } : options);
}
