require("dotenv");
const path = require("path");
const { DefinePlugin } = require("webpack");
const WebpackBar = require("webpackbar");

const paths = {
	buildDir: path.resolve("dist"),
	clientEntry: path.resolve("src", "client"),
	serverEntry: path.resolve("src", "server"),
};

/**
 * @name createDefines
 * @param {Object} base
 * @return {Object}
 * */
function createDefines(base) {
	let output = {};
	const { env } = process;

	for (const key of Object.keys(env)) {
		output[`process.env.${key}`] = env[key];
	}

	output = { ...output, ...base };

	for (const item of Object.keys(output)) {
		output[item] = JSON.stringify(output[item]);
	}

	console.log(output);

	return output;
}

/**
 *
 * @name createWebpackConfig
 * @param {("client" | "server")} target
 * @param {("development"|"production")} env
 * @return {Object}
 * */
function createWebpackConfig(target, env) {
	const isClient = target === "client";
	const isServer = target === "server";
	const isDev = env === "development";
	const isProd = env === "production";

	const config = {
		mode: env,
		name: target,
		target: isServer ? "node" : "web",
		resolve: {
			extensions: [".mjs", ".js", ".json", ".jsx", ".ts", ".tsx"],
		},
		plugins: [
			new WebpackBar({
				name: target,
			}),
			new DefinePlugin(
				createDefines({
					"process.env.NODE_ENV": env,
					IS_DEV: isDev,
					IS_PROD: isProd,
					IS_SERVER: isServer,
					IS_CLIENT: isClient,
				})
			),
		],
	};

	if (isClient) {
		config.entry = { bundle: [paths.clientEntry] };
		config.output = {
			path: path.join(paths.buildDir, "public"),
			filename: "assets/js/[name].js",
			chunkFilename: "assets/js/[name].chunk.js",
		};

		if (isProd) {
			config.output = {
				...config.output,
				filename: "assets/js/[name].[contenthash].js",
				chunkFilename: "assets/js/[name].[contenthash].chunk.js",
			};
		}
	}

	// Server
	if (isServer) {
		config.node = {
			__dirname: false,
			__filename: false,
		};
		config.entry = [paths.serverEntry];
		config.output = {
			path: paths.buildDir,
			filename: "[name].js",
			chunkFilename: "[name].chunk.js",
			library: "commonjs2",
		};
	}

	return config;
}

module.exports = createWebpackConfig;
