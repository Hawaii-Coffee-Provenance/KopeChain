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
        Dark,
        Other
    }

    struct Coordinates {
        int32 latitude;
        int32 longitude;
    }

    struct HarvestData {
        Region region;
        Variety variety;
        uint16 elevation;
        uint32 harvestDate;
        uint64 harvestWeight;
        address farmer;
        string farmName;
        Coordinates location;
    }

    struct ProcessingData {
        ProcessingMethod processingMethod;
        uint8 moistureContent;
        uint8 scaScore;
        uint8 humidity;
        uint16 dryTemperature;
        uint32 processingDate;
        uint64 beforeWeight;
        uint64 afterWeight;
        address processor;
        Coordinates location;
    }

    struct RoastingData {
        RoastingMethod roastingMethod;
        RoastLevel roastLevel;
        uint16 transportTime;
        uint32 roastingDate;
        uint64 beforeWeight;
        uint64 afterWeight;
        address roaster;
        string cuppingNotes;
        Coordinates location;
    }

    struct DistributionData {
        uint32 distributionDate;
        uint32 bagCount;
        uint64 distributionWeight;
        address distributor;
        string destination;
        Coordinates location;
    }

    struct CoffeeBatch {
        uint64 batchId;
        string batchNumber;
        HarvestData harvestData;
        ProcessingData processingData;
        RoastingData roastingData;
        DistributionData distributionData;
        bool verified;
        uint32 mintTimestamp;
    }

    mapping(uint256 => CoffeeBatch) private batches;
    mapping(string => uint256) public batchNumberToId;
    mapping(address => uint256[]) private userBatches;
    mapping(address => bool) private registeredFarms;

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
        Region region,
        Variety variety,
        uint16 elevation,
        uint32 harvestDate,
        uint64 harvestWeight,
        address indexed farmer,
        string farmName,
        int32 latitude,
        int32 longitude
    );

    event Processed(
        uint256 indexed batchId,
        ProcessingMethod processingMethod,
        uint8 moistureContent,
        uint8 scaScore,
        uint8 humidity,
        uint16 dryTemperature,
        uint32 processingDate,
        uint64 beforeWeight,
        uint64 afterWeight,
        address indexed processor,
        int32 latitude,
        int32 longitude
    );

    event Roasted(
        uint256 indexed batchId,
        RoastingMethod roastingMethod,
        RoastLevel roastLevel,
        uint16 transportTime,
        uint32 roastingDate,
        uint64 beforeWeight,
        uint64 afterWeight,
        address indexed roaster,
        string cuppingNotes,
        int32 latitude,
        int32 longitude
    );

    event Distributed(
        uint256 indexed batchId,
        uint32 distributionDate,
        uint32 bagCount,
        uint64 distributionWeight,
        address indexed distributor,
        string destination,
        int32 latitude,
        int32 longitude
    );

    event Verified(uint256 indexed batchId, address indexed verifier);

    function harvestBatch(
        string calldata _batchNumber,
        Region _region,
        Variety _variety,
        uint16 _elevation,
        uint32 _harvestDate,
        uint64 _harvestWeight,
        string calldata _farmName,
        Coordinates calldata _location
    ) public onlyRole(FARMER_ROLE) {
        require(batchNumberToId[_batchNumber] == 0, "Batch number already exists!");

        uint256 _batchId = _batchIdCounter;

        batches[_batchId] = CoffeeBatch({
            batchId: uint64(_batchId),
            batchNumber: _batchNumber,
            harvestData: HarvestData({
                region: _region,
                variety: _variety,
                elevation: _elevation,
                harvestDate: _harvestDate,
                harvestWeight: _harvestWeight,
                farmer: msg.sender,
                farmName: _farmName,
                location: _location
            }),
            processingData: ProcessingData({
                processingMethod: ProcessingMethod.Other,
                moistureContent: 0,
                scaScore: 0,
                humidity: 0,
                dryTemperature: 0,
                processingDate: 0,
                beforeWeight: 0,
                afterWeight: 0,
                processor: address(0),
                location: Coordinates({ latitude: 0, longitude: 0 })
            }),
            roastingData: RoastingData({
                roastingMethod: RoastingMethod.Other,
                roastLevel: RoastLevel.Other,
                transportTime: 0,
                roastingDate: 0,
                beforeWeight: 0,
                afterWeight: 0,
                roaster: address(0),
                cuppingNotes: "",
                location: Coordinates({ latitude: 0, longitude: 0 })
            }),
            distributionData: DistributionData({
                distributionDate: 0,
                bagCount: 0,
                distributionWeight: 0,
                distributor: address(0),
                destination: "",
                location: Coordinates({ latitude: 0, longitude: 0 })
            }),
            verified: false,
            mintTimestamp: uint32(block.timestamp)
        });

        if (!registeredFarms[msg.sender]) {
            registeredFarms[msg.sender] = true;
            _farmCount++;
        }

        userBatches[msg.sender].push(_batchId);
        batchNumberToId[_batchNumber] = _batchId;

        _mint(msg.sender, _batchId, 1, "");

        emit Harvested(
            _batchId,
            _batchNumber,
            _region,
            _variety,
            _elevation,
            _harvestDate,
            _harvestWeight,
            msg.sender,
            _farmName,
            _location.latitude,
            _location.longitude
        );

        _batchIdCounter++;
        _transactionCount++;
    }

    function processBatch(
        uint256 _batchId,
        ProcessingMethod _processingMethod,
        uint8 _moistureContent,
        uint8 _scaScore,
        uint8 _humidity,
        uint16 _dryTemperature,
        uint32 _processingDate,
        uint64 _beforeWeight,
        uint64 _afterWeight,
        Coordinates calldata _location
    ) public onlyRole(PROCESSOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.harvestData.harvestDate != 0, "This coffee batch must be harvested!");
        require(
            batch.processingData.processor == address(0) ||
                batch.processingData.processor == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch is already processed by another processor!"
        );

        if (batch.processingData.processor == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        ProcessingData storage pData = batch.processingData;
        pData.processingMethod = _processingMethod;
        pData.moistureContent = _moistureContent;
        pData.scaScore = _scaScore;
        pData.humidity = _humidity;
        pData.dryTemperature = _dryTemperature;
        pData.processingDate = _processingDate;
        pData.beforeWeight = _beforeWeight;
        pData.afterWeight = _afterWeight;
        pData.processor = msg.sender;
        pData.location.latitude = _location.latitude;
        pData.location.longitude = _location.longitude;

        emit Processed(
            _batchId,
            _processingMethod,
            _moistureContent,
            _scaScore,
            _humidity,
            _dryTemperature,
            _processingDate,
            _beforeWeight,
            _afterWeight,
            msg.sender,
            _location.latitude,
            _location.longitude
        );

        _transactionCount++;
    }

    function roastBatch(
        uint256 _batchId,
        RoastingMethod _roastingMethod,
        RoastLevel _roastLevel,
        uint16 _transportTime,
        uint32 _roastingDate,
        uint64 _beforeWeight,
        uint64 _afterWeight,
        string calldata _cuppingNotes,
        Coordinates calldata _location
    ) public onlyRole(ROASTER_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.harvestData.harvestDate != 0, "This coffee batch must be harvested!");
        require(batch.processingData.processingDate != 0, "This coffee batch must be processed before roasting!");
        require(
            batch.roastingData.roaster == address(0) ||
                batch.roastingData.roaster == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch is already roasted by another roaster!"
        );

        if (batch.roastingData.roaster == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        RoastingData storage rData = batch.roastingData;
        rData.roastingMethod = _roastingMethod;
        rData.roastLevel = _roastLevel;
        rData.transportTime = _transportTime;
        rData.roastingDate = _roastingDate;
        rData.beforeWeight = _beforeWeight;
        rData.afterWeight = _afterWeight;
        rData.roaster = msg.sender;
        rData.cuppingNotes = _cuppingNotes;
        rData.location.latitude = _location.latitude;
        rData.location.longitude = _location.longitude;

        emit Roasted(
            _batchId,
            _roastingMethod,
            _roastLevel,
            _transportTime,
            _roastingDate,
            _beforeWeight,
            _afterWeight,
            msg.sender,
            _cuppingNotes,
            _location.latitude,
            _location.longitude
        );

        _transactionCount++;
    }

    function distributeBatch(
        uint256 _batchId,
        uint32 _distributionDate,
        uint32 _bagCount,
        uint64 _distributionWeight,
        string calldata _destination,
        Coordinates calldata _location
    ) public onlyRole(DISTRIBUTOR_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.harvestData.harvestDate != 0, "This coffee batch must be harvested!");
        require(batch.processingData.processingDate != 0, "This coffee batch must be processed before distribution!");
        require(batch.roastingData.roastingDate != 0, "This coffee batch must be roasted before distribution!");
        require(
            batch.distributionData.distributor == address(0) ||
                batch.distributionData.distributor == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "This coffee batch is already distributed by another distributor!"
        );

        if (batch.distributionData.distributor == address(0)) {
            userBatches[msg.sender].push(_batchId);
        }

        DistributionData storage dData = batch.distributionData;
        dData.distributionDate = _distributionDate;
        dData.bagCount = _bagCount;
        dData.distributionWeight = _distributionWeight;
        dData.distributor = msg.sender;
        dData.destination = _destination;
        dData.location.latitude = _location.latitude;
        dData.location.longitude = _location.longitude;

        emit Distributed(
            _batchId,
            _distributionDate,
            _bagCount,
            _distributionWeight,
            msg.sender,
            _destination,
            _location.latitude,
            _location.longitude
        );

        _transactionCount++;
    }

    function verifyBatch(uint256 _batchId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CoffeeBatch storage batch = batches[_batchId];

        require(batch.harvestData.harvestDate != 0, "This coffee batch must be harvested!");
        require(!batch.verified, "This coffee batch is already verified!");
        batch.verified = true;

        emit Verified(_batchId, msg.sender);

        _transactionCount++;
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
