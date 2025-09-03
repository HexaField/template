// <reference types="node" />
/// <reference types="node" />
import fs from 'fs'
import path from 'path'
// @ts-ignore no types published for the vite plugin
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import packageRoot from 'app-root-path'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'

dotenv.config({
  path: packageRoot.path + '/.env.local'
})

export default defineConfig(({ command }) => ({
  server: {
    host: true,
    ...(command === 'serve'
      ? {
          https: {
            key: fs.readFileSync(path.join(packageRoot.path, process.env.KEY || 'certs/key.pem')),
            cert: fs.readFileSync(path.join(packageRoot.path, process.env.CERT || 'certs/cert.pem'))
          }
        }
      : {})
  },
  plugins: [react(), tailwindcss()]
}))
