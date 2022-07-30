import Footer from "../../common/footer";
import Navbar from "../../common/navbar";
import Web3Provider from "../../../providers/web3";
// import Script from "next/script";

const BaseLayout = (props) => {
    return (
        <>
            {/* since you have to wait for this script to load before you render anything, the rendering of your page
            may be delayed*/}
            {/*<Script src={"/js/truffle-contract.js"} strategy={"beforeInteractive"}/>*/}
            <Web3Provider>
                <div className=" max-w-7xl mx-auto px-4">
                    <Navbar/>
                    <div className="fit">{props.children}</div>
                </div>
                <Footer/>
            </Web3Provider>
        </>
    );
};

export default BaseLayout;
