import * as React from "react";
import { useEffect, useState } from "react";
import { Icon } from "@fluentui/react";
import { IGrades } from "../../../interfaces";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../pnpjsConfig";

const GradesTracker = (props: { context: any }) => {
  const _sp: SPFI | undefined = getSP(props.context);
  const [gradesList, setGradesList] = useState<IGrades[]>([]);
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({});
  const [gradesOpen, setGradesOpen] = useState(false);

  useEffect(() => {
    const fetchGradesWithMetadata = async () => {
      try {
        if (!_sp) {
          console.error("SP context is missing.");
          return;
        }

        const [gradesItems, moduleItems] = await Promise.all([
          _sp.web.lists.getByTitle("Grades List").items(),
          _sp.web.lists.getByTitle("LMS Modules").items()
        ]);

        const mergedData: IGrades[] = moduleItems.map(mod => {
          const gradeEntry = gradesItems.find(grade => grade.ModuleNumber === mod.ModuleNumber);

          return {
            Id: gradeEntry?.Id,
            ModuleNumber: mod.ModuleNumber,
            Title: mod.Title,
            QuizScore: gradeEntry?.QuizScore,
            ExamScore: gradeEntry?.ExamScore,
            QuizMaxScore: mod?.Test?.MaximumScore ?? 5,
            ExamMaxScore: mod?.Exam?.MaximumScore ?? 10,
            HasExam: !!mod?.Exam
          };
        });

        setGradesList(mergedData);
      } catch (error) {
        console.error("Error fetching grades and modules:", error);
      }
    };

    fetchGradesWithMetadata();
  }, []);

  const toggleGrades = () => {
    setGradesOpen(prev => !prev);
    console.log("Grades Accordion Toggled:", !gradesOpen);
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <div style={{ borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.15)", marginBottom: "24px", overflow: "hidden", border: "1px solid #ddd" }}>
      <div onClick={toggleGrades} style={{ background: "#000000", color: "#FFCC00", padding: "16px", cursor: "pointer", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem" }}>
        <span>Grades</span>
        <Icon iconName={gradesOpen ? "ChevronDown" : "ChevronRight"} styles={{ root: { fontSize: 20, color: "#FFCC00" } }} />
      </div>

      {gradesOpen && gradesList.length > 0 ? (
        <div style={{ background: "#fff" }}>
          {gradesList.map((module) => (
            <div key={module.ModuleNumber} style={{ borderBottom: "1px solid #ddd" }}>
              <div onClick={() => toggleModule(module.ModuleNumber)} style={{ background: expandedModules[module.ModuleNumber] ? "#000000" : "#A9A9A9", color: "#fff", padding: "14px 20px", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: expandedModules[module.ModuleNumber] ? "0px" : "12px" }}>
                <span>Module {module.ModuleNumber}: {module.Title}</span>
                <Icon iconName={expandedModules[module.ModuleNumber] ? "ChevronDown" : "ChevronRight"} styles={{ root: { fontSize: 16, color: "#FFCC00" } }} />
              </div>

              {expandedModules[module.ModuleNumber] && (
                <div style={{ background: "#fff", padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontWeight: 600, color: "#000" }}>Quiz Score</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <div style={{ flex: 1, backgroundColor: "#eee", height: 6, borderRadius: 3 }}>
                        <div
                          style={{
                            width: `${((module.QuizScore ?? 0) / (module.QuizMaxScore ?? 5)) * 100}%`,
                            height: "100%",
                            background: "#FFCC00",
                            borderRadius: 3,
                            transition: "width 0.3s ease"
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 600, color: "#FFCC00" }}>
                        {(module.QuizScore !== undefined && module.QuizMaxScore)
                          ? `${module.QuizScore}/${module.QuizMaxScore} (${Math.round((module.QuizScore / module.QuizMaxScore) * 100)}%)`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {module.HasExam && module.ExamScore !== undefined && module.ExamMaxScore !== undefined && (
                    <div>
                      <label style={{ fontWeight: 600, color: "#000" }}>Exam Score</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                        <div style={{ flex: 1, backgroundColor: "#eee", height: 6, borderRadius: 3 }}>
                          <div
                            style={{
                              width: `${((module.ExamScore ?? 0) / (module.ExamMaxScore ?? 10)) * 100}%`,
                              height: "100%",
                              background: "#00C853",
                              borderRadius: 3,
                              transition: "width 0.3s ease"
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, color: "#00C853" }}>
                          {`${module.ExamScore}/${module.ExamMaxScore} (${Math.round((module.ExamScore / module.ExamMaxScore) * 100)}%)`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        gradesOpen && <p style={{ padding: "12px", textAlign: "center", fontSize: "1rem" }}>No grades found.</p>
      )}
    </div>
  );
};

export default GradesTracker;