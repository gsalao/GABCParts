import * as React from "react";
import { useEffect, useState } from "react";
import { IFaqProps } from "./IFaqProps";
import { IFAQ, IVideo } from "../../../interfaces";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../pnpjsConfig";
import { Icon } from "@fluentui/react/lib/Icon";

import styles from './Faq.module.scss'

const Faq = (props: IFaqProps): JSX.Element => {
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

  const [quizSubmitted, setQuizSubmitted] = useState<{ [key: number]: boolean }>({});
  const [examSubmitted, setExamSubmitted] = useState<{ [key: number]: boolean }>({});

  const [quizVisible, setQuizVisible] = useState<{ [key: number]: boolean }>({});
  const [examVisible, setExamVisible] = useState<{ [key: number]: boolean }>({});

  const [watchedVideos, setWatchedVideos] = useState<{ [key: number]: { [videoId: number]: boolean } }>({});

  const [quizCountdowns, setQuizCountdowns] = useState<{ [key: number]: number }>({});
  const [examCountdowns, setExamCountdowns] = useState<{ [key: number]: number }>({});

  const handleQuizLinkClick = (moduleId: number): void => {
    setQuizVisible(prev => ({ ...prev, [moduleId]: true }));
  };

  const handleExamLinkClick = (moduleId: number): void => {
    setExamVisible(prev => ({ ...prev, [moduleId]: true }));
  };

  // note: _0x0020_ represents the space between column Module titles

  const updateProgress = (moduleId: number, totalItems: number, videoId: string | number): void => {
    if (!checkboxClicked[videoId]) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      setProgress(prev => ({
        ...prev,
        [moduleId]: newProgress > 100 ? 100 : newProgress
      }));
      setCheckboxClicked(prev => ({ ...prev, [videoId]: true }));
    }
  };

  const logModuleProgress = async (moduleId: number, moduleTitle: string, progress: number): Promise<void> => {
    try {
      const list = _sp.web.lists.getByTitle("Module Progress List");

      // Get correct module number for filtering
      const faqItem = faqItems.find(item => item.Id === moduleId);
      const moduleNumber = faqItem?.ModuleNumber;

      const quizPassingScore = faqItem?.Test.PassingScore ?? 3; // default quiz passing score set to 3
      const examPassingScore = faqItem?.Exam?.PassingScore ?? 6; // default exam passing score set to 6

      // Fetch all items and find existing module entry
      const allItems = await list.items();
      const existingItems = allItems.filter(item => item.ModuleNumber === moduleNumber);

      // Calculate VideoProgress (number of watched videos vs total)
      const totalVideos = faqItem?.Videos?.length || 0;
      const moduleVideoIds = faqItem?.Videos?.map(v => v.Id) || [];
      const watchedVideos = moduleVideoIds.filter(id => videoWatched[Number(id)]);
      const videoProgress = totalVideos > 0 ? (watchedVideos.length / totalVideos) * 100 : 0;

      const updatedData = {
        Title: moduleTitle,
        ModuleNumber: moduleNumber,
        ModuleProgress: progress,
        VideoProgress: videoProgress, // ✅ Corrected calculation
        QuizProgress: quizScores[moduleId] >= quizPassingScore ? 100 : 0,
        ExamProgress: examScores[moduleId] >= examPassingScore ? 100 : 0,
      };  

      if (existingItems.length > 0) {
        await list.items.getById(existingItems[0].Id).update(updatedData);
        console.log(`Module ${moduleNumber} progress updated successfully!`);
      } else {
        await list.items.add(updatedData);
        console.log(`Module ${moduleNumber} progress logged successfully!`);
      }
    } catch (error) {
      console.error("Error logging module progress:", error);
    }
  };


  const logGrades = async (moduleTitle: string, moduleId: number, quizScore?: number, quizMaxScore?: number, examScore?: number, examMaxScore?: number): Promise<void> => {
    try {
      const list = _sp?.web.lists.getByTitle("Grades List");

      // Get correct module number for filtering
      const faqItem = faqItems.find(item => item.Id === moduleId);
      const moduleNumber = faqItem?.ModuleNumber;

      // Fetch all items and filter for existing one with the same ModuleNumber
      const allItems = await list.items(); 
      const existingItems = allItems.filter(item => item.ModuleNumber === moduleNumber);

      // Quiz-related returns
      const quizMaxScore = faqItem?.Test.MaximumScore ?? null;

      // Exam-related returns
      const examMaxScore = faqItem?.Exam?.MaximumScore ?? null;
      const examExists = !!faqItem?.Exam;
      const examScoreValue = examExists
        ? examScore ?? existingItems[0]?.ExamScore ?? null
        : null;
      const examMaxScoreValue = examExists
        ? examMaxScore
        : null;

      // only need Quiz and Exam max score since failing scores are already caught in the process anyways
      const updatedData = {
        Title: moduleTitle,
        ModuleNumber: moduleNumber,
        QuizScore: quizScore ?? existingItems[0]?.QuizScore ?? null,
        QuizMaxScore: quizMaxScore,
        ExamScore: examScoreValue,
        ExamMaxScore: examMaxScoreValue,
      };

      if (existingItems.length > 0) {
        // Update existing entry
        await list.items.getById(existingItems[0].Id).update(updatedData);
        console.log(`Updated grades for Module ${moduleNumber} successfully!`);
      } else {
        // Add new entry
        await list.items.add(updatedData);
        console.log(`Grades logged successfully for Module ${moduleNumber}`);
      }
    } catch (error) {
      console.error("Error logging grades:", error);
    }
  };

  const handleQuizSubmit = async (moduleId: number): Promise<void> => {
    const faqItem = faqItems.find((item) => item.Id === moduleId);
    const totalItems = + (faqItem?.Test?.Url ? 1 : 0) + (faqItem?.Exam?.Url ? 1 : 0) + (faqItem?.Videos ? faqItem?.Videos.length : 0);

    const quizPassingScore = faqItem?.Test.PassingScore ?? 3; // default quiz passing score is 3 (60% of 5; default 5 total also)

    if (quizScores[moduleId] >= quizPassingScore) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      const finalProgress = newProgress > 100 ? 100 : newProgress;  // Ensure max limit

      await updateProgress(moduleId, totalItems, `test-${moduleId}`);
      await logGrades(faqItem?.Title || "Unknown", moduleId, quizScores[moduleId], faqItem?.Test.MaximumScore || 5);
      await logModuleProgress(moduleId, faqItem?.Title || "Unknown", finalProgress);

      setQuizSubmitted(prev => ({ ...prev, [moduleId]: true }));
      setQuizVisible(prev => ({ ...prev, [moduleId]: false }));
    } else {
      setQuizTimeout(prev => ({ ...prev, [moduleId]: true }));
      setQuizVisible(prev => ({ ...prev, [moduleId]: false }));
      setQuizCountdowns(prev => ({ ...prev, [moduleId]: 5 }));

      const countdownInterval = setInterval(() => {
        setQuizCountdowns(prev => {
          const current = prev[moduleId];
          if (current <= 1) {
            clearInterval(countdownInterval);
            setQuizTimeout(timeout => ({ ...timeout, [moduleId]: false }));
            return { ...prev, [moduleId]: 0 };
          }
          return { ...prev, [moduleId]: current - 1 };
        });
      }, 1000);
    }
  };  

  const handleExamSubmit = async (moduleId: number): Promise<void> => {
    const faqItem = faqItems.find((item) => item.Id === moduleId);
    const totalItems = + (faqItem?.Test?.Url ? 1 : 0) + (faqItem?.Exam?.Url ? 1 : 0) + (faqItem?.Videos ? faqItem?.Videos.length : 0);

    const examPassingScore = faqItem?.Exam?.PassingScore ?? 6; // default exam passing score set to 6 (60% of 10; default also)

    if (examScores[moduleId] >= examPassingScore) {
      const newProgress = ((progress[moduleId] || 0) + 100 / totalItems);
      const finalProgress = newProgress > 100 ? 100 : newProgress;

      await updateProgress(moduleId, totalItems, `exam-${moduleId}`);
      await logGrades(faqItem?.Title || "Unknown", moduleId, undefined, undefined, examScores[moduleId], faqItem?.Exam?.MaximumScore); // Log exam scores
      await logModuleProgress(moduleId, faqItem?.Title || "Unknown", finalProgress);

      setExamSubmitted(prev => ({ ...prev, [moduleId]: true }));
      setExamVisible(prev => ({ ...prev, [moduleId]: false }));
    } else {
      setExamTimeout(prev => ({ ...prev, [moduleId]: true }));
      setExamVisible(prev => ({ ...prev, [moduleId]: false }));
      setExamCountdowns(prev => ({ ...prev, [moduleId]: 5 }));

      const countdownInterval = setInterval(() => {
        setExamCountdowns(prev => {
          const current = prev[moduleId];
          if (current <= 1) {
            clearInterval(countdownInterval);
            setExamTimeout(timeout => ({ ...timeout, [moduleId]: false }));
            return { ...prev, [moduleId]: 0 };
          }
          return { ...prev, [moduleId]: current - 1 };
        });
      }, 1000);
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
          ModuleNumber: item.ModuleNumber ? JSON.parse(item.ModuleNumber): 0,
          Videos: item.Videos ? JSON.parse(item.Videos) : [],
          Test: item.Test ? JSON.parse(item.Test) : { Id: 0, Title: "No Test Available", Url: "" , PassingScore: 0, MaximumScore: 0 },
          Exam: item.Exam ? JSON.parse(item.Exam) : "",
        }));
        parsed.sort((a, b) => a.ModuleNumber - b.ModuleNumber);
        setFaqItems(parsed);  
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    getFAQItems().catch((err) => console.error("Unhandled error from getFAQItems: ", err));
  }, []);

  const handleVideoEnd = (videoId: number): void => {
    setVideoWatched(prev => ({ ...prev, [videoId]: true }));
  };

  const toggle = (id: number): void => {
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
                {`Module ${item.ModuleNumber}: ${item.Title}`}
              </span>
              <Icon
                iconName={isOpen ? "ChevronDown" : "ChevronRight"}
                styles={{ root: { fontSize: 20, color: "white", justifyContent: "center" } }}
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
                <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>WorkingDescription</h3>
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
                        {videoWatched[video.Id] && !watchedVideos[item.Id]?.[video.Id] && (
                            <label
                                style={{
                                    display: "block",
                                    marginTop: 8,
                                    opacity: watchedVideos[item.Id]?.[video.Id] ? 0 : 1, // ✅ Fade effect
                                    transition: "opacity 0.5s ease-out", // Smooth fade-out transition
                                }}
                            >
                                <input
                                    type="checkbox"
                                    disabled={checkboxClicked[video.Id]}
                                    onChange={() => {
                                        updateProgress(item.Id, totalItems, video.Id);

                                        const newProgress = ((progress[item.Id] || 0) + 100 / totalItems);
                                        const finalProgress = newProgress > 100 ? 100 : newProgress; 

                                        console.log(item)

                                        logModuleProgress(item.Id, item.Title || "Unknown", finalProgress).
                                          catch((err) => console.error("Unhandled error from logModuleProgress: ", err));

                                        // Start fade-out effect before removal
                                        setTimeout(() => {
                                            setWatchedVideos(prev => ({
                                                ...prev,
                                                [item.Id]: {
                                                    ...(prev[item.Id] || {}),
                                                    [video.Id]: true
                                                }
                                            }));
                                        }, 500); // Wait for fade-out before hiding
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

                <h3 style={{ borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000" }}>Quiz ({item.Test.MaximumScore} Items)</h3>
                {item.Test?.Url ? (
                  allVideosDone ? (
                    <>
                      {/* Quiz Score Input Box - Only displayed if there's a quiz URL */}
                      <div className={styles.quizContainer}>
                        {/* Quiz Link - Always Visible Unless Test is Failed */}
                        {!quizSubmitted[item.Id] && !quizTimeout[item.Id] && (
                          <>
                            <a
                              href={item.Test.Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.quizLink}
                              onClick={() => handleQuizLinkClick(item.Id)}
                            >
                              {item.Test.Title}
                            </a>
                          </>
                        )}

                        {/* Quiz Form - Only Visible If Quiz Link Clicked */}
                        {quizVisible[item.Id] && !quizSubmitted[item.Id] && (
                          <>
                            <div className={styles.quizScoreForm}>
                              <input
                                type="number"
                                placeholder="Score"
                                min="0"
                                max={item.Test.MaximumScore}
                                className={styles.quizInput}
                                onChange={(e) =>
                                  setQuizScores((prev) => ({
                                    ...prev,
                                    [item.Id]: Number(e.target.value),
                                  }))
                                }
                                disabled={quizTimeout[item.Id]}
                              />
                              <button
                                onClick={() => handleQuizSubmit(item.Id)}
                                disabled={quizTimeout[item.Id]}
                                className={styles.quizButton}
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        )}

                        {/* Failure Message (Hidden After Timeout) */}
                        {quizTimeout[item.Id] && (
                          <p className={`${styles.quizMessage} ${styles.failure}`}>
                            Passing score is {item.Test?.PassingScore} out of {item.Test?.MaximumScore}. 
                            Try again in {
                              Math.floor((quizCountdowns[item.Id] ?? 0) / 60)
                            }:{((quizCountdowns[item.Id] ?? 0) % 60).toString().padStart(2, "0")} minutes!
                          </p>
                        )}

                        {/* Success Message (Displayed Forever After Passing) */}
                        {quizSubmitted[item.Id] && quizScores[item.Id] >= item?.Test.PassingScore && (
                          <p className={styles.quizMessage}>
                            You passed {item.Test?.Title} with a score of {quizScores[item.Id]} out of {item.Test?.MaximumScore}!
                          </p>
                          // ALERT : quizzes assumed to be out of 5 at the moment
                          // quizzes assumed to have a passing score of 3 at the moment
                        )}
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
                        {/* Exam Score Input Box - Only displayed if there's an Exam URL */}
                        <div className={styles.quizContainer}>
                          {/* Exam Link - Always Visible Until Submission */}
                          {!examSubmitted[item.Id] && !examTimeout[item.Id] && (
                            <>
                              <a
                                href={item.Exam.Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.quizLink}
                                onClick={() => handleExamLinkClick(item.Id)}
                              >
                                {item.Exam.Title}
                              </a>
                            </>
                          )}

                          {/* Quiz Form - Only Visible If Quiz Link Clicked */}
                          {examVisible[item.Id] && !examSubmitted[item.Id] && (
                            <>
                              <div className={styles.quizScoreForm}>
                                <input
                                  type="number"
                                  placeholder="Score"
                                  min="0"
                                  max={item.Exam.MaximumScore}
                                  className={styles.quizInput}
                                  onChange={(e) =>
                                    setExamScores((prev) => ({
                                      ...prev,
                                      [item.Id]: Number(e.target.value),
                                    }))
                                  }
                                  disabled={examTimeout[item.Id]}
                                />
                                <button
                                  onClick={() => handleExamSubmit(item.Id)}
                                  disabled={examTimeout[item.Id]}
                                  className={styles.quizButton}
                                >
                                  Submit
                                </button>
                              </div>
                            </>
                          )}

                          {/* Failure Message (Hidden After Timeout) */}
                          {examTimeout[item.Id] && (
                            <p className={`${styles.quizMessage} ${styles.failure}`}>
                              Passing score is {item.Exam?.PassingScore} out of {item.Exam?.MaximumScore}. 
                              Try again in {
                                Math.floor((examCountdowns[item.Id] ?? 0) / 60)
                              }:{((examCountdowns[item.Id] ?? 0) % 60).toString().padStart(2, "0")} minutes!
                            </p>
                          )}

                          {/* Success Message (Displayed Forever After Passing) */}
                          {examSubmitted[item.Id] && examScores[item.Id] >= item?.Exam.PassingScore && (
                            <p className={styles.quizMessage}>
                              You passed {item.Exam?.Title} with a score of {examScores[item.Id]} out of {item.Exam?.MaximumScore}!
                            </p>
                            // ALERT : quizzes assumed to be out of 5 at the moment
                            // quizzes assumed to have a passing score of 3 at the moment
                          )}
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