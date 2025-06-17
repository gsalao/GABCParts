export interface IVideo {
  Id: number;
  Title: string;
  Url: string;
}

export interface ITest {
  Id: number;
  Title: string;
  Url: string;
}

export interface IExam {
  Id: number;
  Title: string;
  Url: string;
}

export interface IFAQ {
  Id: number;
  Title: string;
  Body: string;
  ModuleNumber: number;
  Videos: IVideo[];
  Test: ITest;
  Exam?: IExam;
}