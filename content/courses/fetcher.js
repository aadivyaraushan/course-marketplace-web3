import courses from "./index.json";

export const getAllCourses = () => {
  return {
    data: courses,
    courseMap: courses.reduce((accumulation, course, index) => {
      // console.log("Course: ", course);
      accumulation[course.id] = course;
      accumulation[course.id].index = index;
      return accumulation;
    }, {}),
  };
};
