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
  const [checkboxClicked, setCheckboxClicked] = useState<{ [key: number]: boolean }>({});
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

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
          Test: item.Test ? JSON.parse(item.Test) : { Id: 0, Title: "No Test Available", Url: "" }
        }));

        parsed.sort((a, b) => a.ModuleNumber - b.ModuleNumber);
        setFaqItems(parsed);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    getFAQItems();
  }, []);

  const updateProgress = (moduleId: number, totalItems: number, videoId: number) => {
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
      {faqItems.map((item) => {
        const totalItems = item.Videos.length + 1;
        const moduleProgress = progress[item.Id] || 0;
        const isOpen = expanded[item.Id] || false;

        return (
          <div
            key={item.Id}
            style={{
              borderRadius: "12px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
              marginBottom: "24px",
              background: "#ffffff",
              overflow: "hidden",
              transition: "transform 0.2s ease",
              border: "1px solid #ddd",
            }}
          >
            <div
              onClick={() => toggle(item.Id)}
              style={{
                background: "#000000", // black header
                color: "white",
                padding: "16px",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {item.ModuleNumber != null
                  ? `Module ${item.ModuleNumber}: ${item.Title}`
                  : item.Title}
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
                      background: `linear-gradient(to right, #FFCC00, #FFCC00)`, // yellow gradient progress bar
                      borderRadius: 3,
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <span style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: "#FFCC00"
                }}>{`${moduleProgress.toFixed(0)}%`}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 10, borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000000" }}>📘 Description</h3>
                <p>{item.Body}</p>

                <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

                <h3 style={{ marginBottom: 10, borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000000" }}>🎥 Videos</h3>
                {item.Videos.length > 0 ? (
                  item.Videos.map((video: IVideo) => (
                    <div key={video.Id} style={{ marginBottom: 16 }}>
                      <p style={{ fontWeight: 500 }}>{video.Title}</p>
                      <video width="100%" controls onEnded={() => handleVideoEnd(video.Id)} style={{ borderRadius: "8px", boxShadow: "0px 3px 8px rgba(0,0,0,0.15)" }}>
                        <source src={video.Url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      {videoWatched[video.Id] && (
                        <label style={{ display: "block", marginTop: 8 }}>
                          <input
                            type="checkbox"
                            disabled={checkboxClicked[video.Id]}
                            onChange={() => updateProgress(item.Id, totalItems, video.Id)}
                          />
                          <span style={{ marginLeft: 8 }}>Mark as Watched</span>
                        </label>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No videos available.</p>
                )}

                <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

                <h3 style={{ marginBottom: 10, borderBottom: "3px solid #FFCC00", paddingBottom: 6, color: "#000000" }}>✅ Test</h3>
                {item.Test.Url ? (
                  <a href={item.Test.Url} target="_blank" rel="noopener noreferrer" onClick={() => updateProgress(item.Id, totalItems, item.Id)}>
                    {item.Test.Title}
                  </a>
                ) : (
                  <p>No test available.</p>
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