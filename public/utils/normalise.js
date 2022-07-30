export const normaliseOwnedCourse = (web3, course, ownedCourse) => {
    const COURSE_STATES = {
        "0": "purchased",
        "1": "activated",
        "2": "deactivated"
    }

    return {
        ...course,
        ownedCourseId: ownedCourse.id,
        proof: ownedCourse.proof,
        owner: ownedCourse.owner,
        price: web3.utils.fromWei(ownedCourse.price),
        state: COURSE_STATES[ownedCourse.state]
    }
}