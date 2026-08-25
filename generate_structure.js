#!/usr/bin/env node

/**
 * Advanced Project Analyzer (Web + Xcode + Laravel + SwiftUI + Frontend Tooling)
 * + Project Summary & Language Stats
 */

const fs = require('fs');
const path = require('path');

let XMLParser;
try { XMLParser = require('fast-xml-parser').XMLParser; } catch {}

const OUTPUT_FILE = 'project_structure.md';

const IGNORED_DIRS = new Set([
  'node_modules','.git','dist','build','.next','out',
  'DerivedData','Pods','.build','vendor','__MACOSX'
]);

const ALLOWED_EXT = new Set([
  '.js','.ts','.jsx','.tsx','.json','.html','.css','.scss','.md',
  '.swift','.m','.mm','.h','.c','.cpp','.cc','.cxx','.hpp','.hh','.hxx',
  '.plist','.xml','.sh','.php','.blade.php'
]);

const EXT_TO_LANG = {
  '.js':'JavaScript', '.ts':'TypeScript', '.jsx':'JSX', '.tsx':'TSX',
  '.json':'JSON', '.html':'HTML', '.css':'CSS', '.scss':'SCSS', '.md':'Markdown',
  '.swift':'Swift', '.m':'Objective-C', '.mm':'Objective-C++', '.h':'C/C++ Header',
  '.c':'C', '.cpp':'C++', '.cc':'C++', '.cxx':'C++', '.hpp':'C++ Header',
  '.plist':'Plist', '.xml':'XML', '.sh':'Shell', '.php':'PHP', '.blade.php':'Blade'
};

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    if (entry.name === OUTPUT_FILE) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, fileList);
    else fileList.push(fullPath);
  }
  return fileList;
}

function writeLine(stream, line='') { stream.write(line + '\n'); }

// ----------------------------
// PROJECT STATS
// ----------------------------

function computeStats(files) {
  const stats = { totalFiles: 0, languages: {} };
  files.forEach(f => {
    const ext = path.extname(f);
    if (!ALLOWED_EXT.has(ext)) return;
    stats.totalFiles++;
    const lang = EXT_TO_LANG[ext] || ext;
    stats.languages[lang] = (stats.languages[lang] || 0) + 1;
  });
  return stats;
}

function formatLanguageStats(stats) {
  const total = stats.totalFiles || 1;
  return Object.entries(stats.languages)
    .sort((a,b)=>b[1]-a[1])
    .map(([lang,count]) => `- ${lang}: ${count} files (${((count/total)*100).toFixed(1)}%)`);
}

// ----------------------------
// FRONTEND TOOLING
// ----------------------------

function detectFrontendTools(pkg, files) {
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const result = { css:[], ui:[], build:[], testing:[], styling:[] };

  if (deps.tailwindcss || files.some(f=>f.includes('tailwind.config'))) result.css.push('Tailwind CSS');
  if (deps.bootstrap) result.css.push('Bootstrap');
  if (deps['@mui/material']) result.ui.push('Material UI');
  if (deps['@chakra-ui/react']) result.ui.push('Chakra UI');
  if (deps.antd) result.ui.push('Ant Design');
  if (deps.sass || files.some(f=>f.endsWith('.scss'))) result.styling.push('Sass/SCSS');
  if (deps['styled-components']) result.styling.push('Styled Components');
  if (deps['@emotion/react']) result.styling.push('Emotion');
  if (files.some(f=>f.includes('vite.config'))) result.build.push('Vite');
  if (files.some(f=>f.includes('webpack.config'))) result.build.push('Webpack');
  if (deps.parcel) result.build.push('Parcel');
  if (deps.jest) result.testing.push('Jest');
  if (deps.vitest) result.testing.push('Vitest');
  if (deps.cypress) result.testing.push('Cypress');

  return result;
}

// ----------------------------
// XCODE
// ----------------------------

function parsePBXProj(file) {
  try {
    const content = fs.readFileSync(file,'utf8');
    const targets = [...content.matchAll(/\/\* (.*?) \*\/ = {\n\s*isa = PBXNativeTarget;/g)].map(m=>m[1]);
    const frameworks = [...content.matchAll(/path = (.*?\.framework);/g)].map(m=>m[1]);
    const buildPhases = [...content.matchAll(/isa = PBX(.*?)BuildPhase;/g)].map(m=>m[1]);
    return { targets, frameworks, buildPhases };
  } catch { return { targets:[], frameworks:[], buildPhases:[] }; }
}

function parsePlist(file) {
  if (!XMLParser || !file) return null;
  try {
    const xml = fs.readFileSync(file,'utf8');
    const parser = new XMLParser();
    return parser.parse(xml);
  } catch { return null; }
}

// ----------------------------
// LARAVEL
// ----------------------------

function detectLaravel(files) {
  return files.some(f=>f.endsWith('artisan')) || files.some(f=>f.includes('routes/web.php'));
}

function detectBlade(files) {
  return files.filter(f=>f.endsWith('.blade.php'));
}

// ----------------------------
// ARCHITECTURE
// ----------------------------

function detectArchitecture(files) {
  const swiftFiles = files.filter(f => f.endsWith('.swift'));
  const hasViews = swiftFiles.some(f => fs.readFileSync(f,'utf8').includes(': View'));
  const hasViewModels = swiftFiles.some(f => fs.readFileSync(f,'utf8').includes('ObservableObject'));
  const hasModels = swiftFiles.some(f => !f.includes('View') && !f.includes('ViewModel') && f.endsWith('.swift'));

  if (hasViews && hasViewModels && hasModels) return 'SwiftUI MVVM';
  if (hasViews && hasModels) return 'SwiftUI MVC-like';

  // Fallback for Laravel/other projects
  const hasModelsGeneric = files.some(f=>/Model/.test(f));
  const hasViewsGeneric = files.some(f=>/View|\.blade\.php/.test(f));
  const hasControllers = files.some(f=>/Controller/.test(f));
  const hasViewModelsGeneric = files.some(f=>/ViewModel/.test(f));

  if (hasViewModelsGeneric) return 'MVVM';
  if (hasModelsGeneric && hasViewsGeneric && hasControllers) return 'MVC';
  return 'Unknown';
}

// ----------------------------
// MAIN
// ----------------------------

(function main(){
  const args = process.argv.slice(2);
  const NO_CONTENT = args.includes('--no-content');
  const root = process.cwd();
  const output = fs.createWriteStream(OUTPUT_FILE,{encoding:'utf8'});

  const files = walk(root);
  const stats = computeStats(files);

  const pkgPath = files.find(f=>f.endsWith('package.json'));
  const pkg = pkgPath ? JSON.parse(fs.readFileSync(pkgPath,'utf8')) : null;
  const tools = detectFrontendTools(pkg, files);

  const pbxproj = files.find(f=>f.endsWith('.xcodeproj/project.pbxproj'));
  const plist = files.find(f=>f.endsWith('Info.plist'));

  const isLaravel = detectLaravel(files);
  const bladeFiles = detectBlade(files);

  const pattern = detectArchitecture(files);

  // -------------------
  // OUTPUT
  // -------------------
  writeLine(output,'# Project Overview\n');
  writeLine(output,'## Project Summary\n');
  writeLine(output,`- Total Files: ${stats.totalFiles}\n`);
  writeLine(output,'### Language Breakdown');
  formatLanguageStats(stats).forEach(line=>writeLine(output,line));
  writeLine(output,'\n## App Analysis\n');

  // FRONTEND TOOLS
  if (pkg) {
    writeLine(output,'### Frontend Tooling\n');
    Object.entries(tools).forEach(([key, values]) => {
      if (values.length) writeLine(output,`- ${key.toUpperCase()}: ${values.join(', ')}`);
    });
    writeLine(output);
  }

  // XCODE
  if (pbxproj) {
    const pbx = parsePBXProj(pbxproj);
    const plistData = parsePlist(plist);
    writeLine(output,'### Xcode Project\n');
    writeLine(output,'- Targets:'); pbx.targets.forEach(t=>writeLine(output,`  - ${t}`));
    writeLine(output,'\n- Frameworks:'); pbx.frameworks.forEach(f=>writeLine(output,`  - ${f}`));
    writeLine(output,'\n- Build Phases:'); pbx.buildPhases.forEach(p=>writeLine(output,`  - ${p}`));

    if (plistData) {
      writeLine(output,'\n### Info.plist Parsed');
      writeLine(output,JSON.stringify(plistData,null,2));
    }
    writeLine(output);
  }

  // LARAVEL
  if (isLaravel) {
    writeLine(output,'### Laravel Project Detected\n');
    writeLine(output,'- Blade Files:'); bladeFiles.forEach(f=>writeLine(output,`  - ${f}`));
    writeLine(output);
  }

  // ARCHITECTURE
  writeLine(output,'### Architecture Pattern');
  writeLine(output,`**${pattern}**\n`);

  // PROJECT STRUCTURE (relative paths, collapsed)
  writeLine(output,'# Project Structure\n');
  writeLine(output,'```');

  const dirs = Array.from(new Set(files.map(f => path.relative(root, path.dirname(f)))));
  dirs.sort().forEach(dir => {
    const depth = dir.split(path.sep).length;
    writeLine(output,'  '.repeat(depth-1)+'- '+path.basename(dir));
  });

  writeLine(output,'```\n');

  // FILE CONTENTS
  writeLine(output,'# File Contents\n');
  if (!NO_CONTENT) {
    files.forEach(file => {
      if (!ALLOWED_EXT.has(path.extname(file))) return;
      try {
        let content = fs.readFileSync(file,'utf8');
        if (content.length > 20000) content = `${content.slice(0,20000)}\n... (truncated)`;
        writeLine(output,`## \`${file}\`\n\`\`\`\n${content}\n\`\`\`\n`);
      } catch {}
    });
  } else {
    writeLine(output,'(Skipped due to --no-content flag)\n');
  }
 
  output.end();
  console.log('\n✅ Done! Generated:',OUTPUT_FILE);
})();