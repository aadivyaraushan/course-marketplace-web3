import MarketHeader from "../../../components/ui/marketplace/header";
import OwnedCourseCard from "../../../components/ui/course/card/OwnedCourseCard";
import BaseLayout from "../../../components/ui/layout/base/";
import Button from "../../../components/ui/common/button";
import { useOwnedCourses, useWalletInfo } from "../../../components/web3/hooks";
import { getAllCourses } from "../../../content/courses/fetcher";
import { useRouter } from "next/router";
import Message from "../../../components/message";
import Link from "next/link";
import { useState } from "react";
import { useWeb3 } from "../../../components/providers/web3";

const OwnedCourses = ({ courses }) => {
  const router = useRouter();
  const { requireInstall } = useWeb3();
  const { account } = useWalletInfo();
  const ownedCourses = useOwnedCourses(courses, account.data);
  const [ownedCoursesCard, setOwnedCoursesCard] = useState(<></>);

  // useEffect(() => {
  //     if (ownedCourses.isResponseEmpty) {
  //         setOwnedCoursesCard(
  //             <div>
  //                 <Message type="failure">
  //                     <div>You don't own any courses.</div>
  //                     <Link href="/marketplace">
  //                         <a className="font-normal hover:underline">
  //                             <i>Purchase a course</i>
  //                         </a>
  //                     </Link>
  //                 </Message>
  //             </div>
  //         )
  //     } else {
  //         setOwnedCoursesCard(
  //             <>
  //                 {
  //                     ownedCourses.data?.map((course, index) => (
  //                         <OwnedCourseCard course={course} key={index}>
  //                             <Button onClick={() => {
  //                                 router.push(`/courses/${course.slug}`);
  //                             }}>
  //                                 Watch the course
  //                             </Button>
  //                         </OwnedCourseCard>
  //                     ))
  //                 }
  //             </>
  //         )
  //     }
  // }, [ownedCourses])

  return (
    <>
      <MarketHeader />
      <section>
        {account.isResponseEmpty && (
          <div>
            <Message type="failure">
              <div>Please connect to MetaMask.</div>
            </Message>
          </div>
        )}
        {ownedCourses.isResponseEmpty && (
          <div>
            <Message type="warning">
              <div>You don't own any courses.</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase a course</i>
                </a>
              </Link>
            </Message>
          </div>
        )}
        {ownedCourses.data?.map((course, index) => (
          <OwnedCourseCard course={course} key={index}>
            <Button
              onClick={() => {
                router.push(`/courses/${course.slug}`);
              }}
            >
              Watch the course
            </Button>
          </OwnedCourseCard>
        ))}
      </section>
    </>
  );
};

export function getStaticProps() {
  const { data } = getAllCourses();
  return {
    props: {
      courses: data,
    },
  };
}

export default OwnedCourses;

OwnedCourses.Layout = BaseLayout;
