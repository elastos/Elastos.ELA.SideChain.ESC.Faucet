const Web3 = require('web3')
const {NodejsFileStorage, MasterWalletManager} = require("@elastosfoundation/wallet-js-sdk");

module.exports = function (app) {
	app.configureWeb3 = configureWeb3
	app.configureELAWallet = configureELAWallet
 
	function configureWeb3 (config) {
		return new Promise((resolve, reject) => {
			let web3 = {};
			if (typeof web3['ESC'] !== 'undefined') {
				web3.ESC = new Web3(web3.currentProvider)
			} else {
				web3.ESC = new Web3(new Web3.providers.HttpProvider(config.Ethereum['ESC'][config.environment].rpc))
			}

			if (typeof web3['EID'] !== 'undefined') {
				web3.EID = new Web3(web3.currentProvider)
			} else {
				web3.EID = new Web3(new Web3.providers.HttpProvider(config.Ethereum['EID'][config.environment].rpc))
			}

			if (typeof web3['ESC'] !== 'undefined' && typeof web3['EID'] !== 'undefined') {
				return resolve(web3)
			}
			
			reject({
				code: 500,
				title: "Error",
				message: "check RPC"
			})
		});
	}

	function configureELAWallet(config) {
		let masterWalletId = config.Ethereum.ELA.masterWalletId;
		return new Promise(async (resolve, reject) => {
			try {
				let walletStorage = new NodejsFileStorage();
				let masterWalletManager = await MasterWalletManager.create(walletStorage, "TestNet", {NetType: "TestNet", ELA: {}});
				let masterWallet = await masterWalletManager.getMasterWallet(masterWalletId);
				if(!masterWallet) {
					let mnemonic = config.Ethereum.ELA[config.environment].mnemonic;
					let masterWalletPass = config.Ethereum.ELA.masterWalletPass;
					masterWallet = await masterWalletManager.createMasterWallet(masterWalletId, mnemonic, "", masterWalletPass, true);
				}
				let subWallet = await masterWallet.createSubWallet("ELA");
				resolve(subWallet);
			} catch (error) {
				reject(error);
			}
		})
	}
}