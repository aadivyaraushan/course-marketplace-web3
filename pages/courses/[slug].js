import CourseHero from "../../components/ui/course/hero";
import Keypoints from "../../components/ui/course/keypoint";
import Curriculum from "../../components/ui/course/lectures";
import Modal from "../../components/ui/common/modal";
import BaseLayout from "../../components/ui/layout/base";
import {getAllCourses} from "../../content/courses/fetcher";
import {useAccount, useOwnedCourse} from "../../components/web3/hooks";
import Message from "../../components/message";
import {useWeb3} from "../../components/providers/web3";

export default function Course({course}) {
    const {isLoading} = useWeb3()
    const account = useAccount();
    const ownedCourse = useOwnedCourse(course, account.data);
    const courseState = ownedCourse.data?.state;
    // const courseState = "deactivated";
    const isLocked = !courseState || courseState === "purchased" || courseState === "deactivated";

    return (
        <>

            <div className="py-4">
                <CourseHero
                    title={course.title}
                    description={course.description}
                    image={course.coverImage}
                    hasOwner={!!ownedCourse.data}
                />
            </div>
            {courseState &&
                <div className="max-w-5xl mx-auto">
                    {courseState === "purchased" &&
                        <Message type="lightBlue">
                            Course is awaiting activation. Process can take up to 24 hours.
                            <i className="block font-normal">In case of any difficulties, contact test2@gmail.com</i>
                        </Message>
                    }
                    {courseState === "activated" &&
                        <Message type="success">
                            Course is activated. Happy learning!
                            <i className="block font-normal">In case of any difficulties, contact test2@gmail.com</i>
                        </Message>
                    }
                    {courseState === "deactivated" &&
                        <Message type="failure">
                            Course has been deactivated due to incorrect purchase data.
                            <i className="block font-normal">Please contact test2@gmail.com for more details</i>
                        </Message>
                    }
                </div>
            }
            <Keypoints points={course.wsl}/>
            <Curriculum locked={isLocked} courseState={courseState} isLoading={isLoading}/>
            <Modal/>

        </>
    );
}
Course.Layout = BaseLayout;

export async function getStaticPaths() {
    const {data} = getAllCourses();

    return {
        paths: data.map((course) => ({
            params: {
                slug: course.slug,
            },
        })),
        fallback: false,
    };
}

export function getStaticProps({params}) {
    // console.log(params);
    const {data} = getAllCourses();
    const course = data.filter((course) => course.slug === params.slug)[0];
    // console.log(course);
    return {
        props: {
            course,
        },
    };
}
