// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract OpenBounty is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public constant MAX_PAGE_SIZE = 50;
    uint256 public constant MAX_REPOSITORY_URL_LENGTH = 200;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 500;
    uint256 public constant MAX_PR_LINK_LENGTH = 200;
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    struct Bounty {
        uint256 id;
        address creator;
        string repoUrl;
        string description;
        uint256 reward;
        uint256 deadline;
        bool isOpen;
        bool isCompleted;
        address winner;
    }

    struct Submission {
        address submitter;
        string prLink;
        uint256 timestamp;
    }

    error RewardMustBeGreaterThanZero();
    error RepositoryUrlRequired();
    error DescriptionRequired();
    error PrLinkRequired();
    error RepositoryUrlTooLong(uint256 length, uint256 maxLength);
    error DescriptionTooLong(uint256 length, uint256 maxLength);
    error PrLinkTooLong(uint256 length, uint256 maxLength);
    error CreatorCannotSubmitToOwnBounty(uint256 bountyId);
    error BountyDoesNotExist(uint256 bountyId);
    error OnlyCreator(address caller);
    error BountyNotOpen(uint256 bountyId);
    error BountyAlreadyCompleted(uint256 bountyId);
    error InvalidDeadline(uint256 deadline);
    error RefundRequiresDeadline(uint256 bountyId);
    error DeadlineNotReached(uint256 bountyId, uint256 currentTimestamp, uint256 deadline);
    error InvalidSubmissionIndex(uint256 bountyId, uint256 submissionIndex);
    error InvalidPageSize(uint256 pageSize);
    error TransferFailed();
    error ReentrancyDetected();

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) private bountySubmissions;
    uint256 public bountyCounter;
    uint256 private reentrancyStatus;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string repoUrl,
        string description,
        uint256 reward,
        uint256 deadline
    );
    event SubmissionAdded(uint256 indexed bountyId, uint256 indexed submissionIndex, address indexed submitter, string prLink);
    event SubmissionApproved(uint256 indexed bountyId, uint256 indexed submissionIndex, address indexed winner, uint256 reward);
    event Refunded(uint256 indexed bountyId, address indexed creator, uint256 reward);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        reentrancyStatus = NOT_ENTERED;
    }

    function createBounty(
        string calldata repoUrl,
        string calldata description,
        uint256 deadline
    ) external payable returns (uint256 bountyId) {
        if (msg.value == 0) revert RewardMustBeGreaterThanZero();
        uint256 repoUrlLength = bytes(repoUrl).length;
        uint256 descriptionLength = bytes(description).length;

        if (repoUrlLength == 0) revert RepositoryUrlRequired();
        if (descriptionLength == 0) revert DescriptionRequired();
        if (repoUrlLength > MAX_REPOSITORY_URL_LENGTH) revert RepositoryUrlTooLong(repoUrlLength, MAX_REPOSITORY_URL_LENGTH);
        if (descriptionLength > MAX_DESCRIPTION_LENGTH) revert DescriptionTooLong(descriptionLength, MAX_DESCRIPTION_LENGTH);
        if (deadline != 0 && deadline <= block.timestamp) revert InvalidDeadline(deadline);

        bountyId = ++bountyCounter;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            repoUrl: repoUrl,
            description: description,
            reward: msg.value,
            deadline: deadline,
            isOpen: true,
            isCompleted: false,
            winner: address(0)
        });

        emit BountyCreated(bountyId, msg.sender, repoUrl, description, msg.value, deadline);
    }

    function submitWork(uint256 bountyId, string calldata prLink) external {
        uint256 prLinkLength = bytes(prLink).length;
        if (prLinkLength == 0) revert PrLinkRequired();
        if (prLinkLength > MAX_PR_LINK_LENGTH) revert PrLinkTooLong(prLinkLength, MAX_PR_LINK_LENGTH);

        Bounty storage bounty = _requireOpenBounty(bountyId);
        if (bounty.creator == msg.sender) revert CreatorCannotSubmitToOwnBounty(bountyId);

        bountySubmissions[bountyId].push(
            Submission({
                submitter: msg.sender,
                prLink: prLink,
                timestamp: block.timestamp
            })
        );

        emit SubmissionAdded(bountyId, bountySubmissions[bountyId].length - 1, msg.sender, prLink);
    }

    function approveSubmission(uint256 bountyId, uint256 submissionIndex) external nonReentrant {
        Bounty storage bounty = _requireExistingBounty(bountyId);
        if (bounty.creator != msg.sender) revert OnlyCreator(msg.sender);
        if (!bounty.isOpen) revert BountyNotOpen(bountyId);
        if (bounty.isCompleted) revert BountyAlreadyCompleted(bountyId);
        if (submissionIndex >= bountySubmissions[bountyId].length) revert InvalidSubmissionIndex(bountyId, submissionIndex);

        Submission memory chosenSubmission = bountySubmissions[bountyId][submissionIndex];
        uint256 reward = bounty.reward;

        bounty.reward = 0;
        bounty.isOpen = false;
        bounty.isCompleted = true;
        bounty.winner = chosenSubmission.submitter;

        (bool success, ) = payable(chosenSubmission.submitter).call{value: reward}("");
        if (!success) revert TransferFailed();

        emit SubmissionApproved(bountyId, submissionIndex, chosenSubmission.submitter, reward);
    }

    function refund(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = _requireExistingBounty(bountyId);
        if (bounty.creator != msg.sender) revert OnlyCreator(msg.sender);
        if (!bounty.isOpen) revert BountyNotOpen(bountyId);
        if (bounty.isCompleted) revert BountyAlreadyCompleted(bountyId);
        if (bounty.deadline == 0) revert RefundRequiresDeadline(bountyId);
        if (block.timestamp < bounty.deadline) revert DeadlineNotReached(bountyId, block.timestamp, bounty.deadline);

        uint256 reward = bounty.reward;
        bounty.reward = 0;
        bounty.isOpen = false;

        (bool success, ) = payable(bounty.creator).call{value: reward}("");
        if (!success) revert TransferFailed();

        emit Refunded(bountyId, bounty.creator, reward);
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return _requireExistingBounty(bountyId);
    }

    function getBountiesPaginated(
        uint256 cursor,
        uint256 pageSize
    ) external view returns (Bounty[] memory page, uint256 nextCursor, bool hasMore) {
        _validatePageSize(pageSize);

        uint256 total = bountyCounter;
        if (cursor >= total) {
            return (new Bounty[](0), total, false);
        }

        uint256 end = _min(cursor + pageSize, total);
        page = new Bounty[](end - cursor);

        for (uint256 i = cursor; i < end; ) {
            page[i - cursor] = bounties[i + 1];
            unchecked {
                ++i;
            }
        }

        nextCursor = end;
        hasMore = end < total;
    }

    function getBounties() external view returns (Bounty[] memory) {
        if (bountyCounter > MAX_PAGE_SIZE) revert InvalidPageSize(bountyCounter);
        (Bounty[] memory page, , ) = this.getBountiesPaginated(0, bountyCounter == 0 ? 1 : bountyCounter);
        return page;
    }

    function getSubmissionCount(uint256 bountyId) external view returns (uint256) {
        _requireExistingBounty(bountyId);
        return bountySubmissions[bountyId].length;
    }

    function getSubmission(uint256 bountyId, uint256 submissionIndex) external view returns (Submission memory) {
        _requireExistingBounty(bountyId);
        if (submissionIndex >= bountySubmissions[bountyId].length) revert InvalidSubmissionIndex(bountyId, submissionIndex);
        return bountySubmissions[bountyId][submissionIndex];
    }

    function getSubmissionsPaginated(
        uint256 bountyId,
        uint256 cursor,
        uint256 pageSize
    ) external view returns (Submission[] memory page, uint256 nextCursor, bool hasMore) {
        _requireExistingBounty(bountyId);
        _validatePageSize(pageSize);

        uint256 total = bountySubmissions[bountyId].length;
        if (cursor >= total) {
            return (new Submission[](0), total, false);
        }

        uint256 end = _min(cursor + pageSize, total);
        page = new Submission[](end - cursor);

        for (uint256 i = cursor; i < end; ) {
            page[i - cursor] = bountySubmissions[bountyId][i];
            unchecked {
                ++i;
            }
        }

        nextCursor = end;
        hasMore = end < total;
    }

    function getSubmissions(uint256 bountyId) external view returns (Submission[] memory) {
        _requireExistingBounty(bountyId);
        uint256 submissionCount = bountySubmissions[bountyId].length;
        if (submissionCount > MAX_PAGE_SIZE) revert InvalidPageSize(submissionCount);
        (Submission[] memory page, , ) = this.getSubmissionsPaginated(bountyId, 0, submissionCount == 0 ? 1 : submissionCount);
        return page;
    }

    function _requireExistingBounty(uint256 bountyId) internal view returns (Bounty storage bounty) {
        if (bountyId == 0 || bountyId > bountyCounter) revert BountyDoesNotExist(bountyId);
        bounty = bounties[bountyId];
    }

    function _requireOpenBounty(uint256 bountyId) internal view returns (Bounty storage bounty) {
        bounty = _requireExistingBounty(bountyId);
        if (!bounty.isOpen) revert BountyNotOpen(bountyId);
        if (bounty.isCompleted) revert BountyAlreadyCompleted(bountyId);
    }

    function _validatePageSize(uint256 pageSize) internal pure {
        if (pageSize == 0 || pageSize > MAX_PAGE_SIZE) revert InvalidPageSize(pageSize);
    }

    function _min(uint256 left, uint256 right) internal pure returns (uint256) {
        return left < right ? left : right;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier nonReentrant() {
        if (reentrancyStatus == ENTERED) revert ReentrancyDetected();
        reentrancyStatus = ENTERED;
        _;
        reentrancyStatus = NOT_ENTERED;
    }
}
