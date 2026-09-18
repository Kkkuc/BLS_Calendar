import ReactDOM from 'react-dom';
import type {CompetitionType} from '../../types/competition';
import {COMPETITIONS} from '../../types/competition';
import styles from './TeamSelection.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentCompetition: CompetitionType;
    onSelect: (type: CompetitionType) => void;
    getCompetitionName: (type: CompetitionType) => string;
    getCompetitionEmoji: (type: CompetitionType) => string;
}

export function CompetitionBottomSheet({
                                           isOpen,
                                           onClose,
                                           currentCompetition,
                                           onSelect,
                                           getCompetitionName,
                                           getCompetitionEmoji
                                       }: Props) {
    if (!isOpen) return null;
    return ReactDOM.createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheetContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.sheetHeader}>
                    <h3 className={styles.sheetTitle}>Wybierz rozgrywki</h3>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>
                <div className={styles.competitionList}>
                    {COMPETITIONS.map((type) => {
                        const active = currentCompetition === type;
                        return (
                            <div
                                key={type}
                                onClick={() => onSelect(type)}
                                className={`${styles.competitionOption} ${active ? styles.active : ''}`}
                            >
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <span style={{fontSize: '18px'}}>{getCompetitionEmoji(type)}</span>
                                    <span>{getCompetitionName(type)}</span>
                                </div>
                                {active && <span>✓</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
}