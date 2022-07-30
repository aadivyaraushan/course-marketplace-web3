import { useState } from "react";
import Button from "../../components/ui/common/button";
import CourseCard from "../../components/ui/course/card";
import CourseList from "../../components/ui/course/list";
import BaseLayout from "../../components/ui/layout/base";
import { useOwnedCourses, useWalletInfo } from "../../components/web3/hooks/";
import { getAllCourses } from "../../content/courses/fetcher";
import OrderModal from "../../components/ui/common/modal/order";
import MarketplaceHeader from "../../components/ui/marketplace/header";
import { useWeb3 } from "../../components/providers/web3";
import { toast } from "react-toastify";
import { withToast } from "../../public/utils/toast";
import styles from "./marketplace.module.css";

export default function Marketplace({ courses }) {
  const { web3, contract, requireInstall } = useWeb3();
  const { hasConnectedWallet, account, isConnecting } = useWalletInfo();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isNewPurchase, setIsNewPurchase] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const ownedCourses = useOwnedCourses(courses, account.data);

  const _purchaseCourse = async (order, course) => {
    const hexCourseId = web3.utils.utf8ToHex(course.id);
    const priceInWei = web3.utils.toWei(String(order.price));
    const courseHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data }
    );
    setProcessingId(course.id);
    if (isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);

      const proof = web3.utils.soliditySha3(
        { type: "bytes32", value: emailHash },
        { type: "bytes32", value: courseHash }
      );
      withToast(purchaseCourse(hexCourseId, proof, priceInWei, course));
    } else {
      withToast(repurchaseCourse(courseHash, priceInWei, course));
    }
  };

  const purchaseCourse = async (hexCourseId, proof, priceInWei, course) => {
    try {
      const result = await contract.methods
        .purchaseCourse(hexCourseId, proof)
        .send({
          from: account.data,
          value: priceInWei,
        });
      ownedCourses.mutate([
        ...ownedCourses.data,
        {
          ...course,
          proof,
          state: "purchased",
          owner: account.data,
          price: priceInWei,
        },
      ]);
      return result;
    } catch (e) {
      throw new Error(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const repurchaseCourse = async (courseHash, priceInWei, course) => {
    try {
      const result = await contract.methods.repurchaseCourse(courseHash).send({
        from: account.data,
        value: priceInWei,
      });
      const index = ownedCourses.data.findIndex(
        (value, index) => value.id === course.id
      );
      if (index >= 0) {
        ownedCourses.data[index].state = "purchased";
        ownedCourses.mutate(ownedCourses.data);
      } else {
        ownedCourses.mutate();
      }
      return result;
    } catch (e) {
      throw new Error(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const cleanupModal = () => {
    setSelectedCourse(null);
    setIsNewPurchase(true);
  };

  // const getCourseState = async (courseId) => {
  //     // 1. Construct course hash
  //     const courseHash = createCourseHash(web3, courseId, account.data);
  //
  //     // 2. Get course object using course hash
  //     const course = await contract.methods.getCourseByHash(courseHash).call()
  //
  //
  //
  // }

  return (
    <>
      <MarketplaceHeader />
      <CourseList courses={courses}>
        {(course) => {
          console.log("owned courses: ", ownedCourses);
          console.log("course id", course.id);
          const owned = ownedCourses.data?.find(
            (value) => value.id === course.id
          );
          return (
            <CourseCard
              key={course.id}
              course={course}
              isImageGrayscale={!hasConnectedWallet}
              state={owned?.state}
              Footer={() => {
                console.log("requireInstall: ", requireInstall);
                console.log("hasConnectedWallet: ", hasConnectedWallet);
                console.log("isConnecting: ", isConnecting);
                console.log(
                  "hasInitialResponse: ",
                  ownedCourses.hasInitialResponse
                );
                console.log("account: ", account);
                console.log("ownedCourses:", ownedCourses);
                console.log("owned:", owned);
                if (requireInstall) {
                  return <Button disabled={true}>Install</Button>;
                }

                if (!hasConnectedWallet) {
                  return <Button disabled={true}>Connect</Button>;
                }

                if (isConnecting) {
                  return (
                    <Button disabled={true} className={`${styles.loading}`}>
                      Loading
                    </Button>
                  );
                }

                if (!ownedCourses.hasInitialResponse) {
                  return (
                    <Button disabled={true} className={`${styles.loading}`}>
                      Loading
                    </Button>
                  );
                }
                // const state = getCourseState(course.id);
                // console.log(state);
                const isProcessing = processingId === course.id;

                // return (
                //   <>
                //     <div>
                //       <div className="mb-2">
                //         <Button
                //           onClick={() => setSelectedCourse(course)}
                //           disabled={
                //             !hasConnectedWallet || owned || isProcessing
                //           }
                //           variant={owned ? "green" : "purple"}
                //           size="md"
                //         >
                //           {isProcessing ? (
                //             <p className={`${styles.loading}`}>
                //               Processing transaction
                //             </p>
                //           ) : owned ? (
                //             "Purchased"
                //           ) : (
                //             "Purchase"
                //           )}
                //         </Button>
                //       </div>
                //       {owned?.state === "deactivated" && (
                //         <Button
                //           onClick={() => {
                //             setIsNewPurchase(false);
                //             setSelectedCourse(course);
                //           }}
                //           disabled={false}
                //           variant={"purple"}
                //         >
                //           Fund to reactivate
                //         </Button>
                //       )}
                //     </div>
                //   </>
                // );
                console.log("owned: ", owned);
                if (owned) {
                  return (
                    <>
                      <Button disabled={true}>Purchased</Button>
                      {owned?.state === "deactivated" && (
                        <div>
                          <Button
                            onClick={() => {
                              setIsNewPurchase(false);
                              setSelectedCourse(course);
                            }}
                            disabled={isProcessing}
                            variant={"purple"}
                            className="mt-1"
                          >
                            Fund to reactivate
                          </Button>
                        </div>
                      )}
                    </>
                  );
                }

                return (
                  <Button
                    onClick={() => setSelectedCourse(course)}
                    disabled={!hasConnectedWallet || isProcessing}
                  >
                    {isProcessing ? (
                      <p className="loading">Processing...</p>
                    ) : (
                      <div>Purchase</div>
                    )}
                  </Button>
                );
              }}
            />
          );
        }}
      </CourseList>
      {selectedCourse && (
        <OrderModal
          isNewPurchase={isNewPurchase}
          course={selectedCourse}
          onSubmit={(formData, course) => {
            _purchaseCourse(formData, course);
            cleanupModal();
          }}
          onClose={cleanupModal}
        />
      )}
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

Marketplace.Layout = BaseLayout;
