//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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
        Molokai,
        Oahu,
        Other
    }

    enum Variety {
        Typica,
        Geisha,
        Caturra,
        Catuai,
        MauiMokka,
        Bourbon,
        Peaberry,
        Maragogype,
        MundoNovo,
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
        Dark
    }

    struct CoffeeBatch {
        uint64 batchId;
        uint32 mintTimestamp;
        bool verified;
        Region region;
        Variety variety;
        ProcessingMethod processingMethod;
        RoastingMethod roastingMethod;
        RoastLevel roastLevel;
        address farmer;
        address processor;
        address roaster;
        address distributor;
        string batchNumber;
        string metadataCID;
    }

    mapping(uint256 => CoffeeBatch) private batches;
    mapping(string => uint256) public batchNumberToId;
    mapping(address => uint256[]) private userBatches;
    mapping(address => bool) private registeredFarms;

    event Harvested(
        uint256 indexed batchId,
        string batchNumber,
        string metadataCID,
        address indexed farmer,
        Region indexed region,
        Variety variety
    );

    event Processed(
        uint256 indexed batchId,
        string batchNumber,
        string metadataCID,
        address indexed processor,
        ProcessingMethod processingMethod
    );

    event Roasted(
        uint256 indexed batchId,
        string batchNumber,
        string metadataCID,
        address indexed roaster,
        RoastingMethod roastingMethod,
        RoastLevel roastLevel
    );

    event Distributed(uint256 indexed batchId, string batchNumber, string metadataCID, address indexed distributor);

    event Verified(uint256 indexed batchId, string batchNumber, string metadataCID, address indexed verifier);

    event MetadataUpdated(uint256 indexed batchId, string batchNumber, string metadataCID);

    constructor(address admin, address farmer, address processor, address roaster, address distributor) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FARMER_ROLE, farmer);
        _grantRole(PROCESSOR_ROLE, processor);
        _grantRole(ROASTER_ROLE, roaster);
        _grantRole(DISTRIBUTOR_ROLE, distributor);
    }

    function harvestBatch(
        string calldata _batchNumber,
        Region _region,
        Variety _variety,
        string calldata _metadataCID
    ) public onlyRole(FARMER_ROLE) {
        require(batchNumberToId[_batchNumber] == 0, "This coffee batch number already exists!");

        uint256 _batchId = _batchIdCounter;

        batches[_batchId] = CoffeeBatch({
            batchId: uint64(_batchId),
            mintTimestamp: uint32(block.timestamp),
            verified: false,
            region: _region,
            variety: _variety,
            processingMethod: ProcessingMethod.Other,
            roastingMethod: RoastingMethod.Other,
            roastLevel: RoastLevel.Medium,
            farmer: msg.sender,
            processor: address(0),
            roaster: address(0),
            distributor: address(0),
            batchNumber: _batchNumber,
            metadataCID: _metadataCID
        });

        batchNumberToId[_batchNumber] = _batchId;
        userBatches[msg.sender].push(_batchId);

        if (!registeredFarms[msg.sender]) {
            registeredFarms[msg.sender] = true;
            _farmCount++;
        }

        emit Harvested(_batchId, _batchNumber, _metadataCID, msg.sender, _region, _variety);

        _batchIdCounter++;
        _transactionCount++;

        _mint(msg.sender, _batchId, 1, "");
    }

    function processBatch(
        uint256 _batchId,
        ProcessingMethod _processingMethod,
        string calldata _metadataCID
    ) public onlyRole(PROCESSOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.farmer != address(0), "This coffee batch must be harvested!");
        require(
            batch.processor == address(0) || batch.processor == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch has already been processed!"
        );

        if (batch.processor == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        batch.processor = msg.sender;
        batch.processingMethod = _processingMethod;
        batch.metadataCID = _metadataCID;

        emit Processed(_batchId, batch.batchNumber, _metadataCID, msg.sender, _processingMethod);

        _transactionCount++;
    }

    function roastBatch(
        uint256 _batchId,
        RoastingMethod _roastingMethod,
        RoastLevel _roastLevel,
        string calldata _metadataCID
    ) public onlyRole(ROASTER_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.farmer != address(0), "This coffee batch must be harvested!");
        require(batch.processor != address(0), "This coffee batch must be processed!");
        require(
            batch.roaster == address(0) || batch.roaster == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch has already been roasted!"
        );

        if (batch.roaster == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        batch.roaster = msg.sender;
        batch.roastingMethod = _roastingMethod;
        batch.roastLevel = _roastLevel;
        batch.metadataCID = _metadataCID;

        emit Roasted(_batchId, batch.batchNumber, _metadataCID, msg.sender, _roastingMethod, _roastLevel);

        _transactionCount++;
    }

    function distributeBatch(uint256 _batchId, string calldata _metadataCID) public onlyRole(DISTRIBUTOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.farmer != address(0), "This coffee batch must be harvested!");
        require(batch.processor != address(0), "This coffee batch must be processed!");
        require(batch.roaster != address(0), "This coffee batch must be roasted!");
        require(
            batch.distributor == address(0) ||
                batch.distributor == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch has already been distributed!"
        );

        if (batch.distributor == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        batch.distributor = msg.sender;
        batch.metadataCID = _metadataCID;

        emit Distributed(_batchId, batch.batchNumber, _metadataCID, msg.sender);

        _transactionCount++;
    }

    function verifyBatch(uint256 _batchId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.farmer != address(0), "This coffee batch must be harvested!");
        require(!batch.verified, "This coffee batch has already been verified!");

        batch.verified = true;

        emit Verified(_batchId, batch.batchNumber, batch.metadataCID, msg.sender);

        _transactionCount++;
    }

    function updateMetadataCID(uint256 _batchId, string calldata _metadataCID) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.farmer != address(0), "Batch does not exist!");

        batch.metadataCID = _metadataCID;
        emit MetadataUpdated(_batchId, batch.batchNumber, _metadataCID);
    }

    function getBatch(uint256 _batchId) public view returns (CoffeeBatch memory) {
        require(_batchId >= 1 && _batchId < _batchIdCounter, "This coffee batch does not exist!");

        return batches[_batchId];
    }

    function getBatchByNumber(string memory _batchNumber) public view returns (CoffeeBatch memory) {
        uint256 _batchId = batchNumberToId[_batchNumber];
        require(_batchId != 0, "Batch not found");
        return batches[_batchId];
    }

    function getBatches(uint256 offset, uint256 limit) public view returns (CoffeeBatch[] memory) {
        require(limit <= 100, "Limit too high");

        uint256 total = _batchIdCounter - 1;
        if (offset >= total) return new CoffeeBatch[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        CoffeeBatch[] memory result = new CoffeeBatch[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            result[i] = batches[offset + i + 1];
        }
        return result;
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

    function getBatchCount() public view returns (uint256) {
        return _batchIdCounter - 1;
    }

    function getTransactionCount() public view returns (uint256) {
        return _transactionCount;
    }

    function getFarmCount() public view returns (uint256) {
        return _farmCount;
    }

    function getRole(address account) public view returns (string memory) {
        if (hasRole(DEFAULT_ADMIN_ROLE, account)) return "Admin";
        if (hasRole(FARMER_ROLE, account)) return "Farmer";
        if (hasRole(PROCESSOR_ROLE, account)) return "Processor";
        if (hasRole(ROASTER_ROLE, account)) return "Roaster";
        if (hasRole(DISTRIBUTOR_ROLE, account)) return "Distributor";
        return "User";
    }

    function uri(uint256 _batchId) public view override returns (string memory) {
        require(_batchId >= 1 && _batchId < _batchIdCounter, "This coffee batch does not exist!");
        return string(abi.encodePacked("ipfs://", batches[_batchId].metadataCID));
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public pure override {
        revert("Batch NFTs are non-transferable");
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert("Batch NFTs are non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Batch NFTs are non-transferable");
    }
}
