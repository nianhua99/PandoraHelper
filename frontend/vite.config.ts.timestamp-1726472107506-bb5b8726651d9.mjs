// vite.config.ts
import path from "path";
import react from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@4.5.3_@types+node@20.5.1_sass@1.75.0_sugarss@2.0.0_terser@5.30.4_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@3.29.4/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig } from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/vite@4.5.3_@types+node@20.5.1_sass@1.75.0_sugarss@2.0.0_terser@5.30.4/node_modules/vite/dist/node/index.js";
import { createSvgIconsPlugin } from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@4.5.3_@types+node@20.5.1_sass@1.75.0_sugarss@2.0.0_terser@5.30.4_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import tsconfigPaths from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.4.5_vite@4.5.3_@types+node@20.5.1_sass@1.75.0_sugarss@2.0.0_terser@5.30.4_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { inspectorServer } from "file:///D:/Users/GGBOND/GolandProjects/PandoraHelper/frontend/node_modules/.pnpm/@react-dev-inspector+vite-plugin@2.0.1_eslint@8.57.0_typescript@5.4.5_webpack@5.91.0/node_modules/@react-dev-inspector/vite-plugin/lib/index.js";
var vite_config_default = defineConfig({
  base: "/admin",
  esbuild: {
    // drop: ['console', 'debugger'],
  },
  css: {
    // 开css sourcemap方便找css
    devSourcemap: true
  },
  plugins: [
    react(),
    // 同步tsconfig.json的path设置alias
    tsconfigPaths(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]"
    }),
    visualizer({
      open: true
    }),
    inspectorServer()
  ],
  server: {
    // 自动打开浏览器
    open: true,
    host: true,
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:9000",
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      // output: {
      //   manualChunks(id) {
      //     if (id.includes('node_modules')) {
      //       // 让每个插件都打包成独立的文件
      //       return id.toString().split('node_modules/')[1].split('/')[0].toString();
      //     }
      //     return null;
      //   },
      // },
    },
    terserOptions: {
      compress: {
        // 生产环境移除console
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxHR0JPTkRcXFxcR29sYW5kUHJvamVjdHNcXFxcUGFuZG9yYUhlbHBlclxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVXNlcnNcXFxcR0dCT05EXFxcXEdvbGFuZFByb2plY3RzXFxcXFBhbmRvcmFIZWxwZXJcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1VzZXJzL0dHQk9ORC9Hb2xhbmRQcm9qZWN0cy9QYW5kb3JhSGVscGVyL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgeyBpbnNwZWN0b3JTZXJ2ZXIgfSBmcm9tICdAcmVhY3QtZGV2LWluc3BlY3Rvci92aXRlLXBsdWdpbidcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcvYWRtaW4nLFxuICBlc2J1aWxkOiB7XG4gICAgLy8gZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10sXG4gIH0sXG4gIGNzczoge1xuICAgIC8vIFx1NUYwMGNzcyBzb3VyY2VtYXBcdTY1QjlcdTRGQkZcdTYyN0Vjc3NcbiAgICBkZXZTb3VyY2VtYXA6IHRydWUsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIC8vIFx1NTQwQ1x1NkI2NXRzY29uZmlnLmpzb25cdTc2ODRwYXRoXHU4QkJFXHU3RjZFYWxpYXNcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xuICAgICAgLy8gXHU2MzA3XHU1QjlBXHU5NzAwXHU4OTgxXHU3RjEzXHU1QjU4XHU3Njg0XHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1OTM5XG4gICAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9pY29ucycpXSxcbiAgICAgIC8vIFx1NjMwN1x1NUI5QXN5bWJvbElkXHU2ODNDXHU1RjBGXG4gICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJyxcbiAgICB9KSxcbiAgICB2aXN1YWxpemVyKHtcbiAgICAgIG9wZW46IHRydWUsXG4gICAgfSksXG4gICAgaW5zcGVjdG9yU2VydmVyKCksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIC8vIFx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxuICAgIG9wZW46IHRydWUsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBwb3J0OiAzMDAxLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo5MDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAvLyByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIG91dHB1dDoge1xuICAgICAgLy8gICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgIC8vICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAvLyAgICAgICAvLyBcdThCQTlcdTZCQ0ZcdTRFMkFcdTYzRDJcdTRFRjZcdTkwRkRcdTYyNTNcdTUzMDVcdTYyMTBcdTcyRUNcdTdBQ0JcdTc2ODRcdTY1ODdcdTRFRjZcbiAgICAgIC8vICAgICAgIHJldHVybiBpZC50b1N0cmluZygpLnNwbGl0KCdub2RlX21vZHVsZXMvJylbMV0uc3BsaXQoJy8nKVswXS50b1N0cmluZygpO1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgICByZXR1cm4gbnVsbDtcbiAgICAgIC8vICAgfSxcbiAgICAgIC8vIH0sXG4gICAgfSxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTc5RkJcdTk2NjRjb25zb2xlXG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VixPQUFPLFVBQVU7QUFFOVcsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsdUJBQXVCO0FBR2hDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQTtBQUFBLEVBRVQ7QUFBQSxFQUNBLEtBQUs7QUFBQTtBQUFBLElBRUgsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUVOLGNBQWM7QUFBQSxJQUNkLHFCQUFxQjtBQUFBO0FBQUEsTUFFbkIsVUFBVSxDQUFDLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxrQkFBa0IsQ0FBQztBQUFBO0FBQUEsTUFFMUQsVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLElBQ1IsQ0FBQztBQUFBLElBQ0QsZ0JBQWdCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFFBQVE7QUFBQTtBQUFBLElBRU4sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsTUFFaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBVWY7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQTtBQUFBLFFBRVIsY0FBYztBQUFBLFFBQ2QsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
