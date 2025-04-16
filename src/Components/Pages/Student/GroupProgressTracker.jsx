// src/GroupProgressTracker.jsx

import React from "react";

const steps = [
  "Searching",
  "Group Idea sent",
  "Approved",
  "Finding Supervisor",
  "Supervision Approved",
];

const GroupProgressTracker = ({ currentStep = 0 }) => {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Your current state</h3>
      <div className="flex items-center justify-center gap-3 md:gap-5">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          return (
            <div key={index} className="flex items-center">
              <div
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                  isActive ? "bg-teal-500 border-teal-800" : "bg-white border-gray-300"
                }`}
              >
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white"></div>
              </div>
              <div className="ml-2 text-xs md:text-sm text-center">
                <p className={`${isActive ? "text-teal-800 font-semibold" : "text-gray-400"}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-1 mx-1 md:mx-2 ${isActive ? "bg-teal-600" : "bg-gray-300"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupProgressTracker;
