import detectEthereumProvider from "@metamask/detect-provider";
import {createContext, useContext, useEffect, useMemo, useState} from "react";
import {setupHooks} from "../hooks/setupHooks";
import Web3 from "web3";
import {loadContract} from "../../../public/utils/loadContract";

const Web3Context = createContext(null);

const createWeb3State = (web3, provider, contract, isLoading) => ({
    web3,
    provider,
    contract,
    isLoading,
    hooks: setupHooks(web3, provider, contract)
})

const setListeners = (provider) => {
    provider.on("chainChanged", () => window.location.reload())
}

export default function Web3Provider({children}) {
    const [web3Api, setWeb3Api] = useState(createWeb3State(null, null, null, true));

    useEffect(() => {
        const loadProvider = async () => {
            const provider = await detectEthereumProvider();

            if (provider) {
                const web3 = new Web3(provider);
                const contract = await loadContract("CourseMarketplace", web3);
                setWeb3Api(createWeb3State(web3, provider, contract, false));
                setListeners(provider);
            } else {
                setWeb3Api((api) => ({
                    ...api,
                    isLoading: false,
                }));
                console.error("MetaMask isn't installed");
            }
        };

        loadProvider();
    }, []);

    const memoWeb3Api = useMemo(() => {
        return {
            ...web3Api,
            requireInstall: !web3Api.isLoading && !web3Api.web3,
            connect: web3Api.provider
                ? async () => {
                    try {
                        await web3Api.provider.request({method: "eth_requestAccounts"});
                        await setWeb3Api({
                            ...web3Api,
                        });
                    } catch {
                        console.error("Cannot retreive account");
                        location.reload();
                    }
                }
                : () => {
                    console.log("Cannot connect to MetaMask");
                },
        };
    }, [web3Api]);

    return (
        <Web3Context.Provider value={memoWeb3Api}>{children}</Web3Context.Provider>
    );
}

export function useWeb3() {
    return useContext(Web3Context);
}

export function useHooks(callback) {
    const {hooks} = useWeb3();
    return callback(hooks);
}