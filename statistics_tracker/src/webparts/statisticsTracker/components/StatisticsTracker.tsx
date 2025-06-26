import * as React from 'react';
import { useEffect, useState } from 'react';
import { IStatisticsTrackerProps } from './IStatisticsTrackerProps';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpjsConfig';
import { IGrades } from '../../../interfaces';

const StatisticsTracker: React.FC<IStatisticsTrackerProps> = 
  (
    {
      context, 
      webpartBackground,
      headerFont,
      secondaryFont,
      iconBackground,
      circleBackground,
      taskFont,
      progressDown,
      progressUp
    }  
  ) => {
  const _sp: SPFI = getSP(context);
  const [grades, setGrades] = useState<IGrades[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [gradesItems, moduleItems] = await Promise.all([
          _sp.web.lists.getByTitle("Grades List").items(),
          _sp.web.lists.getByTitle("LMS Modules").items()
        ]);

        const merged: IGrades[] = moduleItems.map(mod => {
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

        setGrades(merged);
      } catch (error) {
        console.error("Error loading statistics:", error);
      }
    };

    fetchData().catch((err) => console.error("Unhandled error from fetchData: ", err));
  }, []);

  const totalQuizzes = grades.length;
  const completedQuizzes = grades.filter(g => g.QuizScore !== undefined).length;
  const quizCompletion = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

  const totalExams = grades.filter(g => g.HasExam).length;
  const completedExams = grades.filter(g => g.HasExam && g.ExamScore !== undefined).length;
  const examCompletion = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

  const totalCompletion = Math.round((quizCompletion + examCompletion) / 2);

  const today = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const currentPeriod = formatter.format(today); // e.g. "June 2025"

  return (
    <div style={{
      backgroundColor: webpartBackground,
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'Segoe UI',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: 800,
      margin: '0 auto'
    }}>
      {/* Left Side: Labels */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: headerFont }}>Statistics</span>
            <span style={{ color: secondaryFont, fontSize: 14 }}>{currentPeriod}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            backgroundColor: iconBackground,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <span style={{ fontSize: 20, color: '#fff' }}>📄</span>
          </div>
          <div>
            <div style={{ color: secondaryFont, fontWeight: 600 }}>Quizzes</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: iconBackground }}>{quizCompletion}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            backgroundColor: iconBackground,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <span style={{ fontSize: 20, color: '#fff' }}>⏰</span>
          </div>
          <div>
            <div style={{ color: secondaryFont, fontWeight: 600 }}>Exams</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: iconBackground }}>{examCompletion}%</div>
          </div>
        </div>
      </div>

      {/* Right Side: Circular Chart */}
      <div style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: `conic-gradient(${progressUp} ${totalCompletion * 3.6}deg, ${ progressDown} 0deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          width: 120,
          height: 120,
          background: circleBackground,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: progressUp }}>{totalCompletion}%</div>
          <div style={{ fontSize: 14, color: taskFont }}>Tasks Completed</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTracker;