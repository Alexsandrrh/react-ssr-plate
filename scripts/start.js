const { webpack } = require("webpack");
const createWebpackConfig = require("../config/createWebpackConfig");

const script = () => {
	// Clear console
	console.log();

	const clientConfig = createWebpackConfig("client", "development");
	const serverConfig = createWebpackConfig("server", "development");

	webpack(clientConfig).run();
	webpack(serverConfig).run();
};

script();
