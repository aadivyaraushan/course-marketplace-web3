import {handler as createUseAccount} from "./handlerAccounts";
import {handler as createUseNetwork} from "./handlerNetwork";
import {handler as createUseOwnedCourses} from "./handlerOwnedCourses"
import {handler as createUseOwnedCourse} from "./handlerOwnedCourse"
import {handler as createUseManagedCourses} from "./handlerManagedCourses"

export const setupHooks = (web3, provider, contract) => {
    return {
        useAccount: createUseAccount(web3, provider),
        useNetwork: createUseNetwork(web3),
        useOwnedCourses: createUseOwnedCourses(web3, contract),
        useOwnedCourse: createUseOwnedCourse(web3, contract),
        useManagedCourses: createUseManagedCourses(web3, contract),
    };
};
