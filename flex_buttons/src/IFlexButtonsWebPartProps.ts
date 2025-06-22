export interface IButtonConfig {
  label: string;
  url: string;
  bgColor: string;
  textColor: string;
  fontSize: string;
  fontStyle: string;
  imageUrl: string;
}

export interface IFlexButtonsWebPartProps {
  buttons: IButtonConfig[];
}