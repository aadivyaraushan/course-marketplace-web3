import useSWR from "swr";
import { normaliseOwnedCourse } from "../../../public/utils/normalise";
import { createCourseHash } from "../../../public/utils/hash";

export const handler = (web3, contract) => (courses, account) => {
  const swrRes = useSWR(
    () => (web3 && account && contract ? `web3/ownedCourses/${account}` : null),
    async () => {
      const ownedCourses = [];
      // console.log(courses, account);
      console.log("courses: ", courses);

      courses.map(async (course, index) => {
        if (course.id) {
          const courseHash = createCourseHash(web3, course.id, account);

          const ownedCourse = await contract.methods
            .getCourseByHash(courseHash)
            .call();
          // use call for no-gas actions
          // use send for gas actions

          if (
            ownedCourse.owner !== "0x0000000000000000000000000000000000000000"
          ) {
            const normalised = normaliseOwnedCourse(web3, course, ownedCourse);
            ownedCourses.push(normalised);
          }
        }
      });
      return ownedCourses;
      //   for (let i = 0; i < courses.length; i++) {
      //     const course = courses[i];

      //     if (!course.id) {
      //       continue;
      //     }

      //     const courseHash = createCourseHash(web3)(course.id, account);
      //     const ownedCourse = await contract.methods
      //       .getCourseByHash(courseHash)
      //       .call();

      //     if (
      //       ownedCourse.owner !== "0x0000000000000000000000000000000000000000"
      //     ) {
      //       const normalized = normaliseOwnedCourse(web3)(course, ownedCourse);
      //       ownedCourses.push(normalized);
      //     }
      //   }
    }
  );

  return {
    ...swrRes,
    lookup:
      swrRes.data?.reduce((accumulator, current, index) => {
        accumulator[current.id] = current;
        return accumulator;
      }, {}) ?? {},
  };
};
