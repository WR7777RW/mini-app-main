import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs'
import dotenv from 'dotenv';
// https://vitejs.dev/config/
dotenv.config();
export default defineConfig({

  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    // hmr: {
    //   host: 'tg-mini-app.local',
    //   port: 443,
    // },
    // https: {
    //   key: fs.readFileSync('./.cert/localhost-key.pem'),
    //   cert: fs.readFileSync('./.cert/localhost.pem'),
    // },
  },
})