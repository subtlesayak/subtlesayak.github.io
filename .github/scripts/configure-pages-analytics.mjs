import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
if (websiteId) {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(websiteId)) {
    throw new Error('UMAMI_WEBSITE_ID must be a website UUID');
  }

  const output = process.argv[2] || '_site';
  const paths = JSON.parse(readFileSync(new URL('./portfolio-page-paths.json', import.meta.url), 'utf8'));
  const pages = paths.map(route => {
    const page = join(output, route === '/' ? 'index.html' : decodeURIComponent(route.slice(1)));
    const html = readFileSync(page, 'utf8');
    if (!/<\/head>/i.test(html)) throw new Error(`Missing head in ${route}`);
    return [page, html];
  });

  const bridge = readFileSync(new URL('./pageviews.mjs', import.meta.url), 'utf8');
  const module = `${bridge}\ncountPageview(${JSON.stringify(websiteId)}, ${JSON.stringify(paths)});\n`;
  const digest = createHash('sha256').update(module).digest('hex').slice(0, 12);
  const asset = `assets/site-pageviews-${digest}.mjs`;
  mkdirSync(join(output, 'assets'), {recursive: true});
  writeFileSync(join(output, asset), module);
  const tag = `<script type="module" src="/${asset}"></script>`;
  for (const [page, html] of pages) {
    writeFileSync(page, html.replace(/<\/head>/i, `${tag}\n</head>`));
  }
}
