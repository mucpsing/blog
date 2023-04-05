// import type {} from "@docusaurus"

type Context = {};

export default async function myPlugin(context: any, options: any) {
  // ...
  return {
    name: "test-plugins",
    async loadContent() {},
    async contentLoaded({ content, actions }: any) {
      // ...
      console.log("contentLoaded...", content);
      console.log("contentLoaded...", actions);
    },
    /* other lifecycle API */
  };
}
