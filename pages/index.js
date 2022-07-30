import Hero from "../components/ui/common/hero/index";
import CourseList from "../components/ui/course/list";
import BaseLayout from "../components/ui/layout/base";
import { getAllCourses } from "../content/courses/fetcher";
import CourseCard from "../components/ui/course/card";

export default function Home({ courses }) {
  return (
    <>
      <Hero />
      <CourseList courses={courses}>
        {(course) => <CourseCard key={course.id} course={course} />}
      </CourseList>
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllCourses();
  return {
    props: {
      courses: data,
    },
  };
}

Home.Layout = BaseLayout;
