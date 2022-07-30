import useSWR from "swr";

export const COURSE_PRICE = 15;

export const useEthPrice = () => {
    const {data} = useSWR(
        "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false",
        async (url) => {
            const res = await fetch(url);
            const json = await res.json();
            return json["market_data"]["current_price"]["usd"] ?? null;
        },
        {refreshInterval: 60000}
    );

    const perItem = (data && (COURSE_PRICE / Number(data)).toFixed(4)) ?? null;
    // HOW THIS FORMULA?
    // 1501.95 dollars:1 ETH::15 dollars:x ETH
    // x = 15/1501.95
    // x = COURSE_PRICE/data

    return {ethPrice: data, ethPerItem: perItem};
};
