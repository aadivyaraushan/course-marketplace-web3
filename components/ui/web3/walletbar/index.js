import {useWeb3} from "../../../providers/web3/index";
import {useWalletInfo} from "../../../web3/hooks/index";
import Button from "../../common/button";

const WalletBar = () => {
    const {requireInstall} = useWeb3();
    const {account, network, hasConnectedWallet} = useWalletInfo();

    return (
        <section className="text-white bg-indigo-600 rounded-lg my-2">
            <div className="p-8">
                <h1 className="text-xl xs:text-2xl break-words">Hello {account.data}</h1>
                <h2 className="subtitle mb-5 text-lg">
                    Welcome back!
                </h2>
                <div className="flex justify-between items-center">
                    <div className="sm:flex sm:justify-center lg:justify-start">
                        <div className="rounded-md shadow">
                            {/*<a*/}
                            {/*    href="#"*/}
                            {/*    className="w-full flex items-center justify-center lg:px-8 lg:py-3 xs:px-4 xs:py-1 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"*/}
                            {/*>*/}
                            {/*    Learn how to purchase*/}
                            {/*</a>*/}
                            <Button variant="white"
                                    className="mr-10 lg:text-base md:text-base xs:text-lg xs:py-0.75 xs:px-2 md:py-3 md:px-8">
                                Learn how to purchase
                            </Button>
                        </div>
                    </div>
                    <div>
                        <div>
                            {!network.isSupported && network.hasInitialResponse && (
                                <div className=" bg-red-600 p-4 rounded-lg">
                                    <div>You are connected to the wrong network</div>
                                    <div>
                                        Please connect to{" "}
                                        <strong>{`${network.targetNetwork}`}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                        {requireInstall && (
                            <div className="bg-yellow-500 p-4 rounded-lg">
                                Cannot connect to network. Please install MetaMask.
                            </div>
                        )}
                        {network.data &&
                            network.isSupported &&
                            network.hasInitialResponse &&
                            account.data && (
                                <div>
                                    <span>Currently on </span>
                                    <strong className="text-2xl">{network.data}</strong>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WalletBar;
