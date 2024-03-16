import { Provider } from "../config/constants";
import ContractAddress from "../config/contracts";
import TokenConfigModel from "../models/token-config";
import { ERC20__factory, Multicall__factory } from "../typechain-types";

const ERC20Interface = ERC20__factory.createInterface();

export async function addTokensToTokenConfigs(tokens: string[]) {
    const tokensToFetch = []
    for (let token of tokens) {
        const model = await TokenConfigModel.findOne({ address: token.toLowerCase() })
        if (!model) {
            tokensToFetch.push(token)
        }
    }

    if (tokensToFetch.length === 0) return;

    const multicall = Multicall__factory.connect(ContractAddress.Multicall, Provider);
    let calls: {
        target: string,
        allowFailure: boolean,
        callData: string
    }[] = [];

    for (let token of tokensToFetch) {
        const nameCall = {
            target: token,
            allowFailure: true,
            callData: ERC20Interface.encodeFunctionData("name")
        }
        const symbolCall = {
            target: token,
            allowFailure: true,
            callData: ERC20Interface.encodeFunctionData("symbol")
        }
        const decimalsCall = {
            target: token,
            allowFailure: true,
            callData: ERC20Interface.encodeFunctionData("decimals")
        }

        calls = [...calls, nameCall, symbolCall, decimalsCall]
    }
    const results = await multicall.callStatic.aggregate3(calls);

    for (let i = 0; i < tokensToFetch.length; i++) {
        const returnData = results.slice(3 * i, 3 * i + 3).map(res => res.returnData);
        if (returnData[0] === '0x') continue;

        const name = ERC20Interface.decodeFunctionResult("name", returnData[0])[0];
        const symbol = ERC20Interface.decodeFunctionResult("symbol", returnData[1])[0];
        const decimals = parseInt(ERC20Interface.decodeFunctionResult("decimals", returnData[2])[0]);
        const newModel = new TokenConfigModel({ address: tokensToFetch[i].toLowerCase(), name, symbol, decimals });
        await newModel.save()
    }
}