import {useHooks, useWeb3} from "../../providers/web3/index";
import {useEffect} from "react";
import {useRouter} from "next/router";

const isEmpty = data => {
    return (
        data === null ||
        data === undefined ||
        data === "" ||
        (Array.isArray(data) && data.length === 0) ||
        (data.constructor === Object && Object.keys(data).length === 0)
    )
}

const enhanceHook = (swrResponse) => {

    const hasInitialResponse = !!(swrResponse.data || swrResponse.error)
    const isResponseEmpty = hasInitialResponse && isEmpty(swrResponse.data)

    return {
        ...swrResponse,
        hasInitialResponse,
        isResponseEmpty
    };
};

export const useNetwork = () => {
    return enhanceHook(useHooks((hooks) => hooks.useNetwork)());
    // return {
    //   network: swrRes,
    // };
};
export const useAccount = () => {
    return enhanceHook(useHooks((hooks) => hooks.useAccount)());
    // return {
    //   account: swrRes,
    // };
};

export const useAdmin = (redirectTo) => {
    const account = useAccount();
    const router = useRouter();
    const {requireInstall} = useWeb3();
    useEffect(() => {
        if ((requireInstall || account.hasInitialResponse && !account.isAdmin)) {
            router.push(redirectTo);
        }
    }, [account]);
    return account;
}

export const useWalletInfo = () => {
    const account = useAccount();
    const network = useNetwork();

    const isConnecting = !account.hasInitialResponse && !network.hasInitialResponse;

    return {
        account,
        network,
        hasConnectedWallet: !!(account.data && network.isSupported),
        isConnecting
    };
};

export const useOwnedCourses = (courses, account) => {
    return enhanceHook(useHooks((hooks) => hooks.useOwnedCourses)(courses, account));
}

export const useOwnedCourse = (course, account) => {
    return enhanceHook(useHooks((hooks) => hooks.useOwnedCourse)(course, account));
}

export const useManagedCourses = (...args) => {
    const swrRes = enhanceHook(useHooks((hooks) => hooks.useManagedCourses)(...args));

    return {
        managedCourses: swrRes
    }
}