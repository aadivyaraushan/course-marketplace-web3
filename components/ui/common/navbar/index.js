import {useEffect, useState} from "react";
import {useWeb3} from "../../../providers/web3";
import Button from "../button/";
import {useAccount} from "../../../web3/hooks/index";
import {useRouter} from "next/router";
import ActiveLink from "../activelink/index";

const Navbar = () => {
    const {connect, isLoading, requireInstall} = useWeb3();
    const account = useAccount();
    const {pathname} = useRouter();

    const [topButton, setTopButton] = useState(<></>);

    useEffect(() => {
        if (isLoading) {
            setTopButton(<Button disabled={true} className="xs:px-2 py:0.75 md:px-8 py:2">Loading...</Button>);
        } else {
            if (!requireInstall) {
                setTopButton(<Button onClick={connect} className="xs:px-2 py:0.75 md:px-8 py:2">Connect</Button>);
                if (account.data) {
                    setTopButton(
                        <Button hoverable={false} className="cursor-default xs:px-2 py:0.75 md:px-8 py:2">
                            Welcome {account.isAdmin && "admin"}
                        </Button>
                    );
                }
            } else {
                setTopButton(
                    <Button
                        target="_blank"
                        onClick={() => {
                            window.open("https://metamask.io", "_blank");
                        }} className="xs:px-2 py:0.75 md:px-8 py:2"
                    >
                        Install MetaMask
                    </Button>
                );
            }
        }
    }, [isLoading, account.isAdmin, account.data]);

    return (
        <section>
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
                <nav className="relative" aria-label="Global">
                    <div className="flex justify-between text-center items-center">
                        <div>
                            <ActiveLink href="/">
                                <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                                    Home
                                </a>
                            </ActiveLink>
                            <ActiveLink href="/marketplace">
                                <a
                                    href="#"
                                    className="font-medium mr-8 text-gray-500 hover:text-gray-900"
                                >
                                    Marketplace
                                </a>
                            </ActiveLink>
                            <ActiveLink href="/blogs">
                                <a
                                    href="#"
                                    className="font-medium mr-8 text-gray-500 hover:text-gray-900"
                                >
                                    Blogs
                                </a>
                            </ActiveLink>
                            <ActiveLink href="/wishlist">
                                <a
                                    href="#"
                                    className="font-medium text-gray-500 hover:text-gray-900"
                                >
                                    Wishlist
                                </a>
                            </ActiveLink>
                        </div>
                        <div>{topButton}</div>
                    </div>
                </nav>
            </div>
            {account.data && !pathname.includes("/marketplace") && (
                <div className="flex justify-end sm:px-6 lg:px-8">
                    <div className="text-white bg-indigo-600 rounded-md p-2 text-sm mt-1">
                        {account.data}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Navbar;
