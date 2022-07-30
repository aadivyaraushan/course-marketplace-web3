import MarketHeader from "../../../components/ui/marketplace/header";
import BaseLayout from "../../../components/ui/layout/base/";
import CourseFilter from "../../../components/ui/course/filter";
import { getAllCourses } from "../../../content/courses/fetcher";
import { useAdmin, useManagedCourses } from "../../../components/web3/hooks";
import ManagedCourseCard from "../../../components/ui/course/card/ManagedCourseCard";
import Button from "../../../components/ui/common/button";
import { useState } from "react";
import { useWeb3 } from "../../../components/providers/web3";
import Message from "../../../components/message";
import { normaliseOwnedCourse } from "../../../public/utils/normalise";
import { withToast } from "../../../public/utils/toast.js";
import { useEffect } from "react";

const VerificationInput = ({ onVerify }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        type="text"
        name="account"
        id="account"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500"
      />
      <Button onClick={() => onVerify(email)}>Verify</Button>
    </div>
  );
};

const ManageCourses = () => {
  const [provedOwnership, setProvedOwnership] = useState({});
  const [searchedCourse, setSearchedCourse] = useState(null);
  const [filter, setFilter] = useState("all");
  const account = useAdmin("/marketplace");
  const { managedCourses } = useManagedCourses(account);
  const { web3, contract } = useWeb3();

  const verifyCourse = (email, hash, proof) => {
    console.log(email, hash, proof);
    // if (!!email) return;
    const emailHash = web3.utils.sha3(email);
    const constructedProof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    );
    proof === constructedProof
      ? setProvedOwnership({
          ...provedOwnership,
          [hash]: true,
        })
      : setProvedOwnership({
          ...provedOwnership,
          [hash]: false,
        });
  };

  const changeCourseState = async (courseHash, method) => {
    try {
      const result = await contract.methods[method](courseHash).send({
        from: account.data,
      });
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const searchCourse = async (courseHash) => {
    const re = /[\dA-Fa-f]{6}/g;
    if (courseHash && courseHash.length === 66 && re.test(courseHash)) {
      const course = await contract.methods.getCourseByHash(courseHash).call();

      if (course.owner !== "0x0000000000000000000000000000000000000000") {
        const normalised = normaliseOwnedCourse(web3, { courseHash }, course);
        setSearchedCourse(normalised);
        console.log(normalised);
        return;
      }
    }

    setSearchedCourse(null);
  };

  const renderCard = (course) => {
    return (
      <ManagedCourseCard course={course} key={course.ownedCourseId}>
        <VerificationInput
          onVerify={(email) => verifyCourse(email, course.hash, course.proof)}
        />
        {provedOwnership[course.hash] === true && (
          <div className="mt-3">
            <Message>Verified!</Message>
          </div>
        )}
        {provedOwnership[course.hash] === false && (
          <div className="mt-3">
            <Message type="failure">Wrong proof</Message>
          </div>
        )}
        {course.state === "purchased" && (
          <div className="mt-3">
            <Button
              onClick={() =>
                withToast(changeCourseState(course.hash, "activateCourse"))
              }
              className="mr-3"
              variant="green"
            >
              ✓️
            </Button>
            <Button
              variant="red"
              onClick={() =>
                withToast(changeCourseState(course.hash, "deactivateCourse"))
              }
            >
              ✕
            </Button>
          </div>
        )}
      </ManagedCourseCard>
    );
  };

  if (!account.isAdmin) {
    return null;
  }

  const filteredCourses = managedCourses.data
    ?.filter((value) => filter === "all" || value.state === filter)
    ?.map((course) => renderCard(course));

  return (
    <>
      <MarketHeader />
      <CourseFilter
        onSearchSubmit={searchCourse}
        onFilterSelected={(value) => setFilter(value)}
      />
      <section className="grid grid-cols-1">
        {searchedCourse ? renderCard(searchedCourse) : filteredCourses}
        {filteredCourses?.length === 0 && (
          <Message type="lightBlue">No {filter} courses to display</Message>
        )}
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

export default ManageCourses;

ManageCourses.Layout = BaseLayout;
