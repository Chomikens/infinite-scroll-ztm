import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({

  base: 'infinite-scroll-ztm',
  server: {
    open: true,
  }
});
