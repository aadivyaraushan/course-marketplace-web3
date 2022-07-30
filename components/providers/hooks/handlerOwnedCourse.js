import useSWR from "swr";
import {normaliseOwnedCourse} from "../../../public/utils/normalise";
import {createCourseHash} from "../../../public/utils/hash";


export const handler = (web3, contract) => (course, account) => {
    return useSWR(() => (web3 && account && contract) ? `web3/ownedCourse/${account}` : null, async () => {
        const courseHash = createCourseHash(web3, course.id, account)
        const ownedCourse = await contract.methods.getCourseByHash(courseHash).call();
        // use call for no-gas actions
        // use send for gas actions
        return ownedCourse.owner === "0x0000000000000000000000000000000000000000" ? null : normaliseOwnedCourse(web3, course, ownedCourse);
    });
}