export function normalizeWordReplacements(value) {
  const entries = Array.isArray(value?.entries) ? value.entries : [];
  return {
    enabled: value?.enabled === true,
    entries: entries.map((entry) => ({
      from: typeof entry?.from === "string" ? entry.from.trim() : "",
      to: typeof entry?.to === "string" ? entry.to.trim() : "",
      enabled: entry?.enabled !== false
    }))
  };
}

export function validateWordReplacements(value) {
  const rules = normalizeWordReplacements(value);
  const from = new Set();
  const to = new Set();
  for (const entry of rules.entries) {
    if (!entry.from || !entry.to) throw new Error("改詞的原詞和替換詞都不能留空。");
    if (entry.from.length > 100 || entry.to.length > 100) throw new Error("每個詞最多 100 個字元。");
    if (from.has(entry.from) || to.has(entry.to)) throw new Error("原詞和替換詞不能各自重複。");
    from.add(entry.from);
    to.add(entry.to);
  }
  if (rules.entries.length > 200) throw new Error("改詞規則最多 200 條。");
  return rules;
}

function activePairs(rules, reverse = false) {
  const normalized = normalizeWordReplacements(rules);
  if (!normalized.enabled) return [];
  return normalized.entries.filter((entry) => entry.enabled && entry.from && entry.to)
    .map((entry) => reverse ? [entry.to, entry.from] : [entry.from, entry.to])
    .sort((a, b) => b[0].length - a[0].length);
}

function replaceWithPairs(text, pairs) {
  if (!pairs.length || typeof text !== "string") return text;
  const pattern = new RegExp(pairs.map(([word]) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gu");
  const lookup = new Map(pairs);
  return text.replace(pattern, (match) => lookup.get(match));
}

export function restoreReplacedWords(text, rules) {
  return replaceWithPairs(text, activePairs(rules, true));
}

export function prepareWordReplacementMessages(messages, rules) {
  const pairs = activePairs(rules);
  if (!pairs.length) return messages;
  const result = messages.map((message) => ({
    ...message,
    content: typeof message.content === "string"
      ? replaceWithPairs(message.content, pairs)
      : Array.isArray(message.content)
        ? message.content.map((part) => part?.type === "text" ? { ...part, text: replaceWithPairs(part.text, pairs) } : part)
        : message.content
  }));
  const instruction = "【改詞規則】\n你需要將所有指定詞語替換成對應的第二個詞，意思仍然是原來的詞。請完全按照這個規則回覆；提供給你的內容也已依照此規則替換。\n" +
    pairs.map(([from, to]) => `${from}改為${to}`).join("\n");
  const lastUser = result.findLastIndex((message) => message.role === "user");
  if (lastUser < 0) {
    result.push({ role: "user", content: instruction });
    return result;
  }
  const addInstruction = (text) => {
    const marker = replaceWithPairs("【使用者自訂補充】", pairs);
    const index = text.lastIndexOf(marker);
    return index < 0 ? `${text}\n\n${instruction}` : `${text.slice(0, index)}${instruction}\n\n${text.slice(index)}`;
  };
  const content = result[lastUser].content;
  if (typeof content === "string") result[lastUser].content = addInstruction(content);
  else if (Array.isArray(content)) {
    const index = content.findLastIndex((part) => part?.type === "text");
    if (index >= 0) content[index] = { ...content[index], text: addInstruction(content[index].text || "") };
    else content.push({ type: "text", text: instruction });
  } else result[lastUser].content = instruction;
  return result;
}

export function createWordRestorer(rules, callback) {
  const pairs = activePairs(rules, true);
  let pending = "";
  const emit = (flush) => {
    let output = "";
    while (pending) {
      if (!flush && pairs.some(([word]) => word.length > pending.length && word.startsWith(pending))) break;
      const match = pairs.find(([word]) => pending.startsWith(word));
      if (match) {
        output += match[1];
        pending = pending.slice(match[0].length);
      } else {
        output += pending[0];
        pending = pending.slice(1);
      }
    }
    if (output) callback?.(output);
  };
  return {
    push(text) { pending += text || ""; emit(false); },
    flush() { emit(true); }
  };
}
