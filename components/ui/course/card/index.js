import Image from "next/image";
import Link from "next/link";
import {AnimateKeyframes} from "react-simple-animate";

const CourseCard = ({course, isImageGrayscale, Footer, state}) => {
    return (
        <div
            key={course.id}
            className="bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl"
        >
            <div className="flex h-full">
                <div className="flex-1 h-full next-image-wrapper">
                    <Image
                        className={`object-cover ${isImageGrayscale && "filter grayscale"}`}
                        layout="responsive"
                        width="200"
                        height="280"
                        src={course.coverImage}
                        alt={course.title}
                    />
                </div>
                <div className="p-8 pb-4 flex-2">
                    <div className="flex items-center">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                            {course.type}
                        </div>
                        {state === "activated" &&
                            <div
                                className="rounded-full bg-green-200 text-green-800 p-2 text-xs  ml-2">Activated!</div>
                        }
                        {state === "deactivated" &&
                            <div
                                className="rounded-full bg-red-200 text-red-800 p-2 text-xs  ml-2">Deactivated!</div>
                        }
                        {state === "purchased" &&
                            <AnimateKeyframes
                                play
                                duration={2.5}
                                keyframes={["opacity: 0.2", "opacity: 1", "opacity: 0.2"]}
                                iterationCount="infinite"
                            >
                                <div className="rounded-full bg-yellow-200 text-yellow-800 p-2 text-xs  ml-2">
                                    Awaiting activation
                                </div>
                            </AnimateKeyframes>
                        }
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                        <a
                            target="_blank"
                            className="block mt-1 text-lg leading-tight font-medium text-black hover:underline lg:h-12 md:h-12 sm:h-20"
                        >
                            {course.title}
                        </a>
                    </Link>
                    <p className="mt-2 text-gray-500 md:h-20 lg:h-20  xs:h-40">{course.description}</p>
                    {Footer != null && <>
                        <div className="mt-3">
                            <Footer/>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
