let network = "matic";

var GET_GLOBAL_VARIABLES ={}
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
  WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  SWAP_CONTRACT : "0xdF56FFD9022dF77d79EBBE094FeBAC9DA9e38AF2",
  GIE_APP_FEES_CONTRACT : "0xf9e1761385db44b23da15c4c2750306ef90050f9",
  GIE_TOKEN_CONTRACT :  "0x147193fB1EF2a5381Dec255f142b0b57ee96e7B4",
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
  WETH: "0x5B67676a984807a212b1c59eBFc9B3568a474F0a",
  SWAP_CONTRACT : "0xdF56FFD9022dF77d79EBBE094FeBAC9DA9e38AF2",
  GIE_APP_FEES_CONTRACT : "0xf9e1761385db44b23da15c4c2750306ef90050f9",
  GIE_TOKEN_CONTRACT :  "0x147193fB1EF2a5381Dec255f142b0b57ee96e7B4",
};

switch (network) {
  case "mumbai":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_MUMBAI;
    break;
  case "matic":
    GET_GLOBAL_VARIABLES = GLOBAL_VARIABLES_POLYGON;
    break;
  default:
  // code block
}

export const GLOBAL_VARIABLES: any = GET_GLOBAL_VARIABLES;
