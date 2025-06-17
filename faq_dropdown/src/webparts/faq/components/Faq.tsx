import * as React from "react";
import { useEffect, useState } from "react";
import { IFaqProps } from "./IFaqProps";
import { IFAQ, IVideo } from "../../../interfaces";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../pnpjsConfig";
import { Icon } from "@fluentui/react/lib/Icon";

const Faq = (props: IFaqProps) => {
  const _sp: SPFI | undefined = getSP(props.context);
  const [faqItems, setFaqItems] = useState<IFAQ[]>([]);
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const [videoWatched, setVideoWatched] = useState<{ [key: number]: boolean }>({});
  const [checkboxClicked, setCheckboxClicked] = useState<{ [key: string]: boolean }>({});
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  const [quizScores, setQuizScores] = useState<{ [key: number]: number }>({});
  const [examScores, setExamScores] = useState<{ [key: number]: number }>({});
  const [quizTimeout, setQuizTimeout] = useState<{ [key: number]: boolean }>({});
  const [examTimeout, setExamTimeout] = useState<{ [key: number]: boolean }>({});

  // note: _0x0020_ represents the space between column Module titles

  const logModuleProgress = async (moduleId: number, moduleTitle: string, progress: number) => {
    try {
      const list = _sp.web.lists.getByTitle("Module Progress List");

      // Fetch all items and find existing module entry
      const allItems = await list.items();
      const existingItems = allItems.filter(item => item.ModuleNumber === moduleId);

      // Calculate VideoProgress (number of watched videos vs total)
      const faqItem = faqItems.find(item => item.Id === moduleId);
      const totalVideos = faqItem?.Videos?.length || 0;
      const moduleVideoIds = faqItem?.Videos?.map(v => v.Id) || [];
      const watchedVideos = moduleVideoIds.filter(id => videoWatched[Number(id)]);
      const videoProgress = totalVideos > 0 ? (watchedVideos.length / totalVideos) * 100 : 0;

      const updatedData = {
        Title: moduleTitle,
        ModuleNumber: moduleId,
        ModuleProgress: progress,
        VideoProgress: videoProgress, // ✅ Corrected calculation
        QuizProgress: quizScores[moduleId] >= 3 ? 100 : 0,
        ExamProgress: examScores[moduleId] >= 6 ? 100 : 0,
      };

      if (existingItems.length > 0) {
        await list.items.getById(existingItems[0].Id).update(updatedData);
        console.log(`Module ${moduleId} progress updated successfully!`);
      } else {
        await list.items.add(updatedData);
        console.log(`Module ${moduleId} progress logged successfully!`);
      }
    } catch (error) {
      console.error("Error logging module progress:", error);
    }
  };


  const logGrades = async (moduleTitle: string, moduleId: number, quizScore?: number, examScore?: number) => {
    try {
      const list = _sp?.web.lists.getByTitle("Grades List");

      // Fetch all items and filter for existing one with the same ModuleNumber
      const allItems = await list.items(); 
      const existingItems = allItems.filter(item => item.ModuleNumber === moduleId);

      const updatedData = {
        Title: moduleTitle,
        ModuleNumber: moduleId,
        QuizScore: quizScore ?? existingItems[0]?.QuizScore ?? null, // Preserve existing value if undefined
        ExamScore: examScore ?? existingItems[0]?.ExamScore ?? null,
      };

      if (existingItems.length > 0) {
        // Update existing entry
        await list.items.getById(existingItems[0].Id).update(updatedData);
        console.log(`Updated grades for Module ${moduleId} successfully!`);
      } else {
        // Add new entry
        await list.items.add(updatedData);
        console.log(`Grades logged successfully for Module ${moduleId}`);
      }
    } catch (error) {
      console.error("Error logging grades:", error);
    }
  };

  const handleQuizSubmit = async (moduleId: number) => {
    const faqItem = faqItems.find((item) => item.Id === moduleId);
    const totalItems = + (faqItem?.Test?.Url ? 1 : 0) + (faqItem?.Exam?.Url ? 1 : 0) + (faqItem?.Videos ? faqItem?.Videos.length : 0);

    if (quizScores[moduleId] >= 3) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      const finalProgress = newProgress > 100 ? 100 : newProgress;  // Ensure max limit

      await updateProgress(moduleId, totalItems, `test-${moduleId}`);
      await logGrades(faqItem?.Title || "Unknown", moduleId, quizScores[moduleId]);
      await logModuleProgress(moduleId, faqItem?.Title || "Unknown", finalProgress);
    } else {
      setQuizTimeout(prev => ({ ...prev, [moduleId]: true }));
      setTimeout(() => {
        setQuizTimeout(prev => ({ ...prev, [moduleId]: false }));
      }, 10000);
    }
  };  

  const handleExamSubmit = async (moduleId: number) => {
    const faqItem = faqItems.find((item) => item.Id === moduleId);
    const totalItems = + (faqItem?.Test?.Url ? 1 : 0) + (faqItem?.Exam?.Url ? 1 : 0) + (faqItem?.Videos ? faqItem?.Videos.length : 0);

    if (examScores[moduleId] >= 6) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      const finalProgress = newProgress > 100 ? 100 : newProgress;

      await updateProgress(moduleId, totalItems, `exam-${moduleId}`);
      await logGrades(faqItem?.Title || "Unknown", moduleId, undefined, examScores[moduleId]); // Log exam scores
      await logModuleProgress(moduleId, faqItem?.Title || "Unknown", finalProgress);

      // Set next module progress to 100% since exam is passed
      const nextModule = faqItems.find(f => f.ModuleNumber === faqItems[moduleId].ModuleNumber + 1);
      if (nextModule) {
        setProgress(prev => ({ ...prev, [nextModule.Id]: 100 }));
      }
    } else {
      setExamTimeout(prev => ({ ...prev, [moduleId]: true }));
      setTimeout(() => {
        setExamTimeout(prev => ({ ...prev, [moduleId]: false }));
      }, 10000);
    }
  };


  useEffect(() => {
    const getFAQItems = async (): Promise<void> => {
      if (!_sp) return;
      try {
        const items = await _sp.web.lists.getByTitle("LMS Modules").items();
        const parsed: IFAQ[] = items.map((item: any) => ({
          Id: item.Id,
          Title: item.Title,
          Body: item.Body,
          ModuleNumber: item["Module Number"],
          Videos: item.Videos ? JSON.parse(item.Videos) : [],
          Test: item.Test ? JSON.parse(item.Test) : { Id: 0, Title: "No Test Available", Url: "" },
          Exam: item.Exam ? JSON.parse(item.Exam) : undefined,
        }));
        parsed.sort((a, b) => a.ModuleNumber - b.ModuleNumber);
        setFaqItems(parsed);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    getFAQItems();
  }, []);

  const updateProgress = (moduleId: number, totalItems: number, videoId: string | number) => {
    if (!checkboxClicked[videoId]) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      setProgress(prev => ({
        ...prev,
        [moduleId]: newProgress > 100 ? 100 : newProgress
      }));
      setCheckboxClicked(prev => ({ ...prev, [videoId]: true }));
    }
  };

  const handleVideoEnd = (videoId: number) => {
    setVideoWatched(prev => ({ ...prev, [videoId]: true }));
  };

  const toggle = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {faqItems.map((item, moduleIdx) => {
        const totalItems = item.Videos.length + (item.Test?.Url ? 1 : 0) + (item.Exam?.Url ? 1 : 0);

        const moduleProgress = progress[item.Id] || 0;
        const isOpen = expanded[item.Id] || false;

        const prevModule = moduleIdx > 0 ? faqItems[moduleIdx - 1] : null;
        const isModuleLocked = prevModule && (progress[prevModule.Id] || 0) < 100;

        const allVideosDone = item.Videos.every(v => checkboxClicked[v.Id]);
        const isQuizDone = checkboxClicked[`test-${item.Id}`];
        const isExamUnlocked = allVideosDone && isQuizDone;

        return (
          <div
            key={item.Id}
            style={{
              borderRadius: "12px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
              marginBottom: "24px",
              background: "#ffffff",
              overflow: "hidden",
              border: "1px solid #ddd"
            }}
          >
            <div
              onClick={() => !isModuleLocked && toggle(item.Id)}
              style={{
                background: isModuleLocked ? "#666" : "#000",
                color: "white",
                padding: "16px",
                cursor: isModuleLocked ? "not-allowed" : "pointer",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: isModuleLocked ? 0.6 : 1
              }}
            >
              <span>
                {item.ModuleNumber != null ? `Module ${item.ModuleNumber}: ${item.Title}` : item.Title}
              </span>
              <Icon
                iconName={isOpen ? "ChevronDown" : "ChevronRight"}
                styles={{ root: { fontSize: 20, color: "white" } }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "40%" }}>
                <div style={{
                  flex: 1,
                  backgroundColor: "#eee",
                  height: 6,
                  borderRadius: 3,
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
                }}>
                  <div
                    style={{
                      width: `${moduleProgress}%`,
                      height: "100%",
                      background: `linear-gradient(to right, #FFCC00, #FFCC00)`,
                      borderRadius: 3,
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#FFCC00" }}>
                  {`${moduleProgress.toFixed(0)}%`}
                </span>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: 24 }}>
                <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>Description</h3>
                <p>{item.Body}</p>

                <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

                <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>Videos</h3>
                {item.Videos.length > 0 ? (
                  item.Videos.map((video: IVideo, idx: number) => {
                    const isVideoLocked = idx > 0 && !checkboxClicked[item.Videos[idx - 1].Id];
                    return (
                      <div key={video.Id} style={{ marginBottom: 16 }}>
                        <p style={{ fontWeight: 500 }}>{video.Title}</p>
                        <video
                          width="100%"
                          controls={!isVideoLocked}
                          onEnded={() => handleVideoEnd(video.Id)}
                          style={{
                            borderRadius: "8px",
                            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)",
                            filter: isVideoLocked ? "grayscale(100%)" : "none"
                          }}
                        >
                          <source src={video.Url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        {isVideoLocked && <p style={{ fontStyle: "italic", color: "#777" }}>Watch previous video first</p>}
                        {videoWatched[video.Id] && (
                          <label style={{ display: "block", marginTop: 8 }}>
                            <input
                              type="checkbox"
                              disabled={checkboxClicked[video.Id]}
                              onChange={() => {
                                updateProgress(item.Id, totalItems, video.Id); // ✅ Update progress first

                                // Ensure latest progress value is passed to logModuleProgress
                                const newProgress = ((progress[item.Id] || 0) + 100 / totalItems);
                                const finalProgress = newProgress > 100 ? 100 : newProgress; 

                                logModuleProgress(item.Id, item.Title || "Unknown", finalProgress); // ✅ Log module progress next
                              }}
                            />
                            <span style={{ marginLeft: 8 }}>Mark as Watched</span>
                          </label>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>No videos available.</p>
                )}

                <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

                <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>Quiz</h3>
                {item.Test?.Url ? (
                  allVideosDone ? (
                    <>
                      <a
                        href={item.Test.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.Test.Title}
                      </a>

                      {/* Quiz Score Input Box - Only displayed if there's a quiz URL */}
                      <div style={{ marginTop: "8px" }}>
                        <input
                          type="number"
                          placeholder="Score"
                          min="0"
                          max="5"
                          onChange={(e) => setQuizScores(prev => ({ ...prev, [item.Id]: Number(e.target.value) }))}
                          disabled={quizTimeout[item.Id]}
                        />
                        <button onClick={() => handleQuizSubmit(item.Id)} disabled={quizTimeout[item.Id]}>Submit</button>
                        {quizTimeout[item.Id] && <p>Try again in 10 seconds!</p>}
                      </div>
                    </>
                  ) : (
                    <p style={{ fontStyle: "italic", color: "#999" }}>Complete all videos to unlock the quiz</p>
                  )
                ) : (
                  <p>No test available.</p>
                )}

                {item.Exam?.Url && (
                  <>
                    <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

                    <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>Exam</h3>

                    {isExamUnlocked ? (
                      <>
                        <a
                          href={item.Exam.Url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.Exam.Title}
                        </a>

                        {/* Show input form only if exam is unlocked */}
                        <div style={{ marginTop: "8px" }}>
                          <input
                            type="number"
                            placeholder="Score"
                            min="0"
                            max="10"
                            onChange={(e) => setExamScores(prev => ({ ...prev, [item.Id]: Number(e.target.value) }))}
                            disabled={examTimeout[item.Id]}
                          />
                          <button onClick={() => handleExamSubmit(item.Id)} disabled={examTimeout[item.Id]}>Submit</button>
                          {examTimeout[item.Id] && <p>⏳ Try again in 10 seconds!</p>}
                        </div>
                      </>
                    ) : (
                      <p style={{ fontStyle: "italic", color: "#999" }}>
                        Complete the quiz to unlock the exam
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Faq;