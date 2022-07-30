import useSWR from "swr";
import {normaliseOwnedCourse} from "../../../public/utils/normalise";


export const handler = (web3, contract) => (account) => {
    return useSWR(() => (web3 && account.data && contract && account.isAdmin) ? `web3/manageCourses/${account.data}` : null,
        async () => {
            const courses = [];
            const courseCount = await contract.methods.getCourseCount().call();
            for (let i = Number(courseCount) - 1; i >= 0; i--) {
                const courseHash = await contract.methods.getCourseHash(i).call();
                const course = await contract.methods.getCourseByHash(courseHash).call();

                if (course) courses.push(normaliseOwnedCourse(web3, {hash: courseHash}, course))
            }
            return courses;
        });
}