import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.resolve(ROOT_DIR, 'lighthouse-reports');

const TARGET_PORT = 3000;
const BASE_URL = `http://localhost:${TARGET_PORT}`;
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'nft-detail', path: '/nft/nft-1' },
];

const THRESHOLDS = {
  performance: 0.85, // WebGL / canvas / MSW in local preview
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.90,
};

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function isServerRunning(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function startPreviewServer() {
  const isUp = await isServerRunning(BASE_URL);
  if (isUp) {
    console.log(`[Lighthouse] Servidor de preview detectado em ${BASE_URL}`);
    return null;
  }

  console.log('[Lighthouse] Iniciando servidor Vite preview na porta', TARGET_PORT);
  const child = spawn('npm.cmd', ['run', 'preview', '--', '--port', String(TARGET_PORT)], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
    shell: true,
  });

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isServerRunning(BASE_URL)) {
      console.log(`[Lighthouse] Servidor Vite preview pronto em ${BASE_URL}`);
      return child;
    }
  }

  throw new Error('Falha ao inicializar o servidor preview dentro do tempo limite.');
}

async function runAudit() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  let serverProcess = null;
  let chrome = null;

  try {
    serverProcess = await startPreviewServer();

    console.log('[Lighthouse] Lançando instância do Google Chrome...');
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    const modes = [
      { name: 'desktop', formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1 } },
      { name: 'mobile', formFactor: 'mobile', screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 } },
    ];

    const allResults = [];
    let hasFailures = false;

    for (const page of PAGES) {
      for (const mode of modes) {
        const fullUrl = `${BASE_URL}${page.path}`;
        console.log(`\n======================================================`);
        console.log(`Auditoria Lighthouse: ${page.name.toUpperCase()} (${mode.name.toUpperCase()})`);
        console.log(`URL: ${fullUrl}`);
        console.log(`Executando 3 iterações para cálculo da mediana...`);

        const runs = [];
        let lastReportHtml = null;
        let lastReportJson = null;

        for (let i = 1; i <= 3; i++) {
          process.stdout.write(`  Iteração ${i}/3... `);
          const flags = {
            port: chrome.port,
            output: ['html', 'json'],
            logLevel: 'error',
            formFactor: mode.formFactor,
            screenEmulation: mode.screenEmulation,
            throttlingMethod: 'provided',
          };

          const runnerResult = await lighthouse(fullUrl, flags);
          const cats = runnerResult.lhr.categories;

          runs.push({
            performance: cats.performance?.score || 0,
            accessibility: cats.accessibility?.score || 0,
            bestPractices: cats['best-practices']?.score || 0,
            seo: cats.seo?.score || 0,
          });

          lastReportHtml = runnerResult.report[0];
          lastReportJson = runnerResult.report[1];
          console.log(`Concluído`);
        }

        const medianScores = {
          page: page.name,
          mode: mode.name,
          performance: median(runs.map((r) => r.performance)),
          accessibility: median(runs.map((r) => r.accessibility)),
          bestPractices: median(runs.map((r) => r.bestPractices)),
          seo: median(runs.map((r) => r.seo)),
        };

        allResults.push(medianScores);

        // Save reports
        const htmlFile = path.join(REPORT_DIR, `${page.name}-${mode.name}.html`);
        const jsonFile = path.join(REPORT_DIR, `${page.name}-${mode.name}.json`);
        fs.writeFileSync(htmlFile, lastReportHtml);
        fs.writeFileSync(jsonFile, lastReportJson);

        console.log(`  Relatórios salvos em:`);
        console.log(`    - ${path.relative(ROOT_DIR, htmlFile)}`);
        console.log(`    - ${path.relative(ROOT_DIR, jsonFile)}`);

        console.log(`  Mediana dos Resultados:`);
        console.log(`    - Performance:    ${Math.round(medianScores.performance * 100)} / 100 (mínimo ${THRESHOLDS.performance * 100})`);
        console.log(`    - Accessibility:  ${Math.round(medianScores.accessibility * 100)} / 100 (mínimo ${THRESHOLDS.accessibility * 100})`);
        console.log(`    - Best Practices: ${Math.round(medianScores.bestPractices * 100)} / 100 (mínimo ${THRESHOLDS['best-practices'] * 100})`);
        console.log(`    - SEO:            ${Math.round(medianScores.seo * 100)} / 100 (mínimo ${THRESHOLDS.seo * 100})`);

        // Check thresholds
        if (
          medianScores.performance < THRESHOLDS.performance ||
          medianScores.accessibility < THRESHOLDS.accessibility ||
          medianScores.bestPractices < THRESHOLDS['best-practices'] ||
          medianScores.seo < THRESHOLDS.seo
        ) {
          console.warn(`  ⚠️ Uma ou mais métricas ficaram abaixo da meta rigorosa estabelecida.`);
        } else {
          console.log(`  ✅ Todas as métricas atingiram ou superaram a meta!`);
        }
      }
    }

    console.log(`\n======================================================`);
    console.log(`RESUMO GERAL DAS AUDITORIAS LIGHTHOUSE`);
    console.log(`======================================================`);
    console.table(
      allResults.map((r) => ({
        Página: r.page,
        Modo: r.mode,
        'Perf (%)': Math.round(r.performance * 100),
        'A11y (%)': Math.round(r.accessibility * 100),
        'Best Prac (%)': Math.round(r.bestPractices * 100),
        'SEO (%)': Math.round(r.seo * 100),
      }))
    );

    console.log(`\nTodos os relatórios HTML e JSON estão disponíveis em: ${REPORT_DIR}`);
  } catch (err) {
    console.error('[Lighthouse] Erro fatal durante a execução:', err);
    process.exitCode = 1;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runAudit();
