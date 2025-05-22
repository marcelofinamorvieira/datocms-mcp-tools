import { readdir, access, stat } from 'fs/promises';
import path from 'path';

const TOOLS_DIR = path.join(process.cwd(), 'src', 'tools');

function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

async function validate() {
  const domains = await readdir(TOOLS_DIR, { withFileTypes: true });
  let hasError = false;

  for (const domain of domains) {
    if (!domain.isDirectory()) continue;
    const domainPath = path.join(TOOLS_DIR, domain.name);
    const entries = await readdir(domainPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const opName = entry.name;

      if (!isPascalCase(opName)) {
        console.error(`Invalid operation directory name: ${domain.name}/${opName}`);
        hasError = true;
      }

      const opPath = path.join(domainPath, opName);
      const opIndex = path.join(opPath, 'index.ts');
      try {
        await access(opIndex);
      } catch {
        console.error(`Missing index.ts in ${domain.name}/${opName}`);
        hasError = true;
      }

      const handlersPath = path.join(opPath, 'handlers');
      try {
        const hstat = await stat(handlersPath);
        if (!hstat.isDirectory()) {
          console.error(`Missing handlers directory in ${domain.name}/${opName}`);
          hasError = true;
        } else {
          const handlersIndex = path.join(handlersPath, 'index.ts');
          try {
            await access(handlersIndex);
          } catch {
            console.error(`Missing handlers/index.ts in ${domain.name}/${opName}`);
            hasError = true;
          }
        }
      } catch {
        console.error(`Missing handlers directory in ${domain.name}/${opName}`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error('Directory structure validation failed.');
    process.exit(1);
  } else {
    console.log('Directory structure validation passed.');
  }
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
