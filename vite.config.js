import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname || path.resolve();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function staticAssetsPlugin() {
  return {
    name: 'balaji-static-assets',
    // 1. Dev server middleware for streaming video with Range support and serving images
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ? req.url.split('?')[0] : '';
        const decodedUrl = decodeURIComponent(rawUrl);

        // Check if request is for assets/, Granite Images/, or root static metadata
        const isStaticAsset =
          decodedUrl.startsWith('/assets/') ||
          decodedUrl.startsWith('/Granite Images/') ||
          decodedUrl === '/favicon.ico' ||
          decodedUrl === '/favicon.svg' ||
          decodedUrl === '/site.webmanifest';

        if (!isStaticAsset) {
          return next();
        }

        const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl;
        const filePath = path.resolve(__dirname, relativePath);

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          return next();
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const range = req.headers.range;
        if (range && ext === '.mp4') {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = end - start + 1;
          const fileStream = fs.createReadStream(filePath, { start, end });

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
          });
          fileStream.pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
          });
          fs.createReadStream(filePath).pipe(res);
        }
      });
    },

    // 2. Production build: copy static assets directly into dist/
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      console.log('📦 Copying static assets to dist/ ...');
      copyDirRecursive(path.resolve(__dirname, 'assets'), path.resolve(distDir, 'assets'));
      copyDirRecursive(path.resolve(__dirname, 'Granite Images'), path.resolve(distDir, 'Granite Images'));

      ['favicon.ico', 'favicon.svg', 'site.webmanifest'].forEach((file) => {
        const srcPath = path.resolve(__dirname, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.resolve(distDir, file));
        }
      });
      console.log('✅ Static assets successfully copied to dist/');
    },
  };
}

export default defineConfig({
  plugins: [staticAssetsPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        products: resolve(__dirname, 'products/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        aboutHtml: resolve(__dirname, 'about.html'),
        productsHtml: resolve(__dirname, 'products.html'),
        contactHtml: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
