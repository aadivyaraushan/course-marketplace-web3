import WalletBar from "../../web3/walletbar";
import EthRates from "../../web3/ethRates";
import BreadCrumbs from "../../common/breadcrumbs";
import {useAccount} from "../../../web3/hooks";

const LINKS = [
    {
        href: "/marketplace",
        value: "Buy",
    },
    {
        href: "/marketplace/courses/owned",
        value: "My Courses",
    },
    {
        href: "/marketplace/courses/manage",
        value: "Manage Courses",
        requireAdmin: true
    }
]

const MarketplaceHeader = () => {
    const account = useAccount();

    return (
        <>
            <div className="pt-4">
                <WalletBar/>
            </div>
            <EthRates/>
            <div className="pt-4 flex flex-row-reverse ">
                <BreadCrumbs items={LINKS} isAdmin={account.isAdmin}/>
            </div>
        </>
    );
};

export default MarketplaceHeader;
