import {COURSE_PRICE, useEthPrice} from "../../../hooks/useEthPrice";
import Image from "next/image";
import Loader from "../../common/loader";

const EthRates = () => {
    const {ethPrice, ethPerItem} = useEthPrice();

    return (
        <div className="flex text-center justify-center lg:flex-row sm:flex-col md:flex-col xs:flex-col">
            <div className="p-10 border drop-shadow rounded-md">
                <div className="flex items-center justify-center">
                    {ethPrice ? (
                        <>
                            <Image
                                layout="fixed"
                                height="35"
                                width="35"
                                src="/small-eth.webp"
                            />
                            <span className="text-2xl font-bold">= ${ethPrice}</span>
                        </>) : (
                        <div className="flex w-full justify-center">
                            <Loader/>
                        </div>
                    )
                    }
                </div>
                <p className="text-xl text-gray-500">Current eth Price</p>
            </div>
            <div className="p-10 border drop-shadow rounded-md ml-5">
                <div className="flex items-center justify-center">
                    {ethPerItem ? (
                            <>
                                <span className="text-2xl font-bold">{ethPerItem}</span>
                                <Image
                                    layout="fixed"
                                    height="35"
                                    width="35"
                                    src="/small-eth.webp"
                                />
                                <span className="text-2xl font-bold">= ${COURSE_PRICE}</span>
                            </>
                        ) :
                        (
                            <div className="flex w-full justify-center">
                                <Loader/>
                            </div>
                        )
                    }
                </div>
                <p className="text-xl text-gray-500">Price per course</p>
            </div>
        </div>
    );
};

export default EthRates;
