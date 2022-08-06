import Web3 from "web3";
import client from "./apolloClient";
import { gql } from "@apollo/client";

import { erc20_abi, factoryABI, multicall_abi, routerABI } from "./ABI";

import { GLOBAL_VARIABLES } from "./config";
// import {
//   popularTokens,
// } from "./popularTokens";
import { parseUnits } from "@ethersproject/units";

let multicall_address = GLOBAL_VARIABLES.MULTICALL_ADDRESS;

export const returnOptimalTradeUsingSubraph = async (
  from: any,
  to: any,
  amountIn: any,
  flag: boolean
) => {

  console.log(from,to,amountIn,flag)
  //flag = true if amount is given in input field

  let allEdges: any = [];
  let allNodes: any = [];
  let allNodesSymbols: any = [];
  let pairs: any = [];
  let pairsToken0: any = [];
  let pairsToken1: any = [];

  enum TRADE_STATUS {
    SUCCESS,
    NO_PATH,
    INSUFFICIENT_RESERVES,
  }

  let router_addreess = GLOBAL_VARIABLES.ROUTER_ADDRESS; // Ethereum All TestNet //Rinkeby
  let factoryaddress = GLOBAL_VARIABLES.FACTORY_ADDRESS; // Ethereum All Test Net //Rinkeby

  let trade_status = TRADE_STATUS.SUCCESS;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(GLOBAL_VARIABLES.JSON_RPC)
  );

  // console.log(web3)

  const mutilcall_inst = new web3.eth.Contract(
    multicall_abi,
    multicall_address
  );

  // console.log(mutilcall_inst)

  const FACTORY_INSTANCE = new web3.eth.Contract(factoryABI, factoryaddress);

  // console.log(FACTORY_INSTANCE)

  let allTokens = GLOBAL_VARIABLES.POPULAR_TOKENS;

  // console.log(allTokens)

  allTokens.push(from, to);
  allTokens = [...new Set(allTokens)];

  console.log(allTokens);

  let subgraphPromiseArr: any = [];

  for (let i = 0; i < allTokens.length - 1; i++) {
    for (let j = i + 1; j < allTokens.length; j++) {
      let data: any;
      data = getPopularPairsData(allTokens[i], allTokens[j], "0", "0");
      // console.log("MyData",i,j,data)
      subgraphPromiseArr.push(data);
      data = getPopularPairsData(allTokens[j], allTokens[i], "0", "0");
      subgraphPromiseArr.push(data);
    }
  }

  // console.log(getPopularPairsData)
  // console.log("subGraphPromiseArr",await Promise.all(subgraphPromiseArr));

  subgraphPromiseArr = await Promise.all(subgraphPromiseArr);
  subgraphPromiseArr = subgraphPromiseArr.filter(
    (d: any) => d.tokenPairs.length !== 0
  );

  console.log(subgraphPromiseArr);

  // subgraphPromiseArr =await Promise.all(subgraphPromiseArr)
  // console.log(await Promise.all(subgraphPromiseArr));

  for (const data of subgraphPromiseArr) {
    if (allEdges.length === 0) allEdges = [...data.tokenPairs];
    else allEdges = [...allEdges, ...data.tokenPairs];
  }

  // console.log(allEdges)

  allEdges = allEdges.filter(
    (allEdges: any, index: any, self: any) =>
      index === self.findIndex((t: any) => t.id === allEdges.id)
  );

  for (const iterator of allEdges) {
    allNodes.push(iterator.token0.id, iterator.token1.id);
    allNodesSymbols.push(iterator.token0.symbol, iterator.token1.symbol);
    pairs.push(iterator.id);
    pairsToken0.push(iterator.token0.id);
    pairsToken1.push(iterator.token1.id);
  }

  allNodes = [...new Set(allNodes)];
  allNodesSymbols = [...new Set(allNodesSymbols)];

  // console.log(allNodes)
  // console.log(allNodesSymbols)
  // console.log(allEdges)

  const return_paths = async (token0Sno: any, token1Sno: any) => {
    let v: any;

    let adjList: any;

    let paths: any = [];

    let pathsSymbol: any = [];

    let MAX_HOPS = 3;

    const Graph = (vertices: any) => {
      v = vertices;
      initAdjList();
    };

    const initAdjList = () => {
      adjList = new Array(v);
      for (let i = 0; i < v; i++) {
        adjList[i] = [];
      }
    };

    const addEdge = (u: any, v: any) => {
      adjList[u].push(v);
    };

    const printAllPaths = (s: any, d: any) => {
      let isVisited = new Array(v);
      for (let i = 0; i < v; i++) isVisited[i] = false;
      let pathList: any = [];
      // add source to path[]
      pathList.push(s);
      // Call recursive utility
      printAllPathsUtil(s, d, isVisited, pathList, s, d);
    };

    const printAllPathsUtil = (
      u: any,
      d: any,
      isVisited: any,
      localPathList: any,
      source: any,
      destination: any
    ) => {
      if (u === d) {
        let temp: any = [];
        let tempSymbol: any = [];
        localPathList.forEach((element: any) => {
          temp.push(allNodes[element]);
          tempSymbol.push(allNodesSymbols[element]);
        });

        if (temp.length <= MAX_HOPS) {
          paths.push(temp);
          pathsSymbol.push(tempSymbol);
        }
        return;
      }
      isVisited[u] = true;

      for (let i = 0; i < adjList[u].length; i++) {
        if (!isVisited[adjList[u][i]]) {
          // store current node
          // in path[]
          localPathList.push(adjList[u][i]);
          printAllPathsUtil(
            adjList[u][i],
            d,
            isVisited,
            localPathList,
            source,
            destination
          );

          // remove current node
          // in path[]
          localPathList.splice(localPathList.indexOf(adjList[u][i]), 1);
        }
      }

      isVisited[u] = false;
    };

    const print = (token0Sno: any, token1Sno: any) => {
      Graph(allNodes.length);

      for (let i = 0; i < allEdges.length; i++) {
        addEdge(
          allNodes.indexOf(allEdges[i].token0.id),
          allNodes.indexOf(allEdges[i].token1.id)
        );
        addEdge(
          allNodes.indexOf(allEdges[i].token1.id),
          allNodes.indexOf(allEdges[i].token0.id)
        );
      }

      printAllPaths(token0Sno, token1Sno);

      return [paths, pathsSymbol];
    };

    let [paths_, pathsSymbol_] = print(token0Sno, token1Sno);

    return [paths_, pathsSymbol_];
  };

  // console.log(return_paths); // consolelog

  const sno1 = allNodes.indexOf(from.toLowerCase());
  const sno2 = allNodes.indexOf(to.toLowerCase());

  let available_paths: any = [];
  let available_path_tokens_symbol: any = [];
  if (sno1 !== sno2 && sno1 !== -1 && sno2 !== -1) {
    [available_paths, available_path_tokens_symbol] = await return_paths(
      sno1,
      sno2
    );
  } else {
    [available_paths, available_path_tokens_symbol] = [[], []];
  }

  console.log(available_paths);

  const fromInst = new web3.eth.Contract(erc20_abi, from);
  const toInst = new web3.eth.Contract(erc20_abi, to);
  const fromDecimals = await fromInst.methods.decimals().call();
  const toDecimals = await toInst.methods.decimals().call();

  const getAmountsOut = async (paths: any, amount: any) => {
    let amounts: any = [];
    const router_inst = new web3.eth.Contract(routerABI, router_addreess);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const data: any = router_inst.methods.getAmountsOut(amount, path).call();
      amounts.push(data);
    }

    amounts = await Promise.all(amounts);

    return amounts;
  };

  const getAmountsIn = async (paths: any, amount: any) => {
    try {
      let amounts: any = [];
      const router_inst = new web3.eth.Contract(routerABI, router_addreess);
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let data: any = router_inst.methods.getAmountsIn(amount, path).call();
        amounts.push(data);
      }

      // let temp = await Promise.allSettled(amounts);
      
      let temp = await PromiseHelperAllSettled(amounts);
      
      
      
      // console.log("BEFORE_AMOUNT",amounts)
      // let temp = await Promise.all(amounts);
      
      console.log("BEFORE_AFTER",amounts)
      amounts = [];

      for (let k = 0; k < temp.length; k++) {
        let iterator = temp[k];
        if (iterator.status !== "rejected") {
          amounts.push(iterator.value);
        } else {
          amounts.push([]);
        }
      }

      return amounts;
    } catch (err) {
   console.log(err);
    }
  };

  let output_with_minimum_amount: any = [];
  let output_with_input_amount: any = [];
  const impact_minimum_amount = 0.00001;
  if (available_paths.length > 0) {
    if (flag) {
      output_with_minimum_amount = await getAmountsOut(
        available_paths,
        convertToWei(impact_minimum_amount, fromDecimals)
      );

      output_with_input_amount = await getAmountsOut(
        available_paths,
        convertToWei(amountIn, fromDecimals)
      ); //amounts =  [[1,2],[1,2,3]]
    } else {
      output_with_minimum_amount = await getAmountsIn(
        available_paths,
        convertToWei(impact_minimum_amount, toDecimals)
      );

      output_with_input_amount = await getAmountsIn(
        available_paths,
        convertToWei(amountIn, toDecimals)
      ); //amounts =  [[1,2],[1,2,3]]
      if (
        output_with_input_amount.length > 0 &&
        output_with_input_amount[0].length === 0 &&
        available_paths.length > 0
      ) {
        trade_status = TRADE_STATUS.INSUFFICIENT_RESERVES;
      }
    }
  } else {
    trade_status = TRADE_STATUS.NO_PATH;
  }

  if (trade_status !== TRADE_STATUS.SUCCESS) {
    return {
      path: available_paths.length > 0 ? available_paths[0][0] : [],
      amounts: [],
      pathPairs: [],
      symbols: [],
      priceImpact: 100,
      trade_status: trade_status,
    };
  }

  const getPairsAddressesUsingPaths = async (paths: any) => {
    let final_results: any = [];

    for (let j = 0; j < paths.length; j++) {
      let targets: any = [];
      let callDatas: any = [];
      let results: any = [];
      let ouput_format: any = [];

      for (let i = 0; i < paths[j].length - 1; i++) {
        targets.push(factoryaddress);
        const data = web3.eth.abi.encodeFunctionCall(
          FACTORY_INSTANCE.methods.getPair(paths[j][i], paths[j][i + 1])
            ._method,
          [paths[j][i], paths[j][i + 1]]
        );
        callDatas.push(data);
        ouput_format.push(
          FACTORY_INSTANCE.methods.getPair(paths[j][i], paths[j][i + 1])._method
            .outputs
        );
      }

      let aggregated_data = await mutilcall_inst.methods
        .aggregate(targets, callDatas)
        .call();

      for (let k = 0; k < paths[j].length - 1; k++) {
        results.push(
          web3.eth.abi.decodeParameters(
            ouput_format[k],
            aggregated_data[1][k]
          )[0]
        );
      }

      final_results.push(results);
    }

    return final_results;
  };

  const sortResults = (arr: any, prop: string, asc: boolean) => {
    arr.sort(function (a: any, b: any) {
      if (asc) {
        return parseFloat(a[prop]) > parseFloat(b[prop])
          ? 1
          : parseFloat(a[prop]) < parseFloat(b[prop])
          ? -1
          : 0;
      } else {
        return parseFloat(b[prop]) > parseFloat(a[prop])
          ? 1
          : parseFloat(b[prop]) < parseFloat(a[prop])
          ? -1
          : 0;
      }
    });
    return arr;
  };
  let final_trade_data: any = [];

  const impacts = async () => {
    let token0PerToken1ForMinimumImpact: any = [];
    let token0PerToken1ForCurrentImpact: any = [];

    for (let i = 0; i < available_paths.length; i++) {
      if (output_with_input_amount[i].length > 0) {
        let fees = 0;
        let input = 0;
        let output = 0;

        //SELL TAX ON INPUT AMOUNT
        input = output_with_minimum_amount[i][0]; //input
        // fees = convertToEther(total_supp_sell_fee[i][0])
        // input = input * (1 - fees)

        //BUY TAX ON OUTPUT AMOUNT
        output =
          output_with_minimum_amount[i][
            output_with_minimum_amount[i].length - 1
          ]; //output
        // fees = convertToEther(total_supp_buy_fee[i][total_supp_buy_fee[i].length - 1])
        // output = output * (1 - fees)

        const minimum_ratio: any = output > 0 ? input / output : 1e18;

        token0PerToken1ForMinimumImpact.push(minimum_ratio);

        //SELL TAX ON INPUT AMOUNT
        input = output_with_input_amount[i][0]; //input
        // fees = convertToEther(total_supp_sell_fee[i][0])
        // input = input * (1 - fees)

        //BUY TAX ON OUTPUT AMOUNT
        output =
          output_with_input_amount[i][output_with_input_amount[i].length - 1]; //output
        // fees = convertToEther(total_supp_buy_fee[i][total_supp_buy_fee[i].length - 1])
        // output = output * (1 - fees)

        const actual_ratio = output > 0 ? input / output : 1e18;

        token0PerToken1ForCurrentImpact.push(actual_ratio);
      } else {
        token0PerToken1ForMinimumImpact[i] = 0.000001;
        token0PerToken1ForCurrentImpact[i] = 1000;
      }
    }

    for (let i = 0; i < available_paths.length; i++) {
      const initial_rate = token0PerToken1ForMinimumImpact[i];
      const final_rate = token0PerToken1ForCurrentImpact[i];
      final_trade_data.push({
        path: available_paths[i],
        // pathPairs: pathsWithPairAddress[i],
        pathSymbol: available_path_tokens_symbol[i],
        amounts: output_with_input_amount[i],
        output:
          output_with_input_amount[i][output_with_input_amount[i].length - 1],
        priceImpact: ((final_rate - initial_rate) * 100) / initial_rate,
      });
    }
  };

  await impacts();

  // final_trade_data = sortResults(final_trade_data, "priceImpact", true);
  // final_trade_data = sortResults(final_trade_data, "output", false);
  final_trade_data = sortResults(final_trade_data, "output", false);

  // console.log("available_paths",available_paths)
  // console.log("pathsWithPairAddress",pathsWithPairAddress)
  // console.log("available_path_tokens_symbol",available_path_tokens_symbol)
  // console.log("output_with_minimum_amount",output_with_minimum_amount)
  // console.log("output_with_input_amount",output_with_input_amount)
  // console.log("total_supp_buy_fee",total_supp_buy_fee) //[[0],[0,0]]
  // console.log("total_supp_sell_fee",total_supp_sell_fee) //[[0],[0,0]]
  // console.log("final_trade_data",final_trade_data)

  const final_path = final_trade_data[0].path;
  const final_price_impact = final_trade_data[0].priceImpact;
  const symbols = final_trade_data[0].pathSymbol;
  const pathPairs = final_trade_data[0].pathPairs;
  const amounts = final_trade_data[0].amounts;

  const inputSymbol = symbols[0];
  const outputSymbol = symbols[symbols.length - 1];

  let maxAmount = amounts[amounts.length - 1];

  return {
    path: final_path,
    amounts: amounts,
    pathPairs: pathPairs,
    symbols: symbols,
    priceImpact: final_price_impact,
    trade_status: trade_status,
  };
};

const getPopularPairsData = async (
  token0: string,
  token1: string,
  reserve0: string,
  reserve1: string
) => {
  let tokenPairs: any = {};
  try {
    const response = await client.query({
      query: POPULAR_PAIR_FINDING_QUERY,
      variables: {
        token0: token0,
        token1: token1,
        reserve0: reserve0,
        reserve1: reserve1,
      },
    });
    if (!!response && typeof response !== "undefined") {
      tokenPairs = response.data.tokenPairs;
    }
  } catch (error) {
    console.log("error===>", error);
  }
  return { tokenPairs: tokenPairs };
};

const POPULAR_PAIR_FINDING_QUERY = gql`
  query pairsData(
    $token0: String
    $token1: String
    $reserve0: String
    $reserve1: String
  ) {
    tokenPairs: pairs(
      where: {
        token0: $token0
        token1: $token1
        reserve0_gt: $reserve0
        reserve1_gt: $reserve1
      }
    ) {
      id
      name
      reserve0
      reserve1
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
  }
`;

export const convertToWei = (data: any, decimals?: any) => {
  decimals = !!decimals ? decimals : 18;
  data = noExponents(data);
  return noExponents(parseUnits(data.toString(), decimals));
};

const noExponents = function (num: any) {
  var data = String(num).split(/[eE]/);
  if (data.length === 1) return data[0];
  var z = "",
    sign = num < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;
  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    // eslint-disable-next-line no-useless-escape
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
};

async function sampleTestFunction() {
  // RINKEBY_TESTCASE
  // let xyz = await returnOptimalTradeUsingSubraph(
  //   // SuccessulCase
  //   "0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99", // BAT
  //   "0xf9ba5210f91d0474bd1e1dcdaec4c58e359aad85", // MKR
  //   "1",
  //   true
  // );
  // console.log("------------------------------------------------");
  // console.log(xyz);

  // BSC_TESTCASE
  // let xyz = await returnOptimalTradeUsingSubraph(
  //   "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  //   "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  //   "2",
  //   true
  // );
  // console.log("------------------------------------------------");
  // console.log(xyz);

  // ARBITRUM_TESTCASE
  // let xyz = await returnOptimalTradeUsingSubraph(
  //   "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //   "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  //   "1",
  //   true
  // );
  // // console.log("------------------------------------------------");
  // console.log(xyz);

  // MUMBAI_TESTCASE(aka MUMBAI MAINNET)
  // let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
  // "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
  // "0x3813e82e6f7098b9583FC0F33a962D02018B6803", // USDT
  //   "1",
  //   true
  // );
  // // console.log("------------------------------------------------");
  // console.log(xyz);

  // // // POLYGON_TESTCASE(aka MATIC MAINNET)
  // let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
  //   "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //
  //   "0x3cef98bb43d732e2f285ee605a8158cde967d219", //
  //   "1",
  //   true
  // );

  let xyz = await returnOptimalTradeUsingSubraph(
    // CODE-------NOT WORKING
    "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
    "0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1", // DAI
    "1",
    true
  );
  // let xyz = await returnOptimalTradeUsingSubraph(
  //   // CODE-------NOT WORKING
  //   "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
  //   "0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1", // DAI
  //   "10000000",
  //   false
  // );

  // let xyz = await returnOptimalTradeUsingSubraph(
  //   // CODE-------NOT WORKING
  //     "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
  //     "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
  //   // "0x3813e82e6f7098b9583FC0F33a962D02018B6803", // USDT
  //   "0.0001",
  //   false
  // );
  //   let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
  // "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
  // "0x3845badade8e6dff049820680d1f14bd3903a5d0", // SAND
  //   "0.001",
  //   true
  // );
  //   let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
  // "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
  // "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
  //   "1",
  //   false
  // );
  /*
{
  path: [
    '0x5b67676a984807a212b1c59ebfc9b3568a474f0a',
    '0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025'
  ],
  amounts: [ '10670825876418742', '1000000000000000000' ],
  pathPairs: undefined,
  symbols: [ 'WMATIC', 'SAND' ],
  priceImpact: 0.15548900087718856,
  trade_status: 0
}

{
  path: [
    '0x5b67676a984807a212b1c59ebfc9b3568a474f0a',
    '0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025'
  ],
  amounts: [ '10670825876418742', '1000000000000000000' ],
  pathPairs: undefined,
  symbols: [ 'WMATIC', 'SAND' ],
  priceImpact: 0.15548900087718856,
  trade_status: 0
}
*/

  // let xyz = await returnOptimalTradeUsingSubraph(
  //   // SuccessulCase
  //   "0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1", // DAI
  //   "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
  //   "1",
  //   true
  // );

  // 0x5B67676a984807a212b1c59eBFc9B3568a474F0a
  //
  // console.log("------------------------------------------------");
  console.log(xyz);
}

// console.log(GLOBAL_VARIABLES)

sampleTestFunction();

// ERC20-NATIVE
//

//   let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
// "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
// "0x3845badade8e6dff049820680d1f14bd3903a5d0", // SAND
//   "0.001",
//   true
// );
//   let xyz = await returnOptimalTradeUsingSubraph( // SuccessulCase
// "0x5b67676a984807a212b1c59ebfc9b3568a474f0a", // WMATIC
// "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025", // SAND
//   "1",
//   false
// );

















const PromiseHelperAllSettled = (promises: any) => {
  return Promise.all(promises.map(function (promise: any ) {
      return promise.then(function (value : any) {
          return { state: 'fulfilled', value: value };
      }).catch(function (reason : any) {
          return { state: 'rejected', reason: reason };
      });
  }));
}







// SAND = 0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025