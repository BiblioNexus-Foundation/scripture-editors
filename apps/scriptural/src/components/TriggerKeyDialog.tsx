import React, { useState, useEffect, useRef } from "react";
import { HiOutlineKey, HiOutlineInformationCircle } from "react-icons/hi";
import { MdKeyboard, MdClose } from "react-icons/md";
import { Keyboard, KeySquare, Headphones, Check, X } from "lucide-react";

interface TriggerKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrigger: string;
  onTriggerChange: (newTrigger: string) => void;
}

export function TriggerKeyDialog({
  isOpen,
  onClose,
  currentTrigger,
  onTriggerChange,
}: TriggerKeyDialogProps) {
  const [listening, setListening] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCapturedKeys([]);
      setListening(false);
    }
  }, [isOpen]);

  // Handle clicks outside the dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add keydown handler for ESC to close the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !listening) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, listening, onClose]);

  // Handle key capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listening) return;

      e.preventDefault();

      // Skip if only modifier keys were pressed
      if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        return;
      }

      const modifiers = [];
      if (e.ctrlKey) modifiers.push("Ctrl");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");
      if (e.metaKey) modifiers.push("Meta");

      setCapturedKeys([...modifiers, e.key]);
      setListening(false);
    };

    if (isOpen && listening) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, listening]);

  const startListening = () => {
    setCapturedKeys([]);
    setListening(true);
  };

  const applyTrigger = () => {
    if (capturedKeys.length > 0) {
      onTriggerChange(capturedKeys.join("+"));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg border border-gray-200 w-[400px] max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeySquare className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-lg text-gray-900">Set Trigger Key</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current trigger */}
          <div className="flex items-center mb-4 gap-2">
            <MdKeyboard className="h-5 w-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Current:</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {currentTrigger}
              </span>
            </div>
          </div>

          {/* Capture box */}
          <div
            className={`
              relative border rounded-md overflow-hidden transition-all duration-200 mb-3
              ${
                listening
                  ? "border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                  : "border-gray-300"
              }
            `}
          >
            <div
              className={`
                p-4 text-center font-mono text-base transition-colors
                ${listening ? "bg-blue-50 text-blue-700" : "bg-white"}
              `}
            >
              {listening ? (
                <div className="flex items-center justify-center gap-2">
                  <Headphones className="h-5 w-5 animate-pulse" />
                  <span className="animate-pulse">Press keys now...</span>
                </div>
              ) : capturedKeys.length > 0 ? (
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {capturedKeys.map((key, i) => (
                    <React.Fragment key={i}>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-800 text-xs font-semibold">
                        {key}
                      </kbd>
                      {i < capturedKeys.length - 1 && <span className="text-gray-400">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <HiOutlineKey className="h-5 w-5" />
                  <span>Click 'Record' below</span>
                </div>
              )}
            </div>
          </div>

          {/* Record button */}
          <button
            onClick={startListening}
            disabled={listening}
            className={`
              w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
              flex items-center justify-center gap-2
              ${
                listening
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }
            `}
          >
            {listening ? (
              <>
                <Headphones className="h-4 w-4" />
                Listening...
              </>
            ) : (
              <>
                <Keyboard className="h-4 w-4" />
                Record Key Combination
              </>
            )}
          </button>

          {/* Info tip */}
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
            <HiOutlineInformationCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>Press modifier keys (Ctrl, Alt, Shift) together with another key.</p>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={applyTrigger}
              disabled={capturedKeys.length === 0}
              className={`
                px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors
                flex items-center gap-1
                ${
                  capturedKeys.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              <Check className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
