import useSWR from "swr";

const NETWORKS = {
    1: "Ethereum Main Network",
    3: "Ropsten Test Network",
    4: "Rinkeby Test Network",
    5: "Goerli Test Network",
    42: "Kovan Test Network",
    56: "Binance Smart Chain",
    1337: "Ganache",
    137: "Polygon Main Network",
};

const targetNetwork = NETWORKS[process.env.NEXT_PUBLIC_TARGET_CHAIN_ID];
export const handler = (web3) => () => {
    const {data, error, isValidating} = useSWR(
        web3 ? "web3/network" : null,
        async () => {
            const id = await web3.eth.getChainId();
            if (!id) {
                throw new Error("Cannot retrieve the network.")
            }
            return NETWORKS[id];
        }
    );

    return {
        data,
        targetNetwork,
        isSupported: data === targetNetwork,
        isValidating,
        error,
    };
};
