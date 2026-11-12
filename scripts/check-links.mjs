#!/usr/bin/env node
/**
 * 静态站点本地资源检查
 *
 * 扫描 public/ 下的 HTML 与 CSS，取出所有指向站内的引用，
 * 逐个确认目标文件真实存在。外部链接（http/https/mailto 等）跳过，
 * 不做网络请求，因此在 CI 里也稳定可跑。
 *
 * 用法：node scripts/check-links.mjs [站点根目录，默认 public]
 * 退出码：0 全部通过；1 存在缺失引用
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? 'public');
const SCAN_EXT = new Set(['.html', '.htm', '.css']);

/** 明确不是站内文件的协议 / 前缀 */
const SKIP_PREFIX = [
  'http://',
  'https://',
  '//',
  'mailto:',
  'tel:',
  'javascript:',
  'data:',
  'sms:',
];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (SCAN_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

/** 从 HTML 中取出所有 src / href / srcset / poster 值 */
function extractFromHtml(text) {
  const found = [];
  const attrRe = /\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(text))) found.push(m[1]);

  const srcsetRe = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcsetRe.exec(text))) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) found.push(url);
    }
  }
  return found;
}

/** 从 CSS 中取出 url(...) 引用，忽略 data: 内联资源 */
function extractFromCss(text) {
  const found = [];
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  let m;
  while ((m = urlRe.exec(text))) found.push(m[2]);
  return found;
}

function shouldSkip(ref) {
  const v = ref.trim();
  if (!v) return true;
  if (v.startsWith('#')) return true;
  return SKIP_PREFIX.some((p) => v.toLowerCase().startsWith(p));
}

/** 解析引用到磁盘路径，去掉 ?query 与 #hash，反解码 %20 之类 */
function resolveRef(fromFile, ref) {
  const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
  if (!clean) return null;
  const base = path.dirname(fromFile);
  const target = clean.startsWith('/')
    ? path.join(ROOT, clean.slice(1))
    : path.join(base, clean);
  return path.normalize(target);
}

async function existsRelaxed(p) {
  // 目录引用（如 "/"、"./"）视为命中其 index.html
  try {
    const s = await stat(p);
    if (s.isDirectory()) {
      const idx = path.join(p, 'index.html');
      return (await stat(idx)).isFile();
    }
    return s.isFile();
  } catch {
    return false;
  }
}

const files = await walk(ROOT);
const problems = [];
let checked = 0;

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const isCss = file.toLowerCase().endsWith('.css');
  const refs = isCss ? extractFromCss(text) : extractFromHtml(text);

  for (const ref of refs) {
    // 先解码再判断：CSS 里写 url(%23n) 这类片段引用，解码后是 #n
    let ref2 = ref;
    try {
      ref2 = decodeURIComponent(ref);
    } catch {
      // 保留原样，交给下面的存在性检查报错
    }
    if (shouldSkip(ref2)) continue;
    const target = resolveRef(file, ref);
    if (!target) continue;
    checked += 1;
    if (!(await existsRelaxed(target))) {
      problems.push({
        from: path.relative(ROOT, file) || file,
        ref,
        expect: path.relative(ROOT, target),
      });
    }
  }
}

console.log(`扫描目录：${ROOT}`);
console.log(`文件数：${files.length}｜站内引用：${checked}`);

if (problems.length === 0) {
  console.log('结果：全部通过，未发现缺失资源。');
  process.exit(0);
}

console.error(`结果：${problems.length} 处引用找不到目标文件`);
for (const p of problems) {
  console.error(`  ${p.from}  ->  ${p.ref}   (应为 ${p.expect})`);
}
process.exit(1);
