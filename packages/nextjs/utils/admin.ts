import { keccak256, toHex } from "viem";

export const ROLES = [
  { label: "Admin", value: "0x0000000000000000000000000000000000000000000000000000000000000000" },
  { label: "Farmer", value: keccak256(toHex("FARMER_ROLE")) },
  { label: "Processor", value: keccak256(toHex("PROCESSOR_ROLE")) },
  { label: "Roaster", value: keccak256(toHex("ROASTER_ROLE")) },
  { label: "Distributor", value: keccak256(toHex("DISTRIBUTOR_ROLE")) },
];
