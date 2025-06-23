import * as React from 'react';
import { useState, useEffect } from 'react';
import { Icon } from '@fluentui/react';
import { IStatisticsTrackerProps } from './IStatisticsTrackerProps';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpjsConfig';
import { IGrades, IModuleProgress } from '../../../interfaces';

const StatisticsTracker: React.FC<IStatisticsTrackerProps> = ({ context }) => {
  const _sp: SPFI = getSP(context);
  const [grades, setGrades] = useState<IGrades[]>([]);
  const [modules, setModules] = useState<IModuleProgress[]>([]);
  const [gradesOpen, setGradesOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [gradesItems, moduleItems, progressItems] = await Promise.all([
        _sp.web.lists.getByTitle("Grades List").items(),
        _sp.web.lists.getByTitle("LMS Modules").items(),
        _sp.web.lists.getByTitle("Module Progress List").items()
      ]);

      const gradesMerged: IGrades[] = moduleItems.map(mod => {
        const grade = gradesItems.find(g => g.ModuleNumber === mod.ModuleNumber);
        return {
          ModuleNumber: mod.ModuleNumber,
          Title: mod.Title,
          QuizScore: grade?.QuizScore,
          ExamScore: grade?.ExamScore,
          QuizMaxScore: mod?.Test?.MaximumScore ?? 5,
          ExamMaxScore: mod?.Exam?.MaximumScore ?? 10,
          HasExam: !!mod?.Exam
        };
      });

      const modulesMerged: IModuleProgress[] = moduleItems.map(mod => {
        const progress = progressItems.find(p => p.ModuleNumber === mod.ModuleNumber);
        return {
          ModuleNumber: mod.ModuleNumber,
          Title: mod.Title,
          VideoProgress: progress?.VideoProgress ?? 0,
          QuizProgress: progress?.QuizProgress ?? 0,
          ExamProgress: mod?.Exam ? progress?.ExamProgress ?? 0 : undefined
        };
      });

      setGrades(gradesMerged);
      setModules(modulesMerged);
    };

    fetchData();
  }, []);

  const toggleGrades = () => setGradesOpen(prev => !prev);
  const toggleModules = () => setModulesOpen(prev => !prev);
  const toggleModule = (mod: number) => setExpandedModule(p => (p === mod ? null : mod));

  const Section = ({
    title,
    isOpen,
    onToggle,
    children
  }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div style={{ border: '1px solid #ddd', marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          background: '#000',
          color: '#FFCC00',
          padding: 16,
          fontWeight: 600,
          fontSize: '1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <span>{title}</span>
        <Icon iconName={isOpen ? "ChevronDown" : "ChevronRight"} />
      </div>
      {isOpen && <div style={{ background: '#fff', padding: 16 }}>{children}</div>}
    </div>
  );

  const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontWeight: 600, color: "#000" }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <div style={{ flex: 1, backgroundColor: '#eee', height: 6, borderRadius: 3 }}>
          <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontWeight: 600, color }}>{value}%</span>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI', margin: 24 }}>
      <Section title="Grades Tracker" isOpen={gradesOpen} onToggle={toggleGrades}>
        {grades.map(mod => (
          <div key={mod.ModuleNumber} style={{ borderBottom: '1px solid #ddd', marginBottom: 16 }}>
            <div
              onClick={() => toggleModule(mod.ModuleNumber)}
              style={{
                background: expandedModule === mod.ModuleNumber ? '#000' : '#A9A9A9',
                color: '#fff',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>Module {mod.ModuleNumber}: {mod.Title}</span>
              <Icon iconName={expandedModule === mod.ModuleNumber ? "ChevronDown" : "ChevronRight"} />
            </div>
            {expandedModule === mod.ModuleNumber && (
              <div style={{ padding: 12, background: '#fff' }}>
                <ProgressBar
                  label="Quiz Score"
                  value={mod.QuizScore !== undefined ? Math.round((mod.QuizScore / (mod.QuizMaxScore ?? 5)) * 100) : 0}
                  color="#bf9902"
                />
                {mod.HasExam && mod.ExamScore !== undefined && mod.ExamMaxScore !== undefined && (
                  <ProgressBar
                    label="Exam Score"
                    value={Math.round((mod.ExamScore / mod.ExamMaxScore) * 100)}
                    color="#00C853"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </Section>

      <Section title="Module Tracker" isOpen={modulesOpen} onToggle={toggleModules}>
        {modules.map(mod => (
          <div key={mod.ModuleNumber} style={{ borderBottom: '1px solid #ddd', marginBottom: 16 }}>
            <div
              onClick={() => toggleModule(mod.ModuleNumber)}
              style={{
                background: expandedModule === mod.ModuleNumber ? '#000' : '#A9A9A9',
                color: '#fff',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>Module {mod.ModuleNumber}: {mod.Title}</span>
              <Icon iconName={expandedModule === mod.ModuleNumber ? "ChevronDown" : "ChevronRight"} />
            </div>
            {expandedModule === mod.ModuleNumber && (
              <div style={{ padding: 12 }}>
                <ProgressBar label="Video Progress" value={mod.VideoProgress} color="#bf9902" />
                <ProgressBar label="Quiz Progress" value={mod.QuizProgress} color="#bf9902" />
                {mod.ExamProgress !== undefined && (
                  <ProgressBar label="Exam Progress" value={mod.ExamProgress} color="#bf9902" />
                )}
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
};

export default StatisticsTracker;
