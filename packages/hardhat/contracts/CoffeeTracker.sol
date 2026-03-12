//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CoffeeTracker is ERC1155, AccessControl {
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    uint256 private _batchIdCounter = 1;
    uint256 private _transactionCount;
    uint256 private _farmCount;

    enum Region {
        Kona,
        Kau,
        Puna,
        Hamakua,
        Maui,
        Kauai,
        Other
    }

    enum Variety {
        Arabica,
        Geisha,
        Typica,
        Caturra,
        Catuai,
        MauiMokka,
        Bourbon,
        Peaberry,
        Maragogype,
        Other
    }

    enum ProcessingMethod {
        Natural,
        Washed,
        Honey,
        Anaerobic,
        Other
    }

    enum RoastingMethod {
        Drum,
        HotAir,
        FluidBed,
        Infrared,
        Other
    }

    enum RoastLevel {
        Light,
        Medium,
        Dark,
        Other
    }

    struct CoffeeBatch {
        // Batch Identification
        uint256 batchId;
        string batchNumber;
        bool verified;
        uint256 mintTimestamp;
        // Origin & Harvesting
        address farmer;
        string farmName;
        Region region;
        Variety variety;
        uint16 elevation;
        uint256 harvestWeight;
        uint256 harvestDate;
        // Processing
        address processor;
        ProcessingMethod processingMethod;
        uint256 processingBeforeWeight;
        uint256 processingAfterWeight;
        uint8 moistureContent;
        uint8 scaScore;
        uint8 humidity;
        uint16 dryTemperature;
        // Roasting
        address roaster;
        RoastingMethod roastingMethod;
        uint256 roastingBeforeWeight;
        uint256 roastingAfterWeight;
        RoastLevel roastLevel;
        string cuppingNotes;
        uint16 transportTime;
        // Distributing
        address distributor;
    }

    mapping(uint256 => CoffeeBatch) private batches;
    mapping(address => uint256[]) private userBatches;
    mapping(string => bool) private registeredFarms;

    constructor(address admin, address farmer, address processor, address roaster, address distributor) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FARMER_ROLE, farmer);
        _grantRole(PROCESSOR_ROLE, processor);
        _grantRole(ROASTER_ROLE, roaster);
        _grantRole(DISTRIBUTOR_ROLE, distributor);
    }

    event Harvested(
        uint256 indexed batchId,
        string batchNumber,
        address indexed farmer,
        string farmName,
        Region region,
        Variety variety,
        uint16 elevation,
        uint256 harvestWeight,
        uint256 harvestDate
    );

    event Processed(
        uint256 indexed batchId,
        address indexed processor,
        ProcessingMethod processingMethod,
        uint256 processingBeforeWeight,
        uint256 processingAfterWeight,
        uint8 moistureContent,
        uint8 scaScore,
        uint8 humidity,
        uint16 dryTemperature
    );

    event Roasted(
        uint256 indexed batchId,
        address indexed roaster,
        RoastingMethod roastingMethod,
        uint256 roastingBeforeWeight,
        uint256 roastingAfterWeight,
        RoastLevel roastLevel,
        string cuppingNotes,
        uint16 transportTime
    );

    event Distributed(uint256 indexed batchId, address indexed distributor);

    event Verified(uint256 indexed batchId, address indexed verifier);

    function harvestBatch(
        string memory _batchNumber,
        string memory _farmName,
        Region _region,
        Variety _variety,
        uint16 _elevation,
        uint256 _harvestWeight,
        uint256 _harvestDate
    ) public onlyRole(FARMER_ROLE) {
        uint256 _batchId = _batchIdCounter;

        batches[_batchId] = CoffeeBatch({
            batchId: _batchId,
            batchNumber: _batchNumber,
            verified: false,
            mintTimestamp: block.timestamp,
            farmer: msg.sender,
            farmName: _farmName,
            region: _region,
            variety: _variety,
            elevation: _elevation,
            harvestWeight: _harvestWeight,
            harvestDate: _harvestDate,
            processor: address(0),
            processingMethod: ProcessingMethod.Other,
            processingBeforeWeight: 0,
            processingAfterWeight: 0,
            moistureContent: 0,
            scaScore: 0,
            humidity: 0,
            dryTemperature: 0,
            roaster: address(0),
            roastingMethod: RoastingMethod.Other,
            roastingBeforeWeight: 0,
            roastingAfterWeight: 0,
            roastLevel: RoastLevel.Other,
            cuppingNotes: "",
            transportTime: 0,
            distributor: address(0)
        });

        emit Harvested(
            _batchId,
            _batchNumber,
            msg.sender,
            _farmName,
            _region,
            _variety,
            _elevation,
            _harvestWeight,
            _harvestDate
        );

        if (!registeredFarms[_farmName]) {
            registeredFarms[_farmName] = true;
            _farmCount++;
        }

        userBatches[msg.sender].push(_batchId);

        _mint(msg.sender, _batchId, 1, "");

        _batchIdCounter++;
        _transactionCount++;
    }

    function processBatch(
        uint256 _batchId,
        ProcessingMethod _processingMethod,
        uint256 _processingBeforeWeight,
        uint256 _processingAfterWeight,
        uint8 _moistureContent,
        uint8 _scaScore,
        uint8 _humidity,
        uint16 _dryTemperature
    ) public onlyRole(PROCESSOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.batchId != 0, "This coffee batch doesn't exist!");
        require(
            batch.processor == address(0) || batch.processor == msg.sender,
            "This coffee batch is already processed by another processor!"
        );

        if (batch.processor == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        batch.processor = msg.sender;
        batch.processingMethod = _processingMethod;
        batch.processingBeforeWeight = _processingBeforeWeight;
        batch.processingAfterWeight = _processingAfterWeight;
        batch.moistureContent = _moistureContent;
        batch.scaScore = _scaScore;
        batch.humidity = _humidity;
        batch.dryTemperature = _dryTemperature;

        emit Processed(
            _batchId,
            msg.sender,
            _processingMethod,
            _processingBeforeWeight,
            _processingAfterWeight,
            _moistureContent,
            _scaScore,
            _humidity,
            _dryTemperature
        );

        _transactionCount++;
    }

    function roastBatch(
        uint256 _batchId,
        RoastingMethod _roastingMethod,
        uint256 _roastingBeforeWeight,
        uint256 _roastingAfterWeight,
        RoastLevel _roastLevel,
        string memory _cuppingNotes,
        uint16 _transportTime
    ) public onlyRole(ROASTER_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.batchId != 0, "This coffee batch doesn't exist!");
        require(batch.processor != address(0), "This coffee batch must be processed before roasting!");
        require(
            batch.roaster == address(0) || batch.roaster == msg.sender,
            "This coffee batch is already roasted by another roaster!"
        );

        if (batch.roaster == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        batch.roaster = msg.sender;
        batch.roastingMethod = _roastingMethod;
        batch.roastingBeforeWeight = _roastingBeforeWeight;
        batch.roastingAfterWeight = _roastingAfterWeight;
        batch.roastLevel = _roastLevel;
        batch.transportTime = _transportTime;
        batch.cuppingNotes = _cuppingNotes;

        emit Roasted(
            _batchId,
            msg.sender,
            _roastingMethod,
            _roastingBeforeWeight,
            _roastingAfterWeight,
            _roastLevel,
            _cuppingNotes,
            _transportTime
        );

        _transactionCount++;
    }

    function distributeBatch(uint256 _batchId) public onlyRole(DISTRIBUTOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.batchId != 0, "This coffee batch doesn't exist!");
        require(batch.roaster != address(0), "This coffee batch must be roasted before distribution!");

        batch.distributor = msg.sender;

        emit Distributed(_batchId, msg.sender);

        _transactionCount++;
    }

    function verifyBatch(uint256 _batchId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.batchId != 0, "This coffee batch doesn't exist!");
        require(!batch.verified, "This coffee batch is already verified!");

        batch.verified = true;

        emit Verified(_batchId, msg.sender);

        _transactionCount++;
    }

    function getBatchCount() public view returns (uint256) {
        return _batchIdCounter - 1;
    }

    function getVerifiedCount() public view returns (uint256) {
        uint256 count = 0;

        for (uint256 i = 1; i < _batchIdCounter; i++) {
            if (batches[i].verified) count++;
        }

        return count;
    }

    function getTransactionCount() public view returns (uint256) {
        return _transactionCount;
    }

    function getFarmCount() public view returns (uint256) {
        return _farmCount;
    }

    function getBatch(uint256 _batchId) public view returns (CoffeeBatch memory) {
        require(_batchId >= 1 && _batchId < _batchIdCounter, "This coffee batch doesn't exist!");
        return batches[_batchId];
    }

    function getBatchByNumber(string memory _batchNumber) public view returns (CoffeeBatch memory) {
        for (uint256 i = 1; i < _batchIdCounter; i++) {
            if (keccak256(bytes(batches[i].batchNumber)) == keccak256(bytes(_batchNumber))) {
                return batches[i];
            }
        }
        revert("Batch not found");
    }

    function getAllBatches() public view returns (CoffeeBatch[] memory) {
        CoffeeBatch[] memory allBatches = new CoffeeBatch[](_batchIdCounter - 1);

        for (uint256 i = 1; i < _batchIdCounter; i++) {
            allBatches[i - 1] = batches[i];
        }
        return allBatches;
    }

    function getVerifiedBatches() public view returns (CoffeeBatch[] memory) {
        uint256 count = 0;

        for (uint256 i = 1; i < _batchIdCounter; i++) {
            if (batches[i].verified) count++;
        }

        CoffeeBatch[] memory verifiedBatches = new CoffeeBatch[](count);

        uint256 _idx = 0;
        for (uint256 i = 1; i < _batchIdCounter; i++) {
            if (batches[i].verified) verifiedBatches[_idx++] = batches[i];
        }
        return verifiedBatches;
    }

    function getUserBatches(address user) public view returns (string memory userRole, CoffeeBatch[] memory history) {
        userRole = getRole(user);
        uint256[] memory ids = userBatches[user];
        history = new CoffeeBatch[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            history[i] = batches[ids[i]];
        }

        return (userRole, history);
    }

    function getRole(address account) public view returns (string memory) {
        if (hasRole(DEFAULT_ADMIN_ROLE, account)) return "Admin";
        if (hasRole(FARMER_ROLE, account)) return "Farmer";
        if (hasRole(PROCESSOR_ROLE, account)) return "Processor";
        if (hasRole(ROASTER_ROLE, account)) return "Roaster";
        if (hasRole(DISTRIBUTOR_ROLE, account)) return "Distributor";
        return "User";
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
