// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarbonCreditToken.sol";
import "./AlgaeProjectNFT.sol";

contract MRVRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    CarbonCreditToken public creditToken;
    AlgaeProjectNFT public projectNFT;

    enum Status { Pending, Verified, Rejected, Minted }

    struct Measurement {
        uint256 id;
        uint256 projectId;
        uint256 timestamp;
        uint256 biomassAmount; // e.g. in kg
        uint256 co2Captured;   // e.g. in kg
        string dataHash;       // IPFS hash or hash of raw data
        Status status;
    }

    uint256 private _nextMeasurementId;
    mapping(uint256 => Measurement) public measurements;
    mapping(uint256 => uint256[]) public projectMeasurements;

    event MeasurementAdded(uint256 indexed id, uint256 indexed projectId, uint256 co2Captured);
    event MeasurementVerified(uint256 indexed id, address verifier);
    event CreditsIssued(uint256 indexed measurementId, uint256 amount);

    constructor(address _creditToken, address _projectNFT) {
        creditToken = CarbonCreditToken(_creditToken);
        projectNFT = AlgaeProjectNFT(_projectNFT);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function addMeasurement(
        uint256 projectId,
        uint256 biomassAmount,
        uint256 co2Captured,
        string memory dataHash
    ) public {
        // In a real scenario, check if sender owns the project or is authorized.
        // For Beta, we allow anyone or assume the caller is the project owner.
        require(projectNFT.ownerOf(projectId) != address(0), "Project does not exist");

        uint256 id = _nextMeasurementId++;
        measurements[id] = Measurement({
            id: id,
            projectId: projectId,
            timestamp: block.timestamp,
            biomassAmount: biomassAmount,
            co2Captured: co2Captured,
            dataHash: dataHash,
            status: Status.Pending
        });

        projectMeasurements[projectId].push(id);
        emit MeasurementAdded(id, projectId, co2Captured);
    }

    function verifyMeasurement(uint256 measurementId, bool approve) public onlyRole(VERIFIER_ROLE) {
        Measurement storage m = measurements[measurementId];
        require(m.status == Status.Pending, "Not pending");

        if (approve) {
            m.status = Status.Verified;
            emit MeasurementVerified(measurementId, msg.sender);
        } else {
            m.status = Status.Rejected;
        }
    }

    function issueCredits(uint256 measurementId) public onlyRole(VERIFIER_ROLE) {
        Measurement storage m = measurements[measurementId];
        require(m.status == Status.Verified, "Not verified");
        
        m.status = Status.Minted;
        
        // 1 CO2 = 1 Credit (with 18 decimals)
        // Assuming co2Captured is in kg, and we want 1 token per tonne, or 1 token per kg?
        // Let's assume 1 Token = 1 kg of CO2 for this Beta to make numbers visible.
        // Or standard: 1 Credit = 1 Tonne.
        // Let's use 18 decimals. If co2Captured is integer kg, amount = co2Captured * 10^18.
        
        uint256 amount = m.co2Captured * 10**18;
        address projectOwner = projectNFT.ownerOf(m.projectId);
        
        creditToken.mint(projectOwner, amount);
        emit CreditsIssued(measurementId, amount);
    }

    function getProjectMeasurements(uint256 projectId) public view returns (Measurement[] memory) {
        uint256[] memory ids = projectMeasurements[projectId];
        Measurement[] memory result = new Measurement[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = measurements[ids[i]];
        }
        return result;
    }

    function getTotalMeasurements() public view returns (uint256) {
        return _nextMeasurementId;
    }

    function getMeasurement(uint256 measurementId) public view returns (Measurement memory) {
        return measurements[measurementId];
    }
}
