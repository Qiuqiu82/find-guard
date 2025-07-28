/// <reference types="vite/client" />

declare module '*.svg' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
