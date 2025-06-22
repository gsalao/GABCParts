import * as React from 'react';
import styles from './FlexButtons.module.scss';
import { IFlexButtonsProps } from './IFlexButtonsProps';

const FlexButtons: React.FC<IFlexButtonsProps> = ({ buttons }) => (
  <div className={styles.buttonRow}>
    {buttons.map((btn, i) => (
      <div key={i} className={styles.buttonContainer}>
        <a
          href={btn.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.roundedButton}
          style={{
            backgroundColor: btn.bgColor,
            color: btn.textColor,
            fontSize: btn.fontSize,
            fontStyle: btn.fontStyle
          }}
        >
          {btn.imageUrl ? (
            <img src={btn.imageUrl} alt={btn.label} className={styles.iconImage} />
          ) : (
            <span className={styles.fallbackLabel}>{btn.label}</span>
          )}
        </a>
        <div className={styles.label}>{btn.label}</div>
      </div>
    ))}
  </div>
);

export default FlexButtons;