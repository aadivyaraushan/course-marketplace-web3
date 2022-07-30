// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CourseMarketplace {

    // Type declarations
    enum State {
        Purchased,
        Activated,
        Deactivated
    }

    struct Course {
        uint256 id; // 256 bits = 32 bytes - one slot
        uint256 price; // 256 bits = 32 bytes - one slot
        bytes32 proof; // proof that the user is the owner of the course. 32 bytes - one slot.
        address owner; // 20 bytes
        State state; // 1 byte
        // owner and state form one slot.
        // overall 4 slots.
    }

    // State variables
    bool public isStopped = false;
    mapping(bytes32 => Course) private ownedCourses; // mapping of course hash to course struct
    mapping(uint => bytes32) private ownedCourseHashes; // mapping of course id to course hash
    uint private totalOwnedCourses; // total number of courses owned by the user'
    address payable private owner; // address of the user who owns the contract

    // Events/Errors
    /// You already own this course.
    error CourseAlreadyOwned(); // error message for when the user tries to purchase a course they already own
    /// Only the owner can perform this action.
    error OnlyOwner();
    /// You are already the owner.
    error AlreadyOwner();
    /// This instance of the course has not been created
    error CourseNotCreated();
    /// Course has invalid state
    error InvalidState();
    /// You do not own this course so you cannot repurchase it.
    error InvalidCourseOwner();

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier alreadyOwner(address newOwner) {
        if (newOwner == owner) revert AlreadyOwner();
        _;
    }

    modifier courseExists(bytes32 courseHash) {
        if (ownedCourses[courseHash].owner == 0x0000000000000000000000000000000000000000) revert CourseNotCreated();
        _;
    }

    modifier coursePurchased(bytes32 courseHash) {
        Course memory course = ownedCourses[courseHash];
        if (course.state != State.Purchased) revert InvalidState();
        _;
    }

    modifier ownsCourse(bytes32 courseHash) {
        Course memory course = ownedCourses[courseHash];
        if (course.owner != msg.sender) revert InvalidCourseOwner();
        _;
    }

    modifier courseDeactivated(bytes32 courseHash) {
        Course memory course = ownedCourses[courseHash];
        if (course.state != State.Deactivated) revert InvalidState();
        _;
    }

    modifier onlyWhenNotStopped() {
        require(!isStopped, "Contract is currently stopped");
        _;
    }

    modifier onlyWhenStopped() {
        require(isStopped, "Contract is not stopped");
        _;
    }

    // Functions

    // Constructor
    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    // External
    function withdraw(uint amount) external onlyOwner {
        (bool success,) = owner.call{value : amount}("");
        require(success, "Transfer failed");
    }

    function emergencyWithdraw() external onlyWhenStopped onlyOwner {
        (bool success,) = owner.call{value : address(this).balance}("");
        require(success, "Transfer failed");
    }

    function selfDestruct() external onlyWhenStopped onlyOwner {
        selfdestruct(owner);
    }

    function stopContract() external onlyOwner {
        isStopped = true;
    }

    function resumeContract() external onlyOwner {
        isStopped = false;
    }

    function purchaseCourse(bytes16 courseId, bytes32 proof) external payable onlyWhenNotStopped returns (bytes32) {
        bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));
        uint id = totalOwnedCourses++;
        if (ownedCourses[courseHash].owner == msg.sender) {
            revert CourseAlreadyOwned();
        }
        ownedCourseHashes[id] = courseHash;
        ownedCourses[courseHash] = Course({
        id : id,
        price : msg.value,
        proof : proof,
        owner : msg.sender,
        state : State.Purchased
        });
        return courseHash;


        /**
        * Examples of i/o for this function:
        * id:"11" = 0x00000000000000000000000000003131
        * proof: 0x0000000000000000000000000000313000000000000000000000000000003130
        * msg.sender = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
        * courseHash: keccak256(id, sender) = 0x4c5428d7da43374870df67dac91d41864c368325fc95a82183d7c752ae2d878c
        */
    }

    function repurchaseCourse(bytes32 courseHash)
    external
    payable
    onlyWhenNotStopped
    courseExists(courseHash)
    ownsCourse(courseHash)
    courseDeactivated(courseHash)
    {
        Course storage course = ownedCourses[courseHash];
        course.state = State.Purchased;
        course.price = msg.value;
    }

    function activateCourse(bytes32 courseHash)
    external
    onlyOwner
    onlyWhenNotStopped
    courseExists(courseHash)
    coursePurchased(courseHash)
    {
        Course storage course = ownedCourses[courseHash];
        // since this is a storage variable any changes made to it are applied to the course in storage
        course.state = State.Activated;
    }

    function deactivateCourse(bytes32 courseHash)
    external
    onlyOwner
    onlyWhenNotStopped
    courseExists(courseHash)
    coursePurchased(courseHash) {
        Course storage course = ownedCourses[courseHash];
        (bool success,) = course.owner.call{value : course.price}("");
        require(success, "Transfer failed!");
        course.state = State.Deactivated;
        course.price = 0;
    }

    function getCourseCount() external view returns (uint) {
        return totalOwnedCourses;
    }

    function getCourseHash(uint id) external view returns (bytes32) {
        return ownedCourseHashes[id];
    }

    function getCourseByHash(bytes32 courseHash) external view returns (Course memory) {
        return ownedCourses[courseHash];
    }

    function getContractOwner() external view returns (address) {
        return owner;
    }

    function transferOwnership(address newOwner) external onlyOwner alreadyOwner(newOwner) {
        owner = payable(newOwner);
    }

}