"use client";

import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useTMK } from "~~/hooks/useTMK";
import { notification } from "~~/utils/scaffold-eth";
import { formatTMKInput, isLookupReady } from "~~/utils/tmk";

interface LocationInputProps {
  latitude: string;
  longitude: string;
  onChange: (field: "latitude" | "longitude", value: string) => void;
  disabled?: boolean;
  latPlaceholder?: string;
  longPlaceholder?: string;
}

type TMKStatus = "none" | "loading" | "valid" | "invalid";

const LocationInput = ({
  latitude,
  longitude,
  onChange,
  disabled,
  latPlaceholder = "19.681101",
  longPlaceholder = "-155.980404",
}: LocationInputProps) => {
  const [mode, setMode] = useState<"latlng" | "tmk">("tmk");
  const [tmkValue, setTMKValue] = useState("");
  const [tmkStatus, setTmkStatus] = useState<TMKStatus>("none");
  const [tmkMessage, setTmkMessage] = useState("");

  const { lookup } = useTMK();
  const [debouncedTMK] = useDebounceValue(tmkValue, 500);

  useEffect(() => {
    if (!isLookupReady(debouncedTMK)) {
      setTmkStatus(debouncedTMK.length > 0 ? "invalid" : "none");
      setTmkMessage(debouncedTMK.length > 0 ? "Need Island-Zone-Section-Plat-Parcel Format!" : "");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setTmkStatus("loading");
      const result = await lookup(debouncedTMK);

      if (cancelled) return;

      if (result) {
        onChange("latitude", result.latitude.toFixed(6));
        onChange("longitude", result.longitude.toFixed(6));
        setTmkStatus("valid");
        setTmkMessage("Location Found!");
      } else {
        setTmkStatus("invalid");
        setTmkMessage("No Parcel Found For That TMK!");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTMK]);

  const handleTMKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTMKValue(formatTMKInput(e.target.value));
    setTmkStatus("none");
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        onChange("latitude", position.coords.latitude.toFixed(6));
        onChange("longitude", position.coords.longitude.toFixed(6));
        setMode("latlng");
      },
      error => {
        notification.error("Failed to get current location: " + error.message);
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header + Switch Mode */}
      <div className="flex items-center justify-between">
        <span className="text-label">Location</span>

        <button
          type="button"
          className="cursor-pointer text-nav-link text-primary border-b border-transparent hover:border-primary transition-colors"
          onClick={() => {
            setMode(mode === "latlng" ? "tmk" : "latlng");
          }}
          disabled={disabled}
        >
          {mode === "latlng" ? "Switch to TMK Code" : "Switch to Lat/Long"}
        </button>
      </div>

      {mode === "latlng" && (
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input input-bordered w-full text-sm h-10"
            inputMode="decimal"
            placeholder={latPlaceholder}
            step="0.000001"
            type="number"
            value={latitude}
            onChange={e => onChange("latitude", e.target.value)}
            disabled={disabled}
          />
          <input
            className="input input-bordered w-full text-sm h-10"
            inputMode="decimal"
            placeholder={longPlaceholder}
            step="0.000001"
            type="number"
            value={longitude}
            onChange={e => onChange("longitude", e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {mode === "tmk" && (
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <input
              type="text"
              className={`input input-bordered w-full text-sm h-10 pr-10 font-mono tracking-wider transition-colors ${
                tmkStatus === "valid" ? "input-success" : tmkStatus === "invalid" ? "input-error" : ""
              }`}
              placeholder="3-7-4-007-090"
              value={tmkValue}
              onChange={handleTMKChange}
              disabled={disabled}
              maxLength={18}
              spellCheck={false}
            />

            {tmkStatus !== "none" && (
              <div className="absolute right-3 flex items-center z-10">
                {tmkStatus === "loading" ? (
                  <span className="loading loading-spinner loading-sm text-base-content/50" />
                ) : (
                  <div className="tooltip tooltip-left" data-tip={tmkMessage}>
                    {tmkStatus === "valid" ? (
                      <CheckIcon className="w-5 h-5 text-success" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-error" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Location Button */}
      <div className="flex justify-end pr-1">
        <button
          type="button"
          className="cursor-pointer text-nav-link text-primary border-b border-transparent hover:border-primary transition-colors"
          onClick={handleCurrentLocation}
          disabled={disabled}
        >
          Use Current Location
        </button>
      </div>
    </div>
  );
};

export default LocationInput;
