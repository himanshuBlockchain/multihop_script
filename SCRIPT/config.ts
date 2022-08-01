import {
    popularTokens_ARBITRUM,popularTokens_BSC,popularTokens_MUMBAI,popularTokens_POLYGON,popularTokens_RINKEBY
  } from "./popularTokens";

let network = "mumbai";
let GET_GLOBAL_VARIABLES = ""

const GLOBAL_VARIABLES_RINKEBY: any = {
  NETWORK: "rinkeby",
  EXCHANGE: "sushiswap",
  JSON_RPC: "https://rinkeby.infura.io/v3/060691df70bc4bb5bf9ca36322fe8705",
  SUBGRAPH_URL:
    "https://api.thegraph.com/subgraphs/name/bhupesh-98/my-subgraph",
  ROUTER_ADDRESS: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
  FACTORY_ADDRESS: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
  MULTICALL_ADDRESS: "0x7CC3DD354fF573f4B48295f28d49f56fe2fa9e64",
  POPULAR_TOKENS : popularTokens_RINKEBY,
};

const GLOBAL_VARIABLES_BSC: any = {
  NETWORK: "bsc",
  EXCHANGE: "pancakeswap",
  JSON_RPC: "https://bsc-dataseed1.ninicoin.io/",
  SUBGRAPH_URL:
    "https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2",
  ROUTER_ADDRESS: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  FACTORY_ADDRESS: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  MULTICALL_ADDRESS: "0x571aC2dF243FC6D8aF105f3A97c8C9cbDD80FB17",
  POPULAR_TOKENS : popularTokens_BSC,
};

const GLOBAL_VARIABLES_ARBITRUM: any = {
  NETWORK: "arbitrum",
  EXCHANGE: "sushiswap",
  JSON_RPC:
    "https://arbitrum-mainnet.infura.io/v3/e821ea96b5f24f01b1566e31f6879d80",
  SUBGRAPH_URL:
    "https://api.thegraph.com/subgraphs/name/mariorz/sushiswap-arbitrum",
  ROUTER_ADDRESS: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
  FACTORY_ADDRESS: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
  MULTICALL_ADDRESS: "0xa0743ace7974d7a4863447742f3528fa985265ae",
  POPULAR_TOKENS : popularTokens_ARBITRUM,
};

const GLOBAL_VARIABLES_POLYGON: any = {
  NETWORK: "matic",
  EXCHANGE: "sushiswap",
  JSON_RPC:
    "https://polygon-mainnet.infura.io/v3/e821ea96b5f24f01b1566e31f6879d80",
  SUBGRAPH_URL:
    "https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange",
  ROUTER_ADDRESS: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
  FACTORY_ADDRESS: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
  MULTICALL_ADDRESS: "0xdcbff8b2fe085ea9a57384a15a2b1b7db48b8bc1",
  POPULAR_TOKENS : popularTokens_POLYGON,
};

const GLOBAL_VARIABLES_MUMBAI: any = {
  NETWORK: "mumbai",
  EXCHANGE: "sushiswap",
  JSON_RPC:
    "https://polygon-mumbai.infura.io/v3/e821ea96b5f24f01b1566e31f6879d80",
  SUBGRAPH_URL:
    "https://api.thegraph.com/subgraphs/name/bhupesh-98/polygon-mumbai-sushiswap-exchange",
  ROUTER_ADDRESS: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
  FACTORY_ADDRESS: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
  MULTICALL_ADDRESS: "0xc3a47ff9cab108cc898ed9d7a20625e74c81e31d",
  POPULAR_TOKENS : popularTokens_MUMBAI,
};

switch (network) {
  case "rinkeby":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_RINKEBY;
    break;
  case "bsc":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_BSC;
    break;
  case "mumbai":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_MUMBAI;
    break;
  case "matic":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_POLYGON;
    break;
  case "arbitrum":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_ARBITRUM;
    break;
  default:
  // code block
}

export const GLOBAL_VARIABLES: any = GET_GLOBAL_VARIABLES;
