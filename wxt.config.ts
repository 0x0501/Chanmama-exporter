import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "Chanmama Exporter",
		version: "0.0.1",
		permissions: ["storage", "tabs"],
		host_permissions: ["https://open.feishu.cn/*"],
	},
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
});
