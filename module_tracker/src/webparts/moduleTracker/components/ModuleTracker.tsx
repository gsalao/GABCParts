import * as React from "react";
import { useEffect, useState } from "react";
import { IModuleTrackerProps } from "./IModuleTrackerProps";
import { IModuleProgress } from "../../../interfaces";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../pnpjsConfig";
import { Icon } from "@fluentui/react";

const ProgressLabel = ({ label, percent, font, progressBarColor }: { label: string; percent: number; font: string | undefined; progressBarColor: string | undefined }): JSX.Element => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontWeight: 600, color: font }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
      <div style={{ flex: 1, backgroundColor: "#eee", height: 6, borderRadius: 3 }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          background: progressBarColor,
          borderRadius: 3,
          transition: "width 0.3s ease"
        }} />
      </div>
      <span style={{ fontWeight: 600, color: progressBarColor }}>{percent}%</span>
    </div>
  </div>
);

const ProgressBar = ({ percent, font }: { percent: number; font: string | undefined }): JSX.Element => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
    <div style={{ flex: 1, backgroundColor: "#eee", height: 6, borderRadius: 3 }}>
      <div style={{
        width: `${percent}%`,
        height: "100%",
        background: font,
        borderRadius: 3,
        transition: "width 0.3s ease"
      }} />
    </div>
    <span style={{ fontWeight: 600, color: font }}>{percent}%</span>
  </div>
);

const ModuleTracker: React.FC<IModuleTrackerProps> = 
  ({ context, headerFont, headerBackground, moduleProgressColor, moduleHeaderFont, moduleInternalFont, moduleHeaderBackground, moduleInternalBackground }) => {
  const _sp: SPFI = getSP(context);
  const [modules, setModules] = useState<IModuleProgress[]>([]);
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({});
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const [moduleItems, progressItems] = await Promise.all([
        _sp.web.lists.getByTitle("LMS Modules").items(),
        _sp.web.lists.getByTitle("Module Progress List").items()
      ]);

      const merged: IModuleProgress[] = moduleItems.map(mod => {
        const progress = progressItems.find(p => p.ModuleNumber === mod.ModuleNumber);

        return {
          ModuleNumber: mod.ModuleNumber,
          Title: mod.Title,
          VideoProgress: progress?.VideoProgress ?? 0,
          QuizProgress: progress?.QuizProgress ?? 0,
          ExamProgress: mod.Exam ? progress?.ExamProgress ?? 0 : undefined
        };
      });

      setModules(merged);
    };

    fetchData().catch((err) => console.error("Unhandled error from fetchData: ", err));
  }, []);

  const toggleTracker = (): void => setTrackerOpen(prev => !prev);
  const toggleModule = (num: number): void => setExpandedModules(prev => ({ ...prev, [num]: !prev[num] }));

  const totalPercent =
    modules.length > 0
      ? Math.round(
          modules.reduce((acc, m) => {
            const parts = 2 + (m.ExamProgress !== undefined ? 1 : 0);
            const sum = m.VideoProgress + m.QuizProgress + (m.ExamProgress ?? 0);
            return acc + sum / parts;
          }, 0) / modules.length
        )
      : 0;

  return (
    <div style={{ borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.15)", marginBottom: "24px", overflow: "hidden", border: "1px solid #ddd" }}>
      <div onClick={toggleTracker} style={{ background: headerBackground, color: headerFont, padding: "16px", cursor: "pointer", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem" }}>
        <span>Module Tracker</span>
        <Icon iconName={trackerOpen ? "ChevronDown" : "ChevronRight"} styles={{ root: { fontSize: 20, color: headerFont } }} />
      </div>

      {trackerOpen && (
        <div style={{ background: moduleInternalBackground, padding: "16px 20px" }}>
          <label style={{ fontWeight: 600, color: moduleInternalFont }}>Total Progress</label>
          <ProgressBar percent={totalPercent} font={moduleProgressColor} />
        </div>
      )}

      {trackerOpen && modules.map(mod => (
        <div key={mod.ModuleNumber} style={{ borderBottom: "1px solid #ddd" }}>
          <div onClick={() => toggleModule(mod.ModuleNumber)}
            style={{
              background: expandedModules[mod.ModuleNumber] ? moduleHeaderBackground : "#A9A9A9",
              color: moduleHeaderFont,
              padding: "14px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "0px"
            }}
          >
            <span>Module {mod.ModuleNumber}: {mod.Title}</span>
            <Icon iconName={expandedModules[mod.ModuleNumber] ? "ChevronDown" : "ChevronRight"} styles={{ root: { fontSize: 16, color: moduleHeaderFont } }} />
          </div>

          {expandedModules[mod.ModuleNumber] && (
            <div style={{ background: moduleInternalBackground, padding: "16px 20px" }}>
              <ProgressLabel label={`Module ${mod.ModuleNumber} Video Progress`} percent={mod.VideoProgress} font={moduleInternalFont} progressBarColor={moduleProgressColor} />
              <ProgressLabel label={`Module ${mod.ModuleNumber} Quiz Progress`} percent={mod.QuizProgress} font={moduleInternalFont} progressBarColor={moduleProgressColor}/>
              {mod.ExamProgress !== undefined && (
                <ProgressLabel label={`Module ${mod.ModuleNumber} Exam Progress`} percent={mod.ExamProgress} font={moduleInternalFont} progressBarColor={moduleProgressColor}/>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModuleTracker;